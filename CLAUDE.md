# ripple_effect_website

The marketing site for Ripple Effect — and, under `docs-site/`, the
documentation site, which is why the repository is no longer called
`ripple_effect_landing_page`. Next.js 16 App Router, Tailwind CSS 4,
TypeScript, pnpm, deployed on Vercel. Six pages — `/`, `/download`,
`/pricing`, `/privacy`, `/thanks` and `/blog` — plus a page per blog post,
three API routes, a feed, and the `/go/` redirects every build of the app
links through.

Scaffolded from [velora-ui](https://github.com/ColorlibHQ/velora-ui) (MIT),
vendored in the first commit unmodified so that a diff against that tree says
exactly what is ours. See [`NOTICE.md`](NOTICE.md).

**Every commit is scanned for secrets, and a clone needs `pre-commit install`
and the `trufflehog` binary** — `.pre-commit-config.yaml` says where to get it,
and without it a commit fails rather than going through unscanned. CI's
`secrets.yml` runs the same scan over everything pushed. This repository is
meant to be public; the hook is what makes that a property of every commit
rather than of one audit.

**`docs-site/` is a second, separate application in this repository** — Astro +
Starlight, deployed as its own Vercel project with that directory as its Root
Directory, at `docs.ripplefx.app`. It shares this checkout and nothing else:
no dependency, no build, no lockfile. It is here rather than in a repository of
its own because the thing it has to stay consistent with — the token block in
`src/app/globals.css` — is here, and a transcription is easier to check against
its source when a diff reaches both. It has its own
[`CLAUDE.md`](docs-site/CLAUDE.md), which is the authority for it; nothing in
this file describes it.

**It is named in this project's `tsconfig.json` `exclude` and in
`eslint.config.mjs`'s `globalIgnores`, and both entries have to be there.**
Neither tool stops at a directory boundary on its own. TypeScript's
`exclude: ["node_modules"]` matches only the one at the root, so without that
entry `pnpm typecheck` walks into the documentation site's sources and its
dependencies and reports errors about `astro:content` and about a Starlight
plugin's own regexes. A bare `eslint` walks into `docs-site/dist/_astro`,
`dist/pagefind` and `.astro` and reports around a thousand problems in
minified vendor bundles. In both cases the failures are unactionable from here
and bury anything real, which makes the command useless for what it is for.
The documentation site checks itself with `astro check`.

## What was taken out of the template, and why

velora-ui is a *component showcase* that contains a landing page, so most of it
went: the components, themes, blog, changelog, contact, about, login and signup
routes, the docs and demo directories, the MDX pipeline, the shadcn registry
and the build scripts. Twenty-one of its thirty-two animation components went
with them. What is left of it is the build setup, the shadcn primitives under
`src/components/ui/`, and **eleven** things under `src/components/velora/`:
`animated-beam`, `blur-fade`, `border-beam`, `flip-words`, `grid-pattern`,
`marquee`, `orbiting-circles`, `scroll-progress`, `shimmer-button`,
`sparkles-text`, `sticky-banner`. Each one is argued for individually below;
none of them arrived because it was in the box.

Two separate reasons, and they should not be collapsed into one.

**The house style.** The app's own theme doc has four rules, and one of them is
*"no glass, no gradients"* — there are zero `BackdropFilter`s in the entire
application. The template's landing page is built on aurora backgrounds,
meteors, particles, a retro grid and gradient text, and its header is frosted.
Keeping any of that would have produced a site that looks like a different
product to the one it is selling. The header is a flat bar on a hairline for
the same reason a card in the app is.

**`BorderBeam` is the one exception, and it is deliberate.** A light travels
the border of the hero screenshot and of the free tier's card — two places,
both of them *the one thing on the page you are meant to look at*, which is
the same job the app's "one accent-filled action per view" rule does. It is
still a gradient. It is allowed here because a marketing page has to catch an
eye once, where a tool people work in for hours must not; `--brand-from` and
`--brand-to` are both the brand hue so it reads as a highlight moving over an
edge rather than as a second colour arriving. **Two instances is the budget.**
A third would make it decoration, and the reason above would stop being true.

**Everything else that moves is listed here, and each is allowed for a
different reason.** The budget above is `BorderBeam`'s own and it is still two.
The rest are enumerated so the next addition has to argue against a list
rather than against nothing.

`ShimmerButton` wears the *only* other travelling light, on the *only* two
buttons that matter — the hero's download and the one above the footer. It is
the same argument the beam makes, aimed at the action instead of at the
screenshot. It does not go on the four cards on `/download`: those are a set
being compared, and four glinting buttons side by side is a lightshow rather
than a pointer.

`ScrollProgress` is a three-pixel line on the header's top edge and is not
decoration at all — it says how much page is left, which on a page this long
is information. It uses the beam's two stops because it is the same kind of
object: a highlight over an edge.

`FlipWords` is in the hero headline and nowhere else. One word changes; the
sentence does not move, because an invisible copy of the longest word holds
the space. A second instance on the page would have two sentences rewriting
themselves at once, which is a slot machine.

`SparklesText` is on four words of the agents heading — "an agent" — and
nowhere else. The four-pointed star has become the shorthand for a model
doing something, and that is the one place on the page where the subject is a
model rather than the app; borrowing the convention says in a glance what the
heading would otherwise spend a clause on. Put it on a second heading and it
stops meaning that and starts meaning "look here".

`AnimatedBeam` and `OrbitingCircles` each draw one diagram, and both exist
because **neither feature has anything to photograph**. The MCP server is a
socket, a sidecar and two switches in a settings dialog; the git integration
is a panel that looks like every other panel. A screenshot of either would say
less than a picture of what connects to what, which is what the two of them
are — not decoration standing in for a missing screenshot.

`StickyBanner` is the only one of these that is *conditional*, and that is what
buys it a full-width brand gradient when nothing else on the site gets one.
See below.

**Do not name a bare CSS class `shimmer`, and check the next one against
`node_modules/shadcn/dist/tailwind.css` before using it.** That file is
imported three lines into `globals.css` and already defines `@utility
shimmer` — as a *text* shimmer, which sets `background-clip: text` and
`-webkit-text-fill-color: transparent` so a gradient runs through the
letterforms. Put it on a filled button and the damage is total and silent:
`background-clip: text` clips `bg-primary`'s fill to the glyphs so the button
loses its colour, and the transparent text fill empties the label. What
survives is a dark rectangle with a faint smear where the words were, plus any
SVG inside — icons stroke with `currentColor` and a text fill does not touch
them, so the icon alone remains and looks like the only thing that rendered.
It builds, it lints, `pnpm typecheck` is happy and nothing anywhere reports a
collision. The class here is called **`glint`**, and it is declared with
`@utility` so it lands in the utilities layer and orders against the rest of
the button rather than beating all of it from outside the cascade. shadcn also
owns `shimmer-once`, `-reverse`, `-none`, `-color-*`, `-duration-*`,
`-spread-*` and `-angle-*`, so the whole `shimmer-` prefix is spoken for.

**The glint is white in both modes and the *alpha* is the token.** velora's
`ShimmerButton` sweeps a hardcoded `rgba(255,255,255,0.35)`, tuned for one dark
button. Light mode's `--primary` is `#4a57e0`, where `0.4` white lands at
`#929aec` — a long step. Dark mode's is `#a8b1fa`, already pale, so the same
alpha barely registers and it takes `0.55` to reach `#d8dcfd`, a comparable
step. Same colour, different push.

**Inverting it in dark mode was tried and is wrong, which is worth recording
because the argument for it sounds right.** The reasoning was that a pale
lavender has no headroom above it, so the sweep should darken instead. The
arithmetic disagrees — white still moves `#a8b1fa` by about fifty points of red
— and more to the point, a dark band travelling across a light button does not
read as a highlight. It reads as a smudge, which is what it was called the
first time somebody looked at it. **A glint is lighter than the thing it
crosses, in both themes.**

**Every third-party mark on the site sits on a white disc, in both themes.**
Seven of them appear — four MCP clients, three git hosts — and three are
near-black: OpenAI is `#000000`, Ollama `black`, GitHub `#161614`. On the dark
ground the site opens in they are a hole in the page. Recolouring them to
`currentColor` was the alternative and is worse, because a recoloured mark is
the wrong mark; giving a disc to three of seven and not the other four is the
kind of inconsistency that reads as a bug. So all seven get one. White rather
than `--card`, because `--card` is `#14171c` in dark and the black marks would
be no better off — this is the one fixed colour on the site that does not
follow the theme, fixed for the same reason a photograph does not.

**It is a `::after`, not a child element, and that is not a style
preference.** Both buttons are `asChild` — one resolves to a `Link`, the other
to an `<a>` pointed at a release asset — so a component that wrapped its
children in a positioned `<span>` would have to reach inside an element the
Slot owns. A pseudo-element needs nothing of the sort. It also passes *over*
the label rather than behind it, which is fine at these alphas because the
sweep is the same hue as the text it crosses in both modes, and which avoids
z-indexing text nodes that have no element to hang a z-index on.

**There is nobody to quote.** The template ships avatar-circle social proof,
a stats counter, six testimonials and a client-logo marquee. Ripple Effect 1.0
has no users, no customers and no logos. Filling those in would be inventing
endorsement, and emptying them would leave four holes — so they are gone, and
the screenshots carry the visual weight instead. **Do not add them back "as
placeholders".**

## The four things this site must not say

Stated because the template actively invites all four:

1. **It is not open source.** Ripple Effect is `LicenseRef-Proprietary` and its
   source is not published. `fl_nodes_v2`, the node editor underneath it, *is*
   public and does take pull requests — that is a separate, true, and
   mentionable fact, and the FAQ makes exactly that distinction.
2. **Be exact about signing, which is not the same on every platform.**
   Nothing is signed by an authority a machine already trusts: Windows shows
   SmartScreen once and macOS Gatekeeper blocks the `.dmg` on first launch,
   while Linux needs none of it. Say that the warning is about the *missing
   certificate* and not about what the installer does, because that is the
   question a reader actually has.

   This has been wrong twice in opposite directions, so it is worth pinning.
   An early version said "nothing is signed" and told Windows users to enable
   Developer Mode — wrong, because the `.msix` of the day *was* signed and
   because sideloading was never what stood in the way. Then Windows shipped a
   self-signed MSIX and this page walked through importing a certificate —
   accurate then, wrong now. Windows ships an unsigned Inno Setup `.exe`, which
   needs one SmartScreen click and nothing else.
3. **There is no price for the paid tier.** That has not been decided, and the
   card says so and shows an em dash.

   Its *contents* used to be on this list too, and are not any more: `/pricing`
   now previews what the tier is for, and every line of that preview is
   `ROADMAP.md`'s own — the value proposition under its SaaS line, and the one
   release number that file gives (real-time collaboration, 1.8). The card
   says the list is from the roadmap, subject to change and not a promise, and
   the `planned` array in `pricing/page.tsx` says to keep it in step with that
   file rather than with what would fill a column. What has not changed: no
   price, and nothing free today is planned to stop being free. **An item that
   is not on the roadmap is an invention.**
4. **No invented numbers.** No download counts, no user counts, no stars.

**And one position rather than a prohibition: telemetry.** There is none in
the app today, and it is coming. Everywhere the site speaks of it — the FAQ,
the privacy page, both pricing cards, the documentation site's *Updates, logs
and support* page — says the same thing in the same tense: planned, opt-in,
anonymous, off until switched on, and used only for internal usage
statistics, performance and stability measurements, and crash reports. When
it ships, those four places change together, and the privacy page says what
is collected; until then none of them may say it exists, and none of them may
say it never will.

**All four apply to a blog post as much as to a page**, and a post is the
easiest place on the site to drift — it is prose, and nobody diffs prose
against a licence. See *The blog* below for the standing rule.

**The hero headline's four flipping words are held to the same bar.** They are
`free`, `fast`, `local`, `yours`, and each is a claim the rest of the site
already stands behind: `free` is the tier as it exists; `local` is what a
project *is*, a folder on your own disk with no scaffold written into it;
`yours` is licence clause 1 in the licence's own word — *"Stories, projects,
boards, components, scripts and exports you author with it are yours."* `fast`
is the one that is a judgement rather than a fact, and it is the only one there
on the strength of the canvas being built to earn it. A fifth word has to pass
the same test.

**It is the last word of the sentence, and that is structural.** A word that
changes has to reserve the width of the longest of them, so mid-line it leaves
a hole beside every short one and the argument becomes which of two bad
options to take. At the end there is nothing after it for a hole to sit in
front of; the word can sit flush left in its box, "and it's free" keeps the
spacing of ordinary text, and the line cannot re-centre because the reserved
box never changes size. **A rewrite that moves it back into the middle of the
line is reintroducing the problem**, which is why the headline reads the way it
does rather than the more natural word order.

## Theming

`src/app/globals.css` is one shadcn token block carrying the app's own hexes
**verbatim** from `packages/ripple_theme/lib/src/app_tokens.dart` — not
converted to oklch, so the two files can be diffed and cannot drift by a
rounding error.

Two things carry over that are easy to lose:

- The neutral ramp is not grey. It sits at roughly 225°, at a saturation low
  enough to read as grey. *"A cool grey looks chosen; a pure grey looks
  defaulted."*
- **The page is the grey one and a card sits lighter on it, in both modes.**
  Material's light ramp runs the other way, which puts a card underneath the
  page it is on and makes a panel read as a dent.

`--go` and `--caution` are `AppStatus`'s own two, carried over so that a
caveat on this site and a caveat in the app's messages panel are the same
yellow. The hero's early-development disclaimer is `text-caution` and nothing
else: **a foreground on the page, not a filled banner.** Accent is a pointer
rather than a paint, and a tinted strip under the hero would shout louder than
the thing it is warning about. Measured against both grounds before it was
used — 4.60:1 light, 11.49:1 dark — because a status colour is normally tuned
to sit *behind* text, and this one is being asked to *be* text.

**Its wording is "Early days — you may still meet the odd rough edge", and
what it stopped saying is the point.** It read "Early development — expect
rough edges and bugs", which is true, and which to a reader who has never
heard of the app is a warning not to install it. Nothing was softened away:
it is still early and there are still rough edges, in the app's own warning
colour, above the fold. What went is the imperative — *expect* tells somebody
what to brace for — and the word *bugs* as the sentence's last beat. **It
carries no version number**, though "1.0 is young" was the obvious phrasing:
the badge above it reads its number from the release and this would not, so
the two would disagree the day 1.1 ships.

**`--premium` is the paid tier's accent, and it is the one token here that is
not the app's.** The app has no paid surface yet, so there is nothing to
transcribe; the colour was chosen for the site — the complement of the
brand's indigo, kept olive-gold rather than amber so nobody reads it as
`--caution`, which sits two doors down the hue circle — and measured the way
the others were: `#8a6512` light is 4.87:1 on the page and carries white at
5.32:1, `#e3c06a` dark is 10.97:1 and carries ink, the brand foreground's own
arrangement. **It goes on paid-tier surfaces and nowhere else**: the pricing
card's border and chip and ticks, the `premium` button variant the waitlist
wears, the roadmap chip of a paywalled release. A gold thing on this site
means "this is about the paid tier", and the meaning only holds while nothing
else borrows it for emphasis.

`--brand` is the seed, `#6C7BF5`, and it is the **mark's** colour. `--primary`
is a legible derivative — `#4A57E0` light, `#A8B1FA` dark — because white on
the seed is 3.63:1. That is not a departure from the app: `ColorScheme.fromSeed`
means the app's `primary` is not the seed either.

The radius scale is `AppRadius` — 8 / 12 / 16 / 24 — overriding the template's
multipliers off `0.625rem`, which landed on none of them.

## The brand is generated, not imported

There is no logo file to import, because in the app the mark is *painted* — so
it takes the theme's colours and stays crisp at any size — and the only rasters
that exist are the generated app icons.

`src/components/ripple-mark.tsx` is the same three-ring table as
`apps/editor/lib/src/widgets/app_brand.dart`, drawn as SVG and inheriting `currentColor`.
`src/lib/og-mark.tsx` is the same table again for `next/og`, as bordered divs
rather than `<circle>`s, because satori renders a subset of CSS and no
arbitrary SVG paint. The favicon and the social card are both generated from
it, so the tab, the title bar and a shared link are one mark rather than three
that were drawn to match once.

## The social card

`src/app/opengraph-image.tsx` is rendered to a PNG **at build time**, and Next
emits `og:image` and `twitter:image` from it along with the width, height, type
and alt — so there is no meta tag written by hand and no second copy of the
dimensions. `/download` and `/pricing` inherit it; nothing needs its own.

It is the grid backdrop, the lockup, the headline and the board screenshot
bleeding off the right and the bottom. Cropping the board rather than fitting
it is the point: it says the canvas carries on past the card, which is the one
thing a picture of an infinite canvas should say.

Three constraints come from satori and explain why the code looks like it does.
It renders a **subset of CSS**, so the grid is a run of one-pixel divs rather
than a repeating gradient. It paints **no arbitrary SVG**, so the mark is
bordered divs (`src/lib/og-mark.tsx`). And it **fetches nothing**, so the
screenshot is read off disk and inlined as a data URI — a card pointing at its
own site's URL could only be generated after a deploy rather than during one.
Missing screenshot returns null and the card falls back to the grid and the
words, so a checkout without them still builds.

The wash under the text is `rgba(13,15,19,0.9)`, not the flat surface colour.
Opaque, it also erased the grid across the left half — which is the half where
the grid is the only texture there is.

The wordmark keeps the app's rule about itself: **`ripple` in the foreground
and `_effect` in the accent** — *"the underscore is coloured rather than
swallowed: it is half the name, and a `ripple effect` that has lost it reads as
two words somebody forgot to join up."*

## What search engines are told

### The canonical origin is one environment variable

`NEXT_PUBLIC_SITE_URL`. Everything absolute is built from it: the canonical
link on every page, every entry in the sitemap, `og:url`, every `<guid>` in the
feed, and every URL inside the structured data.

**Leaving it unset does not merely default — it lies.** The fallback is the
Vercel subdomain, so a site served from its real domain would spend every page
telling Google that the authoritative copy lives somewhere else, which splits
whatever authority it has across two hostnames. `siteConfig.urlIsFallback`
exists for exactly this, and `src/app/sitemap.ts` prints a warning at build
time beside the one `releases.ts` prints for a missing token. **A build that
says `NEXT_PUBLIC_SITE_URL is not set` is a build that should not be
promoted.**

The fallback deliberately still points at the Vercel subdomain rather than at
the intended domain. A canonical naming a hostname that does not resolve yet
is worse than one naming the address the page is actually being served from;
the warning is the mechanism, not the default.

### Canonicals are per page, and cannot be inherited

`alternates.canonical` on each route: `/`, `/download`, `/pricing`, `/privacy`,
`/blog`, and `/blog/<slug>`. **It must not go in the root layout.** Next
inherits metadata down the tree, so one there would canonicalise every page on
the site to `/` — the exact failure it is meant to prevent.

`/thanks` has none and wants none: it is already `robots: { index: false }`,
because it exists for the seconds after a click and its URL carries an asset
id that stops meaning anything at the next release.

### Structured data

`src/lib/structured-data.ts` builds it, `src/components/json-ld.tsx` prints it.

`SoftwareApplication` on `/` and `/download`, **both under the same `@id`** —
that is what says two pages are about one product rather than two products
with the same name. It carries the version when there is a published release
and omits the key when there is not, which is the right way round: an absent
version beats a stale one.

`BlogPosting` and `BreadcrumbList` on each post. `headline` takes `seoTitle`
when the post has one, because that is the line a result shows, and
`alternativeHeadline` keeps the piece's own name beside it.

**Two things are deliberately missing and should stay missing.**
`aggregateRating` and `review`, because there are none — the same rule as the
rest of the site's numbers, and inventing them is what got rich results
restricted in the first place. And `FAQPage`, which `/`'s FAQ section is a
perfect fit for and which would earn nothing: Google narrowed FAQ rich results
to well-known government and health sites, so the markup is now weight with no
result behind it.

### The blog is linked in both directions, and that is a rule

It was a leaf when it landed: nothing linked into it but the navbar, and
nothing in it linked back out. Both halves cost something, and the second is
the one that is easy to forget — a reader who arrives on a post from a search
has no route to the product unless the post gives them one.

So: `FromTheBlog` puts the two newest posts on the home page, between the FAQ
and the call to action; the FAQ's open-source answer links to the post that
expands it; and each post links to `/` and to its sibling. **A new post should
link outward at least once**, in prose, where it is genuinely useful — not as
a footer nobody reads.

Links inside a post render as plain `<a>` rather than `next/link`, because
they come out of Markdown. That is a full navigation rather than a client
transition, which on a site where every page is prerendered is a difference
nobody can feel and a crawler prefers.

## Every link the app opens is a redirect here

`/go/<name>` — `/go/support/issues/new`, `/go/survey`, `/go/docs/<slug>`,
`/go/legal/<page>` and the rest — is a **307** to wherever that thing lives
today, and `src/lib/go.ts` is the table; `next.config.ts` turns it into
`redirects()`. The app spells only these, from 1.5 on. 1.4 was built with the
support repository's owner, the survey's form id and the coffee page compiled
in, and an installed build cannot be edited; a build that spells `/go/` follows
a repository transfer, a replaced form or a licence that moved from a GitHub
file to a page with a deploy here and no release there.

Three rules, all of them in the file's comment as well:

- **Never `permanent`.** A 308 is cached by the browser, which would bake the
  destination back into the client this exists to keep it out of.
- **A path, once shipped, stays.** Repoint it; never remove or repurpose it,
  because some build in the wild still opens it.
- **The query passes through**, which Next does unasked. The issue forms read
  a parameter per field and the survey reads `source` and `version`.

The app's `test/site_links_test.dart` reads `go.ts` out of this submodule and
fails on any address the app opens that the table lacks, so the two halves
cannot drift without a red test on the app's side.

**Docs and legal are on the list though they are ours**: a subdomain is one
more address a build can outlive. `/go/docs` and `/go/legal` take the root
explicitly, ahead of the `:path+` row, because `:path*` on an empty path writes
a `//` into the destination.

**`/api/contributors` is the About box's contributor list**, fetched from
GitHub here and cached for an hour, so the app no longer ships the repository's
owner or a token to buy a rate limit with. It uses `RIPPLE_EFFECT_METADATA`
when set — a fine-grained token reads any public repository — and works
without it. That token is never the download routes' `RIPPLE_EFFECT_EDITOR_RELEASES`,
which can read a private repository and is used for nothing else.

**`/api/engine` is the one engine route, and it serves discovery only**
(`src/lib/engine.ts`). An installed editor asks it which engine patch of its
contract, platform and bridge hash is the newest above what it has; it reads
the *public* `ripple_engine_releases` (no token needed, `RIPPLE_EFFECT_METADATA`
used for the rate limit when set), skips drafts, candidates and anything in `withheld`,
and hands back the manifest's exact text and its signature. The archive itself
comes from GitHub through `/go/engine/:tag/:file`. **It can only narrow**: the
editor verifies the signature, the contract, the bridge and every digest
itself, so `withheld` is how a bad patch is stopped without releasing anything,
and nothing here can make an editor take one it should not. The contract is
the app repository's `docs/specs/engine-distribution.md` §7.

## Downloads

Releases are cut on the **private** `ripple_effect` repository, so there is no
public URL to link to. `src/lib/releases.ts` runs server-side behind
`import "server-only"`, holding a fine-grained PAT scoped to that one
repository with `Contents: read`.

`/api/download/[id]` asks GitHub for the asset as `application/octet-stream`
with `redirect: "manual"` and hands the browser the `location` header. Two
consequences, both load-bearing:

- The token never reaches the client.
- **The bytes never touch the server.** Following that redirect here would
  stream tens of megabytes through a function; handing it over costs one small
  response and sends the download straight from GitHub's CDN. Never "improve"
  this into a proxy that streams.

The id is checked against the latest release's asset list before anything is
fetched. Without that check the route is a general read oracle for every asset
of every release in a private repository, which is a larger thing than a
download button.

Three operational facts that will otherwise bite:

1. **The release is picked by tag, not by GitHub's *latest*.** The app
   repository cuts editor releases (`v*`) and engine releases (`engine-v*`),
   and *latest* is whichever was created last unless every workflow says
   otherwise — one engine release holding it would stop every installed
   editor being offered updates. `pickEditorRelease` lists the releases and
   takes the highest `v<major>.<minor>.<patch>` that is neither a draft nor a
   prerelease. The release workflow's `draft` input defaults to `true`, so a
   release that has been cut but not undrafted is invisible here — correctly,
   but confusingly if you are waiting for it.
2. **Filenames are never hardcoded.** Three spellings of the same artifact are
   already in circulation: the workflow's own notes say `ripple-effect_*.deb`,
   the README says `ripple_effect-<version>-linux.deb`, and fastforge builds
   `ripple_effect-1.0.0+1-linux.deb`. The API is the only source that cannot be
   wrong.
3. **`null` is a designed answer, not a failure.** No token, no release, an API
   error — all three draw the four platforms in a "not published yet" state
   rather than a button that 404s.
4. **`/api/releases` says which of those it is**, and that is not decoration.
   `{ published: false }` alone covers four causes — nothing released, no
   token, a token that cannot see the repository, and GitHub unreachable — of
   which one is fine and three are outages wearing its clothes. The site served
   "not published yet" for hours against a release that was published, and
   there was no way to tell from the outside which of the four it was.
   `problem` is now `no-token` / `unauthorized` / `not-found` / `unreachable`,
   and **every branch logs, 404 included** — that was the one that did not, on
   the reasonable-until-it-wasn't grounds that "nothing published yet" is
   ordinary. A token that cannot see a private repository 404s identically.
   The reason names a class of problem and never a value.

## What the release feeds, and what is written down

Nothing on the site states a version number. The hero's badge and both pages'
copy come from the latest release's **tag**, parsed by `parseTag` —
`v1.0.0` and `v1.0.0+1` both read as `1.0.0`, and a tag in a spelling it does
not know renders as the tag itself rather than as nothing. A hardcoded version
is wrong from the first release after somebody forgets it, and wrong quietly.

**Both `/` and `/download` are ISR at five minutes**, and `fetchLatestRelease`
caches for the same. So publishing a release updates the site within five
minutes with **no redeploy** — the cards, the filenames, the byte sizes and the
badge are all read from the API, never from anything committed here.

The hero's button aims at the reader's machine (`useDetectedPlatforms`), so
that the ordinary visitor never chooses anything: *Download for Windows
(installer)*, with the platform's icon trailing the label. Four rules, each of them
paid for.

**The format is named on every platform, not only on Linux.** It is
load-bearing there — nothing in a user agent distinguishes apt from dnf, so a
silent pick would be a guess presented as an answer — but a button that names
the format on Linux and hides it everywhere else reads as a warning about
Linux. Saying it four times says instead that this is simply what you are
about to get.

**The label survives when the release does not.** With the platform known but
no asset for it, the button keeps saying what it would give you and goes to
`/download`, which explains the state in a sentence. Falling back to a bare
"Download" was the first version and it was wrong in practice: before the first
release the aiming was invisible, so the feature looked absent rather than
waiting.

**Do not set `data-icon="inline-end"` on that trailing icon**, tempting as it
looks — it is the attribute the button variants read, and what they do with it
is cut the right padding to `pr-2`. That is right for the compact `h-8` sizes
it was written for and wrong here: at `px-6` it leaves the icon eight pixels
from an edge the label is twenty-four from. The `:has()` selector also
out-specifies the `px-6` passed in `className`, so this is not something
tailwind-merge resolves — the button just renders lopsided.

**It never *only* offers the detected platform.** The line beneath goes to the
page with all four and the install notes, because people download for machines
they are not sitting at, and because the Windows build needs a second file.

**An empty detection is an answer, not a failure**, and the branches that
produce one all exist because a naive test was wrong against real user agent
strings. An iPhone says "like Mac OS X", so a plain `/Mac OS X/` offers it a
`.dmg`. An iPad in desktop mode reports as `Macintosh` with nothing else to
match on — touch points separate them, since a Mac reports 0 and an iPad 5.
Chrome OS carries `X11` and would otherwise be handed a `.deb`; Crostini could
arguably take one, which is exactly why it should be a choice made on the
download page rather than an assumption made here. Android, a phone, anything
unrecognised: the button says "Download" and points at the page.

**The certificate machinery is dormant, not gone.** While Windows shipped an
MSIX, a `.cer` rode along as a release asset that was not a platform:
`platformOf` returns null for it, so it hung off `LatestRelease.certificate`,
`signedAssetUrl` let it through the membership check explicitly, and the
install snippet named both filenames through `%s` and `%c`. Releases carry no
`.cer` any more, so `certificate` is always null and the download button for it
is commented out in `download/page.tsx`. All of it is left in place because a
return to MSIX — not a real code-signing certificate, which would remove the
need entirely — is what would want it back.

One latent trap, harmless today: an asset is matched by extension and the
**first** match wins, so a release shipping two `.deb`s for two architectures
would silently offer one of them. Ripple Effect ships one file per platform, so
this has never mattered; if that changes, the architecture has to become part
of `ReleaseAsset` rather than something the ordering happens to decide.

## The waitlist links out rather than collecting

The pricing card's "Keep me posted" is a link to a hosted form, not a styled
field of our own. The first version was the field, and it was wrong in a way
worth recording: it POSTed a `FormData` at the form's public URL, which that
host does not accept — so it would have looked like it worked, reported
success, and swallowed every address typed into it.

Linking out also means no address of anybody's sits in a database we run, and
no privacy notice has to be written for one. `?source=` fills a hidden field on
the far side, so where somebody came from is answerable without asking them.

**The satisfaction survey is the same arrangement and gets one line in the
footer, deliberately.** It is a second hosted form — how the app is doing, its
features rated one by one, the roadmap, support, and an open box at the end —
and this site is not where it is expected to be answered: the app puts it in
front of somebody who has just used the thing, and there is no page here whose
subject is how well it is going. So it is a footer link carrying
`?source=website-footer`, which is what tells the two populations apart later.
The privacy page's *The forms* section covers both, and says the contact fields
at the end of the survey are optional — which is the only claim on this site
about that form that a reader could check.

## Screenshots

Every image is a real screenshot; there are no mockups or composites.
`src/lib/screenshots.ts` is the shot list, typed, so a slug that does not exist
is a compile error. Until a file lands, `Screenshot` draws that shot's brief in
a dashed frame — the page stays laid out and reviewable, and an un-captured
shot is impossible to miss where a broken `<img>` reads as a bug.

**`Screenshot` is theme-aware by construction and takes no `theme` prop.** The
first version defaulted to dark and offered a separate `ThemedScreenshot` for
the one shot that had been captured twice — which meant every call site was one
forgotten import away from pinning an image to a theme the page was not in.
That is exactly what happened: light captures landed for all eight shots and
seven of them went on rendering dark in light mode, because the sections asked
for `theme="dark"` and got what they asked for.

**Existence on disk decides now.** Two files render as a pair, one file renders
in both themes, neither draws the brief. There is no prop to get wrong, and
adding a shot needs no decision about it.

The frame is a hairline and a radius and **no browser chrome**. These are shots
of a desktop application taken on Linux; dressing them in a fake macOS window
would be a picture of a product that does not exist.

`docs/screenshots.md` carries the capture protocol — one window size for the
whole set, because minimap placements are filed per window size.

**The captures are in Git LFS** — `public/screenshots/**/*.png` and the
documentation site's `src/assets/screenshots/**/*.png`, per `.gitattributes`
— so the repository does not carry a new megabyte of pixels for every retake.
Two consequences. A clone needs `git lfs install` before the files are
pictures rather than three-line pointers, and **Vercel has to be told**: both
projects deploying from here need *Git LFS* switched on in their settings, or
the build sees pointers, `next/image` serves them as broken images, and the
social card's `readFileSync` of `board-dark.png` hands satori a text file and
dies at prerender — loudly, at least. Nothing else in the repository is in
LFS; the app repository does not use it at all yet.

One trap already paid for: the show/hide classes go on a **wrapper**, never on
the frame. Passing `hidden dark:block` down through the frame's own `cn` lets
tailwind-merge read it and the frame's `flex` as the same display property, so
the later one wins and the placeholder silently loses its flex container.

## Not in this repository

`next.config.ts` deliberately does **not** say `output: "export"`, which is
what the template shipped with — it was built for a static host. The two route
handlers have nowhere to run under a static export, which is the whole reason
this deploys to Vercel.

Vercel points at this repository directly rather than at the app repository
that carries it as a submodule at `website/`, which sidesteps private-submodule
cloning entirely.

## The release banner

A bar under the header saying a version is out, for the **three days** after it
is published, dismissible, and keyed by tag so dismissing 1.0.0 does not also
dismiss 1.1.0 three weeks later.

**The clock is read on the client, and that is the whole design.** Deciding
freshness on the server decides it when the page was *rendered* — which for a
statically prerendered route is whenever the site was last built. `/pricing`
would then carry a banner three days old relative to a deploy nobody made, and
carry it forever. So the server supplies the one thing only it knows, the
publication date, and the browser does the subtraction when somebody actually
looks. Nothing renders server-side: `getServerSnapshot` returns false and the
banner appears after hydration, because the alternative is comparing two
clocks across a hydration boundary, which is a mismatch by construction. The
snapshot is cached per key because `useSyncExternalStore` loops on one that is
not `Object.is`-stable, and `Date.now()` is not.

**It is `fixed top-16`, not the template's `sticky top-0`.** This site's header
is `fixed`, so it is out of flow and covers the first 64px of every page; a
banner in normal flow at the top of `<main>` would be behind it. It needs no
layout allowance from the pages — the home hero clears the header at `pt-32`
and `PageHeader` at `pt-36`, and the banner is about 40px, so it lands in space
that is empty either way. **Reduce either of those paddings and this is what
breaks.**

It wears a full-width brand gradient, which nothing else on the site does. An
announcement's whole job is to be noticed once, and what keeps that honest is
that it is transient by construction rather than by discipline: three days
after a release it stops rendering on its own. **`--brand-foreground` is
`#14171c` in *both* themes**, which looks like a copy-paste error and is not —
the gradient is light lavender either way, so white on it is 3.63:1 at the
darkest stop and 2.3:1 at the lightest, which is not text. A foreground that
followed the theme would be wrong in one of them.

## The tool list is transcribed, not summarised

`src/lib/mcp-tools.ts` carries all **39** tool names, and the number is worth
being exact about — it is the one claim in that section a reader can check in
an afternoon. They come from the app's dispatch table rather than from the
spec, because the spec describes the surface and the table *is* it. Two traps:
`board` and `passage` look like tool names in a naive grep of `apps/editor/lib/src/mcp/`
and are resource URI segments, `ripple://board/{id}` and
`ripple://passage/{id}` — count them and you get 37. And the count belongs in
one place: the paragraph under the marquee reads `mcpTools.length` rather than
saying "35", and the marquee splits the list in half by arithmetic, so adding
a tool cannot leave the prose or the belt behind. 1.3.2 was the first time it
grew — `node_types`, `campaign_trace`, `campaign_answer` — and 1.4 the second,
with the four `soundscape_*` tools; the file has to be updated by hand when
the app's table does, since nothing here reads it. The documentation site's
`reference/mcp-tools.md` is the third copy, and the one with the arguments
on it.

## The painting

`public/cover.jpg` is the only photographic thing on the site, and it appears
twice on the home page: under the hero, fading out before the board
screenshot, and behind the closing call to action at the bottom. Both go
through `components/cover.tsx`.

**The component owns the tint and the caller owns the placement**, which is
the same split the app makes between a mechanism and the policy for using it.
Everything below — the blend, the token it tints to, the isolation, the two
opacities — is one decision in one file. Where the picture sits, how tall it
is and how it fades are passed in as `className`, because they are genuinely
per-section: the hero is anchored to the top of the viewport and has one seam
to fade across, and a band in the middle of the document has two.

**The call to action has no grid over it, deliberately.** In the hero the
pattern has a second job — the cover is a photograph and the grid is what says
the page is a tool — and by the time somebody has read the whole page that has
been said. What is left at the bottom is one picture behind two buttons.

**Its mask is linear where the grid's are radial, and that was measured.** A
`radial-gradient(ellipse 85% 75% at 50% 50%)` still has about a third of its
alpha left where the band ends, because the vertical radius is 75% of the
height and the edge is only 50% away — so the painting stopped in a hard line
above the footer. Reaching zero at both seams is the whole requirement there,
and one axis of a linear gradient says it exactly.

`loading="eager"` is the hero's and not the other's: one is above the fold and
one is the last thing on the page. Neither takes `priority`, because that also
emits a preload and the one image here that deserves the slot is the board
screenshot.

**The tint is a blend, not a filter.** `mix-blend-mode: luminosity` takes the
lightness of the image and the hue and saturation of whatever is beneath it,
so a flat `bg-brand` under it leaves the painting with all of its values and
exactly one colour. There is no `grayscale()` in front — the blend already
discards the source's colour, and a filter would cost a raster pass to change
nothing. The alternative was an SVG `feColorMatrix` duotone, which is more
precise and would have meant a hand-written matrix per theme, recomputed by
hand every time the seed moved. This one follows the token.

It tints to **`--brand`, not `--primary`**. Everywhere else on the site that
rule runs the other way, because `--primary` is the *legible* derivative and
almost everything else is text or a control. Nothing here has to be legible;
it is the identity hue doing the one job it is actually for.

**`isolate` on the wrapper is load-bearing.** A blend mode composites against
everything beneath it in its stacking context, which without isolation is the
page. The wrapper's own `opacity` would establish one anyway, so it is belt
and braces — but it is what records the intent.

**Two opacities, and light mode's is the lower one**, which is the opposite of
the first guess. The painting is high key: most of its area is bright sky. On
the dark ground that reads as a glow and takes `0.18`. On the near-white light
ground the *dark* parts are what show, against almost nothing, so the same
value turns the top of the page lavender; light gets `0.10`.

The fade is a `mask-image`, not a gradient overlay. An overlay would have to
be painted in `--background`, and would then be a rectangle of the wrong
colour the moment anything were ever put behind it.

**The grid was extended to `90% x 80%` from `70% x 60%` at the same time**, and
that is part of the same change rather than a tidy-up. The grid is the thing
that says this page belongs to a tool; leave it fading out a third of the way
down and the rest of the hero is bare picture.

## Images: what was measured, and what not to do

**`next/image` already serves AVIF and WebP.** `next.config.ts` asks for both,
and the optimizer resizes to the layout width as well. Measured on the wire:
`board-dark.png` is 272 KB on disk and **28 KB** delivered. So converting the
screenshots to WebP by hand would save the *repository* about 1.3 MB and the
visitor **exactly nothing**. Do not spend a build step on it, and do not add a
converter dependency for it.

**And one of them cannot be converted at all.**
`src/app/opengraph-image.tsx` reads `public/screenshots/board-dark.png` off
disk and inlines it as a data URI. The OG renderer recognises `image/webp` as a
MIME type and then cannot rasterise it — `next build` dies with *"Error
occurred prerendering page /opengraph-image"*. It fails loudly, which is the
good case, but it fails.

**The cover is the exception, because greyscale changes the pixels the encoder
is given**, and no amount of downstream optimisation can do that for it. The
image is composited with `mix-blend-mode: luminosity`, so its chroma is
discarded before anything reaches the screen; storing it was paying for bytes
that are thrown away. `pnpm images` regenerates `public/cover.webp` from
`cover-source.jpg`, which stays in the repository because greyscale is not
reversible and this has to remain reproducible. On the wire, at 1080: **60 KB
to 19 KB**.

**`sharp().greyscale()` is the wrong conversion and the page shows it.** It
converts through linear light; CSS blend modes operate on gamma-encoded sRGB.
On this image the two disagree by 16 levels out of 255 — the linear version is
13% brighter — which was enough to bring the painting forward and wash out the
paragraph under the headline. The compositing spec's `Lum(C)` is
`0.3R + 0.59G + 0.11B` on the encoded values; applying exactly that through
`recomb` lands within half a level of what the browser computes from the colour
original, which is what makes the swap invisible. `tool/optimize-cover.mjs`
carries the reasoning.

**A `quality` prop that is not in `images.qualities` is a 400, not a
fallback.** Next 16 ships with `[75]`. `<Image quality={60}>` against that
config renders an `img` whose every srcset candidate fails — nothing appears,
the build says nothing, and the only sign is a 400 in the network panel. The
config now declares `[60, 75]`; the prop and the config have to travel
together.

**`sizes` cannot cap below the `deviceSizes` ladder.** Capping the cover at
`1280px` looked like a free 40% and did nothing: the optimizer only serves
widths on that ladder — 1080, 1200, 1920 — so a 1920 viewport asking for 1280
is handed 1920 exactly as before. Making it bite means widening the ladder for
every image on the site, or writing a number in `sizes` that is not the layout
width, and a lie there is paid by whoever next touches the element.

**Clear `.next/cache/images` before measuring anything here.** The optimizer
caches by `(url, w, q)`, so replacing a file under `public/` and re-requesting
returns the old bytes to the byte — which reads as "my change did nothing".

## `min-w-0` on any grid column that holds a marquee

A grid item defaults to `min-width: auto` and will not shrink below its
content's min-content width. The agents section's left column holds the tool
marquee, whose chips are `whitespace-nowrap`, so its min-content width is
sixteen tool names laid end to end — about a thousand pixels. On a phone that
blew the track past the viewport and broke **both** columns at once: the
heading and the paragraph ran off the right edge, and the constellation, which
is `mx-auto` inside the same over-wide track, was centred a few hundred pixels
off-screen and read as having failed to render.

`overflow-hidden` on the `Marquee` does not fix it. That zeroes the *automatic
minimum size* of the marquee itself, not the min-content contribution it makes
to the block above it — and the grid item is that block. The fix is `min-w-0`
on the column, and it is on both columns of both new sections.

## The roadmap

Nine releases, each a pack of features with a codename, in
`src/lib/roadmap.ts`, drawn as spotlight cards on a marquee.

**No dates, anywhere, and that is the rule rather than an omission.** A
roadmap with dates on it is a set of promises, and the only honest thing this
page can say about a version that has not been started is *what* it is. The
order of the list is the entire schedule. The numbering has a gap — 1.1 is
missing — because that was a fix release and a fix release does not get a
codename. 1.4 was such a gap once and became a pack of its own, which is the
reminder that the list is a copy of `ROADMAP.md` in the app repository and
follows it rather than deciding anything.

**A shipped release gets three lines, read off its changelog section.** Three
is what a card holds, and the lines are the ones a reader of the release notes
would pick — not the plan's wording, which is one line and usually narrower
than what shipped. A planned release keeps the plan's wording, because the
plan is all there is to say.

**The belt is full bleed, outside the `max-w-6xl` container.** A belt that
starts and stops at the same margins as the paragraph above it reads as a
broken carousel; one that runs off both edges reads as a belt. The marquee's
own edge mask does the fading.

**`motion-reduce:overflow-x-auto` on the marquee is not a nicety.**
`globals.css` stops `animate-marquee` under `prefers-reduced-motion`, and the
animation is the only thing that brings the later cards into view — so without
it a reader who asked for less motion gets the first four releases and no way
to reach 1.8. Turning the overflow back on hands them a scrollbar instead. Any
future marquee carrying content rather than decoration needs the same line.

The honest cost, which is worth knowing before adding a second one: a marquee
is a poor way to read an *ordered* list. `pauseOnHover` covers a mouse and
nothing covers a touch screen, where the cards simply go past. The version
number leads every card so that a reader who catches one mid-belt still knows
where they are.

## The blog

`/blog`, `/blog/<slug>`, `/blog/feed.xml` and `/blog/search.json`. A little
machinery for what
is, deliberately, a static list of posts: somewhere to explain what a feature
is actually for, to talk about where this is going, and to say something about
the packages underneath the app that are published on their own.

**A post is one Markdown file in `content/blog/`, and the file is the whole
record.** The slug is its name, the metadata is its frontmatter, the reading
time is counted from its body. There is no second list. The template shipped
one — `src/lib/blog-posts.ts`, carrying a title, an excerpt, a date, a category
and a hand-typed `"4 min read"` for each post, *beside* an MDX file that
repeated most of it — and a list like that is already wrong by the second post.

Frontmatter is four keys, all required: `title`, `description`, `date`
(`YYYY-MM-DD`), `category`. **It is parsed by hand and strictly**, in
`src/lib/blog.ts`. Four scalar keys do not justify a YAML engine in the
dependency tree; what they do justify is a parser that stops the build and
names the file on an unknown key, a missing one, a malformed date or a category
that is not in the union. A lenient parser would drop a typo'd `discription` on
the floor and publish a card with no excerpt. It understands `key: value` on
one line with optional matching quotes and nothing else — only the *first*
colon splits, so a title with a colon in it survives.

**`seoTitle` is the one optional key**, and it is usually absent. `title` is
what the piece is called — the `<h1>`, the card, the social card image — and it
gets to be evocative. `seoTitle` is what somebody typed into a search box, so
it is literal, and it is used only for `<title>`, the OG title and the
`BlogPosting` headline. "A node body is an ordinary widget" is a good name for
an essay and a poor search result: it contains none of the words a Flutter
developer would look for. **It is a licence to be plain, not a licence to
stuff** — if it does not read as a sentence a person would write, it is wrong.
The social card image keeps the real title, because that one is read by a
human.

`category` is a typed union of four — `Feature`, `Engineering`, `Release`,
`Roadmap` — so a fifth invented in a hurry is a compile error. **The chip that
draws it is the quiet one and stays that way**: the roadmap's chips are toned
because shipped-versus-planned is a status a reader acts on, and a category is
not. The title carries a card.

**Reading time is computed, and it is honestly the cheap version.** A word
count at 200 wpm, English-only. The app itself does this properly — fifty-four
languages, mixed scripts counted a run at a time, `dart_read_time` — and none
of it is reachable from here, because that is a Dart package and this is a Next
site. What is borrowed is the pair of rules that matter at this scale: fenced
and inline code come out before anything is counted, and a link is worth the
words you read rather than the length of its URL.

### Search

A box above the list, filtering it as you type. Built before it was needed,
which is the right order for this one: retrofitting search means moving the
card into a client component and splitting where its text comes from, and
doing that later is the same work plus a diff nobody wanted to read.

**Case-insensitive substring matching, every term required, and nothing
else.** No stemming, no fuzzy matching, no inverted index, no library. A blog
is tens of posts and a reader typing into a box on a page they are already
looking at usually knows roughly what they want. If it ever needs ranking a
human would call clever, that is the moment to reach for something — the
matching is thirty lines in `src/components/blog-list.tsx` and is meant to be
thrown away rather than extended.

**It searches metadata immediately and body text shortly afterwards, and that
is the design rather than a compromise.** Title, description and category come
down as props and are matchable the moment the page loads. Bodies live in
`/blog/search.json`, prerendered as a static file, and are fetched **the first
time somebody types** — once per page load, memoised on a module-level promise
so React's development double-invocation of effects reuses the request instead
of racing two of it. So the page's weight does not grow with the archive: three
posts or three hundred, `/blog` ships the same bytes and the index is only
paid for by people who use it.

The honest consequence: for the width of one round trip, a query matches
metadata only. Nothing in the UI says so, deliberately — a spinner over a list
that is already correct-so-far is worse than the wait, and the failure mode if
the fetch never lands is a search that still works on titles.

**The index carries body text and nothing else.** Everything else is already
on the page; putting it in the file too would ship every title twice.

`searchableText` in `src/lib/blog.ts` is **not** the same stripping as
`readingMinutes`, and the difference is deliberate rather than an oversight.
Reading time takes code *out* — a Python snippet is not read at reading speed.
The index leaves code *in*, because `Element.updateChild` is exactly the sort
of thing somebody arrives at a search box with. Two questions, two answers.
One trap already paid for: everything ends up on one line, and a heading is
the only block that does not close itself, so headings get a full stop or an
excerpt lifted from that seam reads as a sentence nobody wrote.

**A card that matched only on its body shows an excerpt instead of its
description.** Without it the result is a card whose visible text does not
contain what you typed, which reads as a bug in the search rather than as a
result. Matched terms are marked in whichever of the two is shown.

**`BlurFade` is on the unfiltered list only.** The reveal is for arriving at
the page; fading every card back in on each keystroke is a strobe.

Two smaller decisions. **`/` focuses the box** — the conventional key for
searching a page you are already on, and it needs no modifier and no platform
detection for its hint, which is why it is not the documentation site's
`Ctrl+K`; that is a modal palette and this is a filter over a list already on
screen. And **there is no `?q=` in the URL**: a filter is not a destination,
and putting it there costs either a router push per keystroke or
`useSearchParams`, which on a static page drags a Suspense boundary in behind
it.

**The box is shown whether there are two posts or two hundred.** A threshold
was considered and rejected: it makes the page behave differently on a day
nobody remembers, for the sake of hiding a 40px input.

### The pipeline, and why it costs nothing

`src/lib/markdown.ts` is unified — `remark-parse`, `remark-gfm`,
`remark-rehype`, `rehype-slug`, `@shikijs/rehype`, `rehype-stringify`. Seven
packages, and **not one byte of any of them reaches a browser**: both routes
are prerendered, so the whole chain runs during `next build` and what ships is
the HTML it produced. That is the entire argument for the size of it.

**Raw HTML in a post is dropped, and that is the setting rather than an
oversight.** `remark-rehype` discards it unless `rehype-raw` is added, and it
is not: the posts are Markdown, writing one needs no React, and an escape hatch
into arbitrary markup is how a content directory turns back into a component
directory. A post that genuinely needs a widget wants a page.

**The languages are named rather than bundled**, and typed as
`BuiltinLanguage[]`, so the build loads ten grammars instead of three hundred
and a misremembered name is a compile error rather than every block in that
language silently going plain. An unlisted language falls back to `text`.

**The syntax colours are `github-light` and `github-dark`, which are Expressive
Code's defaults on the documentation site.** So a code block here and a code
block there are coloured the same way without either being told about the
other — and the reasoning made over there carries: the app's Python editor has
a palette of its own, matching it properly is real work, and a half-matched one
would be worse than an honest borrowed one.

`defaultColor: false` is what makes the theme toggle work. It puts both themes
in `--shiki-light` / `--shiki-dark` custom properties instead of baking one
into the `style` attribute, and `src/app/blog/post.css` is the two rules that
read them off `.dark`. It also means Shiki sets no background, which leaves the
*frame* to us: the card surface, a hairline and `--radius-sm` — the same frame
the documentation site puts round its own blocks. **The split is deliberate and
it is the same on both sites: the frame is ours, the syntax is Shiki's.**

### `post.css`

Plain CSS against the same tokens rather than `@tailwindcss/typography`, for
the reason `docs-site/src/styles/content.css` gives: the plugin arrives with
its own colour ramp and its own spacing opinions and every one of them then has
to be argued back down. Writing the dozen rules that are wanted is smaller than
overriding the eighty that are not — and it is the *same* dozen, lifted from
that file so a paragraph reads the same on either site.

**It is unlayered, which beats Tailwind's utilities without `!important`.**
That is safe here and nowhere else on this site: everything it styles came out
of a Markdown file and carries no classes of its own.

### The one `dangerouslySetInnerHTML`

It is in `src/app/blog/[slug]/page.tsx` and it is not dangerous, for one
reason: the HTML was produced during `next build`, from a Markdown file in this
repository, by a pipeline that drops raw HTML. Nothing a reader can send
reaches it. **If a post ever comes from somewhere that is not a committer — a
CMS, a form, anybody — that is the line to sanitise before anything else.**

### What is prerendered, and the trap if that changes

Everything. `/blog` is static, `/blog/[slug]` and its social card are SSG with
every slug named by `generateStaticParams`, and both the feed and the search
index are `force-static`. So `content/` is read at build time and never to
answer a request.

`/blog` being static and its list being a client component are not in tension:
a client component still renders during the build, so the cards are in the
HTML for a crawler that never runs the script, and hydration only adds the
box.

**If either route is ever made dynamic, `content/` has to be named in
`outputFileTracingIncludes`.** Next traces the files a server bundle needs by
reading the code, and a `readdirSync` of a path it computed at runtime cannot
be traced — the route would deploy and then find an empty directory.

### The cards

Each post gets its own social card, `src/app/blog/[slug]/opengraph-image.tsx`:
the same backdrop and the same lockup as the site's, with the post's title
where the headline goes and no screenshot. A shared link should say which post
it is; a picture of the board says only which product it is. Title size steps
by string length because satori has no layout to ask.

`src/lib/og-grid.tsx` exists because there are two cards now and a copied grid
is two places for the line colour to drift apart.

### The posts themselves

**The four things this site must not say apply to a post exactly as they apply
to a page.** A post is the easiest place on the site to drift, because it is
prose and nobody diffs prose against a licence — so the standing rule is that
everything in one is either checkable in this repository or in a public one.
The two that are here were written that way: the `dart_read_time` post is the
package's own README and the app's changelog, and the `fl_nodes_v2` post is
that package's own notes — including every number in it, which are measured
and recorded there rather than estimated here.

One distinction a post about a package has to keep making, because it is the
easiest one to blur: **the packages are open source and the app is not.**

## `/thanks`, and the Buy Me a Coffee ask

Every download button now points at `/thanks?asset=<id>` rather than straight
at `/api/download/<id>`. The page starts the file itself and then asks for a
coffee.

**Nothing navigates, which is the whole reason this works.** The API route
answers with a 302 to a GitHub asset URL carrying
`Content-Disposition: attachment`, and a browser handed an attachment
downloads it and leaves the document where it is. So `location.href = …` in an
effect starts the file and the reader stays on the page.

That is also why it is not a hidden iframe, which was the other candidate and
fails worse: downloads inside frames are blocked in more situations, and
silently. If this ever stopped being an attachment the browser would navigate
to the file — which is precisely what the button did before this page existed,
so the worst case is the old behaviour rather than a download that never
happens. The effect is guarded by a ref, because React runs effects twice in
development and each run is a real request for tens of megabytes.

**The asset id is looked up, not trusted.** That is what lets the page name
the file it is handing over; an id from a previous release simply does not
match and lands on the "that link has expired" copy. `/api/download` validates
ids itself and always did — this is not the security boundary, it is what stops
the page saying something untrue about what is downloading. The page is
`noindex` and is not in the sitemap: its URL carries an id that stops meaning
anything at the next release.

**The widget is on every page except `/thanks`**, whose entire content is the
same sentence and the same button. A floating bubble repeating it in the corner
is one request made twice in a single viewport.

**The vendor script needs `DOMContentLoaded` re-fired on `window`, and getting
the target wrong fails in complete silence.** `widget.prod.min.js` ends in
`window.addEventListener("DOMContentLoaded", …)`. `next/script` injects it long
after that event, so the listener waits for something that will never happen
again: the script loads, reports success, draws nothing. Re-firing it in
`onLoad` is the fix — but `document.dispatchEvent(new Event("DOMContentLoaded"))`,
the obvious spelling, does nothing at all, because `new Event()` is
`bubbles: false` by default and the listener is on `window`. No error, no
warning, an empty corner. The bundle is 8 KB and says which target it uses in
one line; read it rather than guessing.

**The button image is a remote SVG in a plain `<img>`**, with the lint rule
disabled on that line. `next/image` would need `dangerouslyAllowSVG`, which is
the wrong trade entirely: it would let this site's own origin serve arbitrary
SVG. Scripting is disabled for SVG in an `<img>`, and the file stays on Buy Me
a Coffee's origin.

The sentence lives in `src/lib/support.ts` because it is said in two places and
a reader who meets it twice should not find it reworded. Keeping it there also
keeps its apostrophes out of JSX.

## The cookie notice asks about one cookie, and it is not the analytics

Both halves of that were measured on a clean browser profile rather than
reasoned about, and the measurement is the whole design. **Vercel Web Analytics
sets nothing at all** — no cookie, no `localStorage`; visitors are told apart by
a hash of the incoming request that is discarded after a day. **Buy Me a
Coffee's widget sets one first-party cookie, `visited`.** That is the entire
inventory, so the banner *discloses* the analytics and *gates* the widget.
Gating the analytics as well would cost the only numbers the site has and buy
no privacy whatsoever, which is a bad trade dressed as a careful one.

Analytics that answered "is this the same person updating, or a new one?" would
need a persistent identifier and would therefore need consent for itself. That
question is answered instead by **GitHub's own `download_count`**, which is per
asset and so per platform and per version, costs nothing, and — unlike any
script — cannot be blocked by the ad blocker a developer audience is running.
`src/lib/releases.ts` already fetches the object that carries it.

`src/lib/consent.ts` is the store, and three of its decisions are load-bearing.

**`getServerSnapshot` returns `"unknown"`, and nothing renders for it.** The
answer lives in `localStorage`, the server cannot see it, and a component that
guessed would flash a banner at somebody who had already answered. Same shape
as `ReleaseBanner`, same reason.

**A store that throws reads as `"denied"`, not as `"unset"`.** `localStorage`
throws outright when a browser blocks site data, and the choice there is a
banner on every single page load forever, or nothing. A browser refusing to
store anything would very likely refuse the cookie being asked about too, so
the question has effectively been answered elsewhere and nagging about it
records nothing.

**Withdrawing deletes the cookie and reloads the page**, and both steps are
necessary. A decline that leaves `visited` in place has undone nothing; and
unmounting the `<Script>` element does not unload a third-party script that has
already run, so a reload is the only way to say "not loaded" and have it be
true. Both are skipped when there was nothing to withdraw, so a first-visit
decline stays silent.

In the banner itself, **Decline is the same size as Accept** and differs only
by variant. It is also not a dialog and does not trap focus: nothing on the
page is withheld pending an answer, so a modal would be claiming an urgency it
does not have.

**Writing the page found a claim that had gone stale.** The FAQ said the About
box's contributor list was the only thing the app ever sent — but
`apps/editor/lib/src/updates/` now asks this site's `/api/releases` once per launch, so
that had been untrue since the update check landed. It is fixed, and it is the
failure mode this site's honesty rules are most exposed to: a sentence that was
accurate when written and was never revisited when the app grew a second
request.
