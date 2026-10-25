/**
 * The generated app icon's plate, in the numbers the icon generator uses
 * (`test/tool/generate_icons_test.dart`): a rounded square with a corner
 * radius of `side * 0.22`, filled with a topLeft-to-bottomRight gradient from
 * the seed at HSL lightness +0.06 to the seed at -0.14, with the mark drawn in
 * Lamplight's paper, #fffdf7, and inset 0.17 on every side.
 *
 * The seed is ember, #9F3D15, since Lamplight — the light theme's `primary`,
 * where it was the cool near-black #2A2E37 in 1.5 and the periwinkle #6C7BF5
 * before that. It is hsl(17.4 76.7% 35.3%), so the two stops are simply that
 * hue and saturation at two lightnesses — no hex conversion to get wrong.
 */
export const iconPlate = {
  seed: "#9f3d15",
  gradientFrom: "hsl(17.4 76.7% 41.3%)",
  gradientTo: "hsl(17.4 76.7% 21.3%)",
  cornerRadius: 0.22,
  markInset: 0.17,
} as const;

/** The three-ring table, so the OG image can draw the mark without JSX. */
export const markRings = [
  { r: 0.46, alpha: 0.95, width: 0.13 },
  { r: 0.72, alpha: 0.55, width: 0.11 },
  { r: 0.96, alpha: 0.28, width: 0.09 },
] as const;

export const markDrop = 0.17;
