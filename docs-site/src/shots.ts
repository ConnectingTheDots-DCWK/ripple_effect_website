/**
 * The shot list for the documentation.
 *
 * The same idea as the landing page's `src/lib/screenshots.ts`, and the same
 * capture protocol (`../docs/screenshots.md`: 1600×1000, the example project
 * copied out of the repository first, no personal paths in frame). Naming a
 * shot here rather than inline means `<Shot name="…">` with a misspelt name
 * fails the build naming the shot — `astro check` types the component's
 * props but not an MDX page's use of them — and every slot on every page has
 * a brief saying what belongs in it before anyone opens the app to capture
 * it.
 *
 * Files go in `src/assets/screenshots/<slug>-<dark|light>.png`. Until one exists the
 * component draws the brief in a dashed frame, so a missing picture is a
 * visible gap rather than a silent one.
 *
 * Several slots are the landing page's shots exactly — the brief says so. For
 * those, copy the file from `../public/screenshots/` rather than capturing it
 * twice; the two sites share a checkout and nothing else, so it is a copy.
 */
/**
 * Deliberately no `SHOT_WIDTH`/`SHOT_HEIGHT` here, though the landing page's
 * list has them. The captures are not all one size — a component's editor is
 * wide and short, the file tree is nearly square — and the component reads
 * each file's own dimensions off the import; a shared pair forced every one
 * into a 16:10 box and stretched it. The 16:10 of the protocol survives only
 * as the placeholder's aspect ratio.
 */

export interface Shot {
  /** File stem under `src/assets/screenshots/`. */
  slug: string;
  /** What must be in frame. Read this before capturing. */
  brief: string;
  alt: string;
  /**
   * Whether a light twin is expected beside the dark one. Documentation for
   * whoever is capturing: what the page draws is decided by which files
   * exist, so a shot with only one does not break.
   */
  themes: 'dark' | 'both';
}

const LANDING = 'The landing page has this shot — copy it from ../public/screenshots/.';

export const shots = {
  // --- Shared with the landing page ---------------------------------------
  board: {
    slug: 'board',
    brief: `${LANDING} The at_elsenmars_gates board: six to eight nodes legible, wires carrying choice captions, the quickbar, the minimap and the play button in frame.`,
    alt: 'A branching story laid out on a canvas, passages wired to the choices that lead between them',
    themes: 'both',
  },
  trace: {
    slug: 'trace',
    brief: `${LANDING} Two passages picked, the routes between them drawn in colour, everything else under the scrim.`,
    alt: 'Every route between two passages picked out in colour while the rest of the board dims',
    themes: 'both',
  },
  play: {
    slug: 'play',
    brief: `${LANDING} The campaign window part-way through a story: rendered prose, the choice tiles beneath it, the language selector in the header.`,
    alt: 'A story being played: rendered prose above a list of choices',
    themes: 'both',
  },
  python: {
    slug: 'python',
    brief: `${LANDING} The Python editor with source on the left and the console on the right.`,
    alt: 'The Python editor, source on the left and an interactive console on the right',
    themes: 'both',
  },
  localisation: {
    slug: 'localisation',
    brief: `${LANDING} A narration bundle open: the locale chips (one wearing a staleness dot), the source on one side and the rendered passage on the other.`,
    alt: 'One passage in two languages, with a mark on the translation that has fallen behind',
    themes: 'both',
  },
  overview: {
    slug: 'overview',
    brief: `${LANDING} Script navigation: one card per board, labelled arrows between them, the start pennant and the end marker.`,
    alt: 'A map of how the boards hand the story to each other',
    themes: 'both',
  },
  component: {
    slug: 'component',
    brief: `${LANDING} A component open in its editor, its typed attributes listed, and a Component node on a board beside it if both fit.`,
    alt: 'A component with its typed attributes',
    themes: 'both',
  },
  files: {
    slug: 'files',
    brief: `${LANDING} The file tree, a row of editor tabs, and a passage open in the Markdown editor.`,
    alt: 'The project as a folder: the file tree beside an open passage',
    themes: 'both',
  },

  // --- The workspace --------------------------------------------------------
  home: {
    slug: 'home',
    brief:
      'The home grid with two or three projects on it, one with a cover picture, and the New project and Import a folder buttons visible.',
    alt: 'The home screen: known projects as cards, with New project and Import a folder',
    themes: 'both',
  },
  newProject: {
    slug: 'new-project',
    brief:
      'The New project dialog with a title typed, the location chosen and the "Written in" language picker open or visibly filled.',
    alt: 'The New project dialog: title, location and the language the story is written in',
    themes: 'both',
  },
  palette: {
    slug: 'palette',
    brief:
      'The command palette open over a board, with a partial query typed and the filtered commands beneath it.',
    alt: 'The command palette with a query typed and the matching commands listed',
    themes: 'both',
  },

  // --- Boards ---------------------------------------------------------------
  nodeMenu: {
    slug: 'node-menu',
    brief:
      'A wire dragged from a Narration node and let go over empty canvas, with the create menu open at that point and its categories visible.',
    alt: 'The create menu opened by dropping a wire on empty canvas',
    themes: 'both',
  },
  firstBoard: {
    slug: 'first-board',
    brief:
      'A brand-new board: one Start node and nothing else, the quickbar along the top with its Narration button.',
    alt: 'A new board holding only its Start node',
    themes: 'both',
  },
  firstPassage: {
    slug: 'first-passage',
    brief:
      'A Start node wired to a Narration node, that Narration wired to two more through its two named choice rows, one of them ending at an End node.',
    alt: 'A Start, a passage, two choices and an End, wired together',
    themes: 'both',
  },

  macro: {
    slug: 'macro',
    brief:
      'A macro open on the canvas — its Macro In with two takes and its Macro Out with one answer, a passage or two between them — and, if it fits, a board beside it with the Macro card calling it, one take wired and one typed.',
    alt: 'A macro: Macro In, a few nodes, Macro Out, and the card that calls it from a board',
    themes: 'both',
  },

  firstPlay: {
    slug: 'first-play',
    brief:
      'The campaign window on the tutorial’s first passage: one sentence of prose and two choice tiles beneath it.',
    alt: 'The tutorial story being played: a passage and two choices',
    themes: 'both',
  },

  // --- Passages -------------------------------------------------------------
  readingTime: {
    slug: 'reading-time',
    brief:
      'The row under the narration editor: the word count on the left, the pace selector and the estimate on the right, with the tooltip open saying whether the figure is measured or reasoned.',
    alt: 'The reading-time row under a passage, showing the word count, the pace and the estimate',
    themes: 'both',
  },

  // --- Components -----------------------------------------------------------
  entitiesPanel: {
    slug: 'entities-panel',
    brief:
      'The campaign window with the Entities panel open: entities grouped under the component they came from, a count on each heading, the search line at the top and a bin on each row.',
    alt: 'The Entities panel during a playthrough, grouped by component',
    themes: 'both',
  },

  // --- Python ---------------------------------------------------------------
  sandbox: {
    slug: 'sandbox',
    brief:
      'The sandbox report behind the console’s i button: the "What this app binds" list at the top and a few rows of the Language and Modules probes below it, yes and no both visible.',
    alt: 'The sandbox report: what the interpreter accepted and refused, row by row',
    themes: 'both',
  },

  // --- Console variables ----------------------------------------------------
  cvarsPage: {
    slug: 'cvars-page',
    brief:
      'The console variables page with four or five declared: a mix of scalar and list types, one typed default visibly being edited.',
    alt: 'The console variables page: names, types and defaults',
    themes: 'both',
  },
  cvarsNodes: {
    slug: 'cvars-nodes',
    brief:
      'A board fragment with a Set variable wired from a Dice roller and a Variable branch further along, both pointing at the same variable.',
    alt: 'A Set variable node and a Variable branch node on a board',
    themes: 'both',
  },

  // --- State machines -------------------------------------------------------
  fsmEditor: {
    slug: 'fsm-editor',
    brief:
      'A .fsm.mmd open: the mermaid text on the left with three or four states, the rendered diagram on the right, and one problem underlined on its line if one can be arranged.',
    alt: 'A state machine as text beside the diagram it draws',
    themes: 'both',
  },

  // --- Playing --------------------------------------------------------------
  inputForm: {
    slug: 'input-form',
    brief:
      'The campaign window stopped at an Input node: the passage before it asking the question, and the form beneath with a text field, a number field and a switch, one of them filled in.',
    alt: 'An Input node in the play window: a short form under the passage that asked',
    themes: 'both',
  },
  tracePanel: {
    slug: 'trace-panel',
    brief:
      'The campaign window with the Trace panel open a dozen lines in: a Read line with a choice, a Set line with the old value, a Rolled line, each wearing its node’s icon, the story/everything toggle and the Copy button in the header.',
    alt: 'The Trace panel: what the story did, line by line, each line wearing its node’s icon',
    themes: 'both',
  },
  savedGames: {
    slug: 'saved-games',
    brief:
      'The saved games list: two or three entries with the passage each is waiting at and how long ago it was written, and one refused entry with its reason beside it.',
    alt: 'The list of saved games, each naming the passage it is waiting at',
    themes: 'both',
  },
  playFromHere: {
    slug: 'play-from-here',
    brief:
      'A node’s right-click menu open on a board with "Play from here" visible.',
    alt: 'The right-click menu on a node, with Play from here',
    themes: 'both',
  },

  // --- Reading back ---------------------------------------------------------
  mergedTrace: {
    slug: 'merged-trace',
    brief:
      'The merged view: two boards on one canvas with a route drawn across the Jump between them.',
    alt: 'A route traced across two boards on one canvas',
    themes: 'both',
  },

  // --- Sound ----------------------------------------------------------------
  soundscapeEditor: {
    slug: 'soundscape-editor',
    brief:
      'A soundscape open in its tab: three or four clips on two lanes, one selected with its panel open on the right (File, From/To, Playback, Volume, Speed, the fades), the transport and the gear in the bar, the playhead somewhere past the first clip.',
    alt: 'A soundscape on its timeline, with one clip selected and its properties beside it',
    themes: 'both',
  },
  soundscapeRow: {
    slug: 'soundscape-row',
    brief:
      'A Narration card with its Soundscape picker open, showing None, Silence and one or two soundscapes of the project, with the tied marker visible if the picker draws one.',
    alt: 'The Soundscape row on a Narration node, its picker open',
    themes: 'both',
  },

  // --- Templates and metadata -----------------------------------------------
  templates: {
    slug: 'templates',
    brief:
      'The New project dialog on its Templates pane: the rail on the left with Templates chosen, The City Of Elsenmar listed with its description, and the location field filled.',
    alt: 'The New project dialog on its Templates pane, with the example project listed',
    themes: 'both',
  },
  metadataEditor: {
    slug: 'metadata-editor',
    brief:
      'The Edit metadata dialog over a board, two or three rows filled with a name, a type and a value, and the tag it leaves on the card\'s header visible behind it.',
    alt: 'The metadata editor: rows of names, types and values on one node',
    themes: 'both',
  },

  // --- Exporting ------------------------------------------------------------
  exportDialog: {
    slug: 'export-dialog',
    brief:
      'The export dialog with Campaign chosen: the three Include media switches and the zip control above the line, and HTML delivery with the strip switches below it.',
    alt: 'The export dialog, set to compile a campaign with HTML passages',
    themes: 'both',
  },
  exportProfile: {
    slug: 'export-profile',
    brief:
      'The export profile editor beside the export controls: each kind of element on the left, a class typed for a few of them on the right.',
    alt: 'An export profile: a CSS class for each kind of Markdown element',
    themes: 'both',
  },

  // --- Version control ------------------------------------------------------
  changesTab: {
    slug: 'changes-tab',
    brief:
      'The Changes tab with a few files in each of its two groups and one selected, its diff open side by side. Coloured dots visible in the file tree if it is in frame.',
    alt: 'The Changes tab: files ready to save, files not yet included, and a diff',
    themes: 'both',
  },
  conflict: {
    slug: 'conflict',
    brief:
      'A passage with a merge conflict: both versions side by side and the buttons that pick one.',
    alt: 'Two versions of a passage side by side, waiting for a decision',
    themes: 'both',
  },

  // --- Agents ---------------------------------------------------------------
  agentsPanel: {
    slug: 'agents-panel',
    brief:
      'The Agents panel: the two switches with the first on, the "Connecting a client" box showing the bridge’s path, and the Copy client configuration button.',
    alt: 'The Agents panel: the two switches and the path a client is pointed at',
    themes: 'both',
  },
  agentConnected: {
    slug: 'agent-connected',
    brief:
      'The app bar with a client’s mark showing beside the other buttons, its tooltip open naming the client, and the panel’s "Who is connected" and "Touched this session" lists if it fits.',
    alt: 'The app bar while an assistant is connected, and the list of what it has touched',
    themes: 'both',
  },

  // --- Support --------------------------------------------------------------
  support: {
    slug: 'support',
    brief:
      'The support window: the version, the OS and the installer already filled in, the three copy buttons, and the line naming which log file is the session just had.',
    alt: 'The support window with the report details filled in',
    themes: 'both',
  },
} as const satisfies Record<string, Shot>;

export type ShotName = keyof typeof shots;
