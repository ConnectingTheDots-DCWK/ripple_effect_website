---
title: Console variables
description: Why a story keeps state in declared, typed variables rather than wires, and what that costs and buys.
---

A story can carry state with no wire at all. A project declares **console variables**: the game-engine idea, at the size a story needs. Each is a typed, named value with a default, set anywhere, read anywhere, across boards and across saves, and every playthrough starts with each one at its default. Three nodes use them: Get variable, Set variable and Variable branch (see [Nodes](/reference/nodes/)).

The alternative is to run a wire from wherever a value is decided to wherever it is used. That works on one board and gets worse with every board you add, because a board is meant to be reusable and a wire ties it to its neighbour. A variable inverts the arrangement: a Set variable on one board and a Variable branch on another need no wire between them, because the variable is the wire. The cost is that the connection is no longer visible on the canvas, which is why a variable is declared in one place, with a type, rather than invented at the node that first needs it.

The three nodes take the flow rather than being pulled by a wire, so a read after a write in the flow always sees the write. See [How a story runs](/explanation/how-a-story-runs/) for the model behind it.

## A declaration is a name, a type and a default

Every variable is declared on the project's Console variables page as a name, a type and a default. The declarations live in `.ripple/cvars.json`, beside the project's settings, and travel with the project.

A node that uses a variable stores the variable's id, not its name. That is the reason renaming is free: every board that names the variable follows the rename, because none of them ever held the name. The same decision is why a declaration is something you edit in one place rather than something each node carries a copy of.

The types are a closed set, the same twenty-four every other editor in the app offers: eight kinds of value (`int`, `float`, `bool`, `string`, `markdown`, `asset`, `componentRef` and `json`), each on its own, in a `list<…>` or in a `map<…>`.

Some of the eight are the same kind of value under another purpose. `markdown`, `asset` and `componentRef` are text as far as what you may write into them goes; they say what the variable is *for*. `json` is the open one: it holds a list or an object as it stands, so a `list<json>` is a list of lists if that is what you put in it. No type accepts an empty value.

## Scope is offered, not enforced

A variable can be scoped to boards. The page has a **Boards** column per variable, reading *Everywhere* until you tick some. A Get variable, Set variable or Variable branch node then offers only the variables scoped to its board or to none, and a node already pointed at a variable scoped elsewhere keeps its name and says *Not scoped to this board* under it.

That is all a scope does. It decides where a variable is *offered*, not where it can be read: at play time a variable belongs to the campaign, a script names any of them from anywhere, and nothing about a scope reaches a bundle. The word promises more than it delivers, so treat a scope as a promise the author keeps, not one the engine checks.

Scope is a change to the file format that an older build refuses rather than reading: it would write the file back without the scopes on its next save. The current version numbers are in [Console variable declarations](/reference/console-variable-declarations/).

## Every write is lossless or refused

Because any node, script or panel can write any variable, the type is defended at every door. One rule is asked by the Set variable node, by Python, by the campaign panel and by the export alike: a value is coerced to the declared type when nothing is lost, and refused otherwise.

A whole number goes into an `int`; `3.5` does not. The text `"42"` goes into an `int`; `"forty-two"` does not. `true` and `false` go into a `bool`; `"yes"` and `1` do not. A scalar is never wrapped into a list.

Where the refusal lands depends on who is typing. A value that does not fit is refused as you type it on a card. One that arrives on a wire wrong ends the run with a message naming the node:

> `gold holds an int, and 3.5 is not one`

The full table of conversions is in the [reference](/reference/python/console-variables/#coercion).

## Saves and exports

A saved game carries every variable. A save from before the project had one holds it at its default; a variable added while a campaign is paused is there when it resumes; one removed is gone.

A save records what each variable held and not its type, so an older build refuses a newer save outright rather than restoring a value it cannot tell apart from another. Format numbers are in the reference pages.

An export carries `.ripple/cvars.json` beside the project's settings, so a scaffold opens with every card still pointing at its variable, and a compiled campaign carries the declarations in its own form.

## Related

- [How to declare and scope a console variable](/how-to/declare-console-variables/)
- [Console variable declarations](/reference/console-variable-declarations/)
- [Console variables in Python](/reference/python/console-variables/)
- [The campaign window and saved games](/reference/campaign-window/)
- [Components and entities](/explanation/components-and-entities/)
