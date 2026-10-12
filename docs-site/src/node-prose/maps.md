These seven cards read a map: a set of names, each holding a value. A map is itself; any other value is read as an empty map.

- A name is always text.
- No card holds a map as a literal. A **Set** with nothing wired to its subject returns a map of one pair, and a chain of Set cards builds a larger one.
- A name that is not present does not stop the story. **Get** answers nothing and reports it on `found`; **Remove** returns the map unchanged.
