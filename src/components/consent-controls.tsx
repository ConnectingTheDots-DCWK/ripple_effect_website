"use client";

import { Button } from "@/components/ui/button";
import { useConsent, setConsent } from "@/lib/consent";

/**
 * Withdrawing has to be as easy as agreeing, so the choice is restated here
 * rather than only in the banner — which by design is gone the moment it is
 * answered and never comes back on its own.
 *
 * The current answer is shown as a sentence rather than as a toggle wearing a
 * state: "unknown" renders nothing at all (see `useConsent`), and a switch
 * that appeared blank for a frame and then flipped itself would read as the
 * page changing the setting rather than as the page catching up.
 */
export function ConsentControls() {
  const consent = useConsent();

  if (consent === "unknown") return null;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {consent === "granted"
          ? "You accepted the coffee button's cookie."
          : consent === "denied"
            ? "You declined the coffee button's cookie, so its script is not loaded."
            : "You have not answered yet."}
      </p>
      <div className="flex shrink-0 gap-2">
        {consent !== "denied" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConsent("denied")}
          >
            Decline
          </Button>
        )}
        {consent !== "granted" && (
          <Button size="sm" onClick={() => setConsent("granted")}>
            Accept
          </Button>
        )}
      </div>
    </div>
  );
}
