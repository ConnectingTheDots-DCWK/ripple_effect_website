import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A brand mark on a white disc, linking to whoever owns it.
 *
 * **The disc is not decoration.** Three of the seven marks the site shows are
 * near-black — OpenAI `#000000`, Ollama `black`, GitHub `#161614` — and the
 * site opens in dark mode, where they would be a hole in the page. The
 * alternative was recolouring them to `currentColor`, which is worse: a
 * recoloured mark is the wrong mark. So every one of them sits on white, in
 * both themes, including the ones that would have survived without it —
 * giving three of seven a disc and four of seven none is the kind of
 * inconsistency that reads as a bug.
 *
 * White rather than `--card`, because `--card` is `#14171c` in dark and the
 * black marks would be no better off. This is the one place on the site with a
 * fixed colour that does not follow the theme, and it is fixed for the same
 * reason a photograph does not follow the theme.
 */
export function LogoTile({
  src,
  name,
  href,
  label,
  size = 56,
  className,
}: {
  src: string;
  name: string;
  href: string;
  label: string;
  size?: number;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      aria-label={`${label} — opens ${new URL(href).hostname}`}
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-full border border-border bg-white shadow-sm",
        "transition-transform duration-(--motion-base) ease-(--motion-curve) hover:-translate-y-0.5",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size * 0.55, height: size * 0.55 }}
        className="object-contain"
      />
    </a>
  );
}

/**
 * The same disc with an icon in it instead of a mark — for the point of the
 * pentagon that is not a company.
 */
export function IconTile({
  href,
  name,
  label,
  size = 56,
  children,
  className,
}: {
  href: string;
  name: string;
  label: string;
  size?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      aria-label={`${label} — opens ${new URL(href).hostname}`}
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-full border border-border bg-white text-neutral-800 shadow-sm",
        "transition-transform duration-(--motion-base) ease-(--motion-curve) hover:-translate-y-0.5",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      {children}
    </a>
  );
}
