import Link from "next/link";

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
 * The wordmark, with the app's one rule about it:
 *
 * > The underscore is coloured rather than swallowed: it is half the name, and
 * > a `ripple effect` that has lost it reads as two words somebody forgot to
 * > join up.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      ripple<span className="text-primary">_effect</span>
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
