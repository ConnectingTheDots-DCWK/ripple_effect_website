import Image from "next/image";

import { BlurFade } from "@/components/velora/blur-fade";
import { OrbitingCircles } from "@/components/velora/orbiting-circles";
import { RippleMark } from "@/components/ripple-mark";
import { gitHosts } from "@/lib/integrations";

const points = [
  "Save points instead of commits, storylines instead of branches — the words are the ones a writer already has",
  "libgit2 is compiled into the app, so there is nothing to install and no git on PATH is consulted",
  "Status dots in the ordinary file tree, and a third tab beside Files and Messages",
  "Set a change aside and come back to it, with a safety net that says where the work went",
];

export function VersionControl() {
  return (
    <section
      id="version-control"
      className="border-t border-border bg-card py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/*
            * The orbit sits first on a wide screen and second on a narrow one:
            * on mobile the sentence explaining what it is should arrive before
            * the picture of it, and on desktop the picture anchors the left
            * where every other section on the page puts its image.
            */}
          <BlurFade className="order-2 min-w-0 lg:order-1">
            <div className="relative mx-auto flex aspect-square w-full max-w-[26rem] items-center justify-center">
              {/* One step *lighter* than the ground it sits on, which on this section is
                  `bg-card` — so the hub is `bg-popover`, not `bg-background`. The house
                  rule is that a card sits lighter on the page; a disc in the middle of a
                  card that reached back down to the page colour would read as a dent
                  punched in it. The agents section is on the page ground and takes
                  `bg-card` for the same reason. */}
              <div className="flex size-20 items-center justify-center rounded-full border border-border bg-popover">
                <RippleMark size={40} className="text-brand" />
              </div>
              <OrbitingCircles radius={140} duration={28} iconSize={56}>
                {gitHosts.map((host) => (
                  <a
                    key={host.name}
                    href={host.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={host.name}
                    aria-label={`${host.label} — opens ${new URL(host.href).hostname}`}
                    className="flex size-14 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-transform duration-(--motion-base) ease-(--motion-curve) hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <Image
                      src={host.src}
                      alt=""
                      width={56}
                      height={56}
                      className="size-7 object-contain"
                    />
                  </a>
                ))}
              </OrbitingCircles>
            </div>
          </BlurFade>

          <BlurFade delay={0.12} className="order-1 min-w-0 lg:order-2">
            <div>
              <span className="text-sm font-medium text-primary">
                Version control
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
                Version control for people who have never used it
              </h2>
              <p className="mt-5 text-lg text-muted-foreground text-pretty">
                Git, for a folder of prose, aimed at somebody who has never
                needed it and should not have to start now. It is a panel in
                the app rather than a terminal beside it — and because the
                repository underneath is an ordinary one, anybody on the
                project who does know git carries on as normal.
              </p>
              <ul className="mt-6 space-y-3">
                {points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm text-muted-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
