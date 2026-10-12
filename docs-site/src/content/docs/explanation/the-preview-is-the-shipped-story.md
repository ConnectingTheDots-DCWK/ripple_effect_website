---
title: Why the preview is the shipped story
description: "Why Play runs the same engine as an exported campaign, and the decisions that follow from it: spent choices, the loop ceiling, refused saves and narration roots."
sidebar:
  order: 4
---

A preview that is a different thing from what ships is a preview that can lie. If the editor ran the story with one implementation and an export ran it with another, the two could disagree. Ripple Effect has only one implementation to disagree with.

## One engine, and it has never seen the canvas

**Play** runs the same engine an exported campaign runs: the native engine, which knows nothing about the canvas. The board you draw is compiled into a campaign, and the engine plays the campaign. What you see in the campaign window is therefore the compiled story playing, as a reader of the export would meet it. The rules for how a story moves are the subject of [How a story runs](/explanation/how-a-story-runs/).

Play also re-indexes before it compiles. It refreshes what passages link to and where boards jump, which is the same index an export reads. A picture added to a passage since the project was opened is therefore in the playthrough without an export first. Compile warnings, and the engine's checks of every board, reach **Messages** when you press Play for the same reason: they come from the compiler an export uses, so a problem is found while you are still at the desk.

The same logic explains one deliberate asymmetry. The loop ceiling is the app's and never travels with an exported campaign. It is a guard for the person testing, not a property of the story.

## Showing what has been spent

A choice with a **Times** limit that has been used up stays on screen, greyed out and unpressable, rather than disappearing. The reason is that a preview exists to tell you what a reader will meet. If spent choices vanished, a passage whose every path was spent would show up as an empty slide, and you could not tell a broken board from a story that had run out. Left visible, the choice says that the path exists and has been used. How to set a limit is in [How to limit a choice](/how-to/limit-a-choice/).

The reader's language follows the same principle. A passage with nothing in the chosen language says so, rather than falling back quietly to another one. A silent fallback would hide the gap and make the preview in one language misleading about the shipped story in another. See [Passages and translations](/explanation/passages-and-translations/).

## A loop that nothing breaks

A loop nothing breaks out of stops the campaign instead of running for ever. By default one loop node may go round 512 times in a board; the campaign then stops and offers you the node that ran away. A For node's own *Max iterations* still applies first when it is lower. Stopping and naming the culprit is the useful behaviour in a preview: an endless loop is almost always a mistake in the board, and the node that ran away is where the mistake is. The choices of ceiling are listed in [Settings](/reference/settings/).

## A project with Python off

If the project has turned Python off, every Script node and every passage with Python in it is marked as an error and listed in Messages, and the campaign will not play until none remain. The export's **Needs no Python** option is ticked and locked. None of these is wrong on a board, only for a player that cannot run Python, so turning Python back on lets the same project play and export as before. See [How to build a campaign with no Python](/how-to/turn-python-off/).

## Starting where you are looking

**Play from here** begins at any node instead of the Start. It starts with nothing made yet, and says so. What a run would have built on the way there depends on dice, on scripts and on choices nobody made, so an invented version would look plausible and be wrong. An empty start is honest. The console in the campaign window is the way to set up whatever the story should have had, and it may do everything a Script node may. The cost is a little setup work; the gain is that the state you test from is one you chose rather than one the tool guessed. See [How to play and test a campaign](/how-to/play-a-campaign/).

## Why a changed story refuses an old save

Pausing writes an automatic save into the project's `.ripple/saves/`. It records where you are and everything the story has made, including a choice's **Times** count, so coming back finds a path as spent as it was left; starting over reopens it. The full list is in [The campaign window and saved games](/reference/campaign-window/).

A save records a place in a board. A board that has since been rewritten may no longer have that place, and putting you somewhere that no longer means what it meant would be worse than refusing. A saved game from a changed story is therefore listed with the reason beside it and left alone. Pausing and resuming in the same sitting is deliberately different: it hands you back the board you just edited, which is what pausing is for. The two cases differ in intent, which is why one is allowed and the other is not.

A save also records what each console variable held, including variables of the `json` type. A build older than the one that wrote a save refuses it rather than quietly putting a `json` variable back to its default, so games have to be saved again after upgrading. Refusing is chosen over guessing here for the same reason as above: a wrong resume looks like a working one.

Saves are left out of version control. A playthrough is a fact about your reading rather than about the story, and the automatic one is rewritten every time you pause, so it would be noise in the history. See [History, sharing and conflicts](/explanation/history-and-sharing/).

## Where a story may begin

A board has one Start, and only a Start begins a story. Project settings also name **narration roots**, the boards a reader is allowed to start from. Nothing in the app is gated on them, and you can still play any board from any node. They are a statement about the story, not a rule for the editor: an export carries them, and whatever reads the export is told where the author intended a story to begin.

## Related

- [How to play and test a campaign](/how-to/play-a-campaign/)
- [How to save and resume a playthrough](/how-to/save-and-resume-a-campaign/)
- [The campaign window and saved games](/reference/campaign-window/)
- [Settings, accessibility and updates controls](/reference/settings/)
- [Diagnostics](/reference/diagnostics/)
