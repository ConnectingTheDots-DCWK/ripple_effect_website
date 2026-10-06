import fs from "node:fs";
import path from "node:path";

import Image from "next/image";

import { BorderBeam } from "@/components/velora/border-beam";
import { cn } from "@/lib/utils";
import { SHOT_HEIGHT, SHOT_WIDTH, shots, type ShotName } from "@/lib/screenshots";

const FRAME = "relative overflow-hidden rounded-lg border border-border bg-card";

function has(file: string) {
  return fs.existsSync(path.join(process.cwd(), "public", "screenshots", file));
}

function Frame({
  name,
  theme,
  priority,
  beam,
  className,
}: {
  name: ShotName;
  theme: "dark" | "light";
  priority: boolean;
  beam: boolean;
  className?: string;
}) {
  const shot = shots[name];
  return (
    <div className={cn(FRAME, className)}>
      <Image
        src={`/screenshots/${shot.slug}-${theme}.png`}
        alt={shot.alt}
        width={SHOT_WIDTH}
        height={SHOT_HEIGHT}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="w-full"
      />
      {beam && <BorderBeam size={140} duration={7} />}
    </div>
  );
}

/**
 * A screenshot in a frame, or an honest gap where one is missing.
 *
 * **It is theme-aware by construction and takes no `theme` prop.** The first
 * version defaulted to dark and offered a separate `ThemedScreenshot` for the
 * one shot captured twice, which meant every call site was one forgotten
 * import away from pinning an image to a theme the page was not in — and that
 * is exactly what happened once the light captures landed for all of them.
 * Existence on disk decides instead: two files render as a pair, one file
 * renders in both themes, neither draws the brief.
 *
 * Both halves of a pair are rendered and one is hidden with CSS rather than
 * chosen in JS: `next-themes` resolves on the client, so a single conditional
 * image would pop from one file to the other on hydration.
 *
 * The hiding sits on a **wrapper**, never on the frame. Passing
 * `hidden dark:block` into the frame's own `cn` lets tailwind-merge read it
 * and the frame's `flex` as the same display property, so the later one wins
 * and the placeholder silently loses its flex container.
 *
 * The frame is a hairline and a radius and **no browser chrome**. These are
 * shots of a desktop application taken on Linux; dressing them in a fake macOS
 * window would be a picture of a product that does not exist.
 */
export function Screenshot({
  name,
  priority = false,
  beam = false,
  className,
}: {
  name: ShotName;
  priority?: boolean;
  /** The travelling border light. For the hero only — see CLAUDE.md. */
  beam?: boolean;
  className?: string;
}) {
  const shot = shots[name];
  const dark = has(`${shot.slug}-dark.png`);
  const light = has(`${shot.slug}-light.png`);

  if (!dark && !light) {
    return (
      <div
        className={cn(
          FRAME,
          "flex aspect-16/10 flex-col items-center justify-center gap-3 border-dashed p-8 text-center",
          className
        )}
      >
        <p className="font-mono text-xs text-primary">
          screenshots/{shot.slug}-dark.png
        </p>
        <p className="max-w-md text-sm text-muted-foreground">{shot.brief}</p>
      </div>
    );
  }

  if (dark !== light) {
    return (
      <Frame
        name={name}
        theme={dark ? "dark" : "light"}
        priority={priority}
        beam={beam}
        className={className}
      />
    );
  }

  return (
    <>
      <div className="dark:hidden">
        <Frame
          name={name}
          theme="light"
          priority={priority}
          beam={beam}
          className={className}
        />
      </div>
      <div className="hidden dark:block">
        <Frame
          name={name}
          theme="dark"
          priority={priority}
          beam={beam}
          className={className}
        />
      </div>
    </>
  );
}
