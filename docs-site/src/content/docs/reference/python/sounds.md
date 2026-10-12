---
title: Sounds
description: The signature of play_sound, its arguments, its behaviour on each surface, and the sentences it refuses with.
---

`play_sound` is the Python counterpart of the [Play sound node](/reference/nodes/#play-sound). It is bound on every surface; what differs per surface is whether it cues a sound or refuses.

## `play_sound(path, volume=1.0, speed=1.0)`

Cues a file the campaign carries: once, immediately, returning before anything has been heard. The return value is always `None`. The host may not have opened the file yet, and the story is not held for it.

| Argument | Required | Default | Meaning |
| --- | --- | --- | --- |
| `path` | yes | none | The file, as the project spells it (`sfx/bell.ogg`) or as the bundle does (`media/sfx/bell.ogg`). Both name the same file, because an export files every asset under `media/`. Leading and trailing whitespace is ignored. |
| `volume` | no | `1.0` | Gain, 0 to 1. |
| `speed` | no | `1.0` | Playback rate, 1 being the file's own. Must be more than 0. |

`volume` and `speed` may be given by position or by name. No other keyword is accepted; this is the [calling rule](/reference/python/#calling) every function on this tier keeps.

```python
play_sound("sfx/bell.ogg")
play_sound("sfx/bell.ogg", volume=0.4)
play_sound("media/sfx/bell.ogg", 0.4, 1.2)
```

## Not provided

| Absent | Where it is done instead |
| --- | --- |
| Setting a soundscape from Python | A soundscape is set on a passage, as a document the project can reuse. |
| Stopping a sound, waiting for one, or asking what is playing | None. A cue is fire and forget. |
| A path outside the bundle | None. Every sound a story can play is in the campaign. |

## Surfaces

| Surface | `play_sound` |
| --- | --- |
| script | Cues. |
| playthrough | Cues when the campaign window handed the console something to play through; otherwise refuses with the design-time sentence. |
| passage | Refuses, with a sentence of its own. |
| console, agent | Refuses, with the design-time sentence. |

A passage always refuses; its snippets run again on every redraw and change of language.

## Refusals

Every refusal is a `RuntimeError` a script may catch, carrying one of these sentences. The sentences are frozen, because a script may branch on which it received.

| When | Sentence |
| --- | --- |
| A passage calls it. | `a passage cannot play a sound — its snippets run again every time it is redrawn, so put this on a Play sound node or in a Script node` |
| The design-time console or an agent calls it, or a live console has nothing to play through. | `no campaign is running, so there is nothing to play this through — press play, or put this on a Play sound node` |
| `path` is blank or not a string. | `play_sound: needs a path` |
| `path` names nothing the campaign carries. | `play_sound: nothing in this campaign is called "<path>"` |
| `volume` is outside 0 to 1. | `play_sound: volume is <v>, and it runs from 0 to 1` |
| `volume` is not a number. | `play_sound: volume has to be a number` |
| `speed` is at or below 0. | `play_sound: speed is <v>, and it has to be more than nothing` |
| `speed` is not a number. | `play_sound: speed has to be a number` |

Order of checks: the arguments are checked before the surface, so a call in the design-time console reports a wrong volume rather than only that the console cannot play. The path is resolved after both, because a surface that cannot play has nothing to resolve against.

## What a host is told

A cue reaches whatever is playing the campaign as the file's bundle path, a gain and a rate, together with the id of the Script node whose program made the call. One event is sent per call, in call order. The runtime plays nothing itself.

## Versioning

The name and the sentences above are a contract with every script written against them from 1.4 onward. They are added to, not repurposed. Adding an argument is a widening; changing what an argument means is not.

## Related

- [Soundscapes and one-shot sounds](/explanation/soundscapes-and-sounds/): why the runtime plays nothing and where a soundscape is set.
- [How to add sound to a story](/how-to/add-sound-to-a-story/)
- [Nodes](/reference/nodes/#play-sound): the Play sound node.
