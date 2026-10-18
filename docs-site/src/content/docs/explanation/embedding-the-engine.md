---
title: Embedding the engine
description: Why every binding of the engine is the same small API (a campaign, a session and an ordered list of effects) and what that shape asks of the program that plays a story.
---

A campaign exported from the editor is played by the **engine**: the same one the editor's Play button runs, published on its own so that other programs can run it too. A game, an app, a page or a tool reaches it through a **binding**, a library in that program's language. There are four today: JavaScript and TypeScript, C and C++, C#, and Dart. Each spells things the way its language does, but underneath they are one API. Learn it once and all four make sense.

The whole design fits in one sentence. **The host never decides anything about the story or the sound: it renders what it is told, tells the engine what the player did, and gives the engine a clock.** The rest of this page follows from that.

## The host drives the story

The engine never blocks, never sleeps, never reads a clock, never picks its own random seed, never starts a thread and never calls into your code. It is a machine with one crank. Your program turns it with a verb. The engine moves the story as far as it can go without the reader, then stops and says what it is waiting for: a passage to show, a form to fill, a wait to sit out, or an ending.

That is the shape every mature narrative runtime a game engine already hosts has, and it was picked for the same reasons. It needs no event loop on either side of a language boundary. It fits a game's frame loop, a UI framework's event handlers and a terminal's read loop equally well. It also compiles for a browser, where there is one thread and nothing may block.

Two things follow that matter in practice:

- **Time is yours.** A Delay node does not wait. It asks your program to wait, and the story stays where it is until you say the time is up. Use game time if your world can pause.
- **Chance is yours.** Every session starts from a seed you choose. The same seed and the same answers play the same story, which is what makes a bug report reproducible and a test deterministic.

## Three things: a campaign, a session, and effects

A **campaign** is the opened bundle. It is immutable and can be shared for the life of your program. It carries the manifest (the languages, the entry boards, whether the text is Markdown or HTML, the table of media files) and two lookups you will call constantly: a node by board and id, for when a trace names one, and a media file by index, for when a passage or the sound names one. A campaign opens from a folder, or from its files held in memory when your program packs its assets its own way.

A **session** is one playthrough of a campaign: the reader's position, the story's variables and the dice. Make one per playthrough, or per save slot. Its verbs are the only way the story moves.

**Effects** are what a verb hands back.

## A verb answers with a list of what happened

Every verb returns an **ordered list of effects**: everything the story did between your call and the moment it stopped. The last effect is the **turn**, which says where the story is now:

| Turn | What your program does |
| --- | --- |
| show | Draw a passage and its choices. |
| ask | Show a form and collect typed answers. |
| hold | Start a timer, and tell the engine when it fires. |
| ended | The story reached an End its author wrote. |
| failed | The story stopped on an error, naming the node if it can. |
| stopped | The session was stopped or paused. |

Before the turn come the facts along the way. The story changed board. The soundscape in force changed. A sound command for your speaker. A console variable, an entity or the story's memory moved. A named callback the author published fired. With tracing on, there is also one step of the trace per node the story ran through.

**The answer is a value, not a set of callbacks**, and that was the decision the rest rests on. A list of plain records crosses every language boundary the same way: a C struct, a WebAssembly record or a JavaScript object. A callback has to be invented again for every language, and with it questions about which thread it runs on and what happens if it throws. So a binding is a dispatch over a list, and your program handles one case per kind of effect and nothing else for the story. Every effect is a copy, so nothing in it points back into the engine.

**Order is part of the answer.** A change to the story's state arrives before the passage it affects, so a status display is right when the dialog box appears. A soundscape stopping arrives before the next one starting. A callback about a passage arrives before the passage. Apply the list in order and you never have to reason about it.

## Answering the turn

There are four ways to answer a turn: choose a choice, leave the passage without choosing, answer the form, or report that the wait is over. Restart, stop, pause and a change of language are also verbs.

**A wrong verb is refused, and nothing moves.** Choosing while a form is showing, or choosing an index that does not exist, is an error your program can catch, and the story is exactly where it was. Most of these are bugs in the host. Two are met in ordinary use and are worth handling:

- **A choice that is not open now.** Every wired choice is offered, but one the author limited may be spent or behind a guard that is false. It comes marked unavailable, so draw it greyed and do not offer the press. Pressing it anyway is refused.
- **A language the campaign does not have.** Changing the language re-shows the current passage in the new one; an unknown language is refused and nothing changes.

**A wait is a request, not a sleep.** If the reader pauses, restarts or stops in the middle of a wait, the report that the time is up is harmless when it finally arrives.

## The player is the loop, written once

Dispatching the list, keeping track of the last turn and running the timer is the same code in every host. So each binding ships a **player**: an optional layer over a session that delivers every effect to one handler in order, keeps the current turn, answers a wait itself when your frame loop or event loop finds it due, forwards the sound to your speaker, and keeps the table of named callbacks. Its verbs are the session's. Most programs use the player. Programs that want every step in their own hands use the session directly, and lose nothing by it.

## Named callbacks are the author's API to you

An author can publish named points in a story, such as `chapterTwoBegan` or `achievementHit`, each tied to an event and optionally aimed at a board, a node or a variable. A name carries no code. It says that a point exists and what it is called. Your program registers a handler against the name. The engine never sees your table: it hands over a callback effect like any other, and the player looks the name up.

Four rules make this safe to build on:

- **A callback is a notification.** It returns nothing and cannot change the story. The story plays the same whether anybody is listening or not.
- **An unknown name is ordinary.** The two sides are written by different people and nothing can check one against the other, so a miss is counted, not raised.
- **A handler that throws does not stop the story.** The error is reported, and the rest of the list is still delivered.
- **A handler must not call a verb.** The session is not re-entrant, and a verb from inside a handler is refused. Queue it, and run it once the handler has returned.

The name is the only thing joining the author's declaration to your code, so treat it like a function name somebody else calls: agree it early and rename it deliberately. [Host callbacks](/explanation/host-callbacks/) explains the author's half.

## Values keep integers and floats apart

Everything that is data rather than structure (a console variable, an entity's attribute, a form's answer, a script's result) is one type: JSON, with the difference between an integer and a float kept. The story's `7` and `7.0` are different values. Integers are 64-bit, and maps keep the order the author wrote them in.

Each binding maps this onto its language's own types. In a language whose numbers are all doubles, the integer side needs a wider type. JavaScript uses `bigint` for it, and Dart compiled to JavaScript rounds an integer beyond 2⁵³. Each binding's reference says how it spells the type.

## Saving is a string

A **checkpoint** is the turn the story is on, written as JSON, without stopping it. A **pause** writes the same save and then ends the session, stopping the sound on the way. Either one exists only while the story is on a passage or a form, because a story mid-wait has no stable place to resume to. Store the save with the seed and the language, and resume a new session from it over the same campaign.

A save names the story it came from. Resuming a save whose board or node the campaign no longer has is refused by name. That is the moment to tell the player the save is from an older build of the story. A save carries neither the dice's position nor the soundscape's: the same seed gives the same future rolls, and a music bed starts from the top. A host that needs the dice's exact continuation reads the generator's state off the old session and sets it on the new one.

## Sound comes in three layers

Sound is where the rule that the host decides nothing pays off most:

1. **The session** says what the story asks for, as audio commands: play a soundscape, stop it with a fade, cut everything, cue a one-shot sound.
2. **The scheduler**, the engine's mixer, turns those into individual voices: which file, from where in it, how loud, when it fades, when one soundscape hands over to the next. It has no clock, no files and no voices of its own.
3. **The speaker** makes the sounds. It is the only part that touches an audio API, and the only part you write.

Between the second and third layers sits the **soundscape driver**, which each binding ships. It ticks the scheduler from your loop, moves a voice's start on by the time its file took to open, waits out a handover's fade, and reports a voice's end and a file's length back to the scheduler. The speaker contract that is left is small. Opening a voice returns only once it can start at once. Playing a voice that is already playing replaces it. Stopping is for good. Reports may come from your audio thread. Gains are on the editor's own scale, which is cubic, so a speaker that converts a gain to amplitude sounds the way the author heard it.

A program that wants none of that can drive the scheduler by hand, and then takes on the driver's duties itself.

## When something goes wrong

A **story that fails** is not an error: it is the failed turn, with a message and the node, and your program shows it the way it would show an ending. The **errors** are about the program around the story, and they come in a handful of families every binding names:

- **The bundle will not open.** A document is missing or malformed, or the campaign was compiled for a newer contract than this engine plays.
- **The bundle needs Python and this engine has none.** See [How the engine ships](/explanation/how-the-engine-ships/) for the two variants.
- **A verb the story was not asking for**, as above.
- **A save that cannot be reunited** with this campaign.
- **An invalid argument**, where nothing was done.
- **A trap**: the engine itself panicked.

**A trap poisons its handle.** The story may be half-moved, so every later call on that campaign or session is refused without running. Recovery is the same in every binding: dispose of it, open the campaign again, and resume from your last checkpoint. That is a reason to checkpoint often, since a checkpoint is cheap.

Every message is English and meant for a log. Branch on the error's code and fields, never on its text.

## One caller at a time

A campaign or session is used by one caller at a time, and may move between threads. Every verb is synchronous: a passage takes microseconds. The exception is a story that runs Python, where a Script node runs to completion inside the verb, under the deadline the session was given. If that is too long to spend on your UI or render thread, own the session on a worker thread and send the effects back. They are plain values, so they travel.

## How a host proves it is right

Every engine release carries the **conformance fixtures**: small campaigns, each with the inputs to replay and the trace and callbacks a correct host produces. Every binding plays every fixture through its own API, both through the session and through the player, so a binding that passes is the engine as far as a story can tell. A host built on a binding inherits that and only has to test its own interface. For a quick check against your own campaign, the terminal player in every desktop engine archive, `ripple <bundle> --auto --seed N`, tells the story a host should tell for that seed.

## What comes next

These four bindings are the general-purpose layer: everything here, in a language's own idiom, with no opinion about what your program draws with or plays sound through. **Integrations for particular software, game engines first, are coming soon.** They will be built on these bindings and will fill in what a binding deliberately leaves to you, such as the speaker, the dialog box and the asset pipeline, the way that software expects.

## Related

- [How to play a campaign in your own program](/how-to/play-a-campaign-in-your-program/): the steps, in all four languages.
- [How the engine ships](/explanation/how-the-engine-ships/): what a binding puts in your build, the two variants, and why only the web has a ready-made speaker.
- [Engine platforms and variants](/reference/engine-targets/): every target, its floor, and which binding ships it.
- [JavaScript and TypeScript](/reference/binding-javascript/), [C and C++](/reference/binding-c-cpp/), [C#](/reference/binding-csharp/) and [Dart](/reference/binding-dart/): each binding's full API.
- [Host callbacks reference](/reference/host-callbacks/): the events an author can publish a name for.
