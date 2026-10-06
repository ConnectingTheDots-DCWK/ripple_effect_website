import { CheckIcon, CircleDotIcon, LockIcon } from "lucide-react";

import { BlurFade } from "@/components/velora/blur-fade";
import { Marquee } from "@/components/velora/marquee";
import { SpotlightCard } from "@/components/velora/spotlight-card";
import { roadmap, type Milestone } from "@/lib/roadmap";
import { cn } from "@/lib/utils";

const tones: Record<Milestone["tone"], string> = {
  shipped: "border-go/40 text-go",
  current: "border-primary/40 text-primary",
  planned: "border-border text-muted-foreground",
};

function Card({ milestone }: { milestone: Milestone }) {
  return (
    <SpotlightCard className="w-[19rem] shrink-0 border-border p-5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm text-muted-foreground">
          {milestone.version}
        </span>
        <h3 className="text-base font-semibold tracking-tight">
          {milestone.codename}
        </h3>
      </div>

      {milestone.note && (
        <span
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
            // The paid tier's accent beats the tone: a paywalled release is
            // planned like the others, and the one thing its chip has to say
            // is which tier it belongs to.
            milestone.paid ? "border-premium/50 text-premium" : tones[milestone.tone]
          )}
        >
          {milestone.tone === "shipped" && <CheckIcon className="size-3" />}
          {milestone.tone === "current" && <CircleDotIcon className="size-3" />}
          {milestone.paid && <LockIcon className="size-3" />}
          {milestone.note}
        </span>
      )}

      <ul className="mt-4 space-y-2">
        {milestone.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2.5 text-sm text-muted-foreground"
          >
            <span
              aria-hidden
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
            />
            {feature}
          </li>
        ))}
      </ul>
    </SpotlightCard>
  );
}

export function Roadmap() {
  return (
    <section id="roadmap" className="border-t border-border py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <BlurFade>
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary">Roadmap</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
              What is shipped, and what is next
            </h2>
            <p className="mt-5 text-lg text-muted-foreground text-pretty">
              Each release is a pack of features with a name. The order is the
              order they are planned in — there are no dates here, because the
              honest thing to say about a version that has not started is what
              it is, not when it lands.
            </p>
          </div>
        </BlurFade>
      </div>

      {/*
        * Full bleed rather than inside the `max-w-6xl` container: a belt that
        * starts and stops at the same margins as the paragraph above it reads
        * as a broken carousel, where one running off both edges reads as a
        * belt. The `Marquee`'s own edge mask does the fading.
        *
        * **`motion-reduce:overflow-x-auto` is the fallback that makes this
        * readable rather than truncated.** `globals.css` stops
        * `animate-marquee` under `prefers-reduced-motion`, which would
        * otherwise leave a reader looking at the first four cards with no way
        * to reach 1.9 — the animation *was* the only means of scrolling.
        * Turning the overflow back on hands them a scrollbar instead.
        */}
      <BlurFade delay={0.1} className="mt-12">
        <Marquee
          pauseOnHover
          repeat={2}
          className="[--duration:80s] [--gap:1rem] motion-reduce:overflow-x-auto"
        >
          {roadmap.map((milestone) => (
            <Card key={milestone.version} milestone={milestone} />
          ))}
        </Marquee>
      </BlurFade>
    </section>
  );
}
