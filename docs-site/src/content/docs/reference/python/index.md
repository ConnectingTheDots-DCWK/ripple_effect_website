---
title: Python reference
description: The eighteen host functions Python in a story may call, the five surfaces they run on, how arguments are checked and how a refusal reads.
---

Every function a script may call is a **host function**: bound under the name an author types, present without an `import`, and answered by the app or by the runtime playing a campaign. There is no `import ripple`, no class to instantiate and no object syntax. A component or an entity crosses as a dict, because the interpreter has no `class`.

## Functions

Eighteen names, bound on every surface, in three groups. Signatures are the ones the app registers; the page for each group lists what every function answers and refuses.

### Components and entities

Detail: [Components and entities](/reference/python/components-and-entities/).

| Function | Does |
| --- | --- |
| `component_names()` | Every component the project holds. |
| `component_get(name)` | One component as its file describes it, as a dict of labels, types and starting values, or `None`. A type you do not recognise is one a later version wrote. |
| `entity_names(of=None)` | What the story has made, all of it or only what came from one component. |
| `entity_get(name)` | A snapshot of one entity's attributes, or `None`. Changing the dict changes nothing. |
| `entity_of(name)` | Which component an entity was made from, or `None`. |
| `entity_set(name, attribute, value)` | Writes one attribute. |
| `entity_create(name, of=None)` | Makes an entity from a component and answers its attributes. Refuses a name that is taken. |
| `entity_delete(name)` | Unmakes one. The board's nodes still name it and make a fresh one if they run again. |
| `entity_rename(name, to)` | Renames one, keeping what it is and what it holds. A node still naming the old one makes a fresh one if it runs again. |
| `component(name)` | The attributes of a component or entity, as a dict, or `None`. Superseded by `component_get` for the definition and `entity_get` for what the story has changed. |
| `components()` | Every name you can ask for. Superseded by `component_names` and `entity_names`, which do not run the two together. |
| `set_attribute(name, attribute, value)` | Writes to an entity; `True` when it landed. Superseded by `entity_set`, which says why when it cannot. |

### Console variables

Detail: [Console variables](/reference/python/console-variables/). A value is coerced to the declared type when that loses nothing, and refused otherwise.

| Function | Does |
| --- | --- |
| `cvar_names()` | Every console variable, in declaration order. |
| `cvar_type(name)` | Its type as the file spells it: one of the twenty-four, such as `int`, `markdown`, `json`, `list<string>` or `map<float>`. |
| `cvar_get(name)` | What it holds now. A list or map is a copy. |
| `cvar_set(name, value)` | Writes it, coercing to the declared type when nothing is lost and refusing otherwise. |
| `cvar_reset(name)` | Puts it back to its default. |

### Sound

Detail: [Sounds](/reference/python/sounds/).

| Function | Does |
| --- | --- |
| `play_sound(path, volume=1.0, speed=1.0)` | Plays the file at `path` (`sfx/bell.ogg`, as the project spells it) once and returns at once. `volume` runs from 0 to 1, `speed` from a little above 0. |

A soundscape is set on a passage, not from Python.

## Surfaces

Who is asking decides what may happen. Every function is bound on every surface; what differs is what a call does.

| Surface | Where | Reads | Writes |
| --- | --- | --- | --- |
| `script` | A Script node on a board | Yes | Yes |
| `passage` | `{{ … }}` and ```` ```ripple ```` in prose | Yes | Refused |
| `console` | The editor's Python console, at design time | Definitions and defaults | Refused |
| `agent` | `python_eval` over MCP | Definitions and defaults | Refused |
| `playthrough` | The campaign window's console, during play | Yes | Yes |

- A passage refuses writes because of where the call runs: a state change belongs in a node you can point at on the canvas.
- A passage refuses a sound because its snippets run again on every redraw.
- The console and an agent refuse writes because nothing is running at design time: a project with no playthrough has no entities, and a console variable holds its default.
- Reads work at design time. `component_get` and `component_names` answer from the files. `entity_names()` is `[]` and `entity_get(name)` is `None`. These are answers, not failures.
- The playthrough surface may do everything a Script node may. *Play from here* starts a story with nothing made, and this console stands in for the nodes the story did not run.

The reasons are in [Python in a story](/explanation/python-in-a-story/).

## Calling

Required arguments are positional. The optional `of` is keyword-only. `play_sound` is the exception: `volume` and `speed` may be given by position or by name. No keyword other than those listed is accepted.

```python
entity_names(of="Goblin")                 # right
entity_names("Goblin")                    # raises: too many positional arguments
entity_create("Goblin-7", frm="Goblin")   # raises: unknown keyword, names the ones it knows
```

| Function | Positional | Keywords |
| --- | --- | --- |
| `entity_names` | 0 | `of` |
| `entity_create` | 1 | `of` |
| `play_sound` | 1 to 3 | `volume`, `speed` |

Other functions take exactly the positional arguments in their signature and no keywords. A wrong call raises rather than answering. `component`, `components` and `set_attribute` are exempt: what they do with a mistake is as frozen as their names.

**Host functions cannot be called inside `map()`, `filter()` or `sorted(key=…)`.** The interpreter raises. Inside a `def` or a comprehension they work:

```python
sorted(entity_names(), key=lambda n: entity_get(n)["HP"])   # raises

pairs = [(entity_get(n)["HP"], n) for n in entity_names()]  # works
weakest = sorted(pairs)[0][1]
```

## Reads are copies

A value crosses from the app to Python through JSON, so what `entity_get`, `component_get` and `cvar_get` answer is a snapshot. Changing it is legal, silent and has no effect:

```python
e = entity_get("Mira")
e["HP"] = e["HP"] - 3      # runs, changes nothing
```

`entity_set` and `cvar_set` are how a script writes.

## Refusals

Every refusal reaches Python as a `RuntimeError` carrying one sentence and nothing else.

```python
try:
    entity_create("Goblin-1", of="Goblin")
except RuntimeError:
    pass                    # it already existed
```

The sentences a surface refuses with are fixed, because a script may already have branched on which it got.

| Refused | Sentence |
| --- | --- |
| A passage, any write | `a passage describes the world; only a Script node changes it` |
| Console or agent, an entity write | `no campaign is running, so there are no entities to change — press play, or put this in a Script node` |
| Console or agent, a variable write | `no campaign is running, so a console variable holds its default — press play, or put this in a Script node` |
| A passage, `play_sound` | `a passage cannot play a sound — its snippets run again every time it is redrawn, so put this on a Play sound node or in a Script node` |
| Console or agent, `play_sound` | `no campaign is running, so there is nothing to play this through — press play, or put this on a Play sound node` |

A refusal inside a passage does not end the run. It renders in place as a `⚠ RuntimeError: …` chip and the story carries on, which is why every message is one line. A name quoted in a refusal is cut to about forty characters.

## Interpreter

The interpreter runs a sandboxed Python subset, not CPython: no `class`, no `random`, no `import requests`, no filesystem, no real standard library. What is available is what the **sandbox report** behind the console's `i` button states on the day you ask, and `python_capabilities` returns the same text to an agent. Where this page and the report disagree, the report is right.

A script that has not finished after two seconds is stopped. See [The sandbox and its limits](/reference/python/sandbox/).

## Versioning

These names are a contract with every passage and script written against them from 1.3 onward (`play_sound` from 1.4), and are added to rather than repurposed. The shape `component_get` answers is shared with `component_read` over MCP.

## Related

- [Python in a story](/explanation/python-in-a-story/): why Python is a host surface and what each surface is for.
- [How to run Python in a story](/how-to/script-a-passage/)
- [How to build a campaign with no Python](/how-to/turn-python-off/)
- [MCP tools](/reference/mcp-tools/): `python_eval`, `python_capabilities` and `component_read`.
