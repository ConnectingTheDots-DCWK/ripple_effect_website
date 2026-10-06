import { ArrowUpRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Interest in the paid tier, and nothing more than that.
 *
 * It links out to a hosted form rather than posting a field of our own. That
 * is not laziness: a styled input on this page would have to POST somewhere,
 * and the form host it would POST to does not accept an arbitrary form
 * submission — so the field would have looked like it worked and swallowed
 * every address typed into it. A button that opens the real form is honest
 * about where the address is going, and it costs no backend, no storage and
 * no privacy notice of our own.
 *
 * `?source=` fills a hidden field on the far side, so it is possible to tell
 * later where somebody came from without asking them.
 */
export function WaitlistForm({
  action,
  source = "pricing",
}: {
  action?: string;
  source?: string;
}) {
  if (!action) {
    return (
      <p className="text-sm text-muted-foreground">
        There is nothing to sign up to yet. When there is, it will be here.
      </p>
    );
  }

  const href = `${action}${action.includes("?") ? "&" : "?"}source=${encodeURIComponent(source)}`;

  return (
    <Button asChild variant="premium" className="h-10 w-full">
      <a href={href} target="_blank" rel="noopener">
        Keep me posted
        <ArrowUpRightIcon />
      </a>
    </Button>
  );
}
