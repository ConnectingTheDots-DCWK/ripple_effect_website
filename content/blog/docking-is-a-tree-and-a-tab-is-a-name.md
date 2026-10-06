---
title: "Docking is a tree, and a tab is a name"
description: "Ripple Effect's workspace is two fixed splits and a strip of tabs. The next one lets you tear a panel off, drop it anywhere, and get the same layout back tomorrow. The package that does it went on GitHub before the app started using it, and this is what is in it."
date: 2026-09-20
category: Engineering
seoTitle: "A Flutter docking layout with splits, tab groups, drag and drop and persistence"
---

Open [Ripple Effect](/) today and the workspace is fixed: a file tree on the
left, a viewer on the right, a handle between them, and under the tree a
second handle above the footer. You can drag the two handles. You cannot move
the tree to the right, put the messages panel beside a board, or tear the
viewer out into a group of its own. Every serious editor lets you do those
things — Blender's areas, Visual Studio's tool windows, VS Code's editor
groups — and the reason they all feel the same is that they are all the same
object underneath.

A docking UI is a tree describing rectangles, a layout algorithm that turns
the tree into rectangles, the hit-testing that turns a drag into an edit of
the tree, and a way to write the tree down. That is the whole thing. We wrote
it as a package, [fl_panel](https://github.com/ConnectingTheDots-DCWK/fl_panel),
and it is public from its first commit, so what follows is checkable rather
than described.

## The tree, and why it is not binary

The textbook version is a binary space partition: a split has a direction, a
ratio, a first child and a second. It is what ImGui's docking does and it was
the first sketch here too:

```
Split(direction: vertical, ratio: 0.6, first: Panel(A), second: Panel(B))
```

It has one real problem. `((A | B) | C)` and `(A | (B | C))` draw the same
picture — three panels side by side — and resize differently. Drag the handle
between A and B in the first tree and C does not move; in the second, dragging
between B and C leaves A alone. Which of the two trees you have is an accident
of the order you docked things in, and it is invisible until a handle behaves
in a way you did not expect.

So a split in `fl_panel` holds any number of children along one axis, with
one extent per child, and the one invariant the tree keeps is that **no child
shares its parent's axis**. Dock something beside a child of a horizontal
split and it becomes another child of that split; dock it above one and the
child is wrapped in a new vertical split of two. A nesting that would break
the rule is spliced flat. The result is that every layout has exactly one
tree, a saved file comes back as the tree the user recognises, and a test can
compare two trees with `==`.

Extents are weights, not pixels — `flex(1)` beside `flex(3)` is a quarter and
three quarters of whatever is left after a `fixed(240)` sibling takes its
two hundred and forty — so a file written on one monitor opens correctly on
another. The only hard constraint is a content minimum. A fixed child gives
its pixels back when the minimums need them, and when even the minimums do
not fit, everything scales down together rather than one panel going to zero.

## A tab is a name, never a widget

The layout tree does not contain a single widget. A tab is a `contentId`, a
map of metadata, the forms it may take, and its minimum size. The
application hands the host a builder that turns the id into a widget, and
that is the entire contract between them.

Three things fall out of that decision, and each would have been a project
of its own without it. The tree serialises without asking anybody, because
there is nothing in it that cannot be written as JSON. A tab moving between
windows — which, under Flutter's multi-window support, means between two
engines that cannot share a widget — is a tree edit and a rebuild from
identity. And the application stays the owner of what a tab *is*: in Ripple
Effect a tab is a view onto a document session, and it will stay one.

## State survives a move

The classic trap in a docking UI is what happens to the thing inside a panel
when the panel moves. Reparent a widget from one group to another and
Flutter builds it again from nothing — the scroll position, the text
selection, the half-typed word are gone — unless the widget wears a
`GlobalKey`, and reparenting by `GlobalKey` has sharp edges of its own.

So the host never reparents. It renders one flat stack: one positioned child
per tab, keyed on the tab's id, placed by the rectangle the solver computed
for the leaf that holds it. Strips, headers, dividers and the drop preview are
layers above. Moving a tab changes its rectangle and nothing else, and a text
field keeps its selection when the tab it lives in lands in another group.
There is a test that types into a field, moves the tab and checks the text is
still there, and it is the one test in the package that the whole design is
for.

If that sounds familiar, it is the same lesson
[the node editor learned](/blog/a-node-body-is-an-ordinary-widget) from a
different direction: the isolation you want is available one layer up, with
ordinary widgets, and reaching below them costs more than it saves.

## What may go where

A tab dragged out of a strip can become a panel of its own, and a panel
dropped onto a strip can become a tab. Whether it *may* is answered at two
levels. The first is on the tab itself — the forms it allows, single or
tabbed or both — so a file tree can say it is never a tab and a document can
say it is never alone. The second is the application's entirely: a policy
object is handed both sides of a proposed move, metadata included, and
answers yes or no. "Tool panels only share a strip with tool panels" is one
line in it.

A move the policy refuses is simply never offered. As the pointer travels
over a leaf, five zones light up or do not — the centre joins the group, the
four edges split it, the window's own edge splits everything — and every
candidate is checked by actually running the edit on the tree, so what the
preview shades is what the drop will do.

## The strip

Three ways to draw a tab, because the products above disagree and each is
right for what it is: flush chips with an accent line, the VS Code shape;
Chrome's curved shoulders, painted, where the active tab and its content are
one surface; and floating pills. A window may mix them per group. Chips share
the strip down to a minimum width and then the strip scrolls — by the wheel,
and never by dragging, because a drag on a strip already means "move this
tab". Asking the controller to focus a tab activates it, scrolls its chip
into view and, if asked, hands its content the keyboard.

Everything drawn that is not content goes through one delegate, so an
application with its own look replaces the chrome and keeps the docking,
provided its chips are wrapped in the one thing the drop hit-test looks for.

## Where it is, and where it is not yet

[fl_panel](https://github.com/ConnectingTheDots-DCWK/fl_panel) is MIT, it is a
Flutter package with a headless half — the tree, the solver and the file
format import nothing from Flutter, and a test keeps it that way — and it
takes pull requests, like [the packages beside
it](https://docs.ripplefx.app/about/open-source/).

It is not in Ripple Effect yet. The workspace still draws its two fixed
splits, and moving it onto this is the next step. The package went public
first because that is the order that keeps it honest: a layout engine built
inside one application quietly learns that application's shape, and one built
in the open, with a demo that is not Ripple Effect, has to earn every
assumption it makes.
