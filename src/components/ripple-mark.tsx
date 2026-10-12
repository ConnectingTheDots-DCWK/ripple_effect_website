import Link from "next/link";

import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/*
 * The brand, transcribed from `lib/src/widgets/app_brand.dart`.
 *
 * There is no logo file to import — in the app the mark is *painted* rather
 * than shipped as an asset, "so it takes the theme's colours and stays crisp
 * at any size", and the only rasters that exist are the generated app icons.
 * So this is the same three-ring table, drawn as SVG, and it inherits
 * `currentColor` for the same reason the Dart painter takes a colour.
 *
 *   (radius, alpha, stroke width) as fractions of unit = shortestSide / 2
 */
const RINGS = [
  { r: 0.46, alpha: 0.95, width: 0.13 },
  { r: 0.72, alpha: 0.55, width: 0.11 },
  { r: 0.96, alpha: 0.28, width: 0.09 },
] as const;

const DROP = 0.17;

/** unit, in the 32x32 viewBox below. */
const U = 16;

export function RippleMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      {RINGS.map((ring) => (
        <circle
          key={ring.r}
          cx={U}
          cy={U}
          r={U * ring.r}
          stroke="currentColor"
          strokeOpacity={ring.alpha}
          strokeWidth={U * ring.width}
        />
      ))}
      <circle cx={U} cy={U} r={U * DROP} fill="currentColor" />
    </svg>
  );
}

/**
 * The wordmark, transcribed from the app's `AppBrand`: the display name — *Ripple
 * Effect*, the name a person reads — with the second word in the accent. It
 * used to be the package name, `ripple_effect`, with the underscore coloured;
 * that is an identifier, and the brand stopped being one.
 */
export function Wordmark({ className }: { className?: string }) {
  const [first, second] = siteConfig.name.split(" ");
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      {first} <span className="text-primary">{second}</span>
    </span>
  );
}

/** Mark and wordmark together, linking home. The header and footer lockup. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-3 transition-colors hover:text-primary",
        className
      )}
    >
      <RippleMark size={24} className="text-brand" />
      <Wordmark />
    </Link>
  );
}
