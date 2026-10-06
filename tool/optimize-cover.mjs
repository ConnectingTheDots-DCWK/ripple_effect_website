// Turns the hero/CTA artwork into the form the page actually uses.
//
// Run it when the painting changes:
//
//     pnpm images
//
// It reads `cover-source.jpg` — the artwork as downloaded, colour, kept in the
// repository so this is reproducible — and writes `public/cover.webp`.
//
// **Greyscale is not a stylistic choice here, it is the removal of dead
// weight.** `Cover` composites the image with `mix-blend-mode: luminosity`,
// which takes lightness from the image and hue from the `bg-brand` beneath it.
// Every chroma sample in the file is therefore discarded before a single pixel
// reaches the screen. Dropping it in the source is pixel-identical on the page
// and takes about a third off what the visitor downloads, because chroma is
// roughly half of what a WebP encoder spends its bits on.
//
// **It is `recomb`, not `greyscale`, and that is the whole reason this file is
// more than three lines.** `sharp().greyscale()` converts through *linear*
// light; CSS blend modes operate on gamma-encoded sRGB. Measured on this
// image, the two disagree by 16 levels out of 255 — the linear conversion is
// 13% brighter — and the page showed it immediately: the painting came
// forward, and the paragraph under the headline went from legible to washed.
// The compositing spec defines `Lum(C)` as `0.3R + 0.59G + 0.11B` on the
// encoded values, and applying exactly that with `recomb` lands within half a
// level of what the browser computes from the colour original. So the swap is
// invisible, which is the only thing that made it worth doing.
//
// **This is the only image on the site worth converting by hand**, and the
// measurement is worth writing down so nobody repeats the survey. `next/image`
// already re-encodes everything under `public/` to AVIF or WebP on request and
// resizes it to the layout width — `board-dark.png` is 272K on disk and 28K on
// the wire. Converting the screenshots to WebP would save the *repository*
// about 1.3 MB and the visitor exactly nothing. The cover is different only
// because greyscale changes the pixels the encoder is given, which no amount of
// downstream optimisation can do for it.
//
// **Do not convert `public/screenshots/board-dark.png`.** It is read straight
// off disk by `src/app/opengraph-image.tsx` and inlined as a data URI, and the
// OG renderer cannot decode WebP — it recognises the MIME type and then fails
// to rasterise it. That does not degrade: `next build` dies with
// "Error occurred prerendering page /opengraph-image".

import sharp from "sharp";

const SOURCE = "cover-source.jpg";
const OUT = "public/cover.webp";

// q82 is chosen against what the page does with it, not against the file. The
// cover is drawn at 10% opacity in light and 18% in dark, under a grid; the
// artefacts that separate q82 from q95 are two orders of magnitude below that.
const QUALITY = 82;

// Lum(), verbatim from the compositing spec, applied to the encoded values.
const LUMA = 0.3;
const LUMB = 0.59;
const LUMC = 0.11;

const info = await sharp(SOURCE)
  .recomb([
    [LUMA, LUMB, LUMC],
    [LUMA, LUMB, LUMC],
    [LUMA, LUMB, LUMC],
  ])
  .extractChannel(0)
  .toColourspace("b-w")
  .webp({ quality: QUALITY, effort: 6 })
  .toFile(OUT);

console.log(`${OUT}  ${(info.size / 1024).toFixed(1)} KB  ${info.width}x${info.height}`);
