---
title: MCP tools
description: The thirty-nine tools an assistant is offered over MCP, grouped as the app groups them — what each answers, what it takes, and which need Agents may edit.
sidebar:
  order: 2
---

Every tool the app offers a connected client, in the words the client sees
them by. The [overview](/overviews/working-with-an-ai-assistant/) says what
an assistant can do with them and the [setup page](/setup/connecting-an-mcp-client/)
how to connect one; this page is the list. An assistant reads the same
descriptions from the app itself, for the build and the project it has
open, so nothing here needs to be pasted into a prompt.

**Every description ends with a link back to this page**, at the tool's own
heading — so an assistant that wants more than a description has somewhere to
go without being told where. Three of them point elsewhere, because their
subject has a reference of its own: `python_eval` and `python_capabilities`
at [the Python API](/reference/python/), `node_types` and the two tools that
build nodes at [the node catalog](/reference/nodes/). For the whole of this
site as one file, there is [`/llms-full.txt`](/llms-full.txt), and
[`/llms.txt`](/llms.txt) indexes the shorter versions of it.

Thirty-nine tools, in six groups. The first four groups need **Agent
access**; the last two need **Agents may edit** as well, and a write tool
called while that is off answers `refused`.

| | Tools |
| --- | --- |
| [Orientation](#orientation) | `project_info`, `project_outline`, `catalog_find` |
| [Reading the story](#reading-the-story) | `board_read`, `passage_read`, `component_read`, `soundscape_read`, `board_links` |
| [What only the app can answer](#what-only-the-app-can-answer) | `trace_between`, `trace_into`, `translation_status`, `diagnostics_read`, `node_types`, `python_capabilities`, `python_eval` |
| [Playtesting](#playtesting) | `campaign_start`, `campaign_choose`, `campaign_answer`, `campaign_state`, `campaign_trace`, `campaign_autoplay`, `campaign_end` |
| [Writing](#writing) | `passage_write`, `passage_create`, `board_add_passage`, `board_add_node`, `board_connect`, `board_disconnect`, `board_set_choice`, `board_set_node`, `board_remove_node`, `component_write`, `file_create`, `file_move`, `file_delete`, `save` |
| [Sound](#sound) | `soundscape_set`, `soundscape_add_clip`, `soundscape_set_clip` |

## How to read the tables

**A reference** — every `board`, `passage`, `component`, `script`,
`soundscape` and `audio` argument — is a catalog id, an unambiguous prefix of
one (the short form a board digest prints after `@`), the name a person uses,
or the project-relative path `catalog_find` prints beside every entry. A name
that matches several entries comes back as `ambiguous` with the candidates
listed, rather than a guess; a path is never ambiguous.

**A node** is its id as a board digest prints it — `narration_3`, `jump_0` —
and node ids are numbered across the whole board rather than per type. **A
port** is its id — `choice_0`, `out`, `exec` — as the digest prints it.

**A locale** is a BCP 47 tag the project is written or translated in, and
defaults to the project's own default language. **A path** is always
project-relative. **A time** is always integer milliseconds.

An argument marked **required** must be sent; every other one may be left
out, and a write tool leaves out what you leave out.

Every answer is either a result or an error with a `code`, a `message` and
usually a `hint` naming the tool that would have answered:

| Code | When |
| --- | --- |
| `notRunning` | the app is closed, or Agent access is off |
| `noProject` | the app is running with nothing open |
| `notFound` | no entry by that id, name or path |
| `ambiguous` | a name matching several entries; `candidates` lists them |
| `conflicted` | the document has a conflict the author has not resolved |
| `refused` | Agents may edit is off, or the tool declines on policy — a clip on a lane the author locked, for one |
| `busy` | a campaign is already running, or a write is in flight |
| `outsideProject` | a path resolved outside the project root |
| `failed` | anything else, with the app's own words |

## Orientation

### `project_info`

What project is open, what languages it is written in, how much of each kind
of file it holds, and whether anything is unsaved or in conflict. Ask this
first if you need paths or locales. It also lists every console variable the
project declares, with its type and default and the boards it is scoped to.
Takes nothing.

### `project_outline`

The story's spine: every board, how big it is, where it ends and which board
it hands the story to. This is the first thing to read to understand a
project. Takes nothing.

### `catalog_find`

Find indexed files by name. Answers id, kind, name and project-relative path,
which is what every other tool takes.

| Argument | | What |
| --- | --- | --- |
| `query` | | Part of a name, case-insensitive. Omit to list everything. |
| `kind` | | Only entries of this kind: `board`, `macro`, `component`, `script`, `narrationBundle`, `machine`, `media`, `audio` or `soundscape`. |

## Reading the story

### `board_read`

One board as a digest: every node, what it points at, and every wire between
them with the words on it. About a twentieth of the size of the
`.graph.json`, which holds mostly geometry — read this rather than the file
unless you mean to change it. A node's metadata is printed as a `meta` line
under it.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `include` | | Any of `choices` — the words a player reads rather than the card labels; `prose` — each passage's text inline; `geometry` — node positions, for drawing. Nodes and wires are always included. |
| `locale` | | The language for `choices` and `prose`. |

### `passage_read`

One passage in every language it has, plus what the app knows that the files
do not: which translations have fallen behind, what Python is embedded in it,
and which nodes on which boards show it.

| Argument | | What |
| --- | --- | --- |
| `passage` | required | The passage. |
| `locale` | | One language. |

### `component_read`

One component: its name, its cover, and every attribute with the type it is
written as. Read this before `component_write` — it is the shape you are
merging into, and the types are the wire names a file uses rather than the
ones a person would guess.

| Argument | | What |
| --- | --- | --- |
| `component` | required | The component. |

### `soundscape_read`

One soundscape: the timeline's own properties, what the author has said
about its lanes, and every clip with its file resolved to a name and a path,
how long that file lasts, and how long the clip occupies on the timeline.
Times are milliseconds. Read this before the `soundscape_*` writes — the
clip ids are what `soundscape_set_clip` takes, and the lanes say where a
clip may go. `usedBy` names the Narration nodes that bring it.

| Argument | | What |
| --- | --- | --- |
| `soundscape` | required | The soundscape. |

### `board_links`

Which board hands the story to which, and where it lands. Answers both
directions for one board, or the whole project when given none. A board says
where it jumps to and nothing says what jumps at it, so this is the question
no single file can answer.

| Argument | | What |
| --- | --- | --- |
| `board` | | One board. Omit for every link in the project. |

## What only the app can answer

### `trace_between`

Every route between two passages: what lies on some path from one to the
other, across boards, split into the runs a reader would take. Answers the
union of the routes rather than a list of them, because a story that loops
has unboundedly many.

| Argument | | What |
| --- | --- | --- |
| `from` | required | A passage, or a node as `board/node`. The direction is discovered: both orders are tried and whichever has a route wins. |
| `to` | required | The other end. Same forms as `from`. |

### `trace_into`

Everything that leads to one passage, from wherever the story begins. The
question to ask about a passage when you do not already know where a reader
would have come from.

| Argument | | What |
| --- | --- | --- |
| `passage` | required | A passage, or a node as `board/node`. |

### `translation_status`

Which passages have fallen behind their source in each language, and which
have never been written. Reports passages only — the words on a choice live
on a node inside a board and are not covered, and the answer says so.

| Argument | | What |
| --- | --- | --- |
| `locale` | | Only this language. Omit for every language the project has. |

### `diagnostics_read`

What the app's messages panel is currently saying about this project: failed
operations, translations behind their source, passages nothing points at, and
what the engine found wrong with the shape of a board. Read-only. Takes nothing.

One row per message, seven columns:

```
code | severity | category | message | nodes | detail | path
```

**`code`** is empty for most of them — those are the app talking about a file
or an operation. A row that has one is a rule with a name, and
[the diagnostics reference](/reference/diagnostics/) says what each one means:
the letter is how loud it is (`E` a problem, `W` worth a look, `I` a record)
and the middle is what it is about. **`nodes`** names the cards a finding is
about, space-separated, which is what a person clicking that row would be shown.
**`category`** is the same word the panel groups by.

### `node_types`

Every kind of node a board can hold, read off the editor's own palette at
the moment of asking rather than written down anywhere: the type
`board_add_node` takes, what the card is called, and what it does. Read this
before adding a node of a type you have not used. Name one and it answers
that one in full — its fields and every port, which is what `board_connect`
takes. The same list, for the build these pages describe, is the [nodes
reference](/reference/nodes/).

| Argument | | What |
| --- | --- | --- |
| `type` | | One type, in full — `cvar.set`, `random.dice`, `input`. Omit for the whole palette, a line each. |

### `python_capabilities`

What the Python in this app can actually do, probed rather than documented:
about eighty tiny scripts run in a real interpreter just now, and judged
only by whether they raised. Read this before writing any Python. It is
monty, not CPython — there is no `random` module and no `class` statement at
all, which puts attribute access out of reach by every route. Takes
nothing; the same report the [Python overview](/overviews/python-scripting/)
describes.

### `python_eval`

Runs one snippet against this project's components and answers what it
printed, what it evaluated to, or how it failed. Use it to check a snippet
before writing it into a passage. It reads the component files as they are
and cannot change anything — the [agent surface](/reference/python/) of the
Python API.

| Argument | | What |
| --- | --- | --- |
| `source` | required | Python. The value of the last expression is the result, so end with the thing you want to see. |

## Playtesting

One campaign at a time, and it is the app's: if you have one paused in the
play window, `campaign_start` says so and refuses rather than throwing it
away. A playthrough lives in memory and writes nothing.

### `campaign_start`

Plays the story, for real: the same runner the author presses play on, with
the Python and the component instances that go with it. Answers the first
passage and what it offers. Boards are read as they are **on disk**, so
unsaved edits are not in what is being played, and the answer names them.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board to begin on. |
| `node` | | A node on that board to begin at instead of its Start. Restarting comes back here, not to the Start. |
| `locale` | | The language to read it in. |

### `campaign_choose`

Takes one of the choices the current passage offers, by its port id, and
answers the next passage.

| Argument | | What |
| --- | --- | --- |
| `portId` | required | From the choices on the last slide — `choice_0`, `choice_1` and so on. Not the words a reader sees. |

### `campaign_answer`

Fills in the form the story is waiting at — an Input node, which
`campaign_state` reports as state `input` with the fields it asks for — and
answers the next slide. A value per field name; a field left out is left
blank. Send a number as a number or as its text, a truth as `true` or
`"true"`, a list as an array or a comma-separated line: the story reads each
as the field's declared type either way.

| Argument | | What |
| --- | --- | --- |
| `values` | required | Field name to value, for the fields the last slide listed. |

### `campaign_state`

Where the playthrough is: the passage on screen, the choices it offers, the
language it is being read in, the console variables' values, and every
component it has materialised so far with what each one now holds. Takes
nothing.

### `campaign_trace`

What the playthrough has done so far, in order: the passages read and the
choices taken, the variables set and what they were, the dice rolled, the
boards jumped to, the entities forged, what a script printed, and anything
that went wrong. Each line names its board and node. The same record the
play window's trace panel draws.

| Argument | | What |
| --- | --- | --- |
| `after` | | Only lines with a key greater than this — the `next` of the last answer, to continue from where it stopped. Omit for everything kept. |
| `depth` | | `story` (the default) is what a reader could have noticed. `everything` adds the machinery underneath — every turn, the values evaluated, the scheduler's remarks — with a technical detail on each line. |
| `limit` | | At most this many lines, oldest first. Defaults to 200. |

### `campaign_autoplay`

Walks every branch of the story to a budget and reports what a human
playtester would never sit through: which endings are reachable, which
passages nothing reaches, where a path runs out of wire, which Jumps are
broken, and how much of what it read is untranslated. An Input node is
walked through with every field blank. Stops early and says so if it meets a
script that never finishes, since one of those cannot be stopped and costs a
core until the app is closed. Ends with no playthrough left running.

| Argument | | What |
| --- | --- | --- |
| `from` | | The board to walk from. Omit to walk from the board the current playthrough began on. |
| `budget` | | How many moves it may spend. Every restart and every replayed step counts, because taking a second branch means starting over and walking back to it. Defaults to 500. |

### `campaign_end`

Throws the playthrough away, component instances and all. There is one
campaign and the app owns it, so this is also how an assistant gives it back
to you. Takes nothing.

## Writing

Every tool from here on needs **Agents may edit**. Each goes through the
app's own document session for the file, so a call is one undo step, autosave
sees it, it is posted to Messages and listed in the agents panel, and a
document with an unresolved conflict is refused rather than written over.
Every write answers with the paths it changed.

### `passage_write`

Writes one language of one passage. Stamps the passage's translation record
for exactly the language written, which is the reason to use this rather
than an ordinary file write: a stamp written by hand is how a translation
comes to claim it is current when the prose beside it is not.

| Argument | | What |
| --- | --- | --- |
| `passage` | required | The passage. |
| `locale` | required | The language to write. It must be one the project is written in — `project_info` lists them. |
| `markdown` | required | The whole passage in that language. An empty string clears it. A link or image with a leading slash, `![map](/art/map.png)`, is measured from the project root and survives the passage being moved; one without is measured from the passage's folder. |
| `also` | | More languages, as locale to markdown, written in the same breath. Use this when translating rather than calling twice: the translation record is stamped once per write, and a translation stamped before its source reads as out of date. Written together, they are not. |

### `passage_create`

Makes a new passage beside the board that will show it, named
`<board>-<title>`. Answers its id, which `board_add_passage` takes. Beside
the board rather than anywhere else because a passage resolves its images
against its own folder's parent.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board it belongs to. |
| `title` | required | What to call it. Becomes part of the folder name. |
| `text` | | The prose, in the language the story is written in. Omit for an empty passage with just a heading. Links and images resolve as on `passage_write`. |

### `board_add_passage`

Adds a passage to a board: a Narration node **and** the passage file behind
it, wired to where it follows from. One undo step, so the whole thing goes
back with one Ctrl+Z.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `title` | required | The card's title, and the name of the passage made for it. |
| `after` | | A node on that board to follow from. The new passage is wired to its next free choice. |
| `via` | | The words a reader sees on the choice that leads here. Only meaningful with `after`. |
| `passage` | | An existing passage to show instead of making a new one. |

### `board_add_node`

Adds any node that is not a passage — a Jump to hand the story to another
board, an End, a Script, and every value and control node besides;
`node_types` is the list of what this build offers. Wires it to where it
follows from, in one undo step. Passages have their own tool,
`board_add_passage`, because it makes the passage file too.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `type` | required | What kind of node. `node_types` lists every one this build has, and the client is shown them as an enum with the card names beside them. |
| `title` | | What the card says. |
| `after` | | A node to follow from. Wired to its first free exit — a Start leaves by `out`, a passage by its next free choice. |
| `via` | | The words a reader sees on the choice that leads here. Only meaningful when `after` is a passage. |
| `target` | | For a Jump: the board it hands the story to. |
| `targetNode` | | For a Jump: a node on the target board to resume at, instead of its Start. |
| `script` | | For a Script node: the `.py` it runs. |
| `component` | | For a Component node: the component it materialises. |
| `macro` | | For a Macro node (type `macro`): the macro it calls. It comes with a port per thing that macro takes and answers. |
| `machine` | | For a State machine node (type `fsm`): the `.fsm.mmd` it drives. |
| `soundscape` | | For a Narration node: the soundscape that plays from this passage on, until another passage brings its own; `silence`, which stops what is playing; or `none`, which clears the field so the passage keeps whatever is playing. |
| `audio` | | For a Play sound node (type `flow.sound`): the audio file it cues, by name or path. Any audio file in the project is one. |
| `event` | | For a State machine node: the event it fires. Blank reads the state without moving; `[*]` resets. |
| `instance` | | For a State machine node, which copy of the machine; for a Component node, the name of the entity it makes. Blank means the machine itself, or the card's title. |
| `cvar` | | For a Get, Set or Variable branch node (types `cvar.get`, `cvar.set`, `cvar.branch`): the console variable it names, by name or id. `project_info` lists them, with the boards each is scoped to; prefer one scoped to this board or to none, as the editor offers. |
| `value` | | For a Set variable or Variable branch node: the literal, in the variable's type — a number, a boolean, a string, a list or an object. Refused when it does not fit. |
| `comparison` | | For a Variable branch node: `equal`, `notEqual`, `greater`, `greaterEqual`, `less` or `lessEqual`. |
| `metadata` | | The node's own metadata: names to values, yours to use for anything, which nothing on the board reads. Any node has it. Replaces what the node had — `{}` clears it. A value may be a number, a boolean, a string, a list of one of those, or any JSON under a name; the editor draws the flat ones as typed rows and the rest as JSON. |

### `board_connect`

Wires one port to another on a board. A choice goes to exactly one place, so
wiring one that already leads somewhere is refused rather than moved —
`board_disconnect` it first.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `from` | required | The node the flow leaves. |
| `fromPort` | required | The port it leaves by — `choice_0`, `out`, and so on. |
| `to` | required | The node it arrives at. |
| `toPort` | | Where it arrives. Defaults to that node's control input, which is what you want for every narrative node. |

### `board_disconnect`

Takes a wire out. The other half of `board_connect`, which refuses to move a
choice that already leads somewhere — disconnect it first, then connect it
where you meant.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `from` | required | The node the wire leaves. |
| `fromPort` | required | The port it leaves by. |

### `board_set_choice`

A choice's two strings. The **name** is what the card shows, so a branch can
be found on a wide board; the **text** is what a reader is offered, and it
has one per language. They are two strings and they stay two — a reader
offered "Choice 3" is being shown the author's notes. Merges, so setting one
does not clear the other or any translation. **times** is how often the path
may be taken, which a reader sees greyed out once it is spent.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `node` | required | The node the choice is on. |
| `portId` | required | Which choice — `choice_0`, `choice_1`, and so on. |
| `name` | | The card's label. Not shown to a reader. |
| `text` | | What a reader is offered, in one language. |
| `locale` | | Which language the text is in. Defaults to the language the story is written in. |
| `times` | | How many times this path may be taken in one playthrough. Counted for the whole campaign, so a jump back and a reloaded save find it as spent as it was. Leave it out to change nothing; send `0` to take the limit off. |

### `board_set_node`

Retitles a node, or changes what it points at — a Jump's board, a Script
node's file, a Component node's component, a Narration node's passage or
soundscape — or replaces its metadata. This is how a revision is made rather
than an addition. Every argument `board_add_node` takes for a node's kind is
taken here with the same meaning, and what you leave out is left as it is.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `node` | required | The node being changed. |
| `title` | | What the card says. |
| `passage` | | For a Narration node: the passage it shows. Its own prose, if it still had any, is cleared. |
| `targetNode` | | For a Jump: a node on the target board to resume at. Named apart from `node`, which is the node being changed. |
| `target`, `script`, `component`, `machine`, `soundscape`, `audio`, `event`, `instance`, `cvar`, `value`, `comparison`, `metadata` | | As on `board_add_node`. |

### `board_remove_node`

Takes a node off a board, and every wire touching it. Refuses the last
Start, because a board without one cannot be played at all.

| Argument | | What |
| --- | --- | --- |
| `board` | required | The board. |
| `node` | required | Its id. |

### `component_write`

Sets a component's attributes, and its name and cover. Attributes you name
are set or added; ones you do not are left alone, so a partial write cannot
drop the rest. Types are the wire names — `int`, `float`, `bool`, `string`,
`markdown`, `asset`, `componentRef` and `json`, each on its own or as
`list<…>` or `map<…>` — and numbers and booleans are written as JSON numbers
and booleans, never as strings. The older spellings, `assetList` and
`componentList`, are accepted and mean what they always did.

| Argument | | What |
| --- | --- | --- |
| `component` | required | The component. |
| `attributes` | | Each is `{label, type, value}`. `type` is required for an attribute that is not there yet, and optional for one that is. The value of a `list<asset>` or `list<componentRef>` is an array of project-relative paths. |
| `remove` | | Labels to delete. Separate from `attributes` so that sending two cannot silently drop five. |
| `name` | | What the component is called — which is what `component("...")` resolves by in a passage, so changing it changes every snippet that names it. |
| `cover` | | An image path, project-relative like every other path here. |

### `file_create`

Makes a new board, macro, component, script, state machine, soundscape, note
or folder, seeded the way the app seeds one — a board arrives with its Start
node, a macro with its Macro In and Macro Out. An assistant should not have
to know this app's on-disk shapes, and a hand-written board is one more
thing that can be subtly wrong. A **passage** is not here, because it goes
beside the board that shows it: `passage_create` makes one.

| Argument | | What |
| --- | --- | --- |
| `kind` | required | `board`, `component`, `script`, `machine`, `soundscape`, `note` or `folder`. |
| `name` | required | Without the extension; the right one is added. |
| `directory` | | Project-relative. Defaults to the top of the project. |

### `file_move`

Moves or renames a file, keeping its identity. This rather than an
assistant's own file tools: a Jump stores an id, and a rename made outside
the app issues a new one, which unwires every board that pointed at the file
without saying a word.

| Argument | | What |
| --- | --- | --- |
| `from` | required | A project-relative path. |
| `to` | required | Where it goes, project-relative, including the file name. Both a move and a rename at once are fine. |

### `file_delete`

Removes a file from the project, and from the index, the tree and the open
tabs with it. **This is the one thing here that cannot be undone** — a board
edit is in the undo stack and a passage is in version control, and this is
neither. Refuses the project's own bookkeeping, an ordinary folder, and
anything with unsaved edits, and posts a caution rather than an info to
Messages.

| Argument | | What |
| --- | --- | --- |
| `path` | required | A project-relative path. A passage folder counts as one file. |

### `save`

Writes out what the app is holding but has not put on disk. Use it when a
tool refuses because a file has unsaved edits. It **saves and does not
resolve**: a file something else changed while the app held edits to it is a
decision you have pending, and it is named in the answer and left alone.

| Argument | | What |
| --- | --- | --- |
| `path` | | Project-relative. Omit to write everything that is waiting. |

## Sound

Three writes for a soundscape, beside `soundscape_read` above and
`file_create(kind: "soundscape")`. Every time is milliseconds, and every
call is one edit on the timeline's own session — one undo step in the
editor, and a clip added while the tab is open appears on it. Nothing here
imports a sound: `catalog_find(kind: "audio")` lists what the project holds,
and a file that is not in it is yours to add. Nothing here reaches the
editor's mute and solo either, since those are not in the file.

**A clip tool answers where the clip settled, not where it was asked for.**
The timeline keeps one clip per spot on a lane and pushes a clip put down on
another past it; the answer carries the clip as it landed, with `moved: true`
and a sentence when the start or the lane is not what was sent.

### `soundscape_set`

Sets the timeline's own properties — how long one pass is, whether it starts
over, its fades and gain, and whether it is tied to the passage that starts
it — and names or locks its lanes. What you leave out is left alone.

| Argument | | What |
| --- | --- | --- |
| `soundscape` | required | The soundscape. |
| `length` | | One pass of the timeline, in ms. A clip past it is cut there unless its mode is `auto`. |
| `loop` | | Whether the timeline starts over at its length. |
| `fadeIn` | | How long the whole soundscape takes to come up from silence when it starts, in ms. 0 is none. |
| `fadeOut` | | How long it takes to fall silent when another soundscape replaces it or a passage stops it, in ms. 0 cuts. |
| `volume` | | Gain over the whole soundscape, 0 to 1. |
| `tied` | | `true` stops it the moment the story leaves the passage that started it; `false` keeps it playing until another passage brings its own, which is what a bed under a chapter wants. |
| `lanes` | | Each is `{lane, name?, locked?}`, merged into what the author has said about that lane. A lane is its number, counting from 0 at the top; a name is for the person looking at the timeline and never reaches the story. A locked lane takes no more clips. An empty name takes the name away. |

### `soundscape_add_clip`

Puts one audio file on the timeline as a clip and answers the clip as it
settled, with the id `soundscape_set_clip` takes. Every field but `audio` is
optional: a clip starts at 0, plays the whole file once at full gain, and
goes on the first lane with room for it, past any lane the author has
locked. A lane named outright that is locked is `refused`, with the
`soundscape_set` that unlocks it.

| Argument | | What |
| --- | --- | --- |
| `soundscape` | required | The soundscape. |
| `audio` | required | The sound, by id, name or project-relative path — `catalog_find(kind: "audio")` lists them. |
| `lane` | | Which row of the timeline, counting from 0 at the top. |
| `start` | | Where on the timeline the clip begins, in ms. |
| `clipStart` | | Where in the file the clip starts playing from, in ms into the file. 0 is the beginning. |
| `clipEnd` | | Where in the file the clip stops, in ms into the file — or the word `end` to play to the end of the file, which is what a clip does until it is trimmed. A number past the file's length is refused. |
| `volume` | | Gain, 0 to 1, relative to the soundscape's own. |
| `speed` | | Playback rate; 1 is the file's own. Above 0. |
| `fadeIn` | | A ramp up at the clip's start, in ms; 0 is none. On an `auto` clip it ramps every play, and every turn of a gapless one. |
| `fadeOut` | | A ramp down at the clip's end, in ms; 0 cuts. |
| `mode` | | How the clip behaves when the timeline comes round. `once` — plays at its position on the first pass and never again: a door, a stinger. `loop` — plays at its position on every pass of a looping timeline and is cut where the timeline ends: rain that restarts with the rain. `auto` — starts at its position and then loops over itself for as long as the soundscape is in force, with no regard for where the timeline ends: music, a bed. With an `interval`, `auto` is a sound every so often instead. |
| `interval` | | For an `auto` clip: the silence between one play ending and the next beginning, in ms. 0 is gapless — a bed. Anything else is a bell every so often. Read by no other mode. |

### `soundscape_set_clip`

Changes one clip — any of its fields, or the file it plays — or takes it off
the timeline. What you leave out is left alone; `clipEnd: "end"` untrims a
clip back to the end of its file.

| Argument | | What |
| --- | --- | --- |
| `soundscape` | required | The soundscape. |
| `clip` | required | The clip's id, as `soundscape_read` prints it. |
| `audio` | | A different sound for this clip, by id, name or path. The trim, the gain and the mode stay as they are. |
| `lane`, `start`, `clipStart`, `clipEnd`, `volume`, `speed`, `fadeIn`, `fadeOut`, `mode`, `interval` | | As on `soundscape_add_clip`. |
| `remove` | | `true` takes the clip off the timeline; every other argument is then ignored. |

## Beyond the tools

**Resources**, for the files that are already the answer. A client can attach
one as context with no tool call: `ripple://project` is the project's
settings, `ripple://board/{id}` and `ripple://macro/{id}` a board's or a
macro's digest, `ripple://passage/{id}` a passage in every language under a
`## <locale>` heading (and `ripple://passage/{id}/{locale}` one of them),
and `ripple://component/{id}`, `ripple://script/{id}`,
`ripple://machine/{id}` and `ripple://soundscape/{id}` the file verbatim. The list names each by its catalog name and path, is
rebuilt on every request, and a client that subscribes is told when a
resource changes — including when you edit a board an assistant is holding.

**Two prompts**, invoked by you rather than by the assistant, each arriving
with the thing you name already in it: *writing-a-passage* (`passage?`) —
what a passage is on disk, the two forms embedded Python takes, and what
monty cannot do; and *editing-a-board* (`board?`) — how node ids are
numbered, where a choice's two strings live, what a wire's caption is and is
not, what a Jump stores, and how a soundscape is laid out.
