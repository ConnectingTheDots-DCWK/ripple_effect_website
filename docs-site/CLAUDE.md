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
them by name. A caution here is the same amber as a caution in the app's
messages panel. **Blue and purple are the ink, `--foreground`, not the
accent.** They pointed at `--primary` and `--brand` while those were the ink;
since Lamplight made the accent ember, an ember note would spend the chrome's
one hue on a tinted box, and the accent is a pointer rather than a paint.

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

## Two languages: English at the root, Italian under `/it/`

`defaultLocale: 'root'`, so English has no `/en/` prefix; Italian is the `it`
locale, and its pages are `src/content/docs/it/<slug>`, the same slug as the
English page they translate. **A page with no Italian file falls back to
English at the same `/it/` path, with Starlight's notice that it is not
translated yet** — so a language can be filled in gradually and no `/it/` link
404s. Every sidebar group and sub-group carries `translations: { it: … }` in
`astro.config.mjs`. Starlight's own UI strings in Italian are built in; the
`i18n` collection in `src/content.config.ts` is for overriding them, and is
empty.

**Four pages are English on purpose.** `reference/nodes` is generated from the
card prose on the definitions, which the app itself shows in English;
`reference/mcp-tools` transcribes the MCP wire, which stays English by rule;
`about/licensing` and `about/what-the-app-sends` restate legal texts whose
English version is the operative one (`../legal/README.md`, *Adding Italian*).
Do not translate them by hand: the first two would drift from their source at
the next regeneration, and the last two would read as a translation of terms
nobody has translated.

**The Italian is the app's Italian.** Translators work from a glossary built
out of `apps/editor/l10n/app_it.arb` and the house glossary
`tool/translation/context.md` in the app repository: *tu*, *lavagna* for board,
*scheda* for card, *passaggio* for passage, and every UI label exactly as the
Italian app shows it. A label the reader cannot find in their app is worse than
one left in English. An Italian page's internal links are `/it/<slug>/`; an
anchor into another page only survives if its heading is not translated (a
diagnostic code, an MCP tool), so cross-page links into translated prose carry
no fragment.

**A visitor from Italy, San Marino or the Vatican is sent to `/it/` on
arrival**, by the one rule in `vercel.json`: a 307 when `x-vercel-ip-country`
matches and the `Referer` is **not** this site. Arrival means a search result,
a link from elsewhere, a typed URL or the app's own *Learn more*; a click inside
the site — including choosing English in the language menu — is never
redirected, which is what makes the choice stick for the visit. It does **not**
stick across visits: someone in Italy who prefers English is offered Italian
again next time. Remembering it would take a cookie, and the Privacy Notice
says the site sets only technically necessary ones besides the coffee button's;
a new one is a change to that text first (`../legal/README.md`). Assets,
`/_astro/`, Pagefind, every file with an extension (`llms.txt`, the sitemap)
and the old `overviews/` and `setup/` redirect stubs are excluded from the
rule, so nothing but a page is ever sent to `/it/`. This is the mechanism the
legal site reserves for its own Italian, as a redirect rather than a rewrite
because the two languages have their own URLs here.

## Two components are overridden, and only two

`SiteTitle`, because the name of the product is in it. Starlight renders
`title` as a single run of text in the accent colour, and the app's wordmark is
the display name with the second word in the accent, beside the mark — the
shape every other surface has. The mark is drawn from the same three-ring table as
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

**The site is laid out by Diátaxis**: *Tutorials* to learn, *How-to guides*
to do a task, *Reference* to look something up, *Explanation* to understand
why, plus *Start here* and *About*. The conventions — how to tell the four
apart on this site, what a page of each looks like, the cross-linking rule —
are `docs/internals/docs-conventions.md` in the app repository, which is the
authority; what follows is what the configuration does about it.

**Every page is named in `astro.config.mjs` by slug, in its sub-group.** A
sub-group (*Boards*, *Python*, *The application*…) is a sidebar label and never
a directory, so a page can move between sub-groups without its URL changing:
`how-to/<task>`, `explanation/<topic>`, `reference/<thing>`. A page written and
not named there is reachable by its path and by search and invisible in the
menu — which is how the diagnostics reference shipped the first time. The one
real subdirectory is `reference/python/`, because its slugs predate the
restructure and the app links them; a future JS/TS reference gets a sub-group
beside it.

**Pages relate across types by links, not by sitting together.** Every how-to,
explanation and reference page ends with `## Related`, two to five pages of
*other* types; a tutorial ends with *Where to go next*. A feature is usually
four pages — the explanation, its how-tos, the reference they consult, a node
in the catalog — and the links are what make it one subject.

**A page that moves keeps its old URL as a redirect**, in `redirects` at the top
of `astro.config.mjs`, and a redirect is never removed: an installed build of
the app deep-links pages, and the oldest one in somebody's hands may be years
old. A redirect carries no `#fragment`, so an old anchor lands at the top of
the page. The app's own table of what it links is
`apps/editor/lib/src/docs_links.dart`; it moves with the site, and its test
resolves every entry against this directory.

Three reference pages are tied to the app and keep their slugs for it. The
MCP page is `kMcpTools` transcribed — every tool's description and every
argument's, in the wire's own words with the reference boilerplate stated
once at the top — so it is re-read against `wire.dart` whenever a tool is
added or an argument reworded, and the count in its frontmatter and on the
connect how-to moves with it. The diagnostics page has a heading per code,
which the messages panel links. The nodes page is generated, below.
*About* is the licence, the open-source packages, including the one that is
not ours, and what the app sends.

Two claims deliberately not made anywhere: that nothing leaves the machine
(the update check, the news and a crash report do, and it was never the
intro's fact to state — what *does* stay is said feature by feature, as the
spelling page and *What never leaves* say it of checking), and what the
interpreter is compiled to — the Python
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
`apps/editor/lib/src/graph/definitions.dart`, and the sections come out in the order the
Create menu offers them, under the categories it groups them by.

What is *not* about one card is hand-written here, in `src/node-prose/`:
`preamble.md` is everything above the first heading, `<category>.md` is the
paragraph under a category's heading, and `footer.md` is the page's
`## Related`, after the last card.
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
palettes offer through the real `GraphViewer`, in both themes, in the
house faces the app bundles, and writes the files here — two per type, and
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
