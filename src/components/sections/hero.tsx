import Link from "next/link";
import { ArrowRightIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Screenshot } from "@/components/screenshot";
import { HeroDownload } from "@/components/hero-download";
import { Cover } from "@/components/cover";
import { BlurFade } from "@/components/velora/blur-fade";
import { FlipWords } from "@/components/velora/flip-words";
import { GridPattern } from "@/components/velora/grid-pattern";
import { fetchLatestRelease } from "@/lib/releases";
import { siteConfig } from "@/lib/site-config";

export async function Hero() {
  // The version on the badge is the tag of the latest published release, never
  // a number written down here — a hardcoded one is wrong from the first
  // release after somebody forgets it, and wrong quietly.
  const latest = await fetchLatestRelease();

  return (
    <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40">
      {/* Order is the layering: painting, then grid over it, then the content
          in a `relative` wrapper over both. */}
      <Cover
        eager
        className="inset-x-0 top-0 h-[36rem] [mask-image:linear-gradient(to_bottom,black_0%,black_28%,transparent_94%)] lg:h-[42rem]"
      />
      {/*
        * The grid reaches further than it used to — 90% x 80% where it was
        * 70% x 60%. It has a second job now: the painting is a photograph and
        * the grid is the thing that says the page is a tool, so the pattern
        * has to still be legible across the whole of it rather than fading
        * out a third of the way down and leaving bare picture underneath.
        */}
      <GridPattern
        width={48}
        height={48}
        className="fill-transparent stroke-border [mask-image:radial-gradient(ellipse_90%_80%_at_50%_0%,black,transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <BlurFade direction="down">
          <div className="mx-auto max-w-3xl text-center">
            {latest && (
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                Version {latest.version}
              </span>
            )}
            {/*
              * **The flipping word is the last one in the sentence, and that is
              * a constraint rather than a preference.** A word that changes
              * mid-line has to reserve the width of the longest of them, which
              * leaves a hole beside every short one; at the end there is
              * nothing after it for a hole to sit in front of, and the line
              * cannot re-centre because the reserved box does not change size.
              *
              * Each of the four is a claim the rest of the site stands behind.
              * `free` is the tier as it exists. `local` is what a project *is*
              * — a folder on your own disk, no scaffold written into it.
              * `yours` is licence clause 1, in the licence's own word:
              * *"Stories, projects, boards, components, scripts and exports
              * you author with it are yours."* `fast` is the one that is a
              * judgement rather than a fact, and it is the one the canvas is
              * built to earn.
              *
              * "Interactive stories, drawn as graphs" is not lost with the old
              * headline: it is the page title and the OG title, which is where
              * a search result and a shared link read it from.
              */}
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
              Interactive narrative design,{" "}
              <span className="block">
                made with ❤️ — and it&rsquo;s{" "}
                <FlipWords
                  words={["free", "fast", "local", "yours"]}
                  className="text-primary"
                />
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
              {siteConfig.name} is a desktop application for writing branching
              narrative. You lay passages out on a canvas, wire each choice to
              what it leads to, and press play to walk the result — over a
              folder on your own disk.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <HeroDownload assets={latest?.assets ?? []} />
              <Button asChild variant="outline" className="h-11 px-6 text-base">
                <Link href="#features">See what it does</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free, and there is no account to make.{" "}
              <Link
                href="/download"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                Every platform, and how to install
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </p>

            {/*
             * `AppStatus.caution`, the app's own warning colour, so a caveat
             * here and a caveat in the messages panel are the same yellow.
             *
             * A foreground on the page, not a filled banner: the house rule is
             * that accent is a pointer rather than a paint, and a tinted strip
             * under the hero would shout louder than the thing it is warning
             * about. Measured at 4.60:1 light and 11.49:1 dark, so it is
             * legible as text rather than only as a signal.
             *
             * **The wording is deliberately calm.** It said "Early development
             * — expect rough edges and bugs", which is honest and reads, to
             * somebody who has never heard of the app, as a warning not to
             * install it. The facts have not changed and none has been
             * softened away: it is early, and there are rough edges. What went
             * is the imperative — "expect" tells a reader what to brace for —
             * and the word "bugs" as the sentence's last beat.
             *
             * No version number in it, though "1.0 is young" was the obvious
             * phrasing. The badge above reads its number from the release and
             * this would not, so the two would disagree the day 1.1 ships.
             */}
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-caution">
              <TriangleAlertIcon className="size-4 shrink-0" />
              Early days — you may still meet the odd rough edge.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.15} className="mt-14">
          <Screenshot name="board" priority beam />
        </BlurFade>
      </div>
    </section>
  );
}
