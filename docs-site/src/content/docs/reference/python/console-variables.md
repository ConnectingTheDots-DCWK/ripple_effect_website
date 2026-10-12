---
title: Console variables
description: The five Python functions over a project's console variables, the twenty-four types, the coercion table and the refusals.
sidebar:
  order: 3
---

Five functions over the console variables a project declares: typed, named values with a default, set anywhere and read anywhere, across boards and across saves. They are bound on the same five [surfaces](/reference/python/#surfaces) as the components API.

## Functions

| Function | Answers | Writes on |
| --- | --- | --- |
| `cvar_names()` | every name, in declaration order | — |
| `cvar_type(name)` | the type, spelled as the file spells it | — |
| `cvar_get(name)` | what the variable holds now; a list or map is a **copy** | — |
| `cvar_set(name, value)` | `None`; the value is coerced or refused | Script node, playthrough console |
| `cvar_reset(name)` | `None`; the variable returns to its default | Script node, playthrough console |

At design time (the editor's console, or an agent) a variable holds its default, and `cvar_get` answers that. A passage may read and not write.

Every function that takes a name raises `there is no console variable called "<name>"` for a name nothing declares. The name is checked **before** the surface, so a passage with a typo is told about the typo, not about passages. A blank name raises `<function>: needs a name`.

## Types

Eight scalars and, for each, a list and a string-keyed map: twenty-four types. The set is closed, and every editor in the app offers the same twenty-four.

| `type` | Holds | Default |
| --- | --- | --- |
| `int` | a whole number | `0` |
| `float` | a number | `0.0` |
| `bool` | `true` or `false` | `false` |
| `string` | text | `""` |
| `markdown` | text with a renderer | `""` |
| `asset` | a project-relative path to a file | `""` |
| `componentRef` | a project-relative path to a component | `""` |
| `json` | any JSON value | `{}` |
| `list<T>` | an ordered list of the scalar `T`, for each of the eight | `[]` |
| `map<T>` | string keys to the scalar `T`, for each of the eight | `{}` |

`cvar_type` answers one of those twenty-four strings, such as `int`, `markdown`, `json`, `list<string>` or `map<float>`. A declared variable never holds `None`.

`markdown`, `asset` and `componentRef` behave as `string`. They state what a variable is for, which is what the editor draws a six-line field or a path from; the engine has no filesystem and does not check that a path resolves.

`json` is the one type that nests. It takes a list or a dict as itself, so a `list<json>` holds lists and a `map<json>` holds dicts. Every other type refuses a collection where it expects a scalar.

## Coercion

Every write is lossless or refused. One function decides, and the Set node, `cvar_set`, the campaign window and the compiler all ask it.

| Into | Accepted | Refused |
| --- | --- | --- |
| `int` | an int; a whole, finite float (`3.0` becomes `3`); the text of either (`"42"`, `" 42 "`, `"3.0"`) | `3.5`, `"3.5"`, NaN, an infinity, a bool, other text, any collection, `None` |
| `float` | any number, as a float (`2` becomes `2.0`); the text of a number | a bool, other text, any collection, `None` |
| `bool` | a bool; exactly the text `true` or `false`, trimmed | `"True"`, `"yes"`, `1`, `0`, `""`, any collection, `None` |
| `string`, `markdown`, `asset`, `componentRef` | text as itself; a number or a bool as its text (`42` becomes `"42"`, `True` becomes `"true"`) | any collection, `None` |
| `json` | anything, as it stands: a scalar, a list, a dict | `None`, and nothing else |
| `list<T>` | a list whose every element coerces to `T` | any scalar (never wrapped), a map, a list with one element that does not coerce, `None` |
| `map<T>` | a map whose every key is a string and every value coerces to `T` | any scalar, a list, a non-string key, a value that does not coerce, `None` |

A coerced collection is a fresh list or map, never the one passed in.

### Refusal sentence

A refused write reads:

```text
<name> holds a <type>, and <value> is not one
```

*an* replaces *a* before a type beginning with a vowel. A string value is quoted, a list is named *a list*, a map *an object*, and `None` *nothing*. Examples: `gold holds an int, and 3.5 is not one`; `tags holds a list<string>, and "sword" is not one`.

The Set node's report and a card's error text use the same sentence.

## Refusals

Every refusal is a `RuntimeError` a script can catch.

| Caller | Sentence |
| --- | --- |
| passage | the components API's own: *a passage describes the world; only a Script node changes it* |
| editor console, agent | `no campaign is running, so a console variable holds its default — press play, or put this in a Script node` |

Both sentences are fixed.

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

## In a save and an export

| Item | Rule |
| --- | --- |
| Saved game | carries every variable by name |
| Variable absent from a save | holds its default |
| Variable removed from the declarations | dropped on resume |
| Variable added while a campaign is paused | present on resume |
| Variable retyped so the saved value no longer fits | falls back to the default |
| Compiled campaign | carries each declaration (name, type, default); every playthrough starts from them |
| Project copy | carries `.ripple/cvars.json` itself |

The twenty-four types are carried by `.ripple/cvars.json` version 3 and saved-game format 5. A save records what each variable held, not its type, so a build older than that format refuses a newer save.

## Related

- [Console variables](/explanation/console-variables/): what a variable is for and where it lives.
- [How to declare and scope a console variable](/how-to/declare-console-variables/)
- [Console variable declarations](/reference/console-variable-declarations/): the file format.
- [The sandbox and its limits](/reference/python/sandbox/)
