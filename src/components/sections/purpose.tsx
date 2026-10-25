import { CableIcon, PenLineIcon, PlayIcon } from "lucide-react";

import { SectionIntro } from "@/components/feature-block";
import { StoryBoard } from "@/components/mock/story-board";
import { Reveal } from "@/components/reveal";

const STEPS = [
  {
    icon: PenLineIcon,
    title: "Write",
    body: "A passage is prose in Markdown, set like a book, in as many languages as the story needs.",
  },
  {
    icon: CableIcon,
    title: "Wire",
    body: "Each passage is a card on a canvas, and every choice is a wire to what it leads to.",
  },
  {
    icon: PlayIcon,
    title: "Play, then ship",
    body: "Press play to walk the story as a reader would. When it is ready, its engine plays it in your game, site or app.",
  },
];

/**
 * What the app *is*, for somebody who has never heard of it — said before
 * anything about how it differs, because "different" means nothing to a
 * reader who does not yet know what it is being compared with.
 */
export function Purpose() {
  return (
    <section id="what-it-is" className="scroll-mt-16 py-16 lg:py-24">
      <Reveal className="mx-auto max-w-6xl px-4 lg:px-8">
        <SectionIntro eyebrow="What it is" title="An editor for stories that branch">
          <p>
            Interactive narrative — a game&rsquo;s dialogue, a visual novel, a
            gamebook, a tabletop campaign — is a story where the reader&rsquo;s
            choices decide what comes next. Ripple Effect is a desktop tool for
            writing one, testing it, and handing it to whatever will play it.
          </p>
        </SectionIntro>

        <div data-reveal className="mt-12">
          <StoryBoard />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} data-reveal>
              <step.icon className="size-5 text-brand" />
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
