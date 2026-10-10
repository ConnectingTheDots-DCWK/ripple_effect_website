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
to record.** Once that version is frozen it renders the same text for ever —
which is what makes "accepted version 1.0 at 14:02 on 3 March" a statement
anybody can go and check. Nothing may be removed from `v/` once it has been
published; `pnpm check` refuses a manifest that drops one, and the scheduled
link check below notices a path that stops resolving.

**Before a version is frozen, its `/v/` page says so** rather than claiming to
be fixed. A page that promised permanence while the text underneath it could
still be corrected would be the one sentence on this site a reader could be
misled by, so it is the one sentence the page does not contain.

**A version freezes when somebody first accepts it, or when its text is
declared final — and `frozen` in the manifest is how that is recorded.**
Before then, a published version binds nobody and is evidence of nothing, so
correcting it in place is a correction rather than a rewrite of the record.
Version 1.0 of all four documents was corrected that way, to describe usage
statistics, account e-mail through Resend and the self-hosted sign-up check.
After the freeze, a change is a new version, as below.

**There used to be a second trigger — "or when it takes effect" — and
removing it is the point.** A document whose freeze was scheduled for a date
was a document the release calendar had to be planned around, and the
documents never needed that: three of the four say *"from the version that
introduces them"* in their own prose and name no date at all. A licence
follows the product. See ADR *a-licence-follows-the-product* in the
application repository.

**Freezing is one edit, and it is deliberate rather than automatic.** Set
`frozen: true` and `sha256` to the digest of the source file in the same
change:

```sh
sha256sum en/eula/1.0.md
pnpm check          # refuses the pair if they disagree
```

From then on `tool/check_legal.mjs` fails any edit to that file whose digest
is not updated with it — so changing a frozen document is a visible,
reviewable diff rather than something that can happen quietly.

## Layout

```
manifest.json          the index — the one place a version number is stated
en/<slug>/<version>.md the documents themselves
it/                    reserved; see "Adding Italian"
src/                   the Astro site that renders them
tool/check_legal.mjs   the guard that holds the two together
```

Every version is its own file and nothing is ever overwritten. Bumping a
document is a new file plus one entry in `manifest.json`; the superseded text
stays in the tree and stays served at its own `/v/` path.

**`manifest.json` is a contract with the application, not just with this
site.** The app cannot read this file at runtime — it ships without the
submodule — so it keeps its own snapshot of the parts it needs, at
`legal/versions.json` in that repository, and `melos run legal:check` there
holds the two together. The numbers being in two places is deliberate; the
check is what keeps them in step.

What that check covers today is the snapshot, the frozen digests and the
`LICENSE` copy. The Dart *literals* — `apps/editor/lib/src/legal_documents.dart`
and the acceptance record — are specified in that repository's
`docs/specs/legal-documents.md` §6 and land with the acceptance page in
**1.5**, and the same check grows to cover them. This paragraph previously
said a test already compared them while none existed, and then that they were
owed in 1.6; the gate moved forward to 1.5 so that the Agreement would not
have to disclaim a release nobody had been asked about.

A document that is **drafted but not published** is simply absent from the
manifest — and, because this repository is public, is not in it at all: an
unserved file here would be published anyway, one `git clone` away. There is
no `published: false` flag, because a flag somebody has to remember to read
gets read wrong once and a document that is not in the index cannot be
rendered by routes built from the index.

**That is now a check rather than a convention.** `pnpm check` fails on any
Markdown file under `en/` that no manifest entry names, so a draft committed
here cannot pass review quietly. It matters because the content loader ingests
every Markdown file under `en/` regardless of the manifest: before the check,
a draft dropped in was loaded, never routed, and completely silent — while
still being one `git clone` away from anybody.

**Drafts are version-controlled in the application repository**, which is
private: `docs/legal-drafts/<slug>/<version>.md` there, copied here only when
the version is published. The **DPA** is the one unpublished document today
and lives there. It is kept privately and sent directly to a business customer
who asks.

## Versions

`major.minor`, per document, independently.

- **Major** — the terms moved. Thirty days' notice, and acceptance is asked
  again. **Minor** — the words moved. Published, no notice period, no re-ask.

Whichever it is, the amendment article in each document is what the reader is
owed, and it is the same in all of them.

**What a version comes into force by is `effectiveOn`, and it is not the same
for all of them**, because they are not accepted the same way. A document's own
amendment article says which, and the manifest records it:

| | `effectiveOn` | `effectiveFrom` | Why |
| --- | --- | --- | --- |
| **EULA** | `acceptance` | the app version that first asks (`1.5`) | It is accepted, so it takes effect per installation at the moment somebody does. No date can describe that. |
| **Terms** | `date` | an ISO date | They govern a website with no versions, accepted by use. A date is the only anchor there is — and it is theirs alone. |
| **Privacy** | `processing` | — | Not an agreement: an information duty under arts. 13–14, discharged when the processing starts. Each section names its release. |
| **Sub-processors** | `publication` | — | A list of facts, not terms. In force as published, kept current, with thirty days' notice before a new provider starts. |
| **Ripple Effect Licence** | `superseded` | the last app version it governed (`1.4`) | Replaced rather than amended. It governs the builds it shipped with, for as long as they are used, and is `frozen` because a superseded notice has nothing left to correct. |

**A new feature is usually not a new version.** The EULA defines "the
Software" as including *every component shipped with it*, so a part of the
application that did not exist when somebody accepted it is already governed.
What makes a version is a change to what a document **says** — not a change to
what the product does. **The Privacy Notice is the exception and takes the
opposite rule**: it only ever looks forward, and is never reworded to cover
processing that has already happened.

## Bumping a document

1. Copy `en/<slug>/<old>.md` to `en/<slug>/<new>.md` and edit it. Update its
   front matter: `version`, `effectiveOn`, `effectiveFrom`.
2. Add a `versions` entry in `manifest.json` and move `current` to it, with
   `frozen: false` and `sha256: null`.
3. **Do not touch the old file.** Its `/v/` path is a promise — and if it is
   `frozen`, `pnpm check` enforces that rather than trusting it.
4. Freeze the superseded version if it was not already, and freeze the new one
   when its text is final — see *Freezing* above.
5. `pnpm check`. It holds the manifest, the front matter, the digests and the
   `/v/` paths against each other.
6. In the application repository: update `legal/versions.json` and run
   `melos run legal:check`. If the bump is major, the `LegalDocument` version
   literal moves with it too — a release of the app, not just of this site. The EULA has **two** further frozen copies, the
   `LICENSE` file in that repository and in `ripple_effect_support`; the
   release checklist names all three.

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
pnpm check        # astro check, then tool/check_legal.mjs
```

**`tool/check_legal.mjs` is the one that holds the documents and the index
together**, and every rule in it is there because something could otherwise go
wrong without a word. Its header says which, at length; in short: a draft
nobody indexed, a `source` naming a file that is not there, front matter
contradicting the manifest, an edit to a frozen version, a malformed `/v/`
path, and a version entry that has disappeared since `origin/main`. Two of
those were reachable before it existed — the build only ever checked that a
*named* file was present, never that a *present* file was named, and `source`
was read nowhere but inside an error message.

It runs in `pnpm check`, which is what Vercel runs for this directory on every
pull request; `.github/workflows/legal-check.yml` runs it again so a red X does
not depend on a deployment. Neither needs the network.

`.github/workflows/legal-links.yml` is the other half and answers a different
question: it fetches every living slug and every frozen path, including
superseded ones, weekly and on dispatch, and opens an issue on anything that is
not a 200. **A file existing in this tree is not a page existing at the
origin**, and that is the gap it covers.

## Not legal advice

These documents were adapted from a reviewed set and have not themselves been
through a professional review. That review is owed before anybody is asked to
accept them.
