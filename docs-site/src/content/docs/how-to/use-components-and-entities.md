---
title: How to use components and entities
description: Make a component, give it typed attributes, put it on a board as a component or an entity, and spawn, delete and list the entities a story has made.
---

Use this to make a component and put it, or entities made from it, on a board. For what the two are, see [Components and entities](/explanation/components-and-entities/).

## Make a component

1. In the file tree, create a **New component**. It is saved as a `*.component.json` file.
2. Set a name and, if you want one, a cover picture.
3. Add a row per attribute. Give each a label, a type and a value. Drag rows to reorder them.
4. Choose each type from the attribute's type menu. Each can stand on its own, as a list or as a map from names.

A `markdown` attribute keeps its six-line editor when you change its type from the menu.

Add only the attributes this story needs. The types and how the file stores them are in [Project files and the .ripple folder](/reference/project-files/).

### Point an attribute at a file

An `asset` or `componentRef` attribute, or the items of a list of them, is filled by name.

1. Type in the slot. The project's files are offered, with the full path beside each.
2. Pick one. It sits in the slot as a chip with its name on it; hover to see the path.

A chip is marked when its file is outside the project or missing; fix or replace the file. Dotted folders and files, and anything outside the project, are not offered.

### Use a cover or file from outside the project

A cover picked from outside the project is copied into `.ripple/external/`, so the file never records a path that works on one machine only.

Copying in is a switch: run **Toggle importing outside assets** from the command palette. With it off, the file is linked instead.

A cover that is still outside the project shows a caution under the field with **Copy into project** beside it. Messages names every such link each time the project is opened.

## Put a component on a board

1. Drag the `*.component.json` from the file tree onto a board. It becomes a **Component** node with one typed output per attribute, plus one that carries the whole component as a map.
2. Choose the node's mode. The node says which one it is in.
   - **Component** is a window onto the file: outputs and nothing else.
   - **Entity** makes the story a thing, keyed by the name on the node. Attribute inputs appear beside the outputs.

To make two independent swords, use two Entity nodes with two names. A node on a later board that names the same entity is the sword the first board made.

To change an entity later, put another node naming it later in the story. There is no Set/Get pair; that node is the setter.

To make one entity per name, wire the node's name from upstream. Wire the name from upstream, for example from a For node, to make one entity per name it is handed.

## Make several entities at once

1. Add a **Spawn** node from the **Entities** category of the node menu.
2. Point it at a component and say how many.
3. Choose how they are told apart: numbers or letters, and what goes between them. "Goblin" with numbers and a dash makes Goblin-1, Goblin-2 and so on.
4. Wire the names it hands on, as a list, into whatever gives each one its own values, for example a Python script that sets each one's hit points. See [How to read and change entities from Python](/how-to/use-entities-from-python/).

Spawn makes the same entities every time. Coming back to the node finds the goblins it already made rather than six more, so a paused campaign resumes into the encounter it left. For a second wave, use a different name.

## Remove an entity

Add a **Delete Entity** node and give it the name. The entity is forgotten; the component file is untouched, so a node naming it later makes a fresh one.

Deleting a name nothing answers to is not an error. It removes nothing and the story carries on.

## Branch on whether an entity exists

Add an **Entity Exists** node and wire its answer into an If node.

## Do something to every entity

1. Add an **Entity Names** node. It answers the names of every entity the story has made, alphabetically. To limit it to one component, choose that component.
2. Wire its `names` output into a For node with a List at node.
3. Put the work to do for each one inside the loop. For example, to reach the goblins still standing two passages later, put the work inside the loop.

## Related

- [Components and entities](/explanation/components-and-entities/) for what a component and an entity are
- [Project files and the .ripple folder](/reference/project-files/) for the component file format
- [Nodes](/reference/nodes/) for the Component, Spawn, Delete Entity, Entity Exists and Entity Names nodes
- [Components and entities in Python](/reference/python/components-and-entities/) for the calls a script uses
- [The campaign window and saved games](/reference/campaign-window/) for the Entities panel
- [How to read and change entities from Python](/how-to/use-entities-from-python/) as a see-also
