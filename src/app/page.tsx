import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { softwareApplication } from "@/lib/structured-data";
import { fetchLatestRelease } from "@/lib/releases";
import { mockFonts } from "@/components/mock/fonts";
import { Hero } from "@/components/sections/hero";
import { Audiences } from "@/components/sections/audiences";
import { Purpose } from "@/components/sections/purpose";
import { Differentiators } from "@/components/sections/differentiators";
import { Agents } from "@/components/sections/agents";
import { Roadmap } from "@/components/sections/roadmap";
import { Cta } from "@/components/sections/cta";

// The hero reads the latest release for its version badge and its download
// button, so the page is revalidated on the same five minutes /download is.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The home page says what the app is and what sets it apart; the features,
 * in depth, are on the three pages written for the people it is for, which
 * the cards under the hero lead to.
 *
 * One surface from top to bottom: no section paints a band of its own
 * colour, so nothing reads as sitting above or below anything else.
 */
export default async function Home() {
  // The same cached call the hero makes, so naming the shipped version in the
  // structured data costs nothing extra.
  const latest = await fetchLatestRelease();

  return (
    <div className={mockFonts}>
      {/* The product, described once. `/download` emits the same entity under
          the same `@id`, which is what makes them two pages about one thing. */}
      <JsonLd data={softwareApplication(latest?.version)} />
      <Hero />
      <Audiences />
      <Purpose />
      <Differentiators />
      {/* Directly after the pipeline: the agents are the last third of it. */}
      <Agents />
      <Roadmap />
      <Cta />
    </div>
  );
}
