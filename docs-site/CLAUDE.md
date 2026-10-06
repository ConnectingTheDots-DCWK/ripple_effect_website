# ripple_effect_docs

The documentation site. Astro 7 + Starlight 0.42, TypeScript, pnpm, deployed on
Vercel at **docs.ripplefx.app**.

It lives in the landing page's repository but is not part of the landing page:
it is a second Vercel project whose **Root Directory is `docs-site`**. The two
share a checkout and nothing else — no dependency, no build, no lockfile.

## Why it is in this repository at all

Because the thing it has to stay consistent with is here. The house style is
transcribed in `../src/app/globals.css`, and `src/styles/tokens.css` is a
transcription of that transcription; a change to either is a one-directory diff
rather than a submodule bump. Splitting it into its own repository is still
open if it outgrows that, and would cost a `git init` and a Vercel project.

**`pnpm-workspace.yaml` exists here for one reason: to stop pnpm walking up.**
The landing page has a workspace root at `../pnpm-workspace.yaml`, and pnpm
resolves to the *nearest* one. Without a file here, installing in this
directory would install into that root — one lockfile for two projects that
share no dependency, and a landing page build on Vercel that resolves this tree
as well.

## The stylesheet is the theme, and it is four files

`src/styles/index.css` is the only file `astro.config.mjs` names, and it
declares the order of the rest — `tokens.css`, `chrome.css`, `content.css`.

**`@layer base, starlight, theme, components, utilities, ripple;` is the line
everything rests on.** A later cascade layer beats an earlier one whatever the
selector specificity, so every rule we write wins over Starlight without a
single `!important`. Two consequences that are not obvious:

- **`@astrojs/starlight-tailwind` rewrites every `--sl-color-*` from Tailwind's
  own palette, inside `@layer utilities`.** If `tokens.css` were imported before
  it, or sat in an earlier layer, the whole theme would silently revert to zinc
  and indigo. That is the only reason the `ripple` layer exists.
- **A Tailwind utility written in one of our components lands in `utilities` and
  therefore loses to anything in `ripple`.** The line that keeps them apart:
  rules in `ripple` target Starlight's own markup, which we do not control the
  classes of; our own components are styled with utilities.

Tailwind rewrites that `@layer` statement on the way out — the emitted CSS says
`@layer starlight,theme,components;` and orders the rest by where their blocks
first appear. That is a correct optimisation and the order survives it, but it
means the guarantee now lives in the *import order* of `index.css`. Reordering
those imports is not cosmetic.

**Overriding Starlight's components was the wrong first instinct and mostly
avoided.** `starlight-theme-exquisitus` — the theme held up as doing much more
than a palette swap — is six CSS files and exactly one component override. What
read as "still flat old Starlight" here was never the colours; it was the
*shapes*: square corners, a solid accent slab for the current page, a search
control shaped like a button rather than an input, links with no resting
affordance. All four are reachable from a stylesheet, and the house answer to
all four is the same one — a hairline, a radius from `AppRadius`, a tonal fill,
no shadow.

**Starlight has already drawn most of the lines, one element up.** The first
version of this pass added a bottom border to `.header` and a rail to the
sidebar's nested `ul`, and both appeared as a *second* line a pixel from the
first: `PageFrame.astro` borders the wrapper around `.header`, and
`SidebarSublist.astro` rails `ul ul li` rather than the `ul`. Because the
hairline variables are already pointed at `--border` in `tokens.css`, those
dividers were the right colour before anything was written — so the rule is to
check for an existing one before adding a divider anywhere. The same applies to
the mobile contents strip and the panel above the page footer.

`tokens.css` carries the hexes verbatim from `globals.css`, the same way that
file carries them from `packages/ripple_theme/lib/src/app_tokens.dart` in the
app. A diff between the three is a real diff. But three things make the
mapping a translation, and each is a way to get it silently wrong:

- **Starlight is dark-first and the landing page is light-first.** Starlight
  puts dark in `:root` and light in `:root[data-theme='light']`; the site does
  the opposite. The blocks here are in the reverse order to their source, and a
  value moved across without being swapped is a value in the wrong mode.
- **The theme switch is a different mechanism.** Starlight writes `data-theme`
  on the root element; the landing page uses next-themes and a `.dark` class.
  `@astrojs/starlight-tailwind` redefines Tailwind's `dark:` variant against
  `[data-theme=dark]`, so a class list pasted from a landing-page component
  behaves — but a hand-written `.dark` selector will never match.
- **`--sl-color-white` is not white and `--sl-color-black` is not black.** They
  are roles — "furthest from the page" and "the page" — and they swap actual
  colours between modes.

**The one deliberate inversion of Starlight is the whole reason it looks like
itself.** The house rule is that *the page is the grey one and a card sits
lighter on it, in both modes*. Starlight's dark already agrees; its light does
not — a white page with a faintly grey nav, which is the dent the rule exists
to avoid. So `--sl-color-bg` points at `--background` and both chrome surfaces
at `--card`, which fixes light and leaves dark alone.

Starlight's grey ramp has seven steps and the site has three. The gaps are
`color-mix`ed between the two anchors rather than invented, so the ladder stays
tied to the same hexes. The same trick does the aside colours in one formula
instead of a table per mode: `-low` mixes toward the page and `-high` toward
the text, and since those two swap places between modes, one expression is
correct in both.

Asides are keyed by hue rather than by meaning — note is blue, tip is purple,
caution is orange, danger is red — so the app's own `AppStatus` colours land on
them by name. A caution here is the same yellow as a caution in the app's
messages panel.

**The file is deliberately unlayered.** Starlight's props live in
`@layer starlight.base`, and unlayered CSS beats layered CSS regardless of
order — that is what makes a plain `customCss` file an override at all. Adding
Tailwind brings a `@layer` declaration with it, and that is the one change that
could quietly stop these rules from winning.

## starlight-theme-obsidian was tried and does not work

It is worth knowing so nobody spends an afternoon on it twice. The theme and
its `starlight-site-graph` dependency were both last published **2025-08-31**,
against Starlight 0.33; Starlight is now 0.42 and Astro is 7.x. Installed
against current versions it fails at `astro:config:setup`:

```
[AstroUserError] Invalid options passed to "starlight-site-graph-integration"
  Hint: Invalid input: expected map, received object
```

Its peer range is an open `>=0.33.0`, so nothing warns at install time. It also
overrides five Starlight components, which is the most version-fragile surface
there is. Since its colours were going to be replaced by the theme above
anyway, what it was actually buying was the graph and backlinks — and that is
the half that is broken.

## Versioning is wired but not switched on

`starlight-versions` is installed, the `versions` collection is declared in
`src/content.config.ts`, and the whole path has been run end to end once
against this Starlight. The plugin call in `astro.config.mjs` is commented out,
together with its import; the two are uncommented as a pair.

**It refuses an empty list** — *"At least one version of the documentation must
be defined"* — and naming a slug is not registration, it is a snapshot: the
next build **copies `src/content/docs/` into `src/content/docs/<slug>/` and
leaves it in the source tree** to be committed. Naming one today would freeze
the current placeholder set as the documentation for a shipped release and
publish it at `/1.2/`. The first slug belongs at the moment the first real
version is superseded.

That a build writes into `src/` is worth remembering on its own: it dirties the
working tree the first time a slug appears, and the file it writes is the
frozen copy, not a cache.

## i18n is prepared, with one language in it

`defaultLocale: 'root'`, so English has no `/en/` prefix. Adding a language is
two things and neither is a restructuring: an entry beside `root` in
`astro.config.mjs`, and a directory under `src/content/docs/` named for its
key. Untranslated pages fall back to the default locale rather than 404, so a
language can be added and filled in gradually. Starlight's own UI strings live
in `src/content/i18n/<lang>.json` and that collection is already declared.

## Two components are overridden, and only two

`SiteTitle`, because the name of the product is in it. Starlight renders
`title` as a single run of text in the accent colour, which produces "Ripple
Effect" in indigo — a different name in a different shape from the one on every
other surface. The app's rule is that the underscore is coloured rather than
swallowed, and the mark is drawn from the same three-ring table as
`apps/editor/lib/src/widgets/app_brand.dart` rather than imported, because there is no logo
file to import. `title` in the config stays "Ripple Effect": that is what
belongs in a `<title>`, a search result and a browser tab.

`ThemeSelect`, because Starlight's is a three-option `<select>` and the landing
page's is a two-state icon button, and the same product offering the same
setting through two different affordances is exactly the seam this pass exists
to close. It writes Starlight's own `starlight-theme` key and `data-theme`
attribute, so the inline `ThemeProvider` still applies the choice before first
paint; nothing re-implements persistence.

**The cost is the "Auto" option and it is a real loss**, not a tidy-up: a reader
who wants the docs to follow their operating system can no longer say so, and
clearing the preference needs devtools. The landing page has always had that
limitation, which is the trade — restoring it means a three-state control on
both sites, not just this one.

Everything else was reached with CSS. An override is a component frozen at the
version it was copied from, and each is a thing to re-read at every Starlight
upgrade; these two earn it because neither is reachable from a stylesheet.

**The splash hero is the case worth knowing about**, because overriding it was
the obvious move and the wrong one. Its buttons are `<LinkButton>`, which is
also what a button in prose is — so styling `.sl-link-button` fixes the hero and
every other button at once, with no fork. Only the *shape* was ever wrong.

**A `<button>` in our own markup needs `bg-transparent` spelled out.** Only
Tailwind's theme and utilities are imported here, not Preflight, so a button
keeps the user agent's `buttonface` fill and renders as a grey lozenge. The
theme toggle shipped looking exactly like that until it was screenshotted.

## llms.txt is generated, and it is in the header

`starlight-llms-txt` builds three files out of these same pages at build time
— `/llms.txt`, an index with a description and the links; `/llms-full.txt`,
every page as one file; `/llms-small.txt`, the same with the asides and the
tutorials stripped — plus one custom set, `Reference`, which is
`reference/**` alone: the node catalog, the MCP tools and the Python API,
which is what an assistant writing against the app actually wants and is
about a fifth of the whole.

**Nothing in it is a second copy.** Every one of the three is rendered from
the pages the site serves, so a page edited is these edited, and the rule
that the app's prose is the source of these pages holds one level further
down without anything being restated. The `description` and `details` in
`astro.config.mjs` are the only prose written *for* these files, and they say
the two things a model gets wrong unprompted: that the Python is a subset and
how a component attribute is read.

The app's end of this is `apps/editor/lib/src/docs_links.dart` in the app repository —
the table of every page the app links, and the reason **every MCP tool
description ends with a link to its own section of `reference/mcp-tools`**.
That is what makes the file worth generating: an assistant is handed a page,
not asked to crawl for one. It also means the tool list and the page are now
checked against each other by a test over there
(`apps/editor/test/docs_links_test.dart`), which reads the `### \`tool_name\`` headings
off this page — so a tool added to the app and not to this page fails the
app's suite. Keep the headings spelled that way.

**The two links in the header are in `social`, which they are not.** Starlight
has one slot for a row of icon links and the alternative was overriding
`SocialIcons.astro` for two anchors — a third component frozen at the version
it was copied from, against the rule two sections up. The costs are that they
come out with `rel="me"` on them, which is meaningless on a same-origin text
file and harmless, and that Starlight labels a social icon with an `sr-only`
span: right for the GitHub mark, not enough for two documents drawn as two
document-ish glyphs. So `chrome.css` gives those two a resting tooltip on
hover and on focus, and its content is `attr(href)` rather than a string —
the label *is* the filename, and a hand-written one that disagreed with the
link would be the only way to get this wrong.

## Code blocks are configured, not styled

Expressive Code composes its own rules at build time from values, and a
stylesheet cannot reach most of them — so the frame is described in
`astro.config.mjs` under `expressiveCode.styleOverrides`, in the same tokens as
everything else: the card surface, the hairline, the small radius, no shadow.
Not every key gets through; Starlight sets some of them itself afterwards, and
`frames.editorBackground` is one of those. It lands on `--card` anyway.

The syntax colours are deliberately left to Shiki's defaults. The app's Python
editor has a palette of its own and matching it is real work; a half-matched one
would be worse than an honest borrowed one.

**`astro build` does not invalidate the Expressive Code stylesheet, and the
failure looks like something else entirely.** Change `styleOverrides`, rebuild,
and the emitted file gets a new content hash while the `<link>` in the HTML
keeps the old one — so the stylesheet 404s and every code block loses its
frame, its background and its copy button in one go. It reads exactly like a
config that broke Expressive Code, and it is a cache. `rm -rf dist .astro
node_modules/.vite` before believing anything about a code block.

## Fonts are self-hosted, and that is load-bearing

Geist and Geist Mono come through Fontsource rather than from Google, which is
the same choice `next/font` makes on the landing page. The site's privacy page
states it as a fact about the whole property — "reading a page here sends no
request to Google Fonts" — so a docs site that pulled a stylesheet from
`fonts.googleapis.com` would make that sentence untrue.

## The content

Six sidebar groups, each a directory under `src/content/docs/`, each ordered
by `sidebar.order` in its pages' frontmatter — a page is listed by being
written, and `astro.config.mjs` names only the groups. *Start here* is the
intro, kept to one screen of what the tool is and links onward — the file
formats live on the workspace page, the packages on the open-source page,
the signing story on the installing page, because each was tried on the
intro first and read as the wrong kind of information there; *Overviews* is
one page per feature, in roughly the order somebody meets them; *Tutorials*
builds things; *Setup* is what happens outside the app — installing, and an
MCP client — written as a flow to follow rather than a mechanism to
understand; *Reference* is the node catalog, the MCP tools and the Python API, the
Python one level deeper because a reference is grouped by what it references
(the group is labelled in the config, since an autogenerated subdirectory
would be labelled `python`, lowercase; the nodes and MCP pages are named by
slug beside it). The MCP page is `kMcpTools` transcribed — every tool's
description and every argument's, in the wire's own words with the reference
boilerplate stated once at the top — so it is re-read against `wire.dart`
whenever a tool is added or an argument reworded, and the count in its
frontmatter and on the setup page moves with it;
*About* is the licence and the open-source packages, including the one that
is not ours.

Two claims deliberately not made anywhere: that nothing leaves the machine
(a paid tier with cloud-hosted writing help is planned, and it was never the
intro's fact to state), and what the interpreter is compiled to — the Python
page says a sandbox exists and where the app reports its limits, not how it
is built.

**Every fact on a page is lifted from the app's own prose**, not written
fresh — `README.md`, `CHANGELOG.md`, `docs/specs/*.md`, the per-feature
`CLAUDE.md`s, the tool descriptions in `kMcpTools`, the help strings the
Python builtins are registered with. The landing page's reason applies with
more force here: a doc that paraphrases its product describes a slightly
different one, and a reader of *documentation* will act on the difference.
When the app and a page disagree, the page is wrong. The landing page's four
things the site must not say — not open source, exact about signing, no
price, no invented numbers — apply to every page here too.

One thing the README still gets wrong and these pages do not: choice text
lives **on the node, per language**, not on the wire. The wire's caption is
an annotation for the author, and no reader sees it. And one thing no source
says outright, read off the code: a new passage is named
`<board>-<title>.loc.narr.bdl` and made beside its board.

### Screenshots

`src/shots.ts` is the shot list and `src/components/Shot.astro` draws one —
the landing page's `screenshots.ts` + `screenshot.tsx` in Astro, with the
same three states decided by which files exist under `src/assets/screenshots/`:
neither file draws the brief in a dashed frame, one file renders in both
themes, both render as a pair with one hidden per theme. There is no `theme`
prop, for the reason the landing page's component has none.

The pair is hidden with Starlight's own `light:sl-hidden` / `dark:sl-hidden`
utilities, keyed on `[data-theme]`. A Tailwind `dark:` variant would also
work here and would be a second spelling of the same thing.

**A shot is drawn at its own size, not the protocol's.** The captures are not
all 1600×1000 — the component editor is wide and short, the file tree nearly
square — so the component passes no `width`/`height` and lets Astro read each
file's dimensions off the import. And `h-auto` on the `<img>` is load-bearing:
this site skips Tailwind's preflight, so nothing resets the `height`
attribute Astro emits, and `w-full` alone stretched every shot to it.

**Thirty-three slots are commented out for the first deploy** — every
`<Shot>` whose capture does not exist yet, wrapped as `{/* TODO(shots): … */}`
so the site goes online without a page of dashed frames. Uncomment each as
its file lands under `src/assets/screenshots/`; `grep -rn "TODO(shots)"` is
the list. The eight the landing page already had render as normal.

**A misspelt `name` fails the build, not `astro check`.** The component's
props are typed, but an MDX page's use of them is not checked, so the guard
is a thrown error in the component naming the shot. Pages that use `<Shot>`
are `.mdx` for the import; pages that do not stay `.md`.

**The nodes reference is generated, and so is the table behind it.**
`reference/nodes.mdx` and `src/node-types.ts` are both written by `melos run
docs:nodes` in the app repository (`apps/editor/test/tool/generate_node_docs_test.dart`),
out of `buildNarrativeRegistry()` and `buildMacroRegistry()` — a card's prose
lives on its prototype, where the app shows it in *About this node*, and the
page is that prose laid out. **Do not edit either by hand**: the next run puts
it back. A wording change on the page is a wording change in
`apps/editor/lib/src/graph/prototypes.dart`, and the sections come out in the order the
Create menu offers them, under the categories it groups them by.

What is *not* about one card is hand-written here, in `src/node-prose/`:
`preamble.md` is everything above the first heading and `<category>.md` — only
`lists.md` and `maps.md` today — is the paragraph under a category's heading.
Those files are outside `src/content/`, so Astro never serves them as pages of
their own. Rerun the generator beside `docs:node-shots` when a card changes,
and commit both results on this side.

**`NodePreview` is `Shot` for one card.** It reads `src/node-types.ts` —
`<NodePreview
type="…">` fails the build on a type not in it, and looks for
`src/assets/screenshots/nodes/<type>-<dark|light>.png` — the card alone,
cropped out of the canvas, at a third of the page's width. No manifest entry
per card: the brief is the same sentence forty times. **These are not
captured by hand.** `melos run editor:docs:node-shots` in the app repository
(`apps/editor/test/tool/generate_node_shots_test.dart`) renders every card the two
palettes offer through the real `GraphViewer`, in both themes, with the
machine's fonts loaded, and writes the eighty files here — two per type, and
it names any file left over from a type that has gone; rerun it when a card
changes or one is added, and commit the result on this side. It is on the
app's release checklist, since a release is when cards have changed.

Several slots are the landing page's shots exactly, and their briefs say so.
Copy those from `../public/screenshots/` rather than capturing them twice —
a copy, not a symlink, because the two sites share a checkout and nothing
else, and Vercel builds this one from its own root directory. The capture
protocol is the landing page's, `../docs/screenshots.md`.

## What is deliberately not here

- **React.** Tailwind is in, so a class list pasted from a landing-page
  component means the same thing on this side — which is what "reuse the Velora
  components" mostly amounts to, since the ones worth reusing are presentational
  and their value is the class list. Nothing yet needs a client island, and
  Starlight's chrome is Astro. `astro add react` is the one command when a
  component arrives that genuinely has state.
- **A link back to the landing page.** The navbar and footer over there point
  here — `siteConfig.links.docs`, one string — and the download icon in this
  header points at `ripplefx.app/download`. Nothing else crosses over; the two
  sites share a checkout and a token block and that is all.
