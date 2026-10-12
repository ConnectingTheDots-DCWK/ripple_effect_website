---
title: Components and entities
description: The twelve Python functions over a campaign's components and the entities a playthrough has made, with the arguments, answers and refusals of each.
sidebar:
  order: 2
---

A **component** is what a `*.component.json` file describes. An **entity** is one the story has made from it, keyed by name. Nine functions read definitions, read entities, and write entities; three older functions are kept.

These are host functions, not a Python library: there is no module to import them from, and they cannot be called inside `map()`, `filter()` or `sorted(key=…)`. A comprehension works.

Where a function may be called is decided by the [surface](/reference/python/#surfaces). Every function reads on every surface. The four writes (`entity_set`, `entity_create`, `entity_delete`, `entity_rename`) work in a Script node and in the playthrough console, and are refused elsewhere.

## Summary

| Function | Answers | Writes | Raises |
| --- | --- | --- | --- |
| `component_names()` | list of component names, in name order | no | never |
| `component_get(name)` | the component as its file describes it, or `None` | no | never |
| `entity_names(of=None)` | list of entity names, in name order | no | `of` names no component |
| `entity_get(name)` | a copy of the entity's attributes, or `None` | no | never |
| `entity_of(name)` | the name of the component it was made from, or `None` | no | never |
| `entity_set(name, attribute, value)` | `None` | yes | no entity under `name` |
| `entity_create(name, of=None)` | the new entity's attributes | yes | name taken; `of` names no component |
| `entity_delete(name)` | `None` | yes | no entity under `name` |
| `entity_rename(name, to)` | `None` | yes | no entity under `name`; `to` taken |

`of` is passed by keyword: `entity_names(of="Goblin")`, `entity_create("Goblin-7", of="Goblin")`. A wrong argument count or an unknown keyword is refused with a message naming the function.

## Definitions

### `component_names()`

Every component the campaign holds, in name order. Components only; `components()` runs components and entities together.

### `component_get(name)`

One component as its file describes it: labels, types and starting values, as a dict, or `None`. Resolves by name or by catalogue id.

```python
>>> component_get("Goblin")
{
  "id": "9f2c…",
  "name": "Goblin",
  "cover": "art/goblin.png",
  "attributes": [
    {"label": "HP",    "type": "int",       "value": 7},
    {"label": "Rate",  "type": "float",     "value": 1.5},
    {"label": "Alive", "type": "bool",      "value": True},
    {"label": "Bio",   "type": "markdown",  "value": "A small, angry thing."},
    {"label": "Loot",  "type": "list<asset>", "items": ["gold.png"]}
  ]
}
```

| Key | Present | Holds |
| --- | --- | --- |
| `id` | always | the component's catalogue id |
| `name` | always | the component's name |
| `cover` | only when the file has one | a path |
| `attributes` | always | an ordered list of `label`, `type` and `value` |
| `items` (on an attribute, in place of `value`) | only on the two lists of paths, `list<asset>` and `list<componentRef>` | the list of paths |

Values cross as native Python types: an `int` is an `int`, and a `json` attribute is the decoded dict or list. The shape is the one `component_read` answers over MCP, without `path`.

**`type` is an open set.** It is the wire name: one of `int`, `float`, `bool`, `string`, `markdown`, `asset`, `componentRef` or `json`, on its own or as `list<…>` or `map<…>`, twenty-four in all. A type this version does not know keeps the spelling the file gave it, so a script that switches on `type` needs a default branch.

**A path is relative to whatever answered.** The editor answers paths relative to the project; a compiled campaign answers paths into its own media folder. Do not join a path onto a directory of your own. In a played campaign, a file the project does not have is left out of the answer.

**An entity never shadows a definition.** `component_get` does not depend on whether an entity of that name has been made. This is the one place it differs from `component()`.

## Entities, read

### `entity_names(of=None)`

Every entity the story has made, in name order. `of` names a component and limits the list to entities made from it. `of` naming no component raises (*there is no component called …*); `of=None`, or an empty name, is no filter. At design time the answer is `[]`.

### `entity_get(name)`

The entity's attributes as a dict, or `None` when the story has made nothing under that name. It does not fall back to the component file.

| Answer | Means |
| --- | --- |
| `None` | no such entity |
| `{}` | an entity with no attributes |

Both are falsy. The dict is a copy: changing it changes nothing, and `entity_set` writes. At design time the answer is `None`.

### `entity_of(name)`

The name of the component the entity was made from, or `None` for an entity made from no component or a name nothing answers to. `component_get(entity_of("Goblin-1"))` is the definition behind an entity.

## Entities, written

Script node and playthrough console only. On a passage, the refusal is *a passage describes the world; only a Script node changes it*. On the editor's console and for an agent over MCP, it is *no campaign is running, so there are no entities to change — press play, or put this in a Script node*.

### `entity_set(name, attribute, value)`

Writes one attribute. Answers `None`. Raises when nothing answers to `name`: *the campaign has made no entity called …*. An attribute the component never had can be written; components and entities are schemaless.

### `entity_create(name, of=None)`

Makes an entity and answers its attributes, for example `entity_create("Goblin-7", of="Goblin")["HP"]`.

| Call | Result |
| --- | --- |
| `of` omitted, a component of the same name exists | made from that component, as a Component node in Entity mode does |
| `of` omitted, no such component | an entity with no attributes |
| `of` given and naming no component | raises: *there is no component to make … from* |
| `name` already taken | raises: *… is already taken, and it never takes over a name that exists* |

`entity_create` is never get-or-create. The board's Component and Spawn nodes are get-or-create.

### `entity_delete(name)`

Unmakes an entity. Answers `None`. Raises when nothing answers to `name`. It leaves no tombstone: a Component node still naming the entity makes a fresh one from the file if it runs again. The Delete Entity node behaves the same way.

### `entity_rename(name, to)`

Renames an entity, keeping what it is and what it holds. Answers `None`. Raises when nothing answers to `name`, and when `to` is taken: *… is already taken, so … was not renamed to it*. Renaming to the name it already has does nothing.

The component it came from does not change: a renamed goblin still groups under Goblin in the entities panel, and `entity_of` still answers `Goblin`.

:::caution
A Component node reads its entity name off the node on every visit. After `entity_rename("Goblin-7", "Steve")`, the next run of that node finds nothing under `Goblin-7` and makes a fresh goblin from the file. This is the delete rule applied to rename.
:::

## Kept functions

Bound on every surface, with their original behaviour. The sandbox panel lists them in amber with the replacement.

| Function | Superseded by | Behaviour |
| --- | --- | --- |
| `component(name)` | `component_get(name)` for the definition, `entity_get(name)` for what the story has changed | The attributes of a component or entity as a dict, or `None`. An entity of the same name wins over the definition. `component()` with no argument is `None`. |
| `components()` | `component_names()` and `entity_names()` | Every name that can be asked for, components and entities together. |
| `set_attribute(name, attribute, value)` | `entity_set(name, attribute, value)`, which says why when it cannot | `True` when the write landed, `False` when it did not; with fewer than three arguments, `False`. In the editor's console it answers `False`, since there is no entity. A passage and an agent are refused in words, as for every other write. |

`component()` shadows; neither `component_get` nor `entity_get` does, which is why the replacements are two functions rather than one.

## Related

- [Components and entities](/explanation/components-and-entities/) explains what the two are and why a passage may read and not write.
- [How to read and change entities from Python](/how-to/use-entities-from-python/) applies these functions.
- [How to use components and entities](/how-to/use-components-and-entities/) covers the board side.
- [The sandbox and its limits](/reference/python/sandbox/) lists the kept functions.
- [Python reference](/reference/python/#refusals) lists the fixed refusal sentences of each surface.
