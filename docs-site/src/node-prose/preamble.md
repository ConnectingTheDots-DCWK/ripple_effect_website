Every card the Create menu offers, in the menu's order and under its categories. Each entry gives, in this order: what the card is for, in the card's own words; what is on the card; the ports it takes and the ports it answers on; and, where one exists, something to read. An agent receives the same list for the build it is talking to from `node_types`.

**Ports.** A port carries either *flow* or a value. Flow is the story, pushed from card to card; a value is read when a card takes its turn, and is whatever the card at the other end last published. A card's way in is `exec` unless its table says otherwise. Every value port is typed: a `number` joins a `number`, and `any` joins anything. How the two kinds are run is in [Board and navigation rules](/reference/canvas-rules/); the cards that declare, keep or read state across a playthrough are grouped in [Node families, slots and state](/reference/node-families/).

**Cards that declare ports.**

| Card | Where the declaration is opened |
| --- | --- |
| Output, Input, Macro In, Macro Out | Double-click the card. |
| Script | The *Inputs* and *Outputs* buttons, which open the same dialog. |
| Narration | The *Reads* row at the bottom of the card, which shows how many names the passage is given. |

Each row is a name and a type. A type answers two questions: what it is, and how many of it.

| Question | Values |
| --- | --- |
| What it is | `int`, `float`, `bool`, `string`, `markdown`, `asset`, `component`, `json` |
| How many of it | one, a list, or a map of names to it |

That is 24 types. Output, Input, Script, Macro In and Macro Out each offer the same 24, as do a component's attributes and the console variables. `number` and `entity` are still read wherever they appear and are no longer suggested: `int` or `float` says which, and an entity is a name, which is a `string`.

**Declared type and port type.** What a row declares and what its port carries are not the same set. The file keeps the declared word.

| Declared | Port carries |
| --- | --- |
| `int`, `float` | `number` |
| A single `asset`, `component` or `markdown` | `string` |
| A list of assets or of components | The tag a component's own `assetList` and `componentList` attributes carry, so those join each other |
| A map | `json` |

**Input.** An Input node's types are narrowed on the way into a campaign. What it declares is drawn as a form for the reader to fill in, and a form has no file picker, so an `asset` field reaches the player as a text box asking for a path. The declaration is kept in the project.

**Names.** A name that becomes a Python variable must be one Python can read: a letter or an underscore, then letters, digits and underscores. A Python keyword such as `class` is refused, with the reason under the field. This applies to a passage's inputs and to a Script node's inputs and outputs. An Output node's rows and an Input node's fields are read by people, so `Your roll` is a valid name there. A board that carries a name Python cannot read reports it.

**Coercion.** A slot receives the type it declared.

- An `int` Script input given `3.7` reads `3`.
- A `list<int>` input handed a list of text receives numbers.
- A value that cannot be read as the declared type becomes that type's blank; the story is not stopped.
- This holds for a Script node's inputs and an Output node's rows. What a script writes is left as it is.

**Defaults.** Any slot can carry a default, the value the slot takes when nothing fills it. Slots that take one: a Macro In's takes, a Script node's inputs and outputs, an Output node's slots, a Macro Out's answers and an Input node's form fields.

| Situation | Value used |
| --- | --- |
| A wire answers the port | The wire. A card's own literal is superseded by a wire, and the field disappears while the wire is attached. |
| No wire | The card's own literal, where the card has one. |
| Neither | The declared default. |
| No default either | The type's blank. |

An Input form field's default is filled in for the reader to accept or type over. A script output's default applies only where the program never set that name. A default on a `json` or a `map<…>` slot cannot travel into a campaign, and the app reports it when you compile.

**File slots.** A slot that points at a file is filled by name. This covers a picture, a document or a component, in a component's attributes, a macro take's or script input's default, and a console variable. Typing a name lists the project's files, with the full path beside each. The pick is shown as a chip, hovering shows the path, and the path is what is stored. A chip whose file is outside the project or missing is marked. On a card (a macro take, a Set variable node) the slot is a searchable dropdown instead, like the Narration node's passage picker.

**Metadata.** Every card can carry metadata. Right-click the card and choose *Edit metadata…*: a list of names, types and values. A small tag shows on the card's header while there is any. Nothing on the board reads it. It travels with the node into a compiled campaign and to an agent, and a copied node keeps its metadata.

| Offered | Not offered |
| --- | --- |
| `int`, `float`, `bool`, `string`, a list of each, and `json` for anything nested | `asset` and `string` are not told apart; a whole `3` and a fractional `3.0` are. |
