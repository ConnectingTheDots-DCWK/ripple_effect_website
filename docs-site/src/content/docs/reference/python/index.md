---
title: The Python API
description: The eighteen functions the app binds, the five places Python runs, what each may do, and how a refusal reads.
sidebar:
  order: 1
  label: Overview
---

Everything a script may call is a **host function**: bound under the name an
author types, present without an `import`, and answered by the app or by the
runtime playing a campaign. There is no `import ripple`, no class to
instantiate, and no object syntax — a component or an entity crosses as a
dict, because the interpreter has no `class`.

Eighteen names, in three groups:

| | |
| --- | --- |
| [Components and entities](/reference/python/components-and-entities/) | `component_names`, `component_get`, `entity_names`, `entity_get`, `entity_of`, `entity_set`, `entity_create`, `entity_delete`, `entity_rename`, and the three older ones — `component`, `components`, `set_attribute` |
| [Console variables](/reference/python/console-variables/) | `cvar_names`, `cvar_type`, `cvar_get`, `cvar_set`, `cvar_reset` |
| [Sounds](/reference/python/sounds/) | `play_sound` |

## The five surfaces

Who is asking decides what may happen. Every function is bound on every
surface; what differs is what a call *does*.

| Surface | Where | Reads | Writes |
| --- | --- | --- | --- |
| **script** | A Script node on a board | yes | yes |
| **passage** | `{{ … }}` and ```` ```ripple ```` in prose | yes | refused — *a passage describes the world* |
| **console** | The editor's Python console, at design time | definitions and defaults | refused — *no campaign is running* |
| **agent** | `python_eval` over MCP | definitions and defaults | refused — *no campaign is running* |
| **playthrough** | The campaign window's console, during play | yes | yes |

A **passage** is refused because of *where it is*: a state change should be
something you can point at on the canvas, and a goblin deleted by a sentence
has nothing on the board to point at. A sound is refused there for a
different reason — a passage's snippets run again on every redraw, so a bell
rung from prose would ring twice — and [its page](/reference/python/sounds/)
says so in its own sentence. The **console** and an **agent** are
refused because there is nothing here to change — a project with no
playthrough has no entities, and a console variable holds its default. Telling
somebody the first when the second is true sends them looking for a rule, so
the two sentences are different on purpose.

Reads still work at design time. `component_get` and `component_names` answer
from the files; `entity_names()` is `[]` and `entity_get(name)` is `None`,
which is an answer rather than a failure.

The **playthrough** surface may do everything a Script node may. It exists
because *Play from here* hands you a story that starts with nothing made, and
the console is how you stand in for the nodes the story did not run.

## Calling

Arguments that are required are positional; **every optional argument is
keyword-only**. One rule rather than one per function:

```python
entity_names(of="Goblin")          # right
entity_names("Goblin")             # raises: too many positional arguments
entity_create("Goblin-7", frm="Goblin")   # raises: unknown keyword, names the ones it knows
```

A wrong call raises rather than answering. The check matters because the
interpreter hands an unknown keyword straight through with no error, so
without it a typo in `of=` would quietly behave as though it were omitted.

The three functions from 1.2 — `component()`, `components()`,
`set_attribute()` — are exempt: every passage anybody has written calls them,
so what they do with a mistake is as frozen as their names.

**Host functions cannot be called inside `map()`, `filter()` or
`sorted(key=…)`** — the interpreter raises. Inside a `def` or a comprehension
they work:

```python
sorted(entity_names(), key=lambda n: entity_get(n)["HP"])   # raises

pairs = [(entity_get(n)["HP"], n) for n in entity_names()]  # works
weakest = sorted(pairs)[0][1]
```

## What a read hands back is a copy

A value crosses from the app to Python through JSON, so what `entity_get`,
`component_get` and `cvar_get` answer is a snapshot. This is legal, silent, and
does nothing:

```python
e = entity_get("Mira")
e["HP"] = e["HP"] - 3      # runs, changes nothing
```

`entity_set` and `cvar_set` are how a script writes. There is no fix and there
is not going to be one: a live handle needs `__setitem__`, which needs a
class, which the interpreter does not have.

## Refusals

Every refusal reaches Python as a **`RuntimeError`** carrying one sentence and
nothing else. A script can catch it:

```python
try:
    entity_create("Goblin-1", of="Goblin")
except RuntimeError:
    pass                    # it already existed
```

The three sentences a surface refuses with are fixed, because a script may
already have branched on which it got:

| | |
| --- | --- |
| A passage, any write | `a passage describes the world; only a Script node changes it` |
| Console or agent, an entity write | `no campaign is running, so there are no entities to change — press play, or put this in a Script node` |
| Console or agent, a variable write | `no campaign is running, so a console variable holds its default — press play, or put this in a Script node` |

A refusal inside a passage does not end the run. It renders in place as a
`⚠ RuntimeError: …` chip and the story carries on, which is why every message
is one line. A name quoted in a refusal is cut to about forty characters.

## The interpreter

[monty](https://github.com/pydantic/monty), a sandboxed Python subset. Not CPython: no `class`,
no `random`, no `import requests`, no filesystem, no real standard library.
What is there — and the list changes without notice — is what the **sandbox
report** behind the console's `i` button says on the day you ask it, and
`python_capabilities` answers the same text to an agent. Where this page and
that report disagree, the report is right.

A script that has not finished after five seconds is abandoned; see
[Python scripting](/overviews/python-scripting/#limits).

## Versioning

These names are a contract with every passage and script written against them
from 1.3 onward — `play_sound` from 1.4 — and are added to rather than
repurposed. The shape
`component_get` answers is shared with `component_read` over MCP, so an agent
that reads one and writes a script against the other meets one spelling.
