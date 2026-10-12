---
title: Host callbacks
description: Why a story tells the program that plays it what happened by name only, and what that choice does and does not give you.
---

A compiled campaign is meant to be played by something: a game engine, an app, a terminal. A **host callback** is how the story tells that something what has just happened in it, at whatever grain the author chooses.

The author declares a **named trigger**: a name, and the occasion that fires it. Whoever embeds the story registers a function against that name. The two halves are written on opposite sides of a boundary and are joined by nothing but the name. That is the whole design, and it is worth holding in mind before anything else about the feature.

## Two people, one name

The author declares the trigger and a programmer writes the code. Naming `chapterTwoBegan` on the **Host callbacks** page says one thing: there is an extension point in this story, and it is called `chapterTwoBegan`. The page has no code field, and nothing typed there changes what the story does.

On the other side, in the game, somebody writes a handler and registers it under that name. When the story reaches the occasion, the engine reports that `chapterTwoBegan` happened and hands over what it knows. The handler runs in their engine, on their schedule.

The name is a contract neither tool can check. Renaming a trigger breaks the programmer's build, and nothing in the editor can warn them, because the breakage lands in a codebase the app has never seen. For the same reason, a callback aimed at a node that is no longer on the board never errors: it fires nothing. The [reference](/reference/host-callbacks/#missing-targets) has what each missing target does. Treat a name the way you would treat the name of a function somebody else calls: agree it early, and rename it deliberately.

## A notification, not a hook

Because the handler lives outside the story, a callback cannot change the story. It is a notification, not a hook: the story carries on exactly as it would with nobody listening, and a name with nothing registered is not an error.

Anything that should change what happens next belongs on the board, as a Script node, a variable or a branch. See [Python in a story](/explanation/python-in-a-story/) for running your own code inside the story.

## Fine grain: watching the cards themselves

Most events describe something that happens to the story as a whole or to a thing it holds: a passage shown, a choice taken, a variable moved. Three events are finer: `node.entered`, `node.exited` and `node.failed`. They fire on every turn a card takes, whatever kind of card it is. Aimed at a board and a card, they tell the host each time the story runs through it. That is the shape of a quest counter, an analytics event, or a game reacting to a scene it knows by name.

The turn of a card has an edge at each end, and where those edges fall is easy to get wrong:

- A passage exits once the reader has chosen, not when it appears. Entering fires as the flow arrives, which for a passage is just before it is shown. Exiting fires once the reader has answered and the turn is finished.
- Going round twice is two callbacks. A loop that runs a card four times fires four times.
- A card inside a macro cannot be picked. A macro is spliced into the board that calls it, so its cards are not on any canvas under their own names. Aim at the card that calls the macro instead.

## Why filtering is on the game's side by default

Left alone, a callback fires at every occasion of its event: every board entered, everything the story spawns. The notification carries which board, which entity and which value, so the game can filter on its own side.

The pane can narrow a callback where it is cheaper to say so there; the [reference](/reference/host-callbacks/) lists what each event can be aimed at. Some events have no sensible unfiltered form. Watching every console variable in a project is almost never what anybody means, so `cvar.changed` requires a variable. A state machine event requires an instance for the same reason.

A `cvar.changed` callback can additionally fire only when the variable becomes a given value. The condition is on the transition, not on the state. Setting a score to 100 when it is already 100 fires nothing, while dropping to 50 and climbing back to 100 fires again. A variable at a value is a fact about the present, while arriving at one is something that happened, and a notification is about things that happened.

## Seeing them fire

The editor publishes names but has no game to react to them, so in the play window normally nothing is registered. The **Host callbacks** side panel there lists every fire: the name, the event, whichever payload fields are set, and what became of the lookup. Each fire shows as a name a game would have looked up. It lets an author check that the story fires the occasions they declared before a programmer has written any code.

## What callbacks are not

- They are not a way to run your own code inside the story. That is Python.
- They are not sound cues. A `soundscape.changed` says which soundscape came into force and nothing finer: not a loop, not a fade, not a marker on a timeline. Those are the mixer's own business. See [Soundscapes and one-shot sounds](/explanation/soundscapes-and-sounds/).
- They are not ordered against the game's frames. The engine hands over a batch of everything a move led to, the callbacks among it, and the game decides when to run them. A callback arrives before the page it is about is drawn. Past that, when a handler runs is the game's to schedule.

## Related

- [How to declare, aim and forget a host callback](/how-to/declare-a-host-callback/)
- [Host callbacks reference](/reference/host-callbacks/): the events, the aiming fields, what a missing target does and what travels with a project
- [What an export is](/explanation/what-an-export-is/)
