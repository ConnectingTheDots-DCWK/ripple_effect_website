# ripple_effect_website

The two sites for [Ripple Effect](https://github.com/ConnectingTheDots-DCWK/ripple_effect_support)
— a branching narrative and game design tool — in one repository, deployed
as two Vercel projects:

- **ripplefx.app**, the marketing site, at the root: Next.js 16, Tailwind
  CSS 4. The landing page, `/download`, `/pricing`, `/privacy` and the blog.
- **docs.ripplefx.app**, the documentation, under `docs-site/`: Astro +
  Starlight, with its own toolchain and its own `CLAUDE.md`. Vercel builds it
  from that directory as its Root Directory.

Everything below is about the marketing site.

## Running it

```sh
pnpm install
pnpm dev
```

`pnpm typecheck`, `pnpm lint` and `pnpm build` are the three checks.

## Environment

| | |
| --- | --- |
| `RIPPLE_EFFECT_EDITOR_RELEASES` | **Required for downloads.** A fine-grained PAT scoped to the editor's repository (`WilliamKarolDiCioccio/ripple_effect`, until it moves to the org) alone, `Contents: read`. Server-side only — no `NEXT_PUBLIC_` prefix, ever. Read by `/download` and the update routes and nothing else. |
| `RIPPLE_EFFECT_METADATA` | Optional. A fine-grained PAT with the `ConnectingTheDots-DCWK` organisation as its resource owner and no permissions beyond the metadata every token has. `/api/contributors` and `/api/engine` read public repositories with it, for the rate limit; without it they still work, at sixty requests an hour. Server-side only. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to the Vercel subdomain. |
| `NEXT_PUBLIC_WAITLIST_URL` | The hosted form the paid-tier waitlist button opens. Defaults to the live one; override to point it elsewhere. |

Without `RIPPLE_EFFECT_EDITOR_RELEASES` the site builds and runs; `/download` draws its four
platforms in a "not published yet" state. That is the same state a real
unpublished release produces, so it is worth looking at.

## Deployment

Vercel points at **this** repository directly, not at the app repository that
carries it as a submodule at `website/`. That sidesteps private-submodule
cloning entirely, and this repo is self-contained.

## Where the decisions are

[`CLAUDE.md`](CLAUDE.md) — why this looks the way it does, what was stripped
out of the template and why, and how the downloads work.
[`docs/screenshots.md`](docs/screenshots.md) — the capture protocol.
