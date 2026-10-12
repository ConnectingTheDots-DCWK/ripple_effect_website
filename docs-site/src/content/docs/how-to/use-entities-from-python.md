---
title: How to read and change entities from Python
description: Find, damage, delete, create and inspect entities from a Script node, using the component and entity functions.
---

Five recipes over the entities a playthrough has made from a component. Each assumes a component called `Goblin` with an `HP` attribute, and a script that runs in a Script node or the playthrough console. Reading works on every [surface](/reference/python/#surfaces); `entity_set`, `entity_create`, `entity_delete` and `entity_rename` work only in a Script node and the playthrough console, and are refused elsewhere. `damage` stands for a number the script already has.

## Find the weakest goblin

1. Collect each goblin's hit points with its name, using `entity_names(of="Goblin")`.
2. Sort the pairs and take the name from the first, guarding against there being none.

```python
pairs = [(entity_get(n)["HP"], n) for n in entity_names(of="Goblin")]
weakest = sorted(pairs)[0][1] if pairs else None
```

`weakest` is a name, or `None` when the story has made no goblins. To test whether an entity exists, use `entity_get(name) is None`: an entity with no attributes answers `{}`, which is falsy too.

## Damage an entity and delete it when it drops

1. Read its `HP` and subtract the damage.
2. Write the new value back with `entity_set` while it is above zero.
3. Call `entity_delete` when it is not.

```python
if weakest is not None:
    hp = entity_get(weakest)["HP"] - damage
    if hp > 0:
        entity_set(weakest, "HP", hp)
    else:
        entity_delete(weakest)
```

Both `entity_set` and `entity_delete` raise when nothing answers to the name. Deleting leaves no tombstone: a Component node that still names the entity makes a fresh one from the file if it runs again. Renaming has the same effect, so avoid `entity_rename` on an entity a Component node names: after `entity_rename("Goblin-7", "Steve")` the node finds nothing under `Goblin-7` and makes a fresh goblin from the file.

## Create an entity only if the story has not already

`entity_create` is never get-or-create: it raises when the name is taken, so catch the error when you do not mind.

```python
try:
    entity_create("Boss", of="Goblin")
except RuntimeError:
    pass
```

The `except` clause also swallows the error raised when `of` names no component, which is a typo rather than an empty filter, so check the spelling of `of` first. The call answers the new entity's attributes, so `entity_create("Goblin-7", of="Goblin")["HP"]` reads the starting hit points in one line.

## Collect a component's values into one dict

1. Call `component_get("Goblin")`, which answers the definition as its file describes it, or `None`.
2. For each entry in `attributes`, take `items` when it has one (the two lists of paths, `list<asset>` and `list<componentRef>`), and `value` otherwise.

```python
fields = {}
for attr in component_get("Goblin")["attributes"]:
    if "items" in attr:
        fields[attr["label"]] = attr["items"]
    else:
        fields[attr["label"]] = attr["value"]
```

Each attribute also carries its `type`. Switch on it with a default branch, because the set is open.

## Find the definition behind an entity

`entity_of` answers the component an entity was made from, and `component_get` takes that name:

```python
definition = component_get(entity_of("Goblin-1"))
```

## Related

- [Components and entities](/reference/python/components-and-entities/) lists every function, what it answers and what it refuses.
- [Components and entities, explained](/explanation/components-and-entities/) covers what a component and an entity are.
- [How to run Python in a story](/how-to/script-a-passage/) covers the Script node these recipes run in.
- [The sandbox and its limits](/reference/python/sandbox/) lists what a script may call.
