// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import starlightLlmsTxt from 'starlight-llms-txt';
// Commented out together with its entry in `plugins` below — the two are
// uncommented as a pair. See the note there for why not yet.
// import starlightVersions from 'starlight-versions';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.ripplefx.app',

	// Tailwind 4 is a Vite plugin rather than an Astro integration. It is here
	// so that a class list pasted from a landing-page component means the same
	// thing on this side — see `src/styles/index.css` for the cascade-layer
	// order it has to fit into, which is the part that breaks quietly.
	vite: { plugins: [tailwindcss()] },
	integrations: [
		starlight({
			title: 'Ripple Effect',
			favicon: '/favicon.svg',
			description:
				'Documentation for Ripple Effect — a branching narrative and game design tool that keeps a story as ordinary files on your own disk.',

			// The *support* repository, not the source one. The source is private,
			// so a link to it is a 404 for whoever clicks it — the landing page
			// makes the same choice for the same reason, and so does the app.
			// The download link lives here rather than on the splash, so it is on
			// every page — a reader who arrives on a reference page from a search
			// has the same route to the app as one who arrived at the front door.
			//
			// The last two are not social links and are in here anyway, which is
			// the trade: Starlight's header has exactly one slot for a row of
			// icon links, and the alternative is overriding `SocialIcons.astro`
			// — a third component frozen at the version it was copied from, for
			// two anchors. `llms.txt` is a page of this site like any other and
			// belongs beside the links to the rest of it.
			social: [
				{
					icon: 'download',
					label: 'Download the app',
					href: 'https://ripplefx.app/download',
				},
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/ConnectingTheDots-DCWK/ripple_effect_support',
				},
				{
					icon: 'list-format',
					label: 'llms.txt — this site as an index for AI assistants',
					href: '/llms.txt',
				},
				{
					icon: 'document',
					label: 'llms-full.txt — every page as one plain-text file',
					href: '/llms-full.txt',
				},
			],

			// One entry, because the order of the rest is declared inside it —
			// including the `@layer` line that everything else depends on.
			customCss: ['./src/styles/index.css'],

			// **`root` rather than `en`, so English has no `/en/` prefix.** Adding a
			// second language is two things and neither of them is a
			// restructuring: an entry beside this one, and a directory under
			// `src/content/docs/` named for its key. Untranslated pages fall back
			// to `defaultLocale` rather than 404, so a locale can be added and
			// filled in gradually. UI strings live in `src/content/i18n/<lang>.json`
			// and the collection for them is already declared in
			// `src/content.config.ts`.
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
			},

			// **Versioning is wired but not yet switched on, and the line below is
			// the whole of switching it on.**
			//
			// `starlight-versions` refuses an empty list — "At least one version of
			// the documentation must be defined" — and adding a slug does not
			// merely register it: the next build *copies the current
			// `src/content/docs/` into `src/content/docs/<slug>/`* and leaves it
			// there, in the source tree, to be committed. It is a snapshot, taken
			// at the moment you name it.
			//
			// So naming one today would freeze the current set as the
			// documentation for a shipped release and publish it under that slug.
			// The first slug belongs at the moment the first real version is
			// superseded — and the first version these pages went live for is
			// 1.4, since the 1.3 pages were written but never deployed. Name
			// `1.4` here as 1.5 opens.
			//
			// What is already paid for is everything that is awkward to retrofit:
			// the dependency is pinned, the `versions` collection is declared in
			// `src/content.config.ts`, and the whole path has been run end to end
			// once to check that it builds against this Starlight.
			plugins: [
				// `/llms.txt`, `/llms-full.txt` and `/llms-small.txt`, built from
				// these pages at build time.
				//
				// **The point is that an assistant does not have to crawl.** The
				// app hands one a link to a page of this site in every MCP tool
				// description — `lib/src/docs_links.dart` in the app repository is
				// the table of them — and an agent that wants the rest of the
				// context rather than one page has one file to fetch instead of
				// twenty-eight. Nothing here is a second copy of the content:
				// every one of these is generated from the same pages the site
				// serves, so a page edited is these edited.
				starlightLlmsTxt({
					projectName: 'Ripple Effect',
					description:
						'Ripple Effect is a branching narrative and game design tool. A ' +
						'project is an ordinary folder on the author’s own disk: boards ' +
						'are JSON, passages are Markdown, components are JSON, each ' +
						'namespaced inside an ordinary extension. A story is drawn as a ' +
						'graph of typed nodes, played by a Rust engine, scripted in a ' +
						'Python subset, and exported either as a project copy or as a ' +
						'compiled campaign.',
					details: [
						'Notes for reading this documentation:',
						'',
						'- The *Overviews* are one page per feature, in roughly the order ' +
							'somebody meets them; the *Reference* pages are the node ' +
							'catalog, the MCP tools, the diagnostic codes and the Python ' +
							'API.',
						'- Python in this app is a restricted subset, not CPython. A ' +
							'component attribute is read as `component("X")["attr"]` and ' +
							'never as an attribute.',
						'- The app can be driven over MCP. Every tool it offers carries a ' +
							'link back to its own section of the MCP reference here, so a ' +
							'connected assistant never has to guess where a page is.',
					].join('\n'),
					// A subset worth asking for on its own: an assistant writing
					// against the app wants the catalog, the tools and the API, and
					// not the tutorial it is not following.
					customSets: [
						{
							label: 'Reference',
							description:
								'the node catalog, the MCP tool list, the diagnostic codes ' +
								'and the Python API',
							paths: ['reference/**'],
						},
					],
					// The front page first, then what the tool is, before anything
					// about one feature of it.
					promote: ['index*', 'start-here/**'],
					// Last in the long file rather than absent: true, and true of
					// the licence rather than of the software.
					demote: ['about/**'],
					// `llms-small.txt` is the budget version, and these are what a
					// model can do without when the budget is the point.
					exclude: ['about/**', 'tutorials/**'],
					optionalLinks: [
						{
							label: 'Download Ripple Effect',
							url: 'https://ripplefx.app/download',
							description: 'installers for Linux, macOS and Windows',
						},
						{
							label: 'Support repository',
							url: 'https://github.com/ConnectingTheDots-DCWK/ripple_effect_support',
							description: 'issues, discussions and the licence',
						},
					],
				}),
				// starlightVersions({ versions: [{ slug: '1.3' }] }),
			],

			/*
			 * Code blocks are Expressive Code, which is themed through values
			 * rather than through CSS — its own rules are composed at build time
			 * and a stylesheet cannot reach most of them. So the frame is
			 * described here in the same tokens as everything else: the card
			 * surface, the hairline, the small radius, and no shadow.
			 *
			 * The syntax colours are deliberately left to Shiki's defaults. The
			 * app's Python editor has a palette of its own and matching it is a
			 * real piece of work; a half-matched one would be worse than an
			 * honest borrowed one.
			 */
			expressiveCode: {
				styleOverrides: {
					codeBackground: 'var(--card)',
					codeFontFamily: 'var(--sl-font-mono)',
					borderColor: 'var(--border)',
					borderWidth: '1px',
					borderRadius: 'var(--radius-sm)',
					frames: {
						editorBackground: 'var(--card)',
						terminalBackground: 'var(--card)',
						editorActiveTabBackground: 'var(--card)',
						editorTabBarBackground: 'var(--background)',
						terminalTitlebarBackground: 'var(--background)',
						frameBoxShadowCssValue: 'none',
						tooltipSuccessBackground: 'var(--primary)',
						tooltipSuccessForeground: 'var(--primary-foreground)',
					},
					textMarkers: {
						insBackground: 'color-mix(in oklab, var(--go) 12%, transparent)',
						delBackground: 'color-mix(in oklab, var(--destructive) 12%, transparent)',
						insBorderColor: 'color-mix(in oklab, var(--go) 40%, transparent)',
						delBorderColor: 'color-mix(in oklab, var(--destructive) 40%, transparent)',
					},
				},
			},

			// Two, and only two. Everything else that needed changing was reached
			// with CSS from `src/styles/`, which is the cheaper tool: an override
			// is a component frozen at the version it was copied from, and each
			// one is a thing to re-read at every Starlight upgrade. These two earn
			// it because neither is reachable from a stylesheet — one is the
			// product's name and the other is a different control altogether.
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},

			// Six groups, each a directory, each ordered by `sidebar.order` in
			// its pages' frontmatter. A page is listed by being written; nothing
			// here has to be edited to add one — **except under Reference**,
			// whose pages are named one by one for the reason below. A page
			// written there and not named here is reachable by its path and by
			// search, and invisible in the menu, which is how the diagnostics
			// reference shipped the first time.
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start-here' } }] },
				{ label: 'Overviews', items: [{ autogenerate: { directory: 'overviews' } }] },
				{ label: 'Tutorials', items: [{ autogenerate: { directory: 'tutorials' } }] },
				{ label: 'Setup', items: [{ autogenerate: { directory: 'setup' } }] },
				{
					label: 'Reference',
					// One level deeper than the rest, because a reference is grouped by
					// what it references. An autogenerated subdirectory would be labelled
					// by its directory name — "python", lowercase — so the group is
					// named here and only its pages are autogenerated.
					items: [
						{ slug: 'reference/nodes' },
						{ slug: 'reference/mcp-tools' },
						{ slug: 'reference/diagnostics' },
						{ label: 'Python', items: [{ autogenerate: { directory: 'reference/python' } }] },
					],
				},
				{ label: 'About', items: [{ autogenerate: { directory: 'about' } }] },
			],
		}),
	],
});
