import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Cover } from "@/components/cover";
import { RippleMark } from "@/components/ripple-mark";
import { BlurFade } from "@/components/velora/blur-fade";
import { ShimmerButton } from "@/components/velora/shimmer-button";

export function Cta() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-card py-20">
      {/*
        * The same painting as the hero, and deliberately **without the grid
        * over it**. Up there the pattern has a job — the cover is a
        * photograph and the grid is what says the page is a tool — and by the
        * time somebody has read the whole page that has been said. What is
        * left here is one picture behind two buttons.
        *
        * Masked at *both* ends rather than faded one way. The hero is
        * anchored to the top of the viewport, so it has one seam and can run
        * off it; this is a band between a border and the footer and has two.
        *
        * Linear rather than the radial ellipse the grid masks use, and that
        * was measured rather than chosen: a `radial-gradient(ellipse 85% 75%)`
        * still has a third of its alpha left where the band ends, because the
        * vertical radius is 75% of the height and the edge is only 50% away —
        * so the painting stopped in a hard line above the footer. Reaching
        * zero at both seams is the whole requirement here, and a linear
        * gradient in one axis says it exactly.
        */}
      <Cover className="inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,black_38%,black_62%,transparent_100%)]" />
      <BlurFade>
        <div className="relative mx-auto max-w-2xl px-4 text-center lg:px-8">
          <RippleMark size={40} className="mx-auto text-brand" />
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
            Open a folder and start writing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            No account, no project scaffold, nothing written into your
            directory that you did not ask for.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ShimmerButton asChild className="h-11 px-6 text-base">
              <Link href="/download">Download for free</Link>
            </ShimmerButton>
            <Button asChild variant="outline" className="h-11 px-6 text-base">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
