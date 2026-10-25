import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Lamp } from "@/components/lamp";
import { Reveal } from "@/components/reveal";

/**
 * The top of a page written for one audience: who it is for, what it
 * promises them, and the two ways on — the thing to do, and the page that
 * says more. Plain, as the home page's hero is until the launch video.
 */
export function AudienceHero({
  eyebrow,
  title,
  children,
  primary,
  secondary,
  aside,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** A row under the buttons — the languages, say. */
  aside?: ReactNode;
}) {
  const link = (href: string, label: string) =>
    href.startsWith("http") ? <a href={href}>{label}</a> : <Link href={href}>{label}</Link>;

  return (
    <section className="relative overflow-hidden pt-32 pb-28 lg:pt-40 lg:pb-32">
      <Lamp />
      <Reveal className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
        <p data-reveal className="text-sm font-medium text-brand">
          {eyebrow}
        </p>
        <h1 data-reveal className="mt-4 text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
          {title}
        </h1>
        <div data-reveal className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
          {children}
        </div>
        <div data-reveal className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-11 px-6 text-base">
            {link(primary.href, primary.label)}
          </Button>
          {secondary && (
            <Button asChild variant="outline" className="h-11 px-6 text-base">
              {link(secondary.href, secondary.label)}
            </Button>
          )}
        </div>
        {aside && (
          <div data-reveal className="mt-10">
            {aside}
          </div>
        )}
      </Reveal>
    </section>
  );
}
