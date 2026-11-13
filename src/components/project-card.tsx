import Image from "next/image";
import type { ReactNode } from "react";

/**
 * A card at the foot of an audience page about somebody else's project —
 * Flame on `/developers`, Harper on `/writers` — whose mark is shown with
 * its owner's permission rather than under published guidelines. The mark
 * leads, where every other block on those pages has an eyebrow: the card is
 * about them, so it opens with their name as they draw it.
 *
 * A mark is always the owner's own file, never recoloured. `light` and `dark`
 * are the variants for each background; a mark the owner ships in one
 * version only passes the same file twice, or a copy with nothing changed
 * but a background removed. This repository's `CLAUDE.md` says why these
 * marks sit on no white disc.
 */
export function ProjectCard({
  id,
  href,
  name,
  logo,
  title,
  children,
  links,
  notice,
}: {
  /** The heading's id, for the section's `aria-labelledby`. */
  id: string;
  /** The project's own home. */
  href: string;
  /** What the logo's link is announced as. */
  name: string;
  logo: { light: string; dark: string; width: number; height: number };
  title: string;
  children: ReactNode;
  links: { label: string; href: string }[];
  /** Whose marks these are, and on what terms they appear. */
  notice: string;
}) {
  return (
    <section aria-labelledby={id} className="rounded-lg border border-border bg-card p-8 lg:p-12">
      <div className="max-w-3xl space-y-4">
        <a href={href} className="inline-block" aria-label={name}>
          <Image
            src={logo.light}
            alt=""
            width={logo.width}
            height={logo.height}
            unoptimized
            className="block dark:hidden"
          />
          <Image
            src={logo.dark}
            alt=""
            width={logo.width}
            height={logo.height}
            unoptimized
            className="hidden dark:block"
          />
        </a>
        <h2 id={id} className="text-2xl font-semibold tracking-tight text-balance lg:text-3xl">
          {title}
        </h2>
        <div className="space-y-4 text-muted-foreground text-pretty">{children}</div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="pt-2 text-xs text-muted-foreground">{notice}</p>
      </div>
    </section>
  );
}

/** The project's name in running text, linked to its home. */
export function ProjectName({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-medium text-foreground underline-offset-4 hover:underline">
      {children}
    </a>
  );
}
