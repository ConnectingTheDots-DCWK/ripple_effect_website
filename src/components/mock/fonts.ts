import { Instrument_Sans, JetBrains_Mono, Literata } from "next/font/google";

/**
 * The app's three faces, for the mock-ups of it and nothing else.
 *
 * The editor sets its chrome in Instrument Sans, the author's words in
 * Literata and code in JetBrains Mono (`AppType` in `ripple_theme`), so a
 * picture of a card drawn in the site's own face would be a card nobody has
 * seen. `next/font` downloads them at build time and serves them from this
 * origin, so nothing is fetched from Google by a reader — the privacy page's
 * promise holds.
 */
const ui = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-mock-ui",
  display: "swap",
});
const prose = Literata({
  subsets: ["latin"],
  variable: "--font-mock-prose",
  style: ["normal", "italic"],
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mock-mono",
  display: "swap",
});

/** On the root of anything that draws the app. */
export const mockFonts = `${ui.variable} ${prose.variable} ${mono.variable}`;
