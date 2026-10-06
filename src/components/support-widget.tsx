"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

import { support } from "@/lib/support";
import { useConsent } from "@/lib/consent";

/**
 * Buy Me a Coffee's floating widget, on every page but one.
 *
 * **`/thanks` is the exception, and it is the page that asks hardest.** That
 * page's entire content is the same sentence and the same button; a floating
 * bubble repeating it in the corner is the same request made twice in one
 * viewport, which reads as nagging rather than as asking.
 *
 * **`onLoad` re-fires `DOMContentLoaded` on `window`, and without it the
 * widget never appears.** The vendor script ends in
 * `window.addEventListener("DOMContentLoaded", …)`. Next injects it after
 * hydration, by which time that event has long since fired, so the listener is
 * waiting for something that will never happen again: the script loads,
 * reports success, and draws nothing. Re-firing it is the documented
 * workaround and is safe here because nothing else on this site listens.
 *
 * **It has to be `window`, not `document`.** The obvious spelling —
 * `document.dispatchEvent(new Event("DOMContentLoaded"))` — is what was tried
 * first and it does nothing at all, because `new Event()` is `bubbles: false`
 * by default and the listener is on `window`. The event fires, reaches
 * nothing, and the failure is completely silent: no error, no warning, an
 * empty corner. Read the vendor bundle before assuming which target it used;
 * it is 8 KB and it says so in one line.
 *
 * It is `lazyOnload`: it is a third-party request that renders a bubble in a
 * corner, and it has no business competing with the page for the network
 * during load.
 *
 * **It waits for consent, and it is the only thing on the site that has to.**
 * The widget sets a first-party `visited` cookie — measured on a clean
 * browser profile, not assumed — which makes it the one non-essential piece
 * of storage here; Vercel's analytics sets nothing at all. So nothing loads
 * until `ConsentBanner` has been answered, and declining means the script is
 * never requested rather than requested and hidden.
 *
 * That also settles a collision that would otherwise need settling: the
 * bubble sits bottom-right and the banner sits along the bottom, and they
 * cannot both be on screen because the banner is gone before the bubble is
 * allowed to exist. The footer carries a plain link to the same page, so
 * declining does not remove the ask, only the script.
 */
export function SupportWidget() {
  const pathname = usePathname();
  const consent = useConsent();

  if (consent !== "granted") return null;
  if (pathname === "/thanks") return null;

  return (
    <Script
      id="bmc-widget"
      strategy="lazyOnload"
      src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
      data-name="BMC-Widget"
      data-cfasync="false"
      data-id={support.slug}
      data-description={support.description}
      data-message={support.message}
      data-color={support.colour}
      data-position="Right"
      data-x_margin="18"
      data-y_margin="18"
      onLoad={() => {
        window.dispatchEvent(new Event("DOMContentLoaded"));
      }}
    />
  );
}
