---
title: State machine files
description: The syntax of a *.fsm.mmd file, what the reader accepts and refuses, how the editor shows it, and what a saved game and an export carry of it.
---

## File

| Property | Value |
| --- | --- |
| Name | `*.fsm.mmd` |
| Content | A mermaid `stateDiagram-v2` |
| Version line | None. Mermaid owns the format, so the `stateDiagram-v2` header is the version mermaid gave it. |
| Created from | **New state machine** in the file tree's right-click menu |
| Rendered by | Any mermaid renderer |

The full mermaid syntax is mermaid's own [state diagram reference](https://mermaid.js.org/syntax/stateDiagram.html). The tables below give the subset Ripple Effect reads.

## Example

Every transition is `From --> To : event`.

```text
stateDiagram-v2
    [*] --> Locked
    Locked --> Unlocked : key
    Unlocked --> Open : push
    Open --> Unlocked : pull
    Unlocked --> Locked : lock
```

## Lines the reader understands

Before parsing, the reader strips `%%` comments, trims each line and skips blank lines.

| Line | Meaning |
| --- | --- |
| `stateDiagram` or `stateDiagram-v2` | The header. It must come first. A missing header is one error, and parsing continues. |
| `%%` … | Comment. |
| `direction …` | Ignored. |
| `[*] --> S` | The start: the state the machine begins in. |
| `S --> T : event` | A transition from `S` to `T` that fires on `event`. |
| `S --> [*] : event` | A transition to the end. |
| `state "Long name" as S` | A state with a label. |
| `state S` | A state with no label. |
| `S : description` | A state with a label taken from the description. |
| `note left of S : …`, `note right of S …` … `end note` | Ignored, as one line or as a block. |

A state id matches `[A-Za-z_][\w.\-]*`: letters, digits, underscores, dots and dashes, not starting with a digit.

## Lines the reader refuses

A refused line is reported with its line number.

| Line | Result |
| --- | --- |
| `state X <<choice>>` and other stereotypes | Refused |
| `state X {` (composite state) and a stray `}` | Refused |
| `--` (concurrency) | Refused |
| A second `[*] -->` | Error: a machine starts in one state. |
| `[*] --> [*]` | Error |
| No start, or an empty diagram | Error at line 0 |
| Any other line | Refused |

A diagram with any error yields no machine. A compiler carries an empty machine for it and says so.

## Warnings

| Case | Result |
| --- | --- |
| An arrow with no event | Drawn and kept in the transitions, but it can never fire, and an export does not write it to the transition table. The editor says so. |
| An event on the start arrow | Ignored. |

## Model

| Part | Content |
| --- | --- |
| Initial state | The target of the start arrow. |
| States | In order of first mention, never `[*]`. A label from `state "…" as` or `id : …` overrides a bare mention. |
| Transitions | In file order, each with `from`, `to`, `event` and `line`. |

## Editor

| Behaviour | Detail |
| --- | --- |
| Layout | The text on one side, the picture on the other. |
| Redraw | As you type. |
| Picture | Fitted to the pane and never scaled up. Zoom and pan; the **Fit to the pane** button fits it again. |
| Problems | Listed with their lines. |
| While the text does not parse | The last machine that parsed stays drawn, greyed. |
| Counts | A card shows how many states and transitions a machine has. |

## In a saved game

A save carries what every machine remembers. A save made before a project had machines reads as remembering nothing.

## In an export

A compiled campaign carries each machine as a transition table, so a runtime needs no mermaid parser. The compiler writes the table with the same reader the editor draws from, so a file that draws is a file that plays.

## Related

- [State machines](/explanation/state-machines/): why a machine is a drawing and how it behaves in a story.
- [How to add a state machine to a board](/how-to/add-a-state-machine/): the State machine node, its event and its instance.
- [Nodes](/reference/nodes/): the State machine node's ports.
- [Export options and bundle contents](/reference/export-options/): what a compiled campaign carries.
