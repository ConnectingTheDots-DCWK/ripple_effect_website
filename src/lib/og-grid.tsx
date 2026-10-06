/**
 * The page's grid backdrop, drawn for `next/og`.
 *
 * Satori renders a subset of CSS and does not do a repeating gradient, so the
 * grid is a run of one-pixel divs. Thirty-nine of them is cheaper than it
 * sounds at build time.
 *
 * It lives here rather than beside either card because there are two of them
 * now — the site's and each post's — and a copied grid is two places for the
 * line colour to drift apart.
 */
export function OgGrid({
  width,
  height,
  step = 48,
  color = "#242932",
}: {
  width: number;
  height: number;
  step?: number;
  color?: string;
}) {
  const columns = Math.ceil(width / step);
  const rows = Math.ceil(height / step);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      {Array.from({ length: columns }, (_, i) => (
        <div
          key={`c${i}`}
          style={{
            position: "absolute",
            left: i * step,
            top: 0,
            width: 1,
            height,
            background: color,
          }}
        />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={`r${i}`}
          style={{
            position: "absolute",
            left: 0,
            top: i * step,
            width,
            height: 1,
            background: color,
          }}
        />
      ))}
    </div>
  );
}
