import { ImageResponse } from "next/og";

import { OgGrid } from "@/lib/og-grid";
import { OgMark } from "@/lib/og-mark";
import { allPosts, findPost, formatDate } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * A post's own social card, rendered to a PNG at build time.
 *
 * The site's card is the grid, the lockup, the headline and the board
 * screenshot; this is the same backdrop and the same lockup with the *post's*
 * title in the headline's place and no screenshot — a shared link should say
 * which post it is, and a picture of the board says only which product it is.
 *
 * Same satori constraints as `src/app/opengraph-image.tsx`: a subset of CSS,
 * no arbitrary SVG paint, nothing fetched. Hence `OgMark` and `OgGrid`.
 */
export function generateStaticParams() {
  return allPosts().map((post) => ({ slug: post.slug }));
}

/**
 * Title sizes by length rather than by measurement, because satori has no
 * layout to ask. The three steps are the three shapes a title of ours takes:
 * a phrase, a sentence, and a sentence with a colon in it.
 */
function titleSize(title: string): number {
  if (title.length <= 42) return 68;
  if (title.length <= 78) return 56;
  return 46;
}

export default async function PostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          padding: 72,
          background: "#0d0f13",
          color: "#e8eaef",
          fontFamily: "sans-serif",
        }}
      >
        <OgGrid width={size.width} height={size.height} />

        {/* The same wash as the site's card, and here it is doing the same
            job: the grid is the only texture behind the words, and a flat
            surface colour would erase it rather than quiet it. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "rgba(13,15,19,0.86)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <OgMark size={40} color="#6c7bf5" />
          <span style={{ fontSize: 28, fontWeight: 600, display: "flex" }}>
            <span>ripple</span>
            <span style={{ color: "#a8b1fa" }}>_effect</span>
          </span>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {post && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 22,
                color: "#99a0ae",
              }}
            >
              <span
                style={{
                  border: "1px solid #262a32",
                  borderRadius: 999,
                  padding: "4px 14px",
                  display: "flex",
                }}
              >
                {post.category}
              </span>
              <span>{formatDate(post.date)}</span>
              <span style={{ color: "#545b69" }}>•</span>
              <span>{post.minutes} min read</span>
            </div>
          )}

          <div
            style={{
              fontSize: post ? titleSize(post.title) : 60,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              display: "flex",
              // Narrower than the card so a two-line title breaks somewhere
              // near the middle instead of leaving a short second line under
              // a full first one. Satori has no text metrics to balance with.
              maxWidth: 900,
            }}
          >
            {post ? post.title : "Notes from the workbench"}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            fontSize: 22,
            color: "#99a0ae",
          }}
        >
          The Ripple Effect blog
        </div>
      </div>
    ),
    { ...size }
  );
}
