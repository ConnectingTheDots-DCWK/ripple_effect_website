# Capturing the screenshots

Every image on the site is a real screenshot of the application. There are no
mockups, no composites and no renders — which means the set has to be captured
deliberately, or it reads as a pile of pictures rather than one product.

`src/lib/screenshots.ts` is the shot list and the source of truth. Each entry
carries a **brief** describing what must be in frame; until a file exists, the
page draws that brief in a dashed frame where the image goes, so nothing is
silently missing.

## Before you start

**Copy the example project somewhere else first.**

```sh
cp -r examples/tabletop/the_city_of_elsenmar ~/shots/elsenmar
```

Opening a project writes `.ripple/workspace.json` and touches the registry.
Shooting in place dirties the checkout, and the diff will follow you around.

## The settings, decided once

| | |
| --- | --- |
| Window size | **1600 × 1000**, every shot |
| Scale | `GDK_SCALE=2 fvm flutter run -d linux` if it takes; 1× is acceptable |
| Theme | Dark, except `board`, which is captured in both |
| Format | PNG, `public/screenshots/<slug>-<dark\|light>.png` |

One window size for the whole set is not fussiness. Minimap placements are
filed **per window size**, so a set shot at three sizes has the panel in three
different corners and the frames stop looking like one application.

Check before each shot that no personal paths are visible — the file tree and
the home grid both show real directories.

## The shots

Read the `brief` field in `src/lib/screenshots.ts` for what belongs in each
frame. In priority order:

1. `board` — the hero, and the only one captured twice.
2. `trace` — the most distinctive thing the app does.
3. `play`
4. `python`
5. `localisation`
6. `overview`
7. `component`
8. `files`

## One thing to decide before shooting

The example project has **two boards and one board link**. That makes
`overview` — a read-only map of how the chapters hand the story on — a picture
of two cards and one arrow, and it makes a merged cross-board trace nearly as
thin. Those are two of the most distinctive features in the app and they will
photograph as the least impressive.

Adding two or three more chapters to `the_city_of_elsenmar` before the shoot
would be worth more than any copy change on this site. It is a content
decision, so it is flagged here rather than assumed.

## Adding a shot

Add the entry to `shots` in `src/lib/screenshots.ts` — `slug`, `brief`, `alt`,
`themes` — and reference it by name. The name is typed, so a slug that does not
exist is a compile error rather than a broken image on a live page.
