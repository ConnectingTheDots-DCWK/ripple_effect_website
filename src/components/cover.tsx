import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The fantasy landscape, reduced to the accent colour.
 *
 * Used twice: under the hero at the top of the home page, and behind the
 * closing call to action at the bottom of it. What is shared is the *tint* —
 * every decision below — and what the caller supplies through `className` is
 * where the painting sits and how it fades out, because those are genuinely
 * per-section. The hero is anchored to the top of the viewport and fades
 * downward; a band in the middle of the document has two seams and fades at
 * both.
 *
 * It is positioned but given no insets of its own, so a caller must say where
 * it goes and its section must be `relative overflow-hidden`.
 *
 * **The tint is a blend, not a filter.** `mix-blend-mode: luminosity` takes
 * the *lightness* of the image and the *hue and saturation* of what is under
 * it — so with a flat `bg-brand` beneath, the painting keeps every one of its
 * values and has exactly one colour. There is no `grayscale()` in front of it
 * because the blend already discards the source's colour; adding one would
 * cost a second raster pass to change nothing.
 *
 * The alternative was an SVG `feColorMatrix` duotone, which is more precise
 * and would have meant a hand-written matrix per theme, recomputed by hand
 * every time `--brand` moved. This follows the token instead: change the seed
 * and the picture follows it.
 *
 * **`isolate` is load-bearing.** A blend mode composites against everything
 * beneath it in its stacking context, and without isolation that is the page
 * — a grid, a section background, whatever scrolls past. The wrapper's
 * `opacity` would create a stacking context on its own, so this is belt and
 * braces, but the belt is what documents the intent.
 *
 * **Two opacities, and the lower one is light mode.** The painting is high
 * key: most of its area is bright sky. On the dark ground that reads as a
 * glow and can take `0.18`; on the near-white light ground the same value
 * turns the page lavender, because there the *dark* parts are what show and
 * they show against almost nothing. Light gets `0.10`. Both are on the
 * painting rather than on its ground, so the same pair holds over `--card` as
 * over `--background`.
 *
 * The vertical fade is a mask rather than a gradient overlay so it works on
 * both grounds without either being named — an overlay would have to be
 * `--background`, and would then be a rectangle of the wrong colour the moment
 * anything else was ever put behind it.
 */
export function Cover({
  className,
  eager = false,
}: {
  /** Where it sits and how it fades: insets, a height, a `mask-image`. */
  className?: string;
  /**
   * Whether to load the image with the document rather than on approach.
   *
   * True only above the fold. `loading="eager"` rather than `priority` even
   * there: `priority` also emits a preload, and the one image on the home page
   * that deserves that slot is the board screenshot.
   */
  eager?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute isolate overflow-hidden opacity-[0.10] dark:opacity-[0.18]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-brand" />
      {/*
        * Three things here are tuned against what the page does with this
        * image rather than against the image, and all three are only
        * defensible because it is drawn at a tenth of its opacity under a
        * grid. Measured on the wire, they take it from 128K to 46K.
        *
        * **The file is greyscale**, made by `pnpm images` from
        * `cover-source.jpg`. The blend below discards chroma before anything
        * reaches the screen, so storing it was paying for bytes that are
        * thrown away — this is pixel-identical and about a third smaller.
        *
        * **`quality={60}`.** The artefacts that separate 60 from the default
        * 75 are far below the opacity this is seen through. It needs
        * `qualities: [60, 75]` in `next.config.ts` — Next 16 rejects an
        * undeclared quality with a 400 rather than falling back, so the prop
        * and the config have to travel together.
        *
        * **`sizes` stays `100vw`, which was tried the other way and undone.**
        * Capping it at `1280px` looked like a free 40%, and does nothing: the
        * optimizer only serves widths on the `deviceSizes` ladder — 1080,
        * 1200, 1920 — so a 1920 viewport asking for 1280 is handed 1920
        * exactly as it was before. Making the cap bite would mean either
        * widening that ladder for every image on the site or writing a layout
        * width in `sizes` that is not the layout width, and a lie there is
        * paid back by whoever next changes this element.
        */}
      <Image
        src="/cover.webp"
        alt=""
        fill
        sizes="100vw"
        quality={60}
        loading={eager ? "eager" : "lazy"}
        className="object-cover object-center mix-blend-luminosity"
      />
    </div>
  );
}
