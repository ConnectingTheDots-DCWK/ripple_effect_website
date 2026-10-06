"use client";

import { useDetectedPlatforms } from "@/lib/use-platform";
import type { Platform } from "@/lib/releases";

/**
 * Marks the card for the visitor's own operating system.
 *
 * Every platform stays listed either way — this points, it does not choose,
 * because plenty of people download for a machine they are not sitting at.
 * A Linux visitor sees both formats marked, for the reason the hook documents.
 */
export function DetectedPlatform({ platform }: { platform: Platform }) {
  const here = useDetectedPlatforms();

  if (!here.includes(platform)) return null;

  return (
    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Your system
    </span>
  );
}
