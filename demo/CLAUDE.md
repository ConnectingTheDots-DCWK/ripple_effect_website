# demo

**The City of Elsenmar, played in a page**, at `demo.ripplefx.app`: the
example project as the editor's Export → Campaign writes it, played by the
engine's web component through the two published packages,
[`@ripplefx/player`](https://www.npmjs.com/package/@ripplefx/player) and
[`@ripplefx/soundscape`](https://www.npmjs.com/package/@ripplefx/soundscape).
Pictures, the four soundscapes, the dice, both languages.

A fourth application in this repository, like `docs-site/` and `legal/`: its
own Vercel project with this directory as its Root Directory, its own
lockfile, nothing shared with the landing page. Plain Vite and TypeScript
rather than Astro, because the page is one screen that a script redraws, and
it is written the way the bindings' own `examples/player` is: a developer
reading this source sees the packages used and nothing else.

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # tsc, then vite build into dist/
pnpm preview    # dist/, under vercel.json's headers
```

## The bundle

`public/the-city-of-elsenmar/` is the compiled campaign, **committed as it is
written and never edited by hand**, its `media/` in Git LFS (`.gitattributes`).
It is served from that folder while the page is at the root of the domain: the
bundle's paths stay the bundle's, and the address a reader sees has nothing
after the domain.

It is made in the application repository, by the engine's own compiler — the
one `melos run campaign:compile` runs — into a cleared folder:

```sh
# in ripple_effect, with the website submodule at this branch
cargo build --release -p ripple-compiler --bin compile
rm -rf website/demo/public/the-city-of-elsenmar
target/release/compile examples/tabletop/the_city_of_elsenmar \
  website/demo/public/the-city-of-elsenmar --generator "ripple_effect demo"
```

Recompile when the example changes, and when an engine release moves the
bundle format, together with the bump of the two packages in `package.json`:
a bundle newer than the engine is refused at load, which is the failure to
expect if only one of the two moves.

## What it keeps, and what it sends

**Nothing, and nothing.** No cookie, no `localStorage`, no analytics script,
no request off this origin: the engine, the bundle, the fonts (Geist, from
`@fontsource-variable`, bundled) and the media are all files of this
deployment. The page's start screen says so, and the Content-Security-Policy
in `vercel.json` is what holds it — `default-src 'self'` — so that a later
change adding a third-party request fails in a browser before it ships. The
light/dark mode follows `prefers-color-scheme` rather than a switch, because a
switch would have to be remembered. A change to any of this is a change to the
published Privacy Notice first (`legal/README.md`).

## Traps paid for

- **Vite inlines a small `.wasm` as a `data:` URL, and the CSP refuses it.**
  Two of jco's shim modules are under Vite's 4 kB inline limit; inlined, they
  are fetched from `data:` and `connect-src 'self'` blocks the fetch, so the
  campaign never opens — in a production build only, since `vite dev` does not
  inline. `assetsInlineLimit` in `vite.config.ts` keeps every module a file.
  `vite preview` is handed `vercel.json`'s headers for exactly this reason:
  `pnpm preview` is the build under production's policy.
- **A soundscape that seems not to start usually has not been allowed to
  yet.** Handover is sequential (`host-audio-system.md` §3 in the application
  repository): the leaving soundscape fades out over its own `fadeOut` — five
  seconds for *gates* and *combat* — and only then does the next begin. A test
  that clicks on every second never hears the shelter's soundscapes. That is
  the engine's rule, not the page's.
- **`"use components"` warnings in the build** are jco's directive in the
  package's generated glue, harmless; the bindings' issue #8.

## The page's own words

The chrome follows the language the reader picked for the story — English or
Italian, a table at the top of `src/main.ts` — and the first pick is the
browser's own, falling back to the project's default. The story's words are
the author's, from the bundle. The house tokens in `src/style.css` are copied
from `src/app/globals.css` verbatim, as `docs-site/` copies them.

## Deploying

A Vercel project over this repository: Root Directory `demo`, **Git LFS
switched on** (or the bundle's pictures and music are pointer files), the
domain `demo.ripplefx.app`. `vercel.json` names the framework, the commands
and the headers.
