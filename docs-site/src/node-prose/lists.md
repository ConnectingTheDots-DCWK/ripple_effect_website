These four cards read a list or a piece of text, and read both the same way. A list is itself; any other value is its text, one character at a time. The same card works on `["bread", "rope"]` and on `"hi"`, and the result is the kind that went in: appending `!` to `hi` gives `hi!`.

- An index counts from zero, and from the end when it is negative: `-1` is the last item.
- An index past either end does not stop the story; it is an ordinary thing to reach inside a loop.
- A map has no order for an index to mean. Insert and Remove hand it back untouched, At answers nothing and Size counts none. The [Maps](#maps) cards read maps.
