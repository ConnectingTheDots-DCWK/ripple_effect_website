---
title: How a story runs
description: Why a board's control wires are pushed and its data wires pulled, why the story only goes forwards, and what that means for branches and for where a story begins.
---

A board looks like a diagram, but the engine reads it as two different things drawn on the same canvas: a path the story walks, and a set of questions the cards ask while they walk it. Most surprises on a board, a value that is a turn out of date or a setting that seems never to have fired, come from taking one wire for the other. This page explains the reasoning, so that the [diagnostics](/reference/diagnostics/) the app raises read as consequences of one model and not as separate rules.

## Two kinds of wire

Every port on a card is one of two kinds, and the canvas draws them apart.

**Control** ports carry the story. A card's way in is called `exec`; its ways out are the choices, the branches, the *first* and *again* of a gate, the `completed` of a node that merely did something. The story is the path from Start along control wires: a node takes its turn, hands the flow on through one of its control outputs, and the next takes its. Two branches that converge on a card run it twice. There is no waiting for both, because a branch a condition never takes would wait for ever.

**Data** ports carry values: a number, a name, a list of goblins, the state a machine is in. A data wire is not a step in the story. It is a question the card at its end asks when its turn comes.

The canvas draws flow ports as triangles and value ports as dots.

Control is **pushed**: a card takes its turn because the card before it handed the flow on. It is one engine, the same whether you press play in the app or ship the campaign, so a story never reads one way in the editor and another in the shipped copy (see [Why the preview is the shipped story](/explanation/the-preview-is-the-shipped-story/)). A data wire is a **read**: when a card takes its turn and reads a data input, it gets what the card at the other end last published. Reading evaluates nothing. The engine could fetch a value on demand from a card with no control ports at all, but every card on this canvas has a way in and a way out, so in practice nothing is pulled.

### Why the values can hang off the story

Every card has control ports, so a card the story never reaches would never take a turn, and something downstream might still read from it. Before a story begins, the engine walks the data wires back from everything the Start can reach and finds those cards. They are **primed**: run once ahead of the story, in dependency order, so that whoever reads them finds the value there.

That is what lets you wire the story and leave the values hanging off it: a Number into a Set variable, a String into a Component's name, a Get variable into an Output. None of them needs an `exec` wire. You lay out one correct control path, and every value a node on it reads is worked out before it runs.

The price is one rule. **A value that depends on something the story does must be in the flow after it.** A Comparator hanging off a Dice roller is primed before the story starts, before there is a roll to compare, and answers for a total that did not exist yet. Wire the roller's `completed` into the Comparator and the Comparator's into the If, and the comparison happens when the roll has. Priming is for values that are true before the story; the flow is for values the story makes.

## The story only goes forwards

Reading a value never makes a card run. The story arrives at a card, the card looks at what is wired into it, and what it finds is **whatever that card published the last time it had a turn**: this turn, an earlier passage, the priming before the story began, or nothing at all. Nothing is fetched by going back up the wire and running the card again. That is deliberate, because a value that could run its card backwards would mean that reading a number rolls a die.

The consequence is that a value is always in one of three states, and only the first is the one you usually want.

- **Computed on the way in.** Its cards are in the flow just before whatever reads them, so every path to that passage runs them. This is the shape to aim for. For several values at once, put a **Do all** in front of the passage, with a chain per value and its `completed` wired on.
- **Worked out before the story.** Nothing in the flow reaches it, so it was primed and answers the same on every visit. That is right for a number or a name and wrong for anything the story changes. The app raises `W.GE.05` wherever a primed value's cards read something the story changes. The cases are a comparison against a die, a variable read, or a gate's answer, all worked out before there was a roll, before the variable was set, before the gate had been through. A **choice's guard** is the same case: a `bool` wired into the small input on a choice's row is worked out in time only if the cards that make it sit in the flow leading to the passage. Hanging off the side, it is worked out once before the story starts and answers the same for ever, and the message names the choice.
- **Left over from another path.** Its cards are in the flow, but the way the reader got here this time did not pass them, so the value is an older turn's. Which visit it came from is not something anything can work out, but the question behind it is one the app can ask. `W.GE.06` asks whether every route to the card that reads the value runs the card that makes it, and says so when one does not. A data wire is a read of what its card last published: if every route runs that card first, what arrives is this visit's, and if one route skips it, what arrives is whatever it published last, which may be from an earlier visit or nothing at all on the first.

`W.GE.06` is worth a look rather than a problem, and a question rather than an accusation, because sometimes the older value is exactly what you meant. A running total reads its own last answer, and a flag set once on the way in is meant to still be set on the way back. So it can be answered per card: tick *I meant that* on its row in the messages panel and the app stops asking about that card. The answer is remembered, and `W.GE.06` is the only code that offers the tick.

A board marks the cards a finding concerns, and the messages panel lists them all. The [diagnostics reference](/reference/diagnostics/) has every one of the fourteen coded checks on a board's shape, including the two above.

### Loops and circles

Wires that go back on themselves are fine, and the model says why. A control wire back to an earlier card is a loop, which is how a hub or a conversation works. A data wire back into the card that feeds it reads that card's previous answer, which is how a running total works: it is a value, not a question being asked in a circle. The first time round there has been no previous turn, so it reads nothing at all. `I.GE.11` is the app confirming that it noticed such a wire and that it is allowed, not complaining.

What the model cannot give an answer to is a circle of cards that read from each other with none of them having a way in. There would be no value to arrive at: each would be worked out when the next asks for it, and they ask each other. That is `E.GE.14`. Nothing you can draw in the app makes it happen; it exists because a campaign built by something else could.

## Doing several things before a passage

A **Do all** runs everything wired to it, one branch after another, then carries on from `completed`. The rule underneath is that every branch runs to the end of its wire before the next starts, and a passage does not end a wire. A passage on branch two therefore holds branch three until every passage after it has been read, which looks exactly like a Set that never fired.

That is the same forward-only model seen from the other side, and the card's description says so. The `completed` port is the way not to have to think about it: put the jobs on the branches and the story on `completed`.

## Where the story begins

A board begins at its **Start** node, and it has exactly one: a board with none, or with two, is one of the coded checks (`E.GE.01` and `E.GE.02`). Where the Start sits on the canvas does not matter. Script navigation and the merged trace ask the same question the runner does, *which node is the Start?*, so a route drawn between two passages is the route the story actually takes. See [Reading a story back](/explanation/reading-a-story-back/).

## Related

- [Nodes](/reference/nodes/): what each card takes in and hands on.
- [Diagnostics](/reference/diagnostics/): every coded check on a board, with its reason.
- [How to run several jobs before a passage](/how-to/order-jobs-before-a-passage/): the Do all shape, step by step.
- [How to limit a choice](/how-to/limit-a-choice/): wiring a guard so it is worked out in time.
- [Board and navigation rules](/reference/canvas-rules/): the rules the canvas and the trace follow.
