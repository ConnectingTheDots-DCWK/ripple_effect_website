import { iconPlate, markDrop, markRings } from "@/lib/brand";

/**
 * The mark, drawn for `next/og`.
 *
 * Satori renders a subset of CSS and no arbitrary SVG paint, so the three
 * rings are bordered divs rather than the `<circle>` elements the real
 * component uses. Same table, same proportions: a ring of fractional radius
 * `r` on a plate of side `S` is a box of side `r * S` with a border of
 * `width * S / 2`, since the painter's unit is half the side.
 */
export function OgMark({ size, color }: { size: number; color: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {markRings.map((ring) => (
        <div
          key={ring.r}
          style={{
            position: "absolute",
            width: ring.r * size,
            height: ring.r * size,
            borderRadius: size,
            border: `${(ring.width * size) / 2}px solid ${color}`,
            opacity: ring.alpha,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          width: markDrop * size,
          height: markDrop * size,
          borderRadius: size,
          background: color,
        }}
      />
    </div>
  );
}

/** The generated app icon: the mark in white on the gradient plate. */
export function OgPlate({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: size * iconPlate.cornerRadius,
        backgroundImage: `linear-gradient(135deg, ${iconPlate.gradientFrom}, ${iconPlate.gradientTo})`,
      }}
    >
      <OgMark size={size * (1 - iconPlate.markInset * 2)} color="#ffffff" />
    </div>
  );
}
