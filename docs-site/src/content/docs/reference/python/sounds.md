---
title: Sounds
description: The one function Python plays a sound by, what it takes, what it does on each surface, and the six sentences it refuses with.
sidebar:
  order: 4
---

One name, the counterpart of the [Play sound
node](/reference/nodes/#play-sound): for the author whose stinger depends on
something a script computed. Bound on every surface, like everything else in
the API; what differs per surface is whether it cues or refuses.

Three things are deliberately not here, and each is a decision. **No
soundscape from Python** — what plays under a passage is set on the passage,
as a document the whole project can reuse, and a script that could put one
in force would be a state change with no node on the canvas to point at.
**No stopping, no waiting, no asking what is playing** — a cue is fire and
forget by construction, and a function that could be awaited is one an author
would await. **No path outside the bundle** — every sound a story can play is
in the campaign, and a name matching nothing there is refused in words.

## `play_sound(path, volume=1.0, speed=1.0)`

Cues a file the campaign carries: once, now, and returns before anything has
been heard. The answer is always `None`; the host may not have opened the
file yet, and the story is not held for it.

| Argument | Meaning |
| --- | --- |
| `path` | The file, **as the project spells it** — `sfx/bell.ogg` — or as the bundle does — `media/sfx/bell.ogg`. Both name the same file: an export files every asset under `media/`, and an author should not have to know that. Leading and trailing whitespace is ignored. |
| `volume` | Gain, 0 to 1. Absent is 1. |
| `speed` | Playback rate, 1 being the file's own. Absent is 1; anything at or below 0 is refused. |

`volume` and `speed` may be given by position or by name, and no other
keyword is accepted — the [calling rule](/reference/python/#calling) every
function on this tier keeps.

```python
play_sound("sfx/bell.ogg")
play_sound("sfx/bell.ogg", volume=0.4)
play_sound("media/sfx/bell.ogg", 0.4, 1.2)
```

## Surfaces

| Surface | `play_sound` |
| --- | --- |
| **script** | cues |
| **playthrough** | cues, when the campaign window handed the console something to play through; refuses as the design-time console otherwise |
| **passage** | **refuses**, with a sentence of its own |
| **console**, **agent** | refuses, with the design-time sentence |

A passage is refused **by rule rather than by circumstance**, and the rule
is not the one that keeps a passage from writing an entity. A sound changes
no state. What it does is *happen* — and a passage's snippets run again on
every redraw and every change of language, so a bell rung from prose would
ring twice for a reader who switched to Italian, with no node on the board to
explain why. A stinger belongs on a Play sound node before the passage, or in
a Script node.

## Refusals

Every refusal is a `RuntimeError` the script may catch, carrying one of these
sentences. They are frozen, because a script may already have branched on
which it got.

| When | Sentence |
| --- | --- |
| a passage calls it | `a passage cannot play a sound — its snippets run again every time it is redrawn, so put this on a Play sound node or in a Script node` |
| the design-time console or an agent calls it, or a live console with nothing to play through | `no campaign is running, so there is nothing to play this through — press play, or put this on a Play sound node` |
| `path` is blank or not a string | `play_sound: needs a path` |
| `path` names nothing the campaign carries | `play_sound: nothing in this campaign is called "<path>"` |
| `volume` outside 0 to 1, or not a number | `play_sound: volume is <v>, and it runs from 0 to 1` / `play_sound: volume has to be a number` |
| `speed` at or below 0, or not a number | `play_sound: speed is <v>, and it has to be more than nothing` / `play_sound: speed has to be a number` |

The arguments are checked **before** the surface is, so a call tried in the
design-time console says the volume is wrong rather than only that the
console cannot hear. The path is resolved after both, since a surface that
cannot play has nothing to resolve against.

## What a host is told

A cue reaches whatever is playing the campaign as the file's bundle path, a
gain and a rate, with the id of the Script node whose program made the call —
one event per call, in call order. The runtime plays nothing itself; the
[soundscapes overview](/overviews/soundscapes-and-sounds/#what-is-playing-and-when)
says why.

## Versioning

The name and the six sentences are a contract with every script written
against them from 1.4 onward, and are added to rather than repurposed.
Adding an argument is a widening; changing what one means is not.
