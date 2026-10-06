---
title: Components and entities
description: The twelve functions over a campaign's components and the entities a playthrough has made — what each answers and what each refuses.
sidebar:
  order: 2
---

Nine functions, plus the three from 1.2 that are kept. A **component** is what
a `*.component.json` file describes; an **entity** is one the story has made
from it, keyed by name. Read access to definitions with their types; read and
write access to entities, including making, unmaking and renaming them.

Where a function may be called is decided by the [surface](/reference/python/#the-five-surfaces).
In short: everything reads everywhere; the four writes work in a Script node
and in the playthrough console, and are refused elsewhere.

## Definitions

### `component_names()`

Every component the campaign holds, in name order. Components only — unlike
`components()`, which runs the components and the entities together.

### `component_get(name)`

One component as its file describes it, or `None`. Resolves by name or by
catalog id.

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
    {"label": "Loot",  "type": "assetList", "items": ["gold.png"]}
  ]
}
```

- `cover` is present only when the file has one; `items` only on the two
  lists of paths, `list<asset>` and `list<componentRef>`. Values cross as
  native Python types — an `int` is an `int`, a `json` attribute is the
  decoded dict or list.
- **`type` is an open set.** It is the wire name: one of `int`, `float`,
  `bool`, `string`, `markdown`, `asset`, `componentRef` or `json`, on its own
  or as `list<…>` or `map<…>`. The older spellings — `assetList`,
  `componentList`, `numberList` — are still in files written before those
  words changed, and a type this version does not know keeps the spelling the
  file gave it. A script switching on `type` needs a default branch.
- **A path in it is relative to whatever answered.** The editor answers paths
  relative to the project; a compiled campaign answers paths into its own
  media folder. Both are what that reader can fetch bytes by, and a script
  that joins one onto a directory of its own is already wrong. In a played
  campaign, a file the project does not actually have is left out of the
  answer rather than travelling as a name nothing can open.
- **An entity never shadows a definition.** Asking what a Goblin *is* does not
  depend on whether one has been made yet. This is the one place it disagrees
  with `component()`.

The shape is the same one `component_read` answers over MCP, minus `path`.

## Entities, read

### `entity_names(of=None)`

Every entity the story has made, in name order. `of` names a component:
`entity_names(of="Goblin")` is every goblin. `of` naming no component
**raises** — it is a typo, not a filter that matches nothing.

### `entity_get(name)`

The entity's attributes as a dict, or `None` when the story has made nothing
under that name. It does **not** fall back to the file: the question is what
the story has, not what it could have.

`None` and `{}` are different answers — the first is "no such entity", the
second "an entity with no attributes". Both are falsy, so
`if entity_get(name):` has asked the wrong question; `entity_get(name) is None`
is the right one.

The dict is a copy. Changing it changes nothing; `entity_set` is how you
write.

### `entity_of(name)`

Which component the entity was made from, as that component's name, or `None`
— for an entity made from no component, or for a name nothing answers to.

It exists because `entity_get` answers the attributes *directly*, so there is
nowhere in that dict to put the provenance without colliding with a real
attribute label. The two compose: `component_get(entity_of("Goblin-1"))` is
the definition behind an entity.

## Entities, written

All four are Script node and playthrough console only.

### `entity_set(name, attribute, value)`

Writes one attribute. Answers `None`; raises when nothing answers to `name`.
An attribute the component never had can still be written — a component is
schemaless by design, and so is an entity.

### `entity_create(name, of=None)`

Makes one and answers its attributes, so
`entity_create("Goblin-7", of="Goblin")["HP"]` is one line.

- `of` omitted means "a component of the same name, if there is one" — what a
  Component node in Entity mode does. Omitted with no such component makes an
  entity with no attributes, which is legal.
- `of` **given** and naming nothing raises: an explicit `of="Gobln"` is a typo
  rather than a request.
- **A name that is taken raises.** It is never get-or-create. The board's
  Component and Spawn nodes *are* — that is what lets one be re-entered and
  the other survive a pause — but a script asking for a name it can already
  see wants to be told, three passages before the mistake would otherwise
  show.

### `entity_delete(name)`

Unmakes one. Answers `None`; raises when nothing answers to `name`.

It leaves no tombstone: a Component node still naming it will make a fresh
one from the file if it runs again. The Delete Entity node behaves the same
way.

### `entity_rename(name, to)`

Renames one, keeping what it is and what it holds. Answers `None`. Raises
when nothing answers to `name`, and when `to` is taken. Renaming to the name
it already has does nothing.

The component it came from does not move: a renamed goblin still groups under
Goblin in the entities panel and `entity_of` still answers `Goblin`.

:::caution
**A rename can make the board duplicate it.** A Component node reads its
entity name off the node, every visit — so after
`entity_rename("Goblin-7", "Steve")`, the next time that node runs it finds
nothing under `Goblin-7` and makes a fresh goblin from the file. This is the
tombstone rule applied to rename, and it is the one consequence of this API
most likely to surprise.
:::

## The three from 1.2

Unchanged, still bound on every surface, and not going away — every passage
anybody has written calls them. The sandbox panel lists them in amber with
what to reach for instead.

| Kept | Superseded by |
| --- | --- |
| `component(name)` | `component_get(name)` for the definition, `entity_get(name)` for what the story has changed |
| `components()` | `component_names()` and `entity_names()`, which do not run the two together |
| `set_attribute(name, attribute, value)` | `entity_set(name, attribute, value)`, which says why when it cannot |

`component()` **shadows** — an entity of the same name wins over the
definition — and neither `component_get` nor `entity_get` does. That
asymmetry is why the replacements are two rather than one.

`set_attribute` answers `True` when the write landed and `False` when it did
not. In the editor's console it answers `False` — truthfully, there is no
entity — where a passage and an agent are refused in words, as for every
other write. `component()` with no arguments is `None` and
`set_attribute("a", "b")` is `False`; their handling of a mistake is as
frozen as their names.

## Examples

```python
# The weakest goblin, by hit points.
pairs = [(entity_get(n)["HP"], n) for n in entity_names(of="Goblin")]
weakest = sorted(pairs)[0][1] if pairs else None

# Damage one, and forget it when it drops.
if weakest is not None:
    hp = entity_get(weakest)["HP"] - damage
    if hp > 0:
        entity_set(weakest, "HP", hp)
    else:
        entity_delete(weakest)

# Make a named one only if the story has not already.
try:
    entity_create("Boss", of="Goblin")
except RuntimeError:
    pass

# A component's fields, with their types, as one dict.
fields = {}
for attr in component_get("Goblin")["attributes"]:
    if "items" in attr:
        fields[attr["label"]] = attr["items"]
    else:
        fields[attr["label"]] = attr["value"]
```
