import { support, supportButton } from "@/lib/support";

/**
 * The author's sentence, and the button under it.
 *
 * The image is Buy Me a Coffee's own generated SVG and is rendered with a
 * plain `<img>`. See `supportButton` for why that is the safe choice rather
 * than the lazy one — `next/image` would need `dangerouslyAllowSVG`, which
 * turns this site's origin into somewhere arbitrary SVG can be served from.
 *
 * `width` and `height` are set from the SVG's own viewBox so the button does
 * not resize the paragraph above it when it arrives.
 */
export function BuyMeACoffee() {
  return (
    <div className="flex flex-col items-center gap-5">
      <p className="max-w-md text-pretty text-muted-foreground">
        {support.message}
      </p>
      <a
        href={support.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg transition-transform duration-(--motion-base) ease-(--motion-curve) hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={supportButton.src}
          alt="Buy me a coffee"
          width={supportButton.width}
          height={supportButton.height}
        />
      </a>
    </div>
  );
}
