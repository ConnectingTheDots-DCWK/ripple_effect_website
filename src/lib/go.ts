/**
 * Every address a shipped build of the app opens, as a redirect from this
 * domain to wherever the thing lives today.
 *
 * **Why the app links here and never to the destination.** An installed build
 * cannot be edited, and it outlives every assumption it was compiled with: a
 * repository changes owner, a form is replaced, the licence moves from a file
 * on GitHub to a page of its own. 1.4 learned this the expensive way — the
 * support repository's owner is baked into it — so from 1.5 the app spells
 * `https://ripplefx.app/go/<name>` and this table is the only place the real
 * address is written. Changing one is a deploy, not a release.
 *
 * Three rules keep that true:
 *
 * - **Never `permanent`.** A 308 is cached by browsers and by `package:http`'s
 *   callers indefinitely, which would bake the destination back into every
 *   client that ever followed it. These are 307s on purpose.
 * - **A path, once shipped, is never removed or repurposed.** Point it
 *   somewhere else; a 404 here is a dead link in every build that has it.
 *   New entries are free.
 * - **The query string passes through**, which Next does for a redirect
 *   without being asked. The issue forms depend on it — `template`, `title`
 *   and one parameter per form field — and so does the survey's `source` and
 *   `version`.
 *
 * The app's half is `apps/editor/lib/src/site_links.dart` in the app's
 * repository, and the two lists must agree: a path the app spells and this
 * table lacks is a 404.
 *
 * No `@/` imports: `next.config.ts` reads this file, and the config is not
 * compiled with the project's path aliases.
 */

/** The public repository the app sends people to for issues and discussions. */
export const supportRepo = {
  owner: "ConnectingTheDots-DCWK",
  name: "ripple_effect_support",
} as const;

/** The public, releases-only repository engine builds are published to. */
export const engineReleasesRepo = {
  owner: "ConnectingTheDots-DCWK",
  name: "ripple_engine_releases",
} as const;

const support = `https://github.com/${supportRepo.owner}/${supportRepo.name}`;

type GoLink = { source: string; destination: string };

export const goLinks: readonly GoLink[] = [
  { source: "/go/support", destination: support },
  { source: "/go/support/issues", destination: `${support}/issues` },
  { source: "/go/support/issues/new", destination: `${support}/issues/new` },
  { source: "/go/support/discussions", destination: `${support}/discussions` },
  {
    source: "/go/support/discussions/new",
    destination: `${support}/discussions/new`,
  },
  {
    source: "/go/support/contributors",
    destination: `${support}/graphs/contributors`,
  },
  { source: "/go/licence", destination: "https://legal.ripplefx.app/eula/" },

  { source: "/go/funding", destination: "https://buymeacoffee.com/wilielmus" },
  { source: "/go/survey", destination: "https://tally.so/r/2EWdND" },

  // The two sites of our own, under the paths they serve. The root first,
  // because `:path+` needs at least one segment and a bare `:path*` would
  // write `//` into the destination. Both destinations end in a slash
  // because both sites serve one, and arriving without it is a second hop.
  { source: "/go/docs", destination: "https://docs.ripplefx.app/" },
  { source: "/go/docs/:path+", destination: "https://docs.ripplefx.app/:path+/" },
  // Engine archives, for the bindings' build hook and an editor's patch
  // path — not for a person, which is why nothing on the site links them.
  // The files are public, so this is a redirect and not a proxy; integrity
  // is the sha256 pinned in the downloader's own lock, never this host.
  // See ADR *the-engine-ships-on-its-own* in the app repository.
  {
    source: "/go/engine/:tag/:file",
    destination: `https://github.com/${engineReleasesRepo.owner}/${engineReleasesRepo.name}/releases/download/:tag/:file`,
  },
  { source: "/go/legal", destination: "https://legal.ripplefx.app/" },
  {
    source: "/go/legal/:path+",
    destination: "https://legal.ripplefx.app/:path+/",
  },
];
