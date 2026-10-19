---
title: The world outside the story
description: location_get, location_distance and datetime.now — what each answers, when it is refused, and what a reader's stand-in does to it.
---

A story may read two things about the reader's world: **where they are** and **what time it is**. Each is read only when the reader allows it. A story that reads either is asked about it before it begins, and the answer is kept in the app's settings, where the reader can change it. The same reads are on a board as the [World nodes](/reference/nodes/#get-location).

## `location_get()`

Where the reader is, as a dict, or `None` when the host has no position yet.

| Key | Holds |
| --- | --- |
| `label` | A place's name. Only a stand-in typed as a name has one; a real reading has none, because nothing is looked up to name the place. |
| `latitude` | Degrees north, negative for south. |
| `longitude` | Degrees east, negative for west. |
| `accuracy` | How many metres the reading may be off. |
| `when` | When the reading was taken, as ISO 8601 text. |

Any key may be `None`. A real reading has coordinates, an accuracy and a time; a stand-in typed as `41.9028, 12.4964` has coordinates and nothing else; a stand-in typed as `Rome, Italy` has a label and nothing else.

```python
here = location_get()
if here and here["label"]:
    said = "in " + here["label"]
elif here:
    said = f"at {here['latitude']:.2f}, {here['longitude']:.2f}"
else:
    said = "somewhere"
```

## `location_distance(latitude, longitude)`

How far the reader is from a place, in metres along the ground, or `None` when the reading has no coordinates or there is no reading yet. It is allowed and refused exactly as `location_get()` is.

| Argument | Meaning |
| --- | --- |
| `latitude` | −90 to 90. |
| `longitude` | −180 to 180. |

```python
near_rome = (location_distance(41.9028, 12.4964) or 1e9) < 10_000
```

Both arguments are positional and required. A place off the globe, or one that is not a number, is refused before anything is read.

## `datetime.now()` and `date.today()`

The standard library's own names, unchanged: `datetime.now()` is the reader's wall clock, `datetime.now(timezone.utc)` the same moment in UTC, `date.today()` the reader's date. **Within one step of the story time does not move**, so two reads in one passage see one moment.

```python
from datetime import datetime
hour = datetime.now().hour
greeting = "Good evening" if hour >= 18 else "Good day"
```

There is no `time` module.

## When a read is refused

A read is answered in one order:

1. **The real value**, when the reader allowed it and the host has one.
2. **The reader's stand-in**, when they gave one. A stand-in is what the reader would rather a story believed, typed in the app's settings beside the answer; a story cannot tell it from the real thing.
3. **Otherwise a refusal**: `PermissionError` when the reader did not allow it. When they allowed it and the host has nothing, `location_get()` answers `None` and the clock raises `OSError`.

So `except PermissionError:` is how a story says what happens without:

```python
from datetime import datetime
try:
    hour = datetime.now().hour
except PermissionError:
    hour = 12                     # a story that cannot know, pretends noon
```

| Refused | Exception | Sentence |
| --- | --- | --- |
| The location, not allowed | `PermissionError` | `The location has not been allowed for this story` |
| The clock, not allowed | `PermissionError` | `The date and time has not been allowed for this story` |
| The clock, allowed with nothing to give | `OSError` | `this host has not said what time it is` |
| Any read in the editor's console or over MCP | `PermissionError` | `no story is playing, so nothing has allowed this read — press play` |
| `location_distance`, a place off the globe | `RuntimeError` | `location_distance: the latitude has to be a number from -90 to 90` (or the longitude, from -180 to 180) |

Each read that does not get the real value is also said once in the play window and in Messages, with a [diagnostic code](/reference/diagnostics/#irt05): `I.RT.05` for a stand-in, `W.RT.06` for a refusal, `I.RT.07` for nothing to give.

## In the editor

The clock is allowed unless the reader says otherwise; the location is asked about. With the location allowed, the editor asks the computer's own location service where it is when the story begins, at about the accuracy of a town, and waits a few seconds for an answer before beginning without one. **A playthrough an agent drives over MCP is never told the real position**: it gets the stand-in or the refusal.

Another program playing an exported campaign decides for itself how it asks and what it hands over. See [How to play a campaign in your own program](/how-to/play-a-campaign-in-your-program/).

## Versioning

These names are part of the 1.6 contract and are added to rather than repurposed. A campaign that reads either is bundle format 16, which an older player refuses rather than playing without asking.

## Related

- [Nodes](/reference/nodes/#get-location): Get location, Near, Get date & time and Time branch.
- [Python reference](/reference/python/): every host function and how a refusal reads.
