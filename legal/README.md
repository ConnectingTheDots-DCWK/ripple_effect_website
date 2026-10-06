# legal — legal.ripplefx.app

The agreements and notices that govern Ripple Effect, the website and the
hosted service. **The Markdown in `en/` is the document**; everything else
here renders it.

A third Vercel project over this repository, like `docs-site/` is a second —
Root Directory `legal`, framework Astro, domain `legal.ripplefx.app`. It
shares this checkout and nothing else: no dependency on the landing page, no
lockfile in common, and its own `pnpm-workspace.yaml` so an install here is
not an install into the root.

## Public URLs

| URL | What it is | Aliases |
| --- | --- | --- |
| `/eula/` | End-User Licence Agreement — the application on your own machine | `/licence`, `/license` |
| `/terms/` | Terms of Service — this site and the hosted service | `/tos` |
| `/privacy/` | Privacy Notice | `/privacy-policy` |
| `/subprocessors/` | Sub-processors | `/sub-processors` |
| `/v/<slug>-<version>/` | One version, frozen | |

**The slug is the link to give out.** It renders whatever `manifest.json`
names as current, so it survives a version bump. **The `/v/` path is the link
to record.** It renders one version and never changes again — which is what
makes "accepted version 1.0 on 15 October 2026" a statement anybody can go and
check. Nothing may be removed from `v/` once it has been published, and the
scheduled link check below is what notices if something is.

**A version freezes when it takes effect, or when somebody first accepts it —
whichever comes first.** Before either, a published version binds nobody and
is evidence of nothing, so correcting it in place is a correction rather than
a rewrite of the record. Version 1.0 of all four documents was corrected that
way before its 15 October 2026 effective date, to describe usage statistics,
account e-mail through Resend and the self-hosted sign-up check. After either
moment, a change is a new version, as below.

## Layout

```
manifest.json          the index — the one place a version number is stated
en/<slug>/<version>.md the documents themselves
it/                    reserved; see "Adding Italian"
src/                   the Astro site that renders them
```

Every version is its own file and nothing is ever overwritten. Bumping a
document is a new file plus one entry in `manifest.json`; the superseded text
stays in the tree and stays served at its own `/v/` path.

**`manifest.json` is a contract with the application, not just with this
site.** `apps/editor/lib/src/legal_documents.dart` carries the same version
numbers as literals, and a test in that repository checks the two agree. The
app cannot read this file at runtime — it ships without the submodule — so
the numbers being in two places is deliberate and the test is what keeps them
in step.

A document that is **drafted but not published** is simply absent from the
manifest — and, because this repository is public, is not in it at all: an
unserved file here would be published anyway, one `git clone` away. The DPA
is the one today; it is kept privately and sent directly to a business
customer who asks. There is no
`published: false` flag, because a flag somebody has to remember to read gets
read wrong once and a document that is not in the index cannot be rendered by
routes built from the index.

## Versions

`major.minor`, per document, independently.

- **Major** — the terms moved. Thirty days' notice, and acceptance is asked
  again when it takes effect. Set `effective` to a date in the future when the
  new version is published; the page says so until that date passes, and the
  previous version is the one that binds in the meantime.
- **Minor** — the words moved. Published, no notice period, no re-ask.

Whichever it is, the amendment article in each document is what the reader is
owed, and it is the same in all of them.

## Bumping a document

1. Copy `en/<slug>/<old>.md` to `en/<slug>/<new>.md` and edit it. Update its
   front matter: `version`, `effective`, and the *Last updated* line in the
   prose.
2. Add a `versions` entry in `manifest.json` and move `current` to it.
3. **Do not touch the old file.** Its `/v/` path is a promise.
4. If the bump is major, the application's `LegalDocument` version literal
   moves with it — a release of the app, not just of this site.

## Adding Italian

The directory and the manifest's `languages` array are here; nothing else is.
When `it/<slug>/<version>.md` exists, two things are added:

1. Routes under `/it/`, from the same manifest entries.
2. A geo rewrite per slug in `vercel.json`, serving Italian to Italy and
   English to everyone else:

   ```json
   {
     "source": "/terms/",
     "has": [{ "type": "header", "key": "x-vercel-ip-country", "value": "IT" }],
     "destination": "/it/terms/"
   }
   ```

   The `has` rule must come **before** the English fallback for each slug —
   first match wins.

**The rewrite is not in `vercel.json` today, on purpose.** A rewrite pointing
at a path that does not exist is not a dormant rule, it is a 404 for every
Italian visitor. The slot is reserved by the directory and the documented
block above, not by shipping the rule early.

Note also that the English version is the operative one for everyone. An
Italian translation is a courtesy and says so in its own header; it does not
become the binding text by being served.

## Checking it

```sh
pnpm install
pnpm build        # every slug and every frozen path
pnpm check        # astro check
```

`.github/workflows/legal-links.yml` fetches every living slug and every frozen
path, including superseded ones, weekly and on dispatch, and opens an issue on
anything that is not a 200. It exists because nothing else checks these URLs:
the application's test resolves against a submodule that its CI never checks
out, and a file existing in this tree is not a page existing at the origin.

## Not legal advice

These documents were adapted from a reviewed set and have not themselves been
through a professional review. That review is owed before anybody is asked to
accept them.
