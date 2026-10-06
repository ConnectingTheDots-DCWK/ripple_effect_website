"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { StickyBanner } from "@/components/velora/sticky-banner";

/** How long a release counts as news. */
const WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

const NO_STORE = () => () => {};

/**
 * `useSyncExternalStore` demands a snapshot that is `Object.is`-stable between
 * calls or it loops, and both halves of this answer are unstable on their own:
 * `Date.now()` moves, and `localStorage` throws outright in a private window
 * or with site data blocked. So it is computed once per key and kept.
 *
 * Not re-checking while the tab is open is correct rather than lazy. The
 * window is three days; a banner that vanished mid-read because a boundary
 * passed would be worse than one that waits for a reload.
 */
const cache = new Map<string, boolean>();

function isNews(key: string, publishedAt: string): boolean {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  let dismissed = false;
  try {
    dismissed = localStorage.getItem(key) !== null;
  } catch {
    // A private window, or site data blocked. Not a reason to hide the news.
  }

  const published = Date.parse(publishedAt);
  const fresh = Number.isFinite(published) && Date.now() - published < WINDOW_MS;

  const value = fresh && !dismissed;
  cache.set(key, value);
  return value;
}

/**
 * Says a release is out, for the three days after it is published.
 *
 * **The clock is read on the client, not on the server**, and that is the
 * whole design of this component. Freshness on the server would be decided
 * when the page was *rendered*, which for a statically prerendered route is
 * whenever the site was last built — so `/pricing` would carry a banner that
 * is three days old relative to a deploy nobody made, and would keep carrying
 * it. The server supplies the one thing only it knows, the publication date,
 * and the browser does the subtraction at the moment somebody looks.
 *
 * That means nothing renders server-side: `getServerSnapshot` returns false,
 * so the markup ships without the banner and it appears after hydration. The
 * alternative is comparing two different clocks across a hydration boundary,
 * which is a mismatch by construction.
 *
 * A dismissal is keyed by tag, so dismissing 1.0.0 does not also dismiss 1.1.0
 * three weeks later.
 */
export function ReleaseBanner({
  version,
  tag,
  publishedAt,
}: {
  version: string;
  tag: string;
  publishedAt: string;
}) {
  const key = `ripple:release-banner:${tag}`;
  const visible = useSyncExternalStore(
    NO_STORE,
    () => isNews(key, publishedAt),
    () => false
  );

  if (!visible) return null;

  return (
    <StickyBanner
      onDismiss={() => {
        try {
          localStorage.setItem(key, "1");
        } catch {
          // Nothing to do: it will be shown again, which is the safe failure.
        }
      }}
    >
      <span className="font-medium">
        Version {version} is out.{" "}
        <Link
          href="/download"
          className="underline underline-offset-4 hover:no-underline"
        >
          Download it
        </Link>
      </span>
    </StickyBanner>
  );
}
