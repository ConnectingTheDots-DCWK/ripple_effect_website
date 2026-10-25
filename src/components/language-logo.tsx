import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A language's or a package manager's own mark, from svglogos.dev (CC0),
 * copied into `public/logos/` so a page here fetches nothing from anybody
 * else's host. Drawn in its own colours, never recoloured: a recoloured mark
 * is the wrong mark (`LogoTile` says the same about the agents' logos).
 *
 * The one exception is a mark with no colour at all — Markdown's is black,
 * JSON's black into white — which would be a hole in the dark page. Those
 * are inverted in dark, which is the inverse every monochrome mark ships
 * for exactly that, not a recolouring.
 */
const MONOCHROME = new Set<LogoName>(["markdown", "json"]);
const FILES = {
  typescript: "typescript-icon.svg",
  c: "c.svg",
  cpp: "c-plusplus.svg",
  csharp: "c-sharp.svg",
  dart: "dart.svg",
  flutter: "flutter.svg",
  npm: "npm-icon.svg",
  nuget: "nuget.svg",
  webassembly: "webassembly.svg",
  python: "python.svg",
  json: "json.svg",
  markdown: "markdown.svg",
  git: "git-icon.svg",
} as const;

export type LogoName = keyof typeof FILES;

const NAMES: Record<LogoName, string> = {
  typescript: "TypeScript",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  dart: "Dart",
  flutter: "Flutter",
  npm: "npm",
  nuget: "NuGet",
  webassembly: "WebAssembly",
  python: "Python",
  json: "JSON",
  markdown: "Markdown",
  git: "Git",
};

export function LanguageLogo({
  name,
  size = 20,
  className,
  decorative,
}: {
  name: LogoName;
  size?: number;
  className?: string;
  /** Beside its own name in text, a logo says nothing more. */
  decorative?: boolean;
}) {
  return (
    <Image
      src={`/logos/${FILES[name]}`}
      alt={decorative ? "" : NAMES[name]}
      width={size}
      height={size}
      unoptimized
      className={cn(
        "inline-block shrink-0 object-contain",
        MONOCHROME.has(name) && "dark:invert",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

export const logoName = (name: LogoName) => NAMES[name];
