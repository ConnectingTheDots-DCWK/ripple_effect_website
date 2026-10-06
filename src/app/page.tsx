import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { softwareApplication } from "@/lib/structured-data";
import { fetchLatestRelease } from "@/lib/releases";
import { Hero } from "@/components/sections/hero";
import { Principles } from "@/components/sections/principles";
import { Features } from "@/components/sections/features";
import { Agents } from "@/components/sections/agents";
import { VersionControl } from "@/components/sections/version-control";
import { Roadmap } from "@/components/sections/roadmap";
import { UseCases } from "@/components/sections/use-cases";
import { Faq } from "@/components/sections/faq";
import { FromTheBlog } from "@/components/sections/from-the-blog";
import { Cta } from "@/components/sections/cta";

// The hero reads the latest release for its version badge and its download
// button, so the page is revalidated on the same five minutes /download is.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  // The same cached call the hero makes, so naming the shipped version in the
  // structured data costs nothing extra.
  const latest = await fetchLatestRelease();

  return (
    <>
      {/* The product, described once. `/download` emits the same entity under
          the same `@id`, which is what makes them two pages about one thing. */}
      <JsonLd data={softwareApplication(latest?.version)} />
      <Hero />
      <Principles />
      <Features />
      {/* The two diagram sections come after the seven screenshot sections
          and before the use cases: neither has a screenshot, so putting them
          here breaks up a long run of alternating images rather than adding
          to it. */}
      <Agents />
      <VersionControl />
      {/* Directly after the two newest features: the page has just said
          what landed last, and this says what lands next. */}
      <Roadmap />
      <UseCases />
      <Faq />
      <FromTheBlog />
      <Cta />
    </>
  );
}
