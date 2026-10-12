/**
 * The generated app icon's plate, in the numbers the icon generator uses
 * (`test/tool/generate_icons_test.dart`): a rounded square with a corner
 * radius of `side * 0.22`, filled with a topLeft-to-bottomRight gradient from
 * the seed at HSL lightness +0.06 to the seed at -0.14, with the mark drawn in
 * white and inset 0.17 on every side.
 *
 * The seed is #2A2E37 since 1.5 — a cool near-black on the neutral ramp's
 * hue, where it was the periwinkle #6C7BF5 before. It is hsl(221.5 13.4%
 * 19%), so the two stops are simply that hue and saturation at two
 * lightnesses — no hex conversion to get wrong.
 */
export const iconPlate = {
  seed: "#2a2e37",
  gradientFrom: "hsl(221.5 13.4% 25%)",
  gradientTo: "hsl(221.5 13.4% 5%)",
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
