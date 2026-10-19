---
title: Diagnostics
description: Every coded message the messages panel can show, with its wording, its meaning and its fix.
sidebar:
  order: 1
---

A coded message is a rule with a name. It is always worded the same way and has a heading on this page. Most messages in the panel carry no code: they report on a file, a translation, or something the app could not do. The coded ones are the engine reading the shape of your boards.

A macro's take declared as a map or as JSON cannot carry a typed value from the card; the compile reports that without a code. Takes typed `int`, `float`, a path to a file, a component or a list of those deliver their value to the story.

## Code format

```
W.GE.05
│  │  └ the fifth rule about the shape of a board
│  └─── GE: boards. RT: a playthrough. EX: an export.
└────── E a problem · W worth a look · I a record
```

| Letter | Level | Meaning | Counted on the tab |
| --- | --- | --- | --- |
| `E` | Problem | A board cannot do what it says: it will not play, or a card in it can never do anything. | Yes |
| `W` | Worth a look | The story plays and may not do what you meant. | Yes |
| `I` | Record | Something true about your board that is very probably fine. | No |

## Index

| Code | Subject |
| --- | --- |
| [`E.GE.01`](#ege01) | Board has no Start |
| [`E.GE.02`](#ege02) | Board has more than one Start |
| [`E.GE.03`](#ege03) | Required input not wired |
| [`W.GE.04`](#wge04) | Cards on no path |
| [`W.GE.05`](#wge05) | Value worked out before the story depends on something the story changes |
| [`W.GE.06`](#wge06) | A way in skips the card whose value is read |
| [`W.GE.07`](#wge07) | While loop without `break` |
| [`W.GE.08`](#wge08) | Jump cannot land |
| [`I.GE.09`](#ige09) | Several wires leave one way out |
| [`I.GE.10`](#ige10) | Several wires arrive at one input |
| [`I.GE.11`](#ige11) | Value comes back round to its card |
| [`I.GE.12`](#ige12) | Path stops without an End |
| [`I.GE.13`](#ige13) | For exceeds the ceiling |
| [`E.GE.14`](#ege14) | Circle of cards with no way in |
| [`W.GE.15`](#wge15) | Name Python cannot read |
| [`W.GE.16`](#wge16) | Host callback watches something that is gone |
| [`I.RT.01`](#irt01) | Card ran more than once |
| [`W.RT.02`](#wrt02) | Something read a card that had not run |
| [`I.RT.03`](#irt03) | Several wires arrived at one input |
| [`W.RT.04`](#wrt04) | Card with several ways out had no behaviour |
| [`I.RT.05`](#irt05) | Story was given your stand-in |
| [`W.RT.06`](#wrt06) | Story was refused something it read |
| [`I.RT.07`](#irt07) | Story was allowed something there was nothing of |
| [`E.EX.01`](#eex01) | Script node in a no-Python campaign |
| [`E.EX.02`](#eex02) | Passage that runs Python in a no-Python campaign |

## Where messages appear

| Where | Behaviour |
| --- | --- |
| Messages panel | Messages are clustered by subject (Boards, Translations, Version control), each heading with a count you can fold away. Cluster by level instead to see problems first. Three chips above the list turn problems, cautions and records on and off. Both choices are remembered. |
| Code | The code is a link to its heading on this page. |
| Cards | A card a problem or a caution names is drawn with a halo in that colour and a small mark at the end of its header. Hovering the mark lists the codes on that card and what each says. Records are not drawn on a card: several of them, such as two wires off one port or paths that stop without an End, are earned by well-drawn boards, and a mark that is usually nothing is a mark you stop seeing. |
| Clicking a message that names cards | Opens the board and lifts those cards out of it. **Escape**, or the cross in the toolbar, puts the canvas back. |
| A file written by a newer version | An uncoded message. A strip across the top of the project says what could not be read, and Messages keeps the note together with the file's path. |
| In the play window | `RT` messages appear in the trace as the story runs, and stay in the messages panel afterwards. |

A finding names the cards it concerns.

### When checks run

| When | What is checked |
| --- | --- |
| While you edit | The board you are working on, about a second after you stop typing. |
| Pressing **Play** | Every board at once. Checks that need more than one board, such as whether a Jump can land, are made then. |

## Boards

### `E.GE.01`

**This board has no Start, so nothing on it can begin a story.**

A Jump can still land on a card here and the story runs on from there, but the board cannot be played on its own and is left out of the campaign when you press Play. A macro board is called rather than begun and is never asked for a Start.

Fix: add a Start card and wire it to where the story begins.

### `E.GE.02`

**This board has more than one Start.**

A board plays with one way in. Clicking the message frames every Start found. Until only one remains the board does not compile, and the freshness checks on it answer for a story with two beginnings.

Fix: delete all but one.

### `E.GE.03`

**A card has nothing wired into an input it cannot work without.**

An If's `condition` comes from another card, usually a Comparator; a Comparator's two operands are the same. A card with a field standing in for the input is not asked. An empty input reads as *nothing*, so the card answers the same way every time.

Fix: wire the input, or put the card that works it out in front of this one.

### `W.GE.04`

**A stretch of cards is not on any path the story can take.**

No control wire leads to them from the Start and nothing reads a value from them, so none of it ever runs. Clicking frames the whole island. Cards that are only read, such as a Number feeding a Set, are not islands: they are worked out before the story starts.

Fix: wire the stretch in, or delete it.

### `W.GE.05`

**A value is worked out before the story starts, and it depends on something the story changes.**

Cards nothing flows into are run once, before the first passage. A comparison against a die, a variable read or a gate's answer depends on something the story changes, so it answers the same on every visit. The rule behind this is in [How a story runs](/explanation/how-a-story-runs/).

A choice's guard follows the same rule: a `bool` wired into the small input on a choice's row hanging off the side of the flow is worked out once. The message names the choice.

Fix: put the cards in the flow that leads to whatever reads them. See [How to build a board](/how-to/work-on-the-canvas/).

### `W.GE.06`

**Some way in does not pass through the card whose value is being read.**

A data wire reads what its card last published, and at least one route to the reader skips that card, so the value may be from an earlier visit or nothing. A running total or a flag set once is meant to behave this way, so the message is a question. See [How a story runs](/explanation/how-a-story-runs/).

This is the only code with an answer: tick *I meant that* on its row in the messages panel and it stops asking about that card. The answer is remembered.

Fix: make every route run the card, or tick *I meant that*.

### `W.GE.07`

**A While loop has nothing wired into `break`.**

Only the ceiling on how many times one loop may go round can end it, and that ends the whole campaign with an error.

Fix: wire a condition's false side into `break`, or use a For, which counts.

### `W.GE.08`

**A Jump cannot land where it is pointed.**

The board it names has no Start and the Jump names no card on it, or it names a card that board no longer has.

Fix: pick the card again, or give that board a Start.

### `I.GE.09`

**Several wires leave one way out.**

Legal. They run one at a time, each to the end of its wire before the next starts, in the order the wires were drawn, which the canvas does not show. The message lists them in running order.

Fix: if the order matters, use a **Do all**, which says it on the card.

### `I.GE.10`

**Several wires arrive at one input.**

One input takes one value. The first arrives; the others are drawn but never read.

### `I.GE.11`

**A value comes back round to the card that makes it.**

Allowed, and how a running total is built: the wire reads what the card published last time, which is the previous turn, and nothing on the first. The message confirms it. A control wire back to an earlier card is a loop, which is how a hub or a conversation works.

### `I.GE.12`

**A path stops without an End.**

The story has nowhere to go next, which plays as it ending. An End card says so on the canvas and gives the reader a last page.

### `I.GE.13`

**A For asks for more turns than the ceiling allows.**

The ceiling wins, and it ends the campaign with an error rather than leaving through `exit`.

Fix: correct the number, or raise the ceiling under *Playing* in the settings.

### `E.GE.14`

**Cards read from each other in a circle, and none of them has a way in.**

There is no value to arrive at: each would be worked out when the next asks for it. Nothing drawn in this app produces this; a campaign built by something else could.

### `W.GE.15`

**A passage or a program is given a name its Python cannot read.**

A Narration node's *Reads* and a Script node's inputs and outputs become variables typed in the prose or the code. A name must be a letter or an underscore followed by letters, digits and underscores, and not a Python keyword such as `class` or `None`. `Your roll` is a valid label on an Output node's rows but nothing could write `{{ Your roll }}`, so the wire into that slot goes nowhere and the passage never sees it.

The editor does not let you type such a name, so it appears only on a board written by an older version or edited by hand.

Fix: rename it, for example `your_roll`.

### `W.GE.16`

**A host callback watches something that is no longer there.**

A callback names a board, and optionally a node on it. If the board or card is deleted, the declaration is dropped from the compiled campaign or never fires, and whatever registered for that name is never told. It is the only message here that is not about a card: it names the callback, and carries the board when that board is still in the project.

A callback aimed at a console variable or a component that has gone is reported when the campaign is built, because that check needs the project's variables and index. A missing node is checked nowhere else. See [Host callbacks](/reference/host-callbacks/).

## A playthrough

Things the engine noticed while the story was running.

### `I.RT.01`

**A card ran more than once.** Ordinary in a loop or a hub the reader returned to; worth a look if you did not expect the story to pass that way twice.

### `W.RT.02`

**Something read a card that had not run.** The value it found was nothing. This is `W.GE.05` and `W.GE.06` seen after the fact, on the path the reader took.

### `I.RT.03`

**Several wires arrived at one input,** and the first was taken. The observed version of `I.GE.10`.

### `W.RT.04`

**A card with several ways out had no behaviour,** so the story stopped there rather than guess which way to go.

The next three are about what a story reads from your computer: the date and time, and where you are. What each may read is under *Settings › Permissions*, and so is the stand-in each is told instead. They appear at the top of the play window as well as in the messages panel, once per playthrough each.

### `I.RT.05`

**The story was given your stand-in.** It read the date and time or the location, could not have the real one — you have not allowed it, or there was nothing to read — and was told the stand-in you typed instead. The story cannot tell the difference; that is what a stand-in is for.

### `W.RT.06`

**The story was refused something it read.** It read the date and time or the location, which is not allowed here, and you have given no stand-in, so its script got a `PermissionError`. If the script catches it with `except PermissionError:`, the story carries on with whatever it says instead; if not, the passage shows a warning in its place.

Fix: allow it under *Settings › Permissions*, give a stand-in there, or write the fallback in the script.

### `I.RT.07`

**The story was allowed something there was nothing of.** It may read the location, but the editor does not read a real position, so `current_position()` gave `None`. Give a stand-in under *Settings › Permissions* to tell stories a place.

## An export

These appear only when a campaign has to play without Python, for a game or player built without the interpreter: when you export with **Needs no Python** ticked, or when the project has **Python** turned off under *Capabilities* in its settings. Each is a place the story would run Python. Any one of them stops the export. With Python off in the project, they also stop the campaign from playing and show on the cards as errors as you draw. None is wrong on a board, only for a player that cannot run it. To undo them, see [How to build a campaign with no Python](/how-to/turn-python-off/); the box is described in [Export options and bundle contents](/reference/export-options/).

### `E.EX.01`

**A Script node, in a campaign that has to play without Python.** A player without the interpreter would stop the story at this card.

A Script node inside a macro is reported on the card that calls the macro when you export, and on the macro's own board while you edit.

Fix: move what the script does onto cards that need no Python, or export with the box unticked. See [How to build a campaign with no Python](/how-to/turn-python-off/).

### `E.EX.02`

**A passage that runs Python, in a campaign that has to play without Python.** The passage has a `ripple` code block or an inline `{{ … }}` in at least one of its languages, and a player without the interpreter would show a warning in its place. The message gives the count across every language.

Fix: replace each with the text it would have produced, or split the passage so a choice or a branch picks between versions.

## Related

- [How a story runs](/explanation/how-a-story-runs/)
- [Host callbacks](/reference/host-callbacks/)
- [Export options and bundle contents](/reference/export-options/)
- [How to build a campaign with no Python](/how-to/turn-python-off/)
- [How to build a board](/how-to/work-on-the-canvas/)
