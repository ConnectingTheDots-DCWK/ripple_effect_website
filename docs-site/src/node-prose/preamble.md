Every card the Create menu offers, grouped as it groups them. For each: what
it is for, in the card's own words; what is on the card; the ports it takes
and the ports it answers on; and, where one exists, something to read. An
agent gets the same list for the build it is talking to from `node_types`.

A port carries either **flow** — the story, pushed from card to card — or a
value, pulled when a card needs it. The [boards
overview](/overviews/boards-and-nodes/#two-kinds-of-wire) says how the two are
run and the one rule that follows. Every card's way in is `exec` unless the
table says otherwise, and every value port is typed: a `number` joins a
`number`, `any` joins anything.

**Five cards let you declare their own ports** — Output, Input, Script, Macro
In and Macro Out. Double-click one and each row is a name and a type, and a
type is two questions: **what it is** — `int`, `float`, `bool`, `string`,
`markdown`, `asset`, `component` or `json` — and **how many of it**: one, a
list, or a map of names to it. Twenty-four in all, and every one of the five
offers the same twenty-four, as do a component's attributes and the console
variables.

Two older words, `number` and `entity`, are still read wherever they appear
and are no longer suggested: `int` or `float` says which, and an entity is a
name, which is a `string`.

What a row *declares* and what its port *carries* are deliberately not the
same set. `int` and `float` both carry `number`, because a wire that would not
join a whole number to an Operator expecting a number is a wire nobody wants.
A lone `asset`, `component` or `markdown` carries `string`, since each of them
is a path or some text. A **list** of assets or of components carries the tag a
component's own `assetList` and `componentList` attributes carry, so those
join each other. A map carries `json`. The file keeps the narrower word
whichever way it goes, so nothing is lost by the port being broad.

**An Input node's types are narrowed on the way into a campaign**, and that
is the one thing worth knowing about them. What it declares is drawn as a
form for the reader to fill in, and a form has no file picker — so an `asset`
field reaches whoever is playing as a text box asking for a path. You may
still declare it: the word is kept in your project, where it says what the
field is for.

**A Macro In's takes and a Script node's inputs can carry a default** — what
the slot is worth when nothing fills it. Where the card's own literal and a
wire both answer a port, **the wire wins**, and the field on the card
disappears while the wire is attached; where neither is there, the declared
default stands in, and where there is no default either, the type's own blank
does. A default on a `json` or a `map<…>` slot cannot travel, and the app
says so when you compile.

**Every card can carry metadata of your own.** Right-click it and choose
*Edit metadata…*: a list of names, types and values — `int`, `float`, `bool`,
`string`, a list of each, and `json` for anything nested — and a small tag on
the card's header while there is any. A shorter list than a port may declare,
and for a structural reason: a node stores the value and not its type, so the
editor reads the type back off the value's own shape when it opens. An
`asset` and a `string` would be the same thing written down, so it does not
offer the difference; a whole `3` and a fractional `3.0` are not, so it does. Nothing on the board reads it; it is yours, for a status, a
reviewer's note, a mark for a tool of your own. It travels with the node into
a compiled campaign and to an agent, and a copied node arrives with its notes.
