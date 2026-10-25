import Link from "next/link";
import { ArrowRightIcon, DicesIcon, PenLineIcon, type LucideIcon } from "lucide-react";

import { LanguageLogo, type LogoName } from "@/components/language-logo";
import { Reveal } from "@/components/reveal";

type Audience = {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  logos?: LogoName[];
  icon?: LucideIcon;
};

/**
 * The three people the app is for, each with a page of their own — right
 * under the hero's buttons, so a reader who knows which one they are is one
 * click from the page written for them. The card is `PostCard`'s shape, at
 * the size the blog used for its two newest posts.
 */
const AUDIENCES: Audience[] = [
  {
    href: "/developers",
    eyebrow: "For game developers",
    title: "Story logic you can drop into any engine",
    body: "Bindings for TypeScript, C and C++, C# and Dart, a C ABI for anything else, and a story that talks with your game both ways — so a choice can be a place, a person or a moment, not just a button.",
    logos: ["typescript", "cpp", "csharp", "dart"],
  },
  {
    href: "/writers",
    eyebrow: "For writers and narrative designers",
    title: "Write prose, and keep the structure in view",
    body: "Spelling and grammar checked on your own machine, house-style rules you write yourself, and a map of how every chapter hands the story on.",
    icon: PenLineIcon,
  },
  {
    href: "/tabletop",
    eyebrow: "For tabletop players and storytellers",
    title: "Storyboard the campaign, and track everything in it",
    body: "Characters, items and factions as entities with typed attributes, console variables for the state of the world, and the dice on the board.",
    icon: DicesIcon,
  },
];

export function Audiences() {
  return (
    <section aria-label="Who it is for" className="pb-8">
      <Reveal className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3 lg:px-8">
        {AUDIENCES.map((audience) => (
          <Link
            key={audience.href}
            href={audience.href}
            data-reveal
            className="group flex flex-col rounded-lg border border-border bg-card p-7 transition-colors hover:border-primary/40"
          >
            <div className="flex h-7 items-center gap-2">
              {audience.logos?.map((logo) => (
                <LanguageLogo key={logo} name={logo} size={22} />
              ))}
              {audience.icon && <audience.icon className="size-6 text-brand" />}
            </div>
            <span className="mt-5 text-sm font-medium text-muted-foreground">
              {audience.eyebrow}
            </span>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-primary lg:text-2xl">
              {audience.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground text-pretty">
              {audience.body}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary">
              Read more
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
