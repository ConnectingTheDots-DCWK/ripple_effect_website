import { Screenshot } from "@/components/screenshot";
import { BlurFade } from "@/components/velora/blur-fade";
import { cn } from "@/lib/utils";
import type { ShotName } from "@/lib/screenshots";

interface Feature {
  shot: ShotName;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}

/**
 * Copy is lifted from the app's README and CHANGELOG rather than written for
 * the web. A landing page that paraphrases its product ends up describing a
 * slightly different one — and these sentences have already been argued over
 * once.
 */
const features: Feature[] = [
  {
    shot: "trace",
    eyebrow: "Tracing a thread",
    title: "Ask how a reader could possibly have got here",
    body: "Pick two passages and every route between them is drawn in colour while the rest of the board goes under a scrim. Runs that meet never share a hue, so the place where the routes part is the place the colour changes.",
    points: [
      "Or pick one passage and ask what leads here, from wherever the story begins",
      "Cycles are fine — a loop back to an earlier chapter is drawn, not refused",
      "When a route arrives through another board, both boards open on one canvas",
    ],
  },
  {
    shot: "play",
    eyebrow: "Playing a campaign",
    title: "Walk the story you just wrote",
    body: "Press play and the graph runs: prose renders, choices become buttons, and the flow follows the wires across boards. A playthrough can be put down and picked back up, and the board can be edited while it is down.",
    points: [
      "The checkpoint is a node id, so resuming re-reads the edited board",
      "A playthrough is ephemeral — nothing new is written into your folder",
      "Component instances survive the pause; what the story changed is kept",
    ],
  },
  {
    shot: "python",
    eyebrow: "Scripting",
    title: "Real Python, in a sandbox that says what it can do",
    body: "Script and Output nodes run a restricted Python subset on a background isolate, and prose can hold it too — a fenced block or a {{ … }} span, so a sentence can vary instead of forking into two passages.",
    points: [
      "Values cross as native types: hp - damage is arithmetic, not a parse",
      "A traceback points at the line you wrote, not at generated scaffolding",
      "The sandbox panel probes the interpreter rather than describing it",
    ],
  },
  {
    shot: "localisation",
    eyebrow: "Translation",
    title: "One passage, every language, one document",
    body: "A passage is a folder holding one Markdown file per language, shown as a single file. A translator handed it can work in any editor, and a git diff still reads as prose.",
    points: [
      "Choices are translated too — an untranslated one is a button nobody can press",
      "A translation that has fallen behind its source says so, and says why",
      "A language with no text says so rather than quietly falling back to English",
    ],
  },
  {
    shot: "overview",
    eyebrow: "Script navigation",
    title: "See how the chapters hand the story on",
    body: "A read-only map of the whole project, laid out left to right in the order the story reaches things. The arrangement is deterministic, so a screenshot in a bug report means the same thing tomorrow.",
    points: [
      "A start marker where a thread begins, a stop where one ends",
      "Play or open any chapter straight from its card",
      "Trace across chapters here the same way you trace across passages",
    ],
  },
  {
    shot: "component",
    eyebrow: "Components",
    title: "The things a story keeps track of",
    body: "A sword, a character, a faction — a name and an ordered bag of typed attributes, with no schema behind it. Drop one on a canvas and it arrives with one typed output per attribute.",
    points: [
      "Numbers stay numbers and JSON stays decoded; nothing is stringified in transit",
      "An instance is keyed by name, so a later board is holding the same sword",
      "Reordering a component's fields carries the wires with them",
    ],
  },
  {
    shot: "soundscape",
    eyebrow: "Soundscapes",
    title: "Music and sound that follow the story",
    body: "A soundscape is a timeline — music under a scene, rain on a roof, a bell at the second minute — in a file of its own. A passage names one, and it plays from that passage on until another brings its own.",
    points: [
      "A clip plays once, on every pass, or looping over itself — gapless for a bed, with a rest between plays for a bell",
      "Every clip shows its waveform; lanes can be named, locked, muted and soloed while you work",
      "A compiled campaign carries its soundscapes, and whatever hosts it plays them",
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <BlurFade>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
              A canvas that knows what a story is
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              The editor supplies geometry, wiring, selection, undo and
              execution. Everything above it — passages, choices, chapters,
              components — is there because a branching story needs it.
            </p>
          </div>
        </BlurFade>

        <div className="mt-16 space-y-20 lg:space-y-28">
          {features.map((feature, index) => (
            <BlurFade key={feature.shot}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <div
                  className={cn(
                    "lg:col-start-1",
                    index % 2 === 1 && "lg:col-start-2"
                  )}
                >
                  <span className="text-sm font-medium text-brand">
                    {feature.eyebrow}
                  </span>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance lg:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-muted-foreground text-pretty">
                    {feature.body}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm">
                    {feature.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                        />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={cn(
                    "lg:row-start-1",
                    index % 2 === 1 ? "lg:col-start-1" : "lg:col-start-2"
                  )}
                >
                  <Screenshot name={feature.shot} />
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
