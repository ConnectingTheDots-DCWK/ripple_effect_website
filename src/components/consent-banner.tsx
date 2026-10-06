"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useConsent, setConsent } from "@/lib/consent";

/**
 * The cookie notice, which is unusually small because the site is.
 *
 * **It asks about one cookie, and it is not the analytics.** Page views are
 * counted by Vercel Web Analytics, which sets nothing on the device at all —
 * visitors are told apart by a hash derived from the request and discarded
 * after a day. There is nothing there to consent to and nothing to switch off,
 * so this does not offer to. The single cookie on this site belongs to the Buy
 * Me a Coffee widget, which sets `visited` to remember that it has been seen;
 * that was measured rather than assumed, on a clean browser profile, and it is
 * the whole reason this component exists.
 *
 * **Declining has to be exactly as cheap as accepting**, which is why both are
 * buttons of the same size sitting side by side rather than a filled *Accept*
 * beside an underlined *no thanks*. The visual weight differs by variant only.
 *
 * It is not a dialog and does not trap focus. Nothing on the page is withheld
 * pending an answer — the answer only decides whether one third-party script
 * loads — so a modal would be claiming an urgency it does not have.
 */
export function ConsentBanner() {
  const consent = useConsent();

  if (consent !== "unset") return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-(--motion-slow) ease-(--motion-curve) motion-reduce:animate-none"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p className="max-w-3xl text-muted-foreground text-pretty">
          <span className="font-medium text-foreground">
            This site sets no cookie unless you say so.
          </span>{" "}
          Page views are counted without one, and nothing here follows you to
          another site. The one cookie on offer belongs to the Buy Me a Coffee
          button, and it remembers only that you have seen it.{" "}
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            What is collected
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConsent("denied")}
          >
            Decline
          </Button>
          <Button size="sm" onClick={() => setConsent("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
