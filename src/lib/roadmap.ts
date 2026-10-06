/**
 * What is shipped, what is being built, and what is intended.
 *
 * **Every entry carries a version and a codename and no date.** Not an
 * oversight: a roadmap with dates on it is a promise, and the only honest
 * thing this page can say about 1.7 is what it is, not when. The order of the
 * list is the order of the versions and that is the whole schedule.
 *
 * The numbering has a gap — 1.1 is not here. That is the project's own
 * numbering rather than an omission; the releases between feature packs are
 * fixes, and a fix release does not get a codename. 1.4 was once such a gap
 * and is not any more: sound became a pack of its own.
 *
 * **A shipped release gets three lines and a planned one gets what was
 * planned.** Three is the most a card holds, and for a release that exists
 * they are the three a reader of its release notes would pick — the
 * changelog is the source, in the app repository, and a line here is a
 * reading of it rather than a claim of its own. A planned release says only
 * what its pack is; the plan is `ROADMAP.md` in the app repository, and this
 * list is its public copy.
 *
 * **`paid: true` is `ROADMAP.md`'s line, not a judgement made here.** That
 * file draws the SaaS switch between 1.5 and 1.6 and says everything after
 * it assumes the backend and a paid plan, so 1.6, 1.7, 1.8 and 2.x carry the
 * chip and 1.5 does not. `/pricing` previews the tier off the same file. The
 * price is still undecided and still says so.
 */
export interface Milestone {
  /** "1.2", "2.x". */
  version: string;
  /** The release's codename. */
  codename: string;
  /** Shown as a chip beside the codename. */
  note?: string;
  tone: "shipped" | "current" | "planned";
  /** Reserved for the paid tier when it exists. */
  paid?: boolean;
  features: string[];
}

export const roadmap: Milestone[] = [
  {
    version: "1.0",
    codename: "Tavern Meetup",
    note: "Shipped",
    tone: "shipped",
    features: [
      "Boards on an infinite canvas, passages in every language, components with typed attributes",
      "Control flow, random numbers and Python in the prose",
      "Playable campaigns, script navigation, tracing every route between two passages",
    ],
  },
  {
    version: "1.2",
    codename: "Mimic Chest",
    note: "Shipped",
    tone: "shipped",
    features: [
      "Version control built in, with nothing to install",
      "An MCP server, so an assistant you already use can read and change the project",
      "In-app updates that fetch and open the right installer",
    ],
  },
  {
    version: "1.3",
    codename: "Homebrew Rule",
    note: "Shipped",
    tone: "shipped",
    // The plan said "Markdown rendered to styled HTML". What shipped across
    // 1.3.x is the release the rest of this list stands on: the story runs
    // outside the editor now — a campaign compiled for a runtime that has
    // never heard of the canvas, which is what 1.8 ports — and a story can
    // carry state with no wire. The third line is what is left over once
    // those two are said, and it is still the longest changelog section the
    // app has had. Three lines is the most a card holds.
    features: [
      "The story runs without the editor: campaigns compiled for a runtime, as Markdown or HTML",
      "State with no wire: console variables, state machines, gates, saved games",
      "Macros, dice, an Input node, and reading time in fifty-four languages",
    ],
  },
  {
    version: "1.4",
    codename: "Elven Choir",
    note: "Current",
    tone: "current",
    // The plan said "multimedia in campaigns, soundtrack and sound effects";
    // what shipped is soundscapes as files of their own with a timeline
    // editor, a Play sound node and `play_sound` from Python, and the rest
    // the changelog's 1.4.0 section carries — templates, node metadata and a
    // bridge that asks the app what it offers among them.
    features: [
      "Soundscapes: a timeline of music and sound a passage brings, and keeps until another replaces it",
      "Sound effects from a node or from Python, and media switches on export",
      "Project templates, metadata on every node, a play window that fills the app",
    ],
  },
  {
    version: "1.5",
    codename: "Multiclassing",
    tone: "planned",
    features: [
      "The core story engine ported to Rust, with bindings for game engines and other third-party integration",
    ],
  },
  {
    version: "1.6",
    codename: "Grammar Lich",
    note: "Paid tier",
    tone: "planned",
    paid: true,
    // Their note said "ortographic-check"; the service checks orthography.
    features: ["Integration with an orthography-checking service"],
  },
  {
    version: "1.7",
    codename: "Illusion School",
    note: "Paid tier",
    tone: "planned",
    paid: true,
    features: [
      "Integration with the Recraft V2 API",
      "LLM integration for generative narration",
    ],
  },
  {
    version: "1.8",
    codename: "Party Gathering",
    note: "Paid tier",
    tone: "planned",
    paid: true,
    features: ["Real-time collaboration"],
  },
  {
    version: "2.x",
    codename: "World Smith",
    note: "Paid tier, across the 2.x releases",
    tone: "planned",
    paid: true,
    features: [
      "Timelines and storyboarding",
      "Indoor and outdoor maps",
      "World wiki",
    ],
  },
];
