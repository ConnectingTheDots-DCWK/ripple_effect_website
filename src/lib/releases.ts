import "server-only";

import { releaseRepo } from "@/lib/site-config";

/*
 * Releases are cut on the *private* `ripple_effect` repository — see
 * `.github/workflows/release.yml`, which runs `gh release create` against its
 * own checkout. So there is no public download URL to link to, and everything
 * here runs on the server with a token that must never reach the browser.
 *
 * The token is a fine-grained PAT scoped to that one repository with
 * `Contents: read` and nothing else. It is `RIPPLE_EFFECT_EDITOR_RELEASES`,
 * deliberately without the `NEXT_PUBLIC_` prefix that would inline it into
 * the bundle, and nothing else reads it: the two routes that only read public
 * repositories have `RIPPLE_EFFECT_METADATA`, so the one token that can see a
 * private repository is used for the one thing that needs it.
 */

const API = "https://api.github.com";
const REPO = `${releaseRepo.owner}/${releaseRepo.name}`;

export type Platform = "linux-deb" | "linux-rpm" | "windows" | "macos";

export interface ReleaseAsset {
  id: number;
  platform: Platform;
  name: string;
  size: number;
  /**
   * `sha256:<hex>`, or null when GitHub does not report one.
   *
   * **Nothing on this site reads it, and it must not be removed for that
   * reason.** It is here for the app: from 1.2 the update dialog downloads an
   * installer and runs it, and it refuses to do that for an asset it cannot
   * check first — no digest, no in-app update, and the person is sent to
   * /download instead. See `lib/src/updates/` in the app.
   *
   * GitHub fills this in only for assets uploaded since roughly mid-2025, so a
   * release cut before then legitimately has null here and self-updating is
   * correctly inert for it.
   */
  digest: string | null;
}

/**
 * Why there is nothing to offer. Four causes that used to be one answer.
 *
 * `{ published: false }` on its own is indistinguishable between "no release
 * yet", "the token is missing", "the token cannot see the repository" and
 * "GitHub was unreachable" — and the first of those is fine while the other
 * three are outages that look exactly like it. That ambiguity is not
 * theoretical: it cost an afternoon on a site that was serving
 * `published: false` for a release that had been published for hours.
 */
export type ReleaseProblem =
  "no-token" | "unauthorized" | "not-found" | "unreachable";

export interface LatestRelease {
  /** `1.0.0` — the tag, stripped of its `v` and of any build suffix. */
  version: string;
  /** The `+1` in `v1.0.0+1`, when the tag carries one. */
  build: string | null;
  tag: string;
  publishedAt: string;
  assets: ReleaseAsset[];
  /**
   * Dormant. Windows used to ship an MSIX, which cannot be installed unsigned
   * at all, so a self-signed certificate rode along as a second file the user
   * had to import first. It is an unsigned Inno Setup .exe now — one
   * SmartScreen click and no second file — so releases carry no .cer and this
   * is always null. Kept, with the code below it, because a real code-signing
   * certificate would not bring it back but a return to MSIX would.
   */
  certificate: { id: number; name: string; size: number } | null;
}

/**
 * `v1.0.0` and `v1.0.0+1` both read as 1.0.0.
 *
 * The workflow tags `v<version>` from an input it has already checked against
 * `pubspec.yaml`'s version *without* its build number, so today the `+1` form
 * does not occur — it is accepted anyway because the pubspec spells the
 * version with one and a tag that grew to match would otherwise render as a
 * blank badge rather than as a version.
 */
export function parseTag(
  tag: string,
): { version: string; build: string | null } | null {
  const match =
    /^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\+([0-9A-Za-z.-]+))?$/.exec(tag);
  return match ? { version: match[1], build: match[2] ?? null } : null;
}

/**
 * Which platform an asset is for, decided by extension.
 *
 * Deliberately not by filename pattern. Three different spellings of the same
 * artifact are already in circulation — the workflow's own release notes say
 * `ripple-effect_*.deb`, the README says `ripple_effect-<version>-linux.deb`,
 * and what fastforge actually builds is `ripple_effect-1.0.0+1-linux.deb` —
 * so anything matching on the stem is matching on a string that has already
 * been wrong three times.
 */
function platformOf(name: string): Platform | null {
  if (name.endsWith(".deb")) return "linux-deb";
  if (name.endsWith(".rpm")) return "linux-rpm";
  if (name.endsWith(".exe")) return "windows";
  if (name.endsWith(".dmg")) return "macos";
  return null;
}

function headers(): HeadersInit | null {
  const token = process.env.RIPPLE_EFFECT_EDITOR_RELEASES;
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

type GitHubRelease = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  assets: {
    id: number;
    name: string;
    size: number;
    digest?: string | null;
  }[];
};

/** An editor release's tag, and only an editor release's: `v1.5.0`, `v1.5.0+6`. */
const EDITOR_TAG = /^v(\d+)\.(\d+)\.(\d+)(?:\+[0-9A-Za-z.-]+)?$/;

/**
 * The editor release an installed app should be offered, out of a page of the
 * repository's releases.
 *
 * **Chosen by tag, never by GitHub's *latest* badge.** The repository cuts two
 * kinds of release — the editor's `v*` and the engine's `engine-v*` (ADR
 * *the-engine-ships-on-its-own* in the app repository) — and *latest* is
 * whichever was created last unless every workflow remembers otherwise. One
 * engine release holding it would make every installed editor, 1.4 included,
 * quietly stop being offered updates and blank the download page. So: drafts
 * and prereleases out, anything not tagged like an editor out, highest version
 * by number.
 */
export function pickEditorRelease(
  releases: GitHubRelease[],
): GitHubRelease | null {
  let best: { release: GitHubRelease; key: number[] } | null = null;
  for (const release of releases) {
    if (release.draft || release.prerelease) continue;
    const match = EDITOR_TAG.exec(release.tag_name);
    if (!match) continue;
    const key = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (!best || compareKeys(key, best.key) > 0) best = { release, key };
  }
  return best?.release ?? null;
}

function compareKeys(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/**
 * The latest published release, or `null`.
 *
 * `null` is a designed answer rather than a failure: before 1.0.0 is published
 * there genuinely is no release, and the download page draws its four
 * platforms in a "not published yet" state instead of buttons that 404.
 *
 * Drafts and prereleases are skipped (see `pickEditorRelease`), and the
 * release workflow's `draft` input **defaults to true** — so a release that
 * has been cut but not undrafted is invisible here, correctly.
 */
export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  return (await loadLatestRelease()).release;
}

/**
 * The same fetch, with the reason it failed kept rather than flattened.
 *
 * Every branch logs, **404 included**. It used to be the one that did not, on
 * the grounds that "nothing published yet" is ordinary and not an error — true
 * before the first release, and misleading after it, since a token that cannot
 * see a private repository 404s in exactly the same way.
 */
export async function loadLatestRelease(): Promise<{
  release: LatestRelease | null;
  problem: ReleaseProblem | null;
}> {
  const auth = headers();
  if (!auth) {
    console.error(
      "RIPPLE_EFFECT_EDITOR_RELEASES is not set. /download will show every platform as unpublished, whatever is actually released.",
    );
    return { release: null, problem: "no-token" };
  }

  let response: Response;
  try {
    response = await fetch(`${API}/repos/${REPO}/releases?per_page=100`, {
      headers: auth,
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error("Could not reach the GitHub API", error);
    return { release: null, problem: "unreachable" };
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      console.error(
        `GitHub answered ${response.status} for ${REPO}/releases. The token is present but rejected — expired, revoked, or not granted Contents: read on that repository.`,
      );
      return { release: null, problem: "unauthorized" };
    }
    if (response.status === 404) {
      console.error(
        `GitHub answered 404 for ${REPO}/releases. The token cannot see that repository.`,
      );
      return { release: null, problem: "not-found" };
    }
    console.error(`GitHub answered ${response.status} for ${REPO}/releases`);
    return { release: null, problem: "unreachable" };
  }

  const release = pickEditorRelease((await response.json()) as GitHubRelease[]);
  if (!release) {
    console.error(
      `${REPO} has no published editor release: nothing tagged v<major>.<minor>.<patch> that is neither a draft nor a prerelease.`,
    );
    return { release: null, problem: "not-found" };
  }

  const assets = release.assets
    .map((asset) => {
      const platform = platformOf(asset.name);
      return platform
        ? {
            id: asset.id,
            platform,
            name: asset.name,
            size: asset.size,
            digest: asset.digest ?? null,
          }
        : null;
    })
    .filter((asset): asset is ReleaseAsset => asset !== null);

  // Nothing publishes a .cer any more; this finds nothing and is left as the
  // one line that would have to change back. See `certificate` above.
  const cer = release.assets.find((asset) => asset.name.endsWith(".cer"));

  const parsed = parseTag(release.tag_name);

  return {
    release: {
      tag: release.tag_name,
      // A tag in a spelling this does not know reads as the tag itself rather
      // than as nothing: a badge saying `v1.0.0-rc1` is worse than a blank one
      // only if it is wrong, and it is not.
      version: parsed?.version ?? release.tag_name.replace(/^v/, ""),
      build: parsed?.build ?? null,
      publishedAt: release.published_at,
      assets,
      certificate: cer ? { id: cer.id, name: cer.name, size: cer.size } : null,
    },
    problem: null,
  };
}

/**
 * A short-lived, signed URL for one release asset, or `null` if that asset is
 * not part of the latest release.
 *
 * The membership check is the reason this takes an id rather than passing one
 * through: without it the route would be a general read oracle for every asset
 * of every release in a private repository, which is a larger thing than a
 * download button.
 *
 * GitHub answers the asset endpoint with a 302 to a pre-signed URL when asked
 * for `application/octet-stream`. Following that redirect here would stream
 * tens of megabytes through the server; handing it to the browser instead
 * costs one small response and sends the bytes straight from GitHub's CDN.
 */
export async function signedAssetUrl(assetId: number): Promise<string | null> {
  const auth = headers();
  if (!auth) return null;

  const latest = await fetchLatestRelease();
  const known =
    latest?.assets.some((asset) => asset.id === assetId) ||
    latest?.certificate?.id === assetId;
  if (!known) return null;

  const response = await fetch(
    `${API}/repos/${REPO}/releases/assets/${assetId}`,
    {
      headers: { ...auth, Accept: "application/octet-stream" },
      redirect: "manual",
      cache: "no-store",
    },
  );

  const location = response.headers.get("location");
  if (!location) {
    console.error(
      `Expected a redirect for asset ${assetId}, got ${response.status}`,
    );
    return null;
  }
  return location;
}
