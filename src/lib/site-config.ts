/**
 * Everything the site says about the product in one place.
 *
 * The strings are lifted from the app rather than written for the web: the
 * tagline is `AppInfo.tagline` verbatim, the description is the rpm package's
 * own, and the licence line is clause 1 of the licence. A landing page that
 * paraphrases its product ends up describing a slightly different one.
 */
import { supportRepo } from "./go";

const supportUrl = `https://github.com/${supportRepo.owner}/${supportRepo.name}`;

export const siteConfig = {
  name: "Ripple Effect",
  /** The binary name, which is also how the wordmark is split. */
  slug: "ripple_effect",

  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ripple-effect.vercel.app"
  ).replace(/\/$/, ""),

  /**
   * Whether `url` above is the fallback rather than a deliberate answer.
   *
   * **This is the single most expensive thing on the site to get wrong.**
   * `url` is what the canonical link, every sitemap entry, every `og:url` and
   * every RSS `<guid>` is built from — so an unset variable does not merely
   * default, it tells search engines that the real address of this content is
   * a domain you are moving away from, *while serving the page from the one
   * you moved to*. `src/app/sitemap.ts` says so at build time, next to the
   * warning `releases.ts` prints for a missing token.
   */
  urlIsFallback: !process.env.NEXT_PUBLIC_SITE_URL,

  /** AppInfo.tagline, unchanged. */
  tagline:
    "A branching narrative and game design tool for D&D and much more, inspired by ArcWeave.",

  /** The rpm package's own description. */
  description:
    "Ripple Effect is a branching narrative and game design tool for D&D and much more, inspired by ArcWeave. Stories are drawn as node graphs: passages hold Markdown, wires carry the choices between them, and components, loops and restricted Python give a story the shape of a program without asking anyone to write one.",

  /**
   * The single best trust line the product has.
   *
   * It was clause 1 of the Ripple Effect Licence and is now Article 3 of the
   * EULA, carried across word for word — which is why quoting it as what "the
   * licence says in as many words" is still literally true after the EULA
   * replaced that licence. Keep it byte-identical to the document.
   */
  ownership:
    "Stories, projects, boards, components, scripts and exports you author with it are yours, and nothing in this licence claims any interest in them.",

  links: {
    // The public support repository — issues, discussions and the licence.
    // Deliberately not where the code is: the source repository is private, so
    // a link to it would be a 404 for whoever clicked it. This mirrors
    // AppInfo.repository, which makes the same choice for the same reason.
    support:
      process.env.NEXT_PUBLIC_GITHUB_URL ?? supportUrl,
    issues: `${supportUrl}/issues`,
    discussions: `${supportUrl}/discussions`,
    // The licence, which is now the EULA on the legal site rather than the
    // LICENSE file in the support repository. The EULA replaces the Ripple
    // Effect Licence rather than sitting above it, so there is one document
    // and this points at it. The repository still carries a copy, and that
    // copy names the version it is a copy of.
    licence: "https://legal.ripplefx.app/eula/",
    // The documentation, a separate Astro site deployed from `docs-site/` in
    // this repository as its own Vercel project. Absolute rather than a path
    // because it is another host, and one string here so the header and the
    // footer cannot point at two spellings of it.
    docs: "https://docs.ripplefx.app",
    // The node editor underneath, which *is* public and does take pull
    // requests. Worth linking precisely because the app itself is not.
    editor: "https://github.com/ConnectingTheDots-DCWK/fl_nodes_v2",
    // The docking layout being built for the workspace — public before the
    // app uses it, which the copy that names it has to keep saying until it
    // does.
    docking: "https://github.com/ConnectingTheDots-DCWK/fl_panel",
    // The reading-time estimate under every passage. Ours, pure Dart, and the
    // one of the three that was public and published before this site was.
    readTime: "https://github.com/ConnectingTheDots-DCWK/dart_read_time",
    monty: "https://github.com/pydantic/monty",
    arcweave: "https://arcweave.com",
    funding: "https://buymeacoffee.com/wilielmus",
    // Interest in the paid tier. A hosted form rather than a field of our own,
    // so there is no address of anybody's sitting in a database we run.
    waitlist:
      process.env.NEXT_PUBLIC_WAITLIST_URL ?? "https://tally.so/r/OD2aWK",
    // How the app is doing, asked of the people using it. Hosted the same way
    // and for the same reason as the waitlist above; the app is where most of
    // the answers are expected to come from, and this link is the other door
    // into the same form.
    survey: process.env.NEXT_PUBLIC_SURVEY_URL ?? "https://tally.so/r/2EWdND",
  },

  /**
   * The legal documents, a third Astro site deployed from `legal/` in this
   * repository as its own Vercel project.
   *
   * One origin and one entry per document, for the reason `docs` above is one
   * string: a footer, a pricing card and a privacy page that each spell the
   * host themselves are three places to fix when one of them is wrong. The
   * project this pattern was taken from spells its legal origin in eight
   * separate files with no shared export, which is the part of it not worth
   * copying.
   *
   * These are the **stable** slugs, which always render whatever version is
   * in force. The frozen `/v/<slug>-<version>/` paths are for recording what
   * somebody accepted, which is the application's job and not this site's.
   */
  legal: {
    origin: "https://legal.ripplefx.app",
    eula: "https://legal.ripplefx.app/eula/",
    terms: "https://legal.ripplefx.app/terms/",
    privacy: "https://legal.ripplefx.app/privacy/",
    subprocessors: "https://legal.ripplefx.app/subprocessors/",
  },

  author: {
    name: "William Karol Di Cioccio",
    email: "williamkarol.dicioccio@gmail.com",
  },

  /**
   * Who publishes this, as distinct from who wrote it.
   *
   * **ConnectingTheDots is a trade name, not a company.** An Italian sole
   * trader may trade under one, but the party that a contract binds is still
   * the natural person and the VAT number — which is why every document on
   * the legal site heads with all three, and why `author` above is unchanged:
   * structured data's `author` is a Person and that Person is real.
   *
   * Both addresses are per-product, on the product's own domain, although
   * the publisher is shared. A second product under the same trade name gets
   * its own pair: its hosted service, data and terms will be different
   * enough that one legal inbox for both would have to ask, every time,
   * which product you mean.
   */
  publisher: {
    name: "ConnectingTheDots",
    legalName: "William Karol Di Cioccio",
    vat: "IT02224180667",
    legalEmail: "legal@ripplefx.app",
    supportEmail: "support@ripplefx.app",
  },

  copyright: "© 2026 ConnectingTheDots. All rights reserved.",
} as const;

/** Where the releases actually are. Private — see `src/lib/releases.ts`. */
export const releaseRepo = {
  owner: "WilliamKarolDiCioccio",
  name: "ripple_effect",
} as const;
