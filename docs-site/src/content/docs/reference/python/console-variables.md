---
title: Console variables
description: The five functions over a project's console variables, the twenty-four types, and the one rule every write obeys.
sidebar:
  order: 3
---

Five functions over the [console variables](/overviews/console-variables/) a
project declares: typed, named values with a default, set anywhere and read
anywhere, across boards and across saves. They sit on the same five
[surfaces](/reference/python/#the-five-surfaces) as the components API.

| function | answers | where it writes |
| --- | --- | --- |
| `cvar_names()` | every name, in declaration order | — |
| `cvar_type(name)` | the type, spelled as the file spells it | — |
| `cvar_get(name)` | what it holds now; a list or map as a **copy** | — |
| `cvar_set(name, value)` | `None`; the value is coerced or refused | Script node, playthrough console |
| `cvar_reset(name)` | `None`; back to the default | Script node, playthrough console |

At design time — the editor's console, or an agent — a variable holds its
default, and `cvar_get` answers that. A passage may read and not write.

A name nothing declares raises `there is no console variable called "<name>"`
on every function that takes one, and it is checked **before** the surface,
so a passage with a typo hears about the typo rather than about passages. A
blank name is `<function>: needs a name`.

## Types

Eight scalars and, for each, a list and a string-keyed map — twenty-four, and
the set is closed. The same twenty-four every editor in the app offers.

| `type` | holds | default |
| --- | --- | --- |
| `int` | a whole number | `0` |
| `float` | a number | `0.0` |
| `bool` | `true` or `false` | `false` |
| `string` | text | `""` |
| `markdown` | text with a renderer | `""` |
| `asset` | a project-relative path to a file | `""` |
| `componentRef` | a project-relative path to a component | `""` |
| `json` | any JSON value at all | `{}` |
| `list<T>` | an ordered list of the scalar, for each of the eight | `[]` |
| `map<T>` | string keys to the scalar, for each of the eight | `{}` |

`cvar_type` answers one of those twenty-four strings. A declared variable
never holds `None`.

**`markdown`, `asset` and `componentRef` behave as `string`.** They say what
a variable is *for*, which is what the editor draws a six-line field or a
path from; the engine has no filesystem and does not check that a path
resolves.

**`json` is the one that nests.** It takes a list or a dict as itself, so a
`list<json>` holds lists and a `map<json>` holds dicts. Everything else may
not: a scalar type refuses a collection, always.

## Coercion

**Every write is lossless or refused**, and one function decides: the Set
node, `cvar_set`, the campaign panel and the compiler all ask it, so an author
meets one rule everywhere.

| into | accepted | refused |
| --- | --- | --- |
| `int` | an int; a whole, finite float (`3.0` → `3`); the text of either (`"42"`, `" 42 "`, `"3.0"`) | `3.5`, `"3.5"`, NaN, an infinity, a bool, other text, any collection, `None` |
| `float` | any number, as a float (`2` → `2.0`); the text of a number | a bool, other text, any collection, `None` |
| `bool` | a bool; exactly the text `true` or `false`, trimmed | `"True"`, `"yes"`, `1`, `0`, `""`, any collection, `None` |
| `string`, `markdown`, `asset`, `componentRef` | text as itself; a number or a bool as its text (`42` → `"42"`, `True` → `"true"`) | any collection, `None` |
| `json` | **anything at all**, as it stands: a scalar, a list, a dict | `None`, and nothing else |
| `list<T>` | a list whose every element coerces to `T` | any scalar (never wrapped), a map, a list with one element that does not coerce, `None` |
| `map<T>` | a map whose every key is a string and every value coerces to `T` | any scalar, a list, a non-string key, a value that does not coerce, `None` |

A coerced collection is a fresh list or map, never the one handed in.

The refusal is one sentence, and it is the same sentence a Set node's report
and a card's error text say:

> `<name> holds a <type>, and <value> is not one`

with *an* before a type beginning with a vowel, a string value quoted, a list
named as *a list*, a map as *an object*, and `None` as *nothing*. So
`gold holds an int, and 3.5 is not one`, and
`tags holds a list<string>, and "sword" is not one`.

## Refusals

Every refusal is a `RuntimeError` a script can catch. A write from a passage
gets the components API's own sentence — *a passage describes the world; only
a Script node changes it* — and a write from the editor's console or an agent
gets this API's:

> `no campaign is running, so a console variable holds its default — press play, or put this in a Script node`

Both are frozen; a script may already have branched on which it got.

## Examples

```python
# Spend gold if there is enough.
gold = cvar_get("gold")
if gold >= 25:
    cvar_set("gold", gold - 25)

# A list is a copy: append to it, then write it back.
tags = cvar_get("tags")
if "wanted" not in tags:
    tags.append("wanted")
    cvar_set("tags", tags)

# Coercion: these land, and the last one is refused.
cvar_set("gold", 3.0)        # 3
cvar_set("gold", "42")       # 42
try:
    cvar_set("gold", 3.5)    # RuntimeError: gold holds an int, and 3.5 is not one
except RuntimeError:
    pass

# What the project declares, with types.
declared = {name: cvar_type(name) for name in cvar_names()}
```

## In a save, in an export

A saved game carries every variable by name. A save from before the project
had one holds it at its default; a variable removed from the declarations is
dropped on resume; one retyped so its saved value no longer fits falls back
to the default.

A compiled campaign carries the declarations — name, type and default — and a
runtime starts every playthrough from them. A project copy carries the file
itself, `.ripple/cvars.json`.
