import Link from "next/link";
import { HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/velora/blur-fade";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center justify-center px-4">
      <BlurFade>
        <div className="mx-auto max-w-md text-center">
          <p className="font-mono text-7xl font-semibold tracking-tight text-brand">
            404
          </p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            There is no wire to this one
          </h1>
          <p className="mt-4 text-muted-foreground">
            The page you asked for does not exist, or it moved.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">
                <HomeIcon />
                Back home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/download">Download</Link>
            </Button>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
