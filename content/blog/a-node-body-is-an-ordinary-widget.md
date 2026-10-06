---
title: "A node body is an ordinary widget"
description: "The canvas under Ripple Effect had to draw hundreds of cards at sixty frames a second without giving up text fields inside them. The usual answer gives up the text fields. Here is the one that does not."
date: 2026-09-09
category: Engineering
seoTitle: "A fast Flutter node editor that keeps text fields in its nodes"
---

Every node editor arrives at the same fork. You are drawing a few hundred cards
on an infinite canvas, they all move when the user pans, and they have to keep
up. The obvious answer is to stop asking the framework to draw them and draw
them yourself.

That is what [fl_nodes](https://github.com/WilliamKarolDiCioccio/fl_nodes), the
predecessor to the canvas under [Ripple Effect](/), did. It isolated rebuilds with a
custom `MultiChildRenderObject`. It worked, and it bought node count, and it
cost the node.

A render object that paints its own content cannot host a text field, a
platform view, or anything else that needs the framework's own machinery.
Native channel synchronisation broke. So a node was a picture of a form rather
than a form.

For a general-purpose graph editor that is a survivable trade. For this one it
is fatal: a passage node in Ripple Effect *is* a form. It has a title you type
into, ports you name, fields you edit in place. The whole product is people
typing inside those cards.

## The isolation was one layer up the whole time

The thing a custom render object was being used for — *do not rebuild this
subtree* — already exists in the element tree, and it is one line of the
framework:

```dart
// Element.updateChild, roughly
if (child.widget == newWidget) {
  // nothing to do
}
```

For a default `Widget`, `==` is identity. **Hand back the same widget instance
and the subtree is skipped without building.** No render object, no fighting
the framework, no losing text fields.

So the editor keeps one slot per on-screen node, holding that node's view
instance and its callbacks, and hands the same instance back whenever its
inputs have not changed. Everything else about the node is an ordinary widget,
which means text fields, sliders, dropdowns and forms all work inside one
because nothing was ever taken away from them.

**The callbacks have to live in the slot, and that is the part that is easy to
get wrong.** A closure is the one input you cannot compare against the last
one: two closures that do exactly the same thing are never equal. So a closure
rebuilt per frame makes every node look different from the node it was a frame
ago, and hands the entire optimisation back without a single error.

Measured on thirty-six drawn nodes, node bodies built per frame:

| | before | after |
| --- | --- | --- |
| Dragging one node | 26 | 1 |
| Panning the canvas | 36 | 0 |
| Changing the selection | 36 | 2 |

Panning is the one to look at. The canvas moves, every node moves with it, and
nothing rebuilds — because moving a node is a transform, not a new widget.

## The trap on the other side of the seam

A host can give all of that back from outside, in one line, and the line looks
completely reasonable:

```dart
ListenableBuilder(
  listenable: controller,
  builder: (context, _) => NodeEditor(controller: controller, …),
)
```

`NodeEditor` already listens to its own controller. Wrapping it in a builder on
that same controller rebuilds it on every notification, which hands it a fresh
`nodeBuilder` closure every frame — and per the rule above, a fresh closure
means every node rebuilds.

The demo did exactly this. It cost **59 ms a frame at 500 drawn nodes, where it
now costs 5**.

What makes that worth writing down rather than merely fixing is *how* it
failed. It did not throw, it did not warn, and every feature carried on
working. **The isolation is invisible when it breaks.** You cannot notice its
absence by using the thing; you notice it by measuring, or by shipping
something that feels bad for a reason nobody can name. That is why it is pinned
by a test that counts builds rather than by a comment asking people to be
careful.

The rule for a host is one sentence: wrap the parts that *read* controller
state, not the editor.

## What is still painted, and why that is not a contradiction

Node bodies are widgets. Connections, port handles, the grid and the selection
overlays are painters. That is not the old trade sneaking back in — none of
those things has ever wanted to be a text field.

The reason is subtler than cost, and it is about **level of detail**. When you
zoom out far enough, a port handle should stop being drawn. As a painter that
is an `if` at paint time. As widgets it is widgets appearing and disappearing,
which means rebuilding every node on screen at the exact moment the threshold
is crossed — which is to say, stuttering precisely while the user is moving.
Doing LOD with widgets makes the canvas worst exactly when it is most watched.

So: the grid is a fragment shader, one `drawRect`, costing per pixel rather
than per line, with a line-drawing fallback if the shader will not compile.
Port handles were forty-odd render objects each and are now batched by colour
into one pass. Connection curves batch by colour into one `Path` per colour,
and their direction markers are sampled once when the curve is built rather
than measured every frame.

One rule holds the painted half together: **what is drawn and what is picked
read the same geometry.** The minimum scale at which a port is drawn is the
same number that gates whether a press can hit it, because an invisible dot
that still starts a wire is worse than one that is plainly not there yet.

## Caches, and the bug that taught the most

Connection geometry is built once and cached. The interesting part is what the
cache keys on.

The obvious key is the controller's revision number, which moves whenever
anything is edited. It is also wrong, and wrong in a way that looks right:
dragging a node bumps the revision on every pointer event, so a memo keyed on
it misses on every frame of every drag — the one situation where you needed it.
Keying the connected-ports lookup on the connections map's *identity* instead
took it from 26.4 node bodies rebuilt per frame down to 0.7.

There is a second half to that fix which is easy to miss: the memo also has to
hand back **the previous `Set` instance** for any node whose set is unchanged.
A freshly constructed `Set` with identical contents is never `identical` to the
last one, and that alone was enough to rebuild every node.

| | rebuilt every frame | cached |
| --- | --- | --- |
| Connection geometry | 4055 µs | 0.02 µs |
| Hover pick | 2627 µs | 0.5 µs |
| One pass while dragging, 4928 links | 4368 µs | 750 µs |

## What it costs

Nothing here is free, and the package's own notes keep a list rather than a
sales pitch. The graph is immutable and edited copy-on-write, so an edit copies
the node map — about 390 µs a frame while dragging at five thousand nodes.
Removing that means trading the immutable snapshot for in-place mutation, and
the model's guarantees along with it, which has not looked worth it yet. There
are no resize handles: comments size themselves to their text and group frames
size themselves to their members, so nothing on the canvas is resized by hand.
Groups do not nest, and a node belongs to at most one.

## Where it is

[fl_nodes_v2](https://github.com/ConnectingTheDots-DCWK/fl_nodes_v2) is public,
MIT, and takes pull requests. It knows nothing about narrative: it supplies a
canvas — geometry, wiring, selection, navigation, undo, execution — and the
application decides what a node *is*. Ripple Effect's passages, choices and
components live entirely on our side of that line, which is what makes the
package worth publishing rather than merely worth extracting. `dart_read_time`
came out of the app the same way, and
[has a post of its own](/blog/counting-a-read-in-fifty-four-languages).

Same distinction as always, and worth repeating because it is the one people
get backwards: **the package is open source, and Ripple Effect is not.**
