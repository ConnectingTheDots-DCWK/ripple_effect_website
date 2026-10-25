import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A section's worth of one idea: a small label, a heading, a paragraph and a
 * few points on one side, the mock-up that shows it on the other — swapping
 * sides from one block to the next, as the page always has. Its parts carry
 * `data-reveal` so a `Reveal` around them brings them in.
 */
export function FeatureBlock({
  eyebrow,
  title,
  children,
  points,
  mock,
  flip,
  wide,
  id,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  points?: ReactNode[];
  mock: ReactNode;
  /** Mock-up on the left. */
  flip?: boolean;
  /** Words above, mock-up below at the full width: for a picture that is
      only legible large. */
  wide?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "grid scroll-mt-24 items-center gap-10 lg:gap-14",
        !wide && "lg:grid-cols-2",
        className
      )}
    >
      <div
        data-reveal
        className={cn(
          flip && !wide && "lg:col-start-2",
          wide && "grid gap-x-14 gap-y-6 lg:grid-cols-2 lg:items-end"
        )}
      >
        <div>
          <span className="text-sm font-medium text-brand">{eyebrow}</span>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance lg:text-3xl">
            {title}
          </h3>
          <div className="mt-4 space-y-4 text-muted-foreground text-pretty [&_strong]:font-medium [&_strong]:text-foreground">
            {children}
          </div>
        </div>
        {points && (
          <ul className={cn("space-y-3 text-sm", !wide && "mt-6")}>
            {points.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div data-reveal className={cn("min-w-0", flip && !wide && "lg:col-start-1 lg:row-start-1")}>
        {mock}
      </div>
    </div>
  );
}

/** A section's opening: what the next blocks are about, before they start. */
export function SectionIntro({
  eyebrow,
  title,
  children,
  centred,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  centred?: boolean;
}) {
  return (
    <div data-reveal className={cn("max-w-3xl", centred && "mx-auto text-center")}>
      {eyebrow && <span className="text-sm font-medium text-brand">{eyebrow}</span>}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
        {title}
      </h2>
      {children && (
        <div className="mt-4 space-y-4 text-lg text-muted-foreground text-pretty">{children}</div>
      )}
    </div>
  );
}
