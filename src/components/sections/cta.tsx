import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Lamp } from "@/components/lamp";
import { RippleMark } from "@/components/ripple-mark";
import { BlurFade } from "@/components/velora/blur-fade";
import { ShimmerButton } from "@/components/velora/shimmer-button";

export function Cta() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <Lamp />
      {/*
        * No picture behind it any more: the painting read as a burning
        * landscape under the ember, as it did in the hero. No band of another
        * colour either — the page is one surface, and the space above is the
        * separation.
        */}
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
