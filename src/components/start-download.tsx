"use client";

import { useEffect, useRef } from "react";

/**
 * Starts the download once, on arrival at `/thanks`.
 *
 * **Navigating to the URL is the trigger, and nothing navigates.** The route
 * answers with a 302 to a GitHub asset URL that carries
 * `Content-Disposition: attachment`, and a browser handed an attachment
 * downloads it and leaves the current document where it is. So assigning
 * `location.href` starts the file and the reader stays on this page.
 *
 * That is also why it is `location.href` rather than a hidden iframe, which
 * was the other candidate. The iframe is theoretically tidier and fails worse:
 * downloads inside frames are blocked in more situations than they are in a
 * top-level navigation, and when they are blocked they are blocked *silently*.
 * If this assignment ever failed to be an attachment the browser would simply
 * navigate to the file — which is exactly what clicking the button did before
 * this page existed, so the worst case is the old behaviour rather than a
 * download that never happens.
 *
 * **The ref guard is not paranoia about StrictMode, it is about the file.**
 * React runs effects twice in development, and each run here is a real HTTP
 * request for tens of megabytes that some browsers will happily save twice.
 */
export function StartDownload({ href }: { href: string }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    window.location.href = href;
  }, [href]);

  return null;
}
