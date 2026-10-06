/**
 * The shot list.
 *
 * Screenshots are captured by hand from a running build, against the example
 * project at `examples/tabletop/the_city_of_elsenmar` in the app repository.
 * Naming them here rather than inline means a typo is a type error and the
 * capture protocol has somewhere to live; `docs/screenshots.md` carries the
 * protocol itself.
 *
 * Every shot is 1600x1000 — one window size for the whole set, because
 * minimap placements are filed per window size and a set shot at three sizes
 * has the panel in three different corners.
 */
export const SHOT_WIDTH = 1600;
export const SHOT_HEIGHT = 1000;

export interface Shot {
  /** File stem under `public/screenshots/`. */
  slug: string;
  /** What must be in frame. Read this before capturing. */
  brief: string;
  alt: string;
  /**
   * Whether a light twin is expected alongside the dark one. Documentation for
   * whoever is capturing: what the page actually draws is decided by which
   * files exist, so a shot with only one does not break.
   */
  themes: "dark" | "both";
}

export const shots = {
  board: {
    slug: "board",
    brief:
      "The at_elsenmars_gates board. Six to eight nodes legible, several wires carrying choice captions, the quickbar, the minimap and the play button all in frame.",
    alt: "A branching story laid out on a canvas, passages wired to the choices that lead between them",
    themes: "both",
  },
  trace: {
    slug: "trace",
    brief:
      "Two passages picked, the routes between them drawn in colour, everything else under the scrim.",
    alt: "Every route between two passages picked out in colour while the rest of the board dims",
    themes: "both",
  },
  play: {
    slug: "play",
    brief:
      "The campaign modal part-way through a story: rendered prose, the choice tiles beneath it, the language selector in the header.",
    alt: "A story being played: rendered prose above a list of choices",
    themes: "both",
  },
  python: {
    slug: "python",
    brief:
      "The Python editor with source on the left and the console on the right, syntax colours visible in both.",
    alt: "The Python editor, source on the left and an interactive console on the right",
    themes: "both",
  },
  localisation: {
    slug: "localisation",
    brief:
      "The narration bundle editor with the en-US and it-IT chips, one wearing a staleness dot, source beside the live render.",
    alt: "One passage in two languages, with a mark on the translation that has fallen behind",
    themes: "both",
  },
  overview: {
    slug: "overview",
    brief:
      "Script navigation — the read-only graph of how the boards hand the story to each other, with a start pennant and an end marker.",
    alt: "A read-only map of how chapters hand the story to one another",
    themes: "both",
  },
  component: {
    slug: "component",
    brief:
      "The sword component's typed attributes, or a Component node on a canvas showing one typed output port per attribute.",
    alt: "A component and its typed attributes, wired into a board",
    themes: "both",
  },
  files: {
    slug: "files",
    brief:
      "The file tree beside an open Markdown passage, with the editor tabs above it — the shot that says everything is a file.",
    alt: "A project shown as an ordinary folder of files beside the document being edited",
    themes: "both",
  },
  soundscape: {
    slug: "soundscape",
    brief:
      "A soundscape open in its tab: three lanes with named clips, the waveform drawn inside each, an auto-loop clip with its ghost repeats along the lane, one clip selected with its panel open on the right showing the mode, the fades and a rest.",
    alt: "A soundscape timeline: clips with their waveforms laid out on lanes, one selected with its settings beside it",
    themes: "both",
  },
} as const satisfies Record<string, Shot>;

export type ShotName = keyof typeof shots;
