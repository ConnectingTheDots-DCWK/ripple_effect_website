// @ts-check
import { readFileSync } from 'node:fs';
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
	// Every page the Diátaxis restructure moved, so a link from an installed
	// build of the app (which deep-links these) or from anywhere else still
	// lands. A redirect carries no #fragment: an old anchor arrives at the top
	// of the page. Never remove one — a build that links it may still be out
	// there.
	redirects: {
		'/overviews/boards-and-nodes/': '/explanation/boards-nodes-and-macros/',
		'/overviews/components-and-entities/': '/explanation/components-and-entities/',
		'/overviews/console-variables/': '/explanation/console-variables/',
		'/overviews/exporting/': '/how-to/export-a-project-or-campaign/',
		'/overviews/host-callbacks/': '/explanation/host-callbacks/',
		'/overviews/passages-and-languages/': '/explanation/passages-and-translations/',
		'/overviews/playing-a-campaign/': '/reference/campaign-window/',
		'/overviews/python-scripting/': '/explanation/python-in-a-story/',
		'/overviews/reading-a-story-back/': '/explanation/reading-a-story-back/',
		'/overviews/soundscapes-and-sounds/': '/explanation/soundscapes-and-sounds/',
		'/overviews/state-machines/': '/explanation/state-machines/',
		'/overviews/the-workspace/': '/explanation/projects-are-folders/',
		'/overviews/updates-logs-and-support/': '/explanation/updates-logs-and-privacy/',
		'/overviews/version-control/': '/explanation/history-and-sharing/',
		'/overviews/working-with-an-ai-assistant/': '/explanation/working-with-an-assistant/',
		'/overviews/settings-language-and-accessibility/': '/reference/settings/',
		'/setup/installing/': '/how-to/install-the-app/',
		'/setup/connecting-an-mcp-client/': '/how-to/connect-an-mcp-client/',
	},

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
			editLink: {
        		baseUrl: 'https://github.com/ConnectingTheDots-DCWK/ripple_effect_website/edit/main/docs-site/',
      		},
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
				it: { label: 'Italiano', lang: 'it' },
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
						'- A compiled campaign is played outside the app through the ' +
							'engine\'s bindings for JavaScript/TypeScript, C/C++, C# and ' +
							'Dart. They share one API: a campaign, a session whose verbs ' +
							'each return an ordered list of effects (the turn last), and ' +
							'an optional player loop.',
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
								'the node catalog, the MCP tool list, the diagnostic codes, ' +
								'the Python API and the engine bindings',
							paths: ['reference/**'],
						},
						// What a programmer embedding the engine wants, and nothing
						// about authoring: the design, the shipping, the steps and
						// the four APIs.
						{
							label: 'Engine bindings',
							description:
								'playing a compiled campaign from your own program: the ' +
								'API design, how the engine ships, and the JavaScript, ' +
								'C/C++, C# and Dart bindings',
							paths: [
								'explanation/embedding-the-engine',
								'explanation/how-the-engine-ships',
								'how-to/play-a-campaign-in-your-program',
								'reference/engine-targets',
								'reference/binding-*',
							],
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
				// Weir — the spelling checker's rule language, on the style-rule
				// how-to — is no language Shiki ships, and borrowing one coloured
				// its brackets and its test lines wrong. The grammar is ours,
				// small, and mirrors the app's own Weir highlighter.
				shiki: {
					langs: [JSON.parse(readFileSync(new URL('./src/weir.tmLanguage.json', import.meta.url), 'utf8'))],
				},
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

			// Diátaxis: Tutorials to learn, How-to guides to do, Reference to look
			// up, Explanation to understand (docs/internals/docs-conventions.md in
			// the app repository). Every page is named here by slug, in its
			// sub-group: a sub-group is a sidebar label and never a directory, so a
			// page can move between sub-groups without its URL changing. A page
			// written and not named here is reachable by its path and by search,
			// and invisible in the menu, which is how the diagnostics reference
			// shipped the first time. Python is the one real subdirectory, because
			// its slugs predate this and the app links them.
			sidebar: [
				{ label: 'Start here', translations: { it: 'Inizia qui' }, items: [{ slug: 'start-here/what-ripple-effect-is' }] },
				{ label: 'Tutorials', translations: { it: 'Tutorial' }, items: [{ slug: 'tutorials' }, { slug: 'tutorials/your-first-story' }] },
				{
					label: 'How-to guides', translations: { it: 'Guide pratiche' },
					items: [
						{ label: 'Getting set up', translations: { it: 'Per iniziare' }, collapsed: false, items: [
							{ slug: 'how-to/install-the-app' },
							{ slug: 'how-to/connect-an-mcp-client' },
							{ slug: 'how-to/report-a-bug' },
						] },
						{ label: 'Projects and files', translations: { it: 'Progetti e file' }, collapsed: false, items: [
							{ slug: 'how-to/create-or-import-a-project' },
							{ slug: 'how-to/find-and-replace-in-project' },
							{ slug: 'how-to/arrange-the-workspace' },
							{ slug: 'how-to/keep-a-history-and-back-up' },
							{ slug: 'how-to/change-app-language-contrast-and-colour' },
						] },
						{ label: 'Boards', translations: { it: 'Lavagne' }, collapsed: false, items: [
							{ slug: 'how-to/work-on-the-canvas' },
							{ slug: 'how-to/order-jobs-before-a-passage' },
							{ slug: 'how-to/make-a-macro' },
						] },
						{ label: 'Passages and languages', translations: { it: 'Passaggi e lingue' }, collapsed: false, items: [
							{ slug: 'how-to/write-a-passage' },
							{ slug: 'how-to/limit-a-choice' },
							{ slug: 'how-to/time-a-choice' },
							{ slug: 'how-to/manage-languages' },
							{ slug: 'how-to/check-spelling-and-grammar' },
							{ slug: 'how-to/write-a-style-rule' },
						] },
						{ label: 'Data and state', translations: { it: 'Dati e stato' }, collapsed: false, items: [
							{ slug: 'how-to/use-components-and-entities' },
							{ slug: 'how-to/declare-console-variables' },
							{ slug: 'how-to/add-a-state-machine' },
						] },
						{ label: 'Sound', translations: { it: 'Suono' }, collapsed: false, items: [
							{ slug: 'how-to/add-sound-to-a-story' },
						] },
						{ label: 'Python', translations: { it: 'Python' }, collapsed: false, items: [
							{ slug: 'how-to/script-a-passage' },
							{ slug: 'how-to/turn-python-off' },
							{ slug: 'how-to/use-entities-from-python' },
						] },
						{ label: 'Playing and tracing', translations: { it: 'Riproduzione e tracciamento' }, collapsed: false, items: [
							{ slug: 'how-to/play-a-campaign' },
							{ slug: 'how-to/save-and-resume-a-campaign' },
							{ slug: 'how-to/trace-a-route' },
						] },
						{ label: 'Exporting', translations: { it: 'Esportazione' }, collapsed: false, items: [
							{ slug: 'how-to/export-a-project-or-campaign' },
							{ slug: 'how-to/export-for-a-player-without-python' },
						] },
						{ label: 'Host callbacks', translations: { it: 'Callback dell\'host' }, collapsed: false, items: [
							{ slug: 'how-to/declare-a-host-callback' },
						] },
						{ label: 'Embedding the engine', translations: { it: 'Integrare il motore' }, collapsed: false, items: [
							{ slug: 'how-to/play-a-campaign-in-your-program' },
						] },
					],
				},
				{
					label: 'Reference', translations: { it: 'Riferimento' },
					items: [
						{ label: 'Nodes', translations: { it: 'Nodi' }, collapsed: false, items: [
							{ slug: 'reference/nodes' },
							{ slug: 'reference/node-families' },
							{ slug: 'reference/canvas-rules' },
						] },
						{ label: 'MCP tools', translations: { it: 'Strumenti MCP' }, collapsed: false, items: [
							{ slug: 'reference/mcp-tools' },
							{ slug: 'reference/mcp-permissions' },
						] },
						{ label: 'Diagnostics', translations: { it: 'Diagnostica' }, collapsed: false, items: [
							{ slug: 'reference/diagnostics' },
						] },
						{ label: 'Python', translations: { it: 'Python' }, collapsed: false, items: [
							{ slug: 'reference/python' },
							{ slug: 'reference/python/components-and-entities' },
							{ slug: 'reference/python/console-variables' },
							{ slug: 'reference/python/sounds' },
							{ slug: 'reference/python/the-world' },
							{ slug: 'reference/python/sandbox' },
						] },
						{ label: 'Project files and formats', translations: { it: 'File e formati del progetto' }, collapsed: false, items: [
							{ slug: 'reference/project-files' },
							{ slug: 'reference/console-variable-declarations' },
							{ slug: 'reference/state-machine-file' },
							{ slug: 'reference/soundscape-file' },
							{ slug: 'reference/host-callbacks' },
							{ slug: 'reference/export-options' },
							{ slug: 'reference/passages' },
						] },
						{ label: 'The application', translations: { it: 'L\'applicazione' }, collapsed: false, items: [
							{ slug: 'reference/workspace-window' },
							{ slug: 'reference/campaign-window' },
							{ slug: 'reference/settings' },
							{ slug: 'reference/version-control' },
							{ slug: 'reference/session-log' },
							{ slug: 'reference/installers' },
						] },
						{ label: 'Embedding the engine', translations: { it: 'Integrare il motore' }, collapsed: false, items: [
							{ slug: 'reference/engine-targets' },
							{ slug: 'reference/binding-javascript' },
							{ slug: 'reference/binding-c-cpp' },
							{ slug: 'reference/binding-csharp' },
							{ slug: 'reference/binding-dart' },
						] },
					],
				},
				{
					label: 'Explanation', translations: { it: 'Spiegazioni' },
					items: [
						{ label: 'Boards and running a story', translations: { it: 'Lavagne e svolgimento della storia' }, collapsed: false, items: [
							{ slug: 'explanation/boards-nodes-and-macros' },
							{ slug: 'explanation/how-a-story-runs' },
							{ slug: 'explanation/reading-a-story-back' },
							{ slug: 'explanation/the-preview-is-the-shipped-story' },
						] },
						{ label: 'Passages and data', translations: { it: 'Passaggi e dati' }, collapsed: false, items: [
							{ slug: 'explanation/passages-and-translations' },
							{ slug: 'explanation/components-and-entities' },
							{ slug: 'explanation/console-variables' },
							{ slug: 'explanation/state-machines' },
							{ slug: 'explanation/python-in-a-story' },
							{ slug: 'explanation/soundscapes-and-sounds' },
						] },
						{ label: 'Exporting and host integration', translations: { it: 'Esportazione e integrazione con l\'host' }, collapsed: false, items: [
							{ slug: 'explanation/what-an-export-is' },
							{ slug: 'explanation/host-callbacks' },
							{ slug: 'explanation/working-with-an-assistant' },
						] },
						{ label: 'Embedding the engine', translations: { it: 'Integrare il motore' }, collapsed: false, items: [
							{ slug: 'explanation/embedding-the-engine' },
							{ slug: 'explanation/how-the-engine-ships' },
						] },
						{ label: 'The workspace, versions and the app', translations: { it: 'Lo spazio di lavoro, le versioni e l\'app' }, collapsed: false, items: [
							{ slug: 'explanation/projects-are-folders' },
							{ slug: 'explanation/history-and-sharing' },
							{ slug: 'explanation/updates-logs-and-privacy' },
							{ slug: 'explanation/unsigned-installers' },
							{ slug: 'explanation/accessibility-limits' },
						] },
					],
				},
				{ label: 'About', translations: { it: 'Informazioni' }, items: [{ slug: 'about/licensing' }, { slug: 'about/open-source' }, { slug: 'about/what-the-app-sends' }] },
			],
		}),
	],
});
