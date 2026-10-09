---
title: Diagnostics
description: Every message the messages panel can show you with a code on it — what each one means, why it is worth knowing, and what to do about it.
sidebar:
  order: 3
---

The messages panel groups what the app has to say about your project, and some
of those messages carry a **code**. A code means the message is a rule with a
name, that it will always be worded the same way, and that it has a heading on
this page.

Read a code left to right: **how loud it is**, **what it is about**, and
**which rule it is**.

```
W.GE.05
│  │  └ the fifth rule about the shape of a board
│  └─── GE: boards. RT: a playthrough. EX: an export.
└────── E a problem · W worth a look · I a record
```

**A problem** is a board that cannot do what it says — it will not play, or a
card in it can never do anything. **Worth a look** is a story that plays and
may not do what you meant. **A record** is something true about your board that
is worth knowing and is very probably fine; records are not counted on the tab.

Most of what the panel shows has no code: those are the app telling you about a
file, a translation, or something it could not do. The coded ones are the
engine reading the *shape* of your boards.

## When they appear

While you edit, a second or so after you stop typing, for the board you are
working on. And for every board at once when you press **Play** — which is
also when the checks that need more than one board can be made, like whether a
Jump can land.

## Where they appear

In the messages panel, and **on the cards themselves**. A card a problem or a
caution names is drawn with a halo in that colour and wears a small mark at the
end of its header; hover the mark and it tells you which codes are on that card
and what each one says. So you can find the trouble by looking at the board,
and read about it in the panel.

Records are not drawn on a card. Several of them — two wires off one port,
paths that stop without an End — are earned by boards that are perfectly well
drawn, and a mark that is usually nothing is a mark you stop seeing.

Clicking a message that names cards does the other half: it opens the board and
lifts those cards out of it. Press **Escape**, or the cross in the toolbar, to
put the canvas back.

## Boards

### `E.GE.01`

**This board has no Start, so nothing on it can begin a story.**

A Jump can still land on a card here and the story will run on from there, but
the board cannot be played on its own, and it is left out of the campaign when
you press Play. Drop a Start card on it and wire it to wherever the story
begins.

A macro is called rather than begun, so a macro board is never asked for a
Start.

### `E.GE.02`

**This board has more than one Start.**

A board is one story and plays with one way in. Clicking the message frames
every Start it found, so you can see which to keep; delete the rest. Until then
the board does not compile, and the freshness checks on it are answering for a
story with two beginnings.

### `E.GE.03`

**A card has nothing wired into an input it cannot work without.**

An If asks nothing itself — its `condition` comes from somewhere else, usually
a Comparator — and a Comparator's two operands are the same. Empty is not blank
here: it reads as *nothing*, so the card answers the same way every time
whatever the story did. Wire it, or put the card that works it out in front of
this one.

### `W.GE.04`

**A stretch of cards is not on any path the story can take.**

No control wire leads to them from the Start, and nothing reads a value from
them either, so none of it ever runs. Usually this is something you were in the
middle of, or a stretch you rewired and left behind. Clicking frames the whole
island so you can see what it is before you delete it.

Cards that are only *read* — a Number hanging off the side feeding a Set — are
not islands. Those are worked out before the story starts, on purpose.

### `W.GE.05`

**A value is worked out before the story starts, and it depends on something
the story changes.**

Cards nothing flows into are run once, before the first passage, so whoever
reads them finds a value there. That is exactly right for a number or a name.
It is wrong for a comparison against a die, a variable read, or a gate's
answer: those get worked out before there was a roll, before the variable was
set, before the gate had been through. The card then answers for a world that
had not happened yet, and it answers the same on every visit.

Put it in the flow that leads to whatever reads it — wire the roller's
`completed` into the Comparator, and the Comparator's into the If — and it will
be worked out on the way in.

### `W.GE.06`

**Some way in does not pass through the card whose value is being read.**

A data wire is a read of what its card last published. If every route to the
reader runs that card first, what arrives is this visit's. If one route skips
it, what arrives is whatever it published last — which may be from an earlier
visit, or nothing at all on the first.

Sometimes that is exactly what you meant: a running total reads its own last
answer, and a flag set once on the way in is meant to still be set on the way
back. So this is a question rather than an accusation, and you can answer it:
tell it you meant that, and it will stop asking about that card.

### `W.GE.07`

**A While loop has nothing wired into `break`.**

Nothing in the story can stop it, so the only thing that ends it is the
ceiling on how many times one loop may go round — and that ends the whole
campaign with an error rather than carrying on. Wire a condition's false side
into `break`, or use a For, which counts.

### `W.GE.08`

**A Jump cannot land where it is pointed.**

Either the board it names has no Start and the Jump names no card on it, or it
names a card that board has not got any more. Pick the card again, or give that
board a Start.

### `I.GE.09`

**Several wires leave one way out.**

Perfectly legal, and worth seeing: they run one at a time, each to the end of
its wire before the next starts, in the order the wires were drawn — which the
canvas does not show. The message lists them in the order they will run. If the
order matters, a **Do all** says it on the card.

### `I.GE.10`

**Several wires arrive at one input.**

One input takes one value. The first of them arrives and the others are drawn
but never read.

### `I.GE.11`

**A value comes back round to the card that makes it.**

That is allowed, and it is how a running total is built: the wire reads what
the card published last time, which is the previous turn — and nothing at all
on the first, before there has been one. The message is here to confirm it
rather than to complain.

### `I.GE.12`

**A path stops without an End.**

The story simply has nowhere to go next, which plays as it ending. An End card
says so on the canvas, and gives the reader a last page.

### `I.GE.13`

**A For asks for more turns than the ceiling allows.**

The ceiling wins, and it ends the campaign with an error rather than leaving
through `exit`. Either the number is a typo or the ceiling wants raising, under
*Playing* in the settings.

### `E.GE.14`

**Cards read from each other in a circle, and none of them has a way in.**

There is no value to arrive at: each would be worked out when the next asks for
it, and they ask each other. Nothing you can draw in this app makes this
happen; it is here because a campaign built by something else could.

### `W.GE.15`

**A passage or a program is given a name its Python cannot read.**

A Narration node's *Reads* and a Script node's inputs and outputs do not merely
label their ports: each name becomes a variable you type in the prose or in the
code. So a name has to be one Python can spell — a letter or an underscore,
then letters, digits and underscores, and not one of Python's own words like
`class` or `None`.

`Your roll` is a fine name for an Output node's rows, which somebody reads. It
is not one here: nothing could write `{{ Your roll }}`, so the wire into that
slot goes nowhere and the passage never sees it. Rename it `your_roll` and the
value arrives.

The editor will not let you type a name like this, so you will only see this on
a board written by an older version or edited by hand.

### `W.GE.16`

**A host callback watches something that is no longer there.**

A callback on the *Host callbacks* page names a board, and optionally a node on
it. Delete the board, or delete the card, and the declaration is left pointing
at nothing: it is dropped from the compiled campaign, or it simply never fires,
and whatever registered for that name is never told.

This is the only message here that is not about a card, because a declaration
lives in a file of its own and is on no board. It names the callback instead,
and carries the board when that board is still in the project, so you can open
it and look.

A callback aimed at a console variable or a component that has gone is said
when the campaign is **built** rather than here — that check needs the
project's variables and its index, which the analysis does not have. A node is
the other way round: nothing checks it when the campaign is built, so this is
the only place it is ever said.

## A playthrough

These are things the engine noticed while the story was actually running. They
appear in the play window's trace as it happens, and stay in the messages panel
afterwards.

### `I.RT.01`

**A card ran more than once.** Ordinary in a loop or a hub the reader came back
to; worth a look if you did not expect the story to pass that way twice.

### `W.RT.02`

**Something read a card that had not run.** The value it found was nothing.
This is `W.GE.05` and `W.GE.06` seen from the other side — after the fact, on
the path the reader actually took.

### `I.RT.03`

**Several wires arrived at one input,** and the first was taken. The observed
version of `I.GE.10`.

### `W.RT.04`

**A card with several ways out had no behaviour,** so the story stopped there
rather than guessing which way to go.

## An export

These appear only when you export a campaign with **Needs no Python** ticked,
for a game or a player that was built without the Python interpreter. Each one
is a place the story would run Python, and **any one of them stops the
export**: nothing is written until the list is empty. Untick the box and the
same project exports as it always did — none of these is wrong on a board, only
for a player that cannot run it.

### `E.EX.01`

**A Script node, in an export that needs no Python.** A player without the
interpreter would stop the story when it reached this card.

Move what the script does onto cards that do not need Python — a console
variable set and read by its own nodes, a branch on a value — or export with
the box unticked for a player that has the interpreter. A Script node inside a
macro is reported on the card that calls the macro.

### `E.EX.02`

**A passage that runs Python, in an export that needs no Python.** The
passage has a `ripple` code block or an inline `{{ … }}` in its text, in at
least one of its languages, and a player without the interpreter would show a
warning in its place. The message says how many there are across every
language.

Replace each with the text it would have produced, or split the passage so
that a choice or a branch picks between versions of it.
