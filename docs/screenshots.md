# Capturing the screenshots

Every image on the site is a real screenshot of the application. There are no
mockups, no composites and no renders.

`src/lib/screenshots.ts` is the landing page's shot list and
`docs-site/src/shots.ts` the documentation's. Each entry carries a **brief**
describing what must be in frame; until a file exists, the page draws that
brief in a dashed frame where the image goes, so nothing is silently missing.

## They are taken by a script

`fvm dart run melos run editor:docs:shots` in the application repository
captures every shot on both lists from a release build, in both themes, and
writes them here — `public/screenshots/` for the landing page, copied into
`docs-site/src/assets/screenshots/` where the documentation names the same
slug. It runs on Linux, in Xephyr, against a copy of the example project in a
sandbox of its own, so nothing personal can be in frame: the author is
`author` and the projects are in `~/Stories`. Its notes, the fixtures it
stages and the traps it paid for are `tool/screenshots/README.md` over
there.

One protocol, decided once:

| | |
| --- | --- |
| Window size | **1600 × 1000**, every shot |
| Scale | **2×** — the PNG is 3200 × 2000 before any crop |
| Theme | Both, every shot: `<slug>-dark.png` and `<slug>-light.png` |
| Format | PNG, stripped of metadata, in Git LFS |

One window size for the whole set is not fussiness. Minimap placements are
filed **per window size**, so a set shot at three sizes has the panel in three
different corners and the frames stop looking like one application.

A shot may be cropped to what its brief is about; the documentation's
`Shot` reads each file's own dimensions.

## Adding a shot

Add the entry to the shot list — `slug`, `brief`, `alt`, `themes` — and
reference it by name; the name is typed, so a slug that does not exist is a
compile error rather than a broken image on a live page. Then write its
recipe in the application repository's `tool/screenshots/shots.py`, keyed by
the same slug, and run it for that slug alone.
