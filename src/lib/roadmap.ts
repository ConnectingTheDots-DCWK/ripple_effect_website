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
 * what its pack is. The plan used to be `ROADMAP.md` in the app repository;
 * that file is gone, and this list is the plan now rather than a copy of it.
 *
 * **`paid: true` marks a release whose pack needs the hosted service.** The
 * old plan drew the SaaS switch between 1.5 and 1.6, and 1.6 has since moved
 * back across it: its spelling and grammar checking runs on the author's
 * machine, with Harper, so there is nothing to host and nothing to charge
 * for. 1.7, 1.8 and 2.x still carry the chip. `/pricing` previews the tier
 * off this list. The price is still undecided and still says so.
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
    note: "Shipped",
    tone: "shipped",
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
    note: "Shipped",
    tone: "shipped",
    // The plan said "the core story engine ported to Rust, with bindings";
    // what shipped is that engine, released on its own for desktop, phones
    // and the web with a JavaScript binding over it, and around it the
    // changelog's 1.5.0 section — a workspace laid out like a code editor's,
    // a board that says what is wrong with it, and the first translation.
    features: [
      "The story engine in Rust, released on its own for desktop, phones and the web, with host callbacks",
      "A workspace like a code editor's: docking tabs, find and replace in project, a menu bar, Zen Mode",
      "Boards that say what is wrong with them, passages that take arguments, and the app in Italian",
    ],
  },
  {
    version: "1.6",
    codename: "Grammar Lich",
    note: "Current",
    tone: "current",
    // The plan said "integration with an orthography-checking service", and
    // a paid one. What shipped checks on the author's machine instead, which
    // is why it is free — and around it the changelog's 1.6.0 section:
    // dictation on the device, countdowns on choices, and stories that read
    // the clock, the location and the reader's language.
    features: [
      "Spelling, grammar and style rules of your own, checked on your machine, with a dictionary per project",
      "Dictation on your computer by NVIDIA's Nemotron models, in English or in 32 languages",
      "Countdowns on choices, and stories that read the time, where you are and the reader's language",
    ],
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
