"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface StickyBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hide the dismiss button for banners that must stay put */
  dismissible?: boolean;
  /** Called after the banner is dismissed */
  onDismiss?: () => void;
  children: React.ReactNode;
}

/**
 * Announcement bar pinned under the site header.
 *
 * **`fixed top-16`, not the template's `sticky top-0`.** This site's header is
 * `fixed`, so it is out of flow and overlays the first 64px of the page; a
 * banner in normal flow at the top of `<main>` would be underneath it and
 * invisible. Sitting at `top-16` puts it exactly below the bar — which is
 * where it was asked for — and `z-40` keeps it beneath the header rather than
 * over it, so the two never fight.
 *
 * It needs no layout allowance from the pages. Every page on the site already
 * clears the fixed header with room to spare — the home hero at `pt-32` and
 * `PageHeader` at `pt-36` — and the banner is about 40px, so it lands in space
 * that is empty either way. Reduce either of those paddings and this is what
 * breaks.
 *
 * The gradient is the brand hue from end to end, the same argument
 * `BorderBeam` makes: an announcement's whole job is to be noticed once. What
 * keeps it honest is that it is *transient by construction* — see
 * `ReleaseBanner`, which only renders it for three days after a release.
 */
export function StickyBanner({
  dismissible = true,
  onDismiss,
  children,
  className,
  ...props
}: StickyBannerProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      {...props}
      data-slot="sticky-banner"
      className={cn(
        "fixed inset-x-0 top-16 z-40 flex items-center justify-center gap-3 border-b border-black/10 bg-gradient-to-r from-brand-from via-brand-via to-brand-to px-4 py-2 text-center text-sm text-brand-foreground",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            setOpen(false);
            onDismiss?.();
          }}
          className="-mr-1 shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      )}
    </div>
  );
}
