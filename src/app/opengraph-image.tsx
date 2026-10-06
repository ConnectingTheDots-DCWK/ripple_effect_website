import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import { OgGrid } from "@/lib/og-grid";
import { OgMark } from "@/lib/og-mark";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — branching narrative, drawn as graphs`;

/*
 * The social card, rendered to a PNG at build time.
 *
 * Next emits `og:image` and `twitter:image` from this file, with the width,
 * height, type and alt beside them, so there is no meta tag to maintain by
 * hand and no second copy of the dimensions to keep in step.
 *
 * It is drawn rather than photographed, and the constraint that shapes it is
 * satori: it renders a subset of CSS, no arbitrary SVG paint, and no image it
 * would have to fetch. Hence the mark as bordered divs, the grid as a run of
 * one-pixel divs, and the screenshot inlined as a data URI read off disk.
 */

/**
 * The board screenshot, inlined.
 *
 * Read off disk rather than linked: satori fetches nothing, and a card that
 * pointed at its own site's URL would have to be generated after a deploy
 * rather than during one. Returns null when the file is not there, so a
 * checkout without the screenshots still builds — the card is then the grid
 * and the words, which is what it was before they were captured.
 */
function boardImage(): string | null {
  const file = path.join(process.cwd(), "public", "screenshots", "board-dark.png");
  if (!fs.existsSync(file)) return null;
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
}

export default function OpengraphImage() {
  const board = boardImage();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0d0f13",
          color: "#e8eaef",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <OgGrid width={size.width} height={size.height} />

        {/* The board, bleeding off the right and the bottom. Cropping it says
            the canvas carries on past the card, which is the one thing a
            screenshot of an infinite canvas should say. */}
        {board && (
          <img
            src={board}
            // Satori renders to a raster, so there is no alt text to read —
            // the card's own `alt` export is what a reader gets.
            alt=""
            width={800}
            height={500}
            style={{
              position: "absolute",
              left: 610,
              top: 150,
              borderRadius: 16,
              border: "1px solid #262a32",
            }}
          />
        )}

        {/* A wash under the text, so a busy corner of the board can never sit
            behind a word.

            Nearly opaque rather than opaque: at a flat #0d0f13 it also erased
            the grid across the left half, which is the half where the grid is
            the only texture there is. At 0.9 the words keep a contrast ratio
            far past anything that matters and the backdrop survives under
            them. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(90deg, rgba(13,15,19,0.9) 0%, rgba(13,15,19,0.9) 42%, rgba(13,15,19,0) 64%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            width: 620,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <OgMark size={44} color="#6c7bf5" />
            <span style={{ fontSize: 30, fontWeight: 600, display: "flex" }}>
              <span>ripple</span>
              <span style={{ color: "#a8b1fa" }}>_effect</span>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: 60,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              Interactive stories, drawn as graphs.
            </div>
            <div
              style={{
                fontSize: 26,
                color: "#99a0ae",
                lineHeight: 1.35,
                display: "flex",
              }}
            >
              Passages on a canvas, choices on the wires, and a play button that
              walks the result.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              color: "#99a0ae",
            }}
          >
            <span>Linux</span>
            <span style={{ color: "#545b69" }}>•</span>
            <span>Windows</span>
            <span style={{ color: "#545b69" }}>•</span>
            <span>macOS</span>
            <span style={{ color: "#545b69" }}>•</span>
            <span>Free</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
