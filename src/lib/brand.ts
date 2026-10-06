/**
 * The generated app icon's plate, in the numbers the icon generator uses
 * (`test/tool/generate_icons_test.dart`): a rounded square with a corner
 * radius of `side * 0.22`, filled with a topLeft-to-bottomRight gradient from
 * the seed at HSL lightness +0.06 to the seed at -0.14, with the mark drawn in
 * white and inset 0.17 on every side.
 *
 * The seed #6C7BF5 is hsl(233.4 87.3% 69.2%), so the two stops are simply that
 * hue and saturation at two lightnesses — no hex conversion to get wrong.
 */
export const iconPlate = {
  seed: "#6c7bf5",
  gradientFrom: "hsl(233.4 87.3% 75.2%)",
  gradientTo: "hsl(233.4 87.3% 55.2%)",
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
