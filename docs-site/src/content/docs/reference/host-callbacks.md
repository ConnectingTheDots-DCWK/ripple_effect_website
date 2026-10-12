---
title: Host callbacks
description: The rules for a callback's name, the eighteen events, the targets that aim one, what happens to a target that is gone, and the callbacks.json file.
---

A host callback is a **name** and an **event**, optionally aimed at one thing the event happens to. It is declared on the **Host callbacks** page, opened from the activity bar button or the command palette, and stored in `.ripple/callbacks.json`. A callback carries no code and cannot change the story.

## Declaration

| Field | Rule |
| --- | --- |
| Name | An identifier-shaped word, such as `chapterTwoBegan`. Unique in the project. Trimmed, non-empty, and free of control characters, so it cannot hold a line break. |
| Event | One of the eighteen events below. The set is closed. |
| Target | Optional. Absent means every occurrence of the event. Only the fields the chosen event can use are offered. |

Renaming a callback breaks any host code registered under the old name.

Changing a callback's event removes any target fields the new event cannot use. A field the new event requires cannot be filled in for you, so that change is refused until the target has it.

The **Forget it** button removes a declaration after a confirmation. A host listening for that name never receives it again.

## Events

| Event | Fires when | May be aimed at | Must be aimed at |
| --- | --- | --- | --- |
| `story.started` | a playthrough begins | nothing | |
| `story.ended` | the story reaches an End | nothing | |
| `story.failed` | the story stops because something went wrong | nothing | |
| `board.entered` | the story arrives on a board | board | |
| `passage.shown` | a passage is put in front of the reader | board, node | |
| `choice.taken` | the reader takes a choice | board, node | |
| `soundscape.changed` | the soundscape in force changes | nothing | |
| `delay.started` | a Delay node begins waiting | board, node | |
| `delay.elapsed` | a Delay node's wait is over | board, node | |
| `cvar.changed` | a console variable moves | console variable, `equals` | console variable |
| `entity.spawned` | the story makes something | component | |
| `entity.removed` | the story forgets something | component | |
| `entity.renamed` | something the story made is renamed | component | |
| `entity.field.changed` | an attribute of something the story made moves | component, attribute | attribute |
| `machine.state.entered` | a state machine enters a state | state machine, state | state machine |
| `node.entered` | the flow arrives at a card | board, node | |
| `node.exited` | a card's turn is over | board, node | |
| `node.failed` | the story breaks at a card | board, node | |

The three `node.*` events came with bundle format 14 and the other fifteen with format 13. The event names are the words a host matches on. They are the same in every language and are written exactly as shown in the host's code.

### Node events

`node.entered`, `node.exited` and `node.failed` fire on every turn a card takes, whatever kind of card it is.

- A passage exits once the reader has chosen, not when it appears. `node.entered` fires as the flow arrives, which for a passage is just before it is shown. `node.exited` fires once the reader has answered and the turn is finished.
- A loop that runs a card four times fires four times. The **Only when it becomes a particular value** condition (`equals`) applies to values, and a turn has no value.
- A card inside a macro cannot be picked, because a macro is spliced into the board that calls it and its cards are on no canvas under their own names. Aim at the card that calls the macro, which is what the picker offers.

## Targets

An event with no target fires at every occurrence. The notification carries which board, entity or value, so a host can also filter on its own side.

| Target field | Panel label | Meaning |
| --- | --- | --- |
| `board` | Board (default: Every board) | A board, by its catalog id, so a renamed or moved board is still the same board. |
| `node` | Node (default: Any node) | A node on that board. Requires `board`; the picker reads "Pick a board first" until one is chosen. |
| `cvar` | Console variable | A console variable, by its editor id, so renaming the variable leaves the declaration alone. |
| `equals` | Only when it becomes a particular value, then Value | A condition on `cvar.changed`. The value field has the variable's own type. It can be typed only once a variable is picked, and picking another variable drops a condition typed against the first. The file accepts any JSON value for `equals`; whether it fits the variable's declared type is checked by the compiler. |
| `component` | Component (default: Every component) | A component, by its catalog id. Aimed at the component, never at one entity, because entity keys are made while the story runs. |
| `attribute` | Attribute | An attribute label on that component. With no component picked, any attribute of that name on anything the story made. |
| `machine` | State machine | A state machine instance name, not a node. |
| `state` | State (default: Any state) | A state on that machine. Absent means any transition of the machine. |

### The equals condition

`equals` fires on the transition into the value, not on holding it.

| Write | Fires |
| --- | --- |
| `score` set to 100 when it is already 100 | no |
| `score` drops to 50, then climbs back to 100 | yes, on reaching 100 again |

## Missing targets

| Target gone | Compiled campaign | Panel |
| --- | --- | --- |
| Board | The callback is left out, with a warning (`W.GE.16`). | The Board field says the board is gone and the callback is left out. |
| Console variable | The callback is left out, with a warning from the compiler. | The Console variable field says so. |
| Component | The callback is left out, with a warning from the compiler. | The Component field says so. |
| Node | The callback travels intact and never fires. Whether a node id is on a board is not checked when the campaign is built. Flagged as `W.GE.16`. | The Node field says so while the board it names is open. |

`W.GE.16` is named for the board and node cases; no code is stated for the other two. The declaration stays in `callbacks.json` in every case, so restoring the board from version control brings the callback back. A callback is never removed from the file for you.

## Host callbacks side panel

The campaign window has a **Host callbacks** side panel. It lists every fire with its name, its event, the payload fields that are set, and the result of the lookup. The editor publishes the names but has no host registered against them, so every fire normally shows as a name a host would have looked up. A name with nothing registered is not an error, and the story plays exactly as it would have.

## `.ripple/callbacks.json`

```json
{
  "version": 1,
  "callbacks": [
    { "id": "cb_8f21", "name": "storyBegan", "event": "story.started" },
    { "id": "cb_7f3a", "name": "achievementHit", "event": "cvar.changed",
      "target": { "cvar": "gold", "equals": 100 } }
  ]
}
```

| Key | Rule |
| --- | --- |
| `version` | Integer. A file with no `version` is broken, not old. A file from a newer build is refused, and the panel does not write to it. |
| `callbacks` | Array. Absent reads as none. |
| `id` | Required string. The editor's own handle, used to tell a rename from a delete and a create. It never reaches the compiled campaign. |
| `name` | Required. The rules under [Declaration](#declaration). A repeated name is refused. |
| `event` | Required. One of the eighteen events. Anything else is refused. |
| `target` | Object. Absent, null and `{}` all mean every occurrence. The event decides which keys are legal; a key the event cannot use is refused. `node` without `board` is refused. |

The file is separate from `project.json`, so a refusal does not affect the project's title or languages. It is not catalogued and does not open as a document.

## What travels

| Carried by | What it holds |
| --- | --- |
| A project copy | `.ripple/callbacks.json`. |
| A compiled campaign | The table a host dispatches from: name, event and target. |

No handler travels, because none is written here.

## Limits

- A callback is a notification only; it cannot change the story.
- `soundscape.changed` reports which soundscape came into force, and nothing finer: not a loop, a fade or a timeline marker.
- Callbacks are not ordered against the host's frames. The engine returns a batch of everything a move led to, the callbacks among it. A callback arrives before the page it is about is drawn; when a handler runs after that is the host's to schedule.

## Related

- [Host callbacks](/explanation/host-callbacks/): why the story names an occasion and the host writes the handler.
- [How to declare, aim and forget a host callback](/how-to/declare-a-host-callback/)
- [How to play and test a campaign](/how-to/play-a-campaign/)
- [The campaign window and saved games](/reference/campaign-window/): the Host callbacks side panel.
- [Diagnostics](/reference/diagnostics/): the `W.GE.16` warning.
