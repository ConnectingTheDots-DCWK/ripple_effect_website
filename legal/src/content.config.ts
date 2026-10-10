import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
// Directly, not the `z` re-exported from `astro:content`, which Astro 7
// deprecates. Pinned to the same major Astro itself depends on so the two
// resolve to one instance.
import { z } from "zod";

/**
 * Every version of every document, loaded from `en/` beside the project root.
 *
 * The sources sit outside `src/` on purpose. They are the thing this
 * repository is actually keeping — the rendering is a detail that could be
 * replaced tomorrow — so they live at `legal/en/<slug>/<version>.md` where
 * somebody can find them without knowing what Astro is, and where a diff in a
 * pull request is a diff of the document rather than of a page component.
 *
 * `generateId` is set rather than left to the default slugifier, which would
 * turn `eula/1.0` into `eula/1-0` and make the id disagree with both the
 * manifest and the published path. The id is the path with the extension
 * taken off, and nothing else.
 *
 * **This schema checks shapes, not agreement.** It cannot see `manifest.json`,
 * so a front matter whose `version` or `effectiveOn` contradicts the manifest
 * entry for the same file passes here and renders a page stating one thing
 * while the index states another. `tool/check_legal.mjs` is what compares the
 * two. The loader also ingests every Markdown file under `en/`
 * unconditionally, so a file in no manifest entry is loaded and simply never
 * routed — which is why that check exists too.
 */
const documents = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./en",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    /** The document this is a version of — must match a manifest slug. */
    slug: z.string(),
    /** `major.minor`. Major means the terms moved; minor means the words did. */
    version: z.string(),
    title: z.string(),
    /**
     * What brings this version into force — `EffectiveOn` in `manifest.ts`,
     * and the same value the manifest carries for it.
     *
     * A string, never a coerced date: `effectiveFrom` is an application
     * version as often as it is a date, and `z.coerce.date()` on "1.6" is a
     * silent `Invalid Date` rather than an error.
     */
    effectiveOn: z.enum(["acceptance", "date", "processing", "publication"]),
    effectiveFrom: z.string().nullable().default(null),
    /** The language this version is written in. */
    language: z.string().default("en"),
  }),
});

export const collections = { documents };
