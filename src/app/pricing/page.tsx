import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { BorderBeam } from "@/components/velora/border-beam";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${siteConfig.name} is free. A paid tier is planned — collaboration, team workspaces, media storage and AI services — and its price is not decided yet.`,
  alternates: { canonical: "/pricing" },
};

/**
 * Everything the app does today, as eight areas rather than a line per
 * feature: the card is a comparison, and a comparison reads at the level of
 * what a tier *has*, not what each part of it is called. Nothing here is held
 * back for a paid tier.
 */
const included = [
  "The full canvas and script navigation suite",
  "Full visual scripting",
  "Full Python scripting",
  "Playing a campaign",
  "Campaign exports",
  "Internationalisation tools",
  "MCP integration",
  "Git integration",
];

/**
 * What the paid tier is shaping up to hold — `ROADMAP.md`'s own list under
 * its SaaS line, in its own words. A version is given only where the roadmap
 * gives one; the rest is the tier's value proposition and is not scheduled.
 * Keep this in step with that file, not with what would look good in a
 * column: an item that is not on the roadmap is an invention.
 */
const planned: { text: string; version?: string }[] = [
  { text: "Real-time collaboration on a project, Figma-style", version: "1.8" },
  { text: "Team workspaces, and managing who is in them" },
  { text: "Cost-effective storage for large media, through git LFS" },
  {
    text: "An AI services package: spelling and grammar checking, image generation, and generative narration",
    version: "1.6 – 1.7",
  },
  { text: "Inference for games built on the runtime" },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Free, and honest about what comes next"
        description="Everything Ripple Effect does today is free. A paid tier is planned and the roadmap says what it is for; its price has not been decided, so none is stated here."
      />

      <section className="mx-auto max-w-5xl px-4 pb-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Free */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8">
            <BorderBeam size={160} duration={8} />
            <h2 className="text-lg font-semibold tracking-tight">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The whole application, as it ships today.
            </p>
            <p className="mt-6 text-4xl font-semibold tracking-tight">
              $0
              <span className="ml-2 align-middle text-base font-normal text-muted-foreground">
                forever
              </span>
            </p>
            <Button asChild className="mt-6 h-10 w-full">
              <Link href="/download">Download</Link>
            </Button>
            <ul className="mt-8 space-y-3 text-sm">
              {included.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-go" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            {/*
              Not a feature: the terms the tier comes on, and now the
              documents that state them. "Opt-in telemetry" used to be here as
              a promise about something that did not exist; it exists from 1.5
              and is opt-in, so the line names it alongside the crash report
              that is asked for one report at a time.
            */}
            <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
              No account, no sync. Crash reports are asked for one at a time;
              anonymous usage statistics are opt-in.
              <br />
              <a
                href={siteConfig.legal.eula}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Licence
              </a>{" "}
              ·{" "}
              <a
                href={siteConfig.legal.privacy}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Privacy Notice
              </a>
            </p>
          </div>

          {/* Paid — a preview, read off the roadmap, and said to be one */}
          <div className="relative rounded-lg border border-premium/40 bg-card p-8">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Paid</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-premium/50 px-2.5 py-0.5 text-xs font-medium text-premium">
                <LockIcon className="size-3" />
                Coming soon
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              A tier that pays for the work. Not built yet.
            </p>
            <p className="mt-6 text-4xl font-semibold tracking-tight text-muted-foreground">
              —
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Not priced yet.
            </p>

            <div className="mt-6">
              <WaitlistForm action={siteConfig.links.waitlist} />
            </div>

            {/*
              * A preview, not a column of ticks. Every line is on
              * `ROADMAP.md` in the app repository, and the two that have a
              * release number carry it; the rest are the plan's own words
              * for what the tier is for, and the caption says they can
              * change. The rule from CLAUDE.md still holds: nothing here is
              * invented, and nothing free today moves across.
              */}
            <p className="mt-8 text-sm font-medium">
              What it is shaping up to hold
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              From the roadmap, subject to change, and not a promise — a glimpse
              of what the tier is for.
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {planned.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-premium" />
                  <span className="text-muted-foreground">
                    {item.text}
                    {item.version && (
                      <span className="ml-2 font-mono text-xs text-premium">
                        {item.version}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {/* The same kind of note as the free card's, for the same reason. */}
            <p className="mt-6 text-xs text-muted-foreground">
              Account required, private storage. Your projects stay yours and
              are not used to train anything.
              <br />
              <a
                href={siteConfig.legal.terms}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Terms of Service
              </a>{" "}
              ·{" "}
              <a
                href={siteConfig.legal.subprocessors}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Sub-processors
              </a>
            </p>

            <p className="mt-6 text-sm text-muted-foreground">
              Nothing that is free today is planned to stop being free. The
              order and the rest of the plan are on the{" "}
              <Link
                href="/#roadmap"
                className="text-foreground underline underline-offset-4 transition-colors hover:text-premium"
              >
                roadmap
              </Link>
              .
            </p>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-sm font-medium">
                Want a say in what it turns out to be?
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Keep me posted, above, is one address, used to tell you when
                there is something to tell, and held by the form host rather
                than by us. Or say it out loud in{" "}
                <a
                  href={siteConfig.links.discussions}
                  target="_blank"
                  rel="noopener"
                  className="text-primary underline underline-offset-4"
                >
                  Discussions
                </a>
                .
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
