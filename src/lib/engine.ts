import "server-only";

import { engineReleasesRepo } from "@/lib/go";

/*
 * Which engine patch an installed editor should be offered — the app
 * repository's `docs/specs/engine-distribution.md` §7, and ADR
 * *the-engine-ships-on-its-own* §5 for why the website answers it.
 *
 * **The website can only narrow.** The editor re-checks the signature, the
 * contract, the bridge hash and every digest itself, and would refuse a
 * manifest this should not have offered; what this adds is the one thing
 * the editor cannot know — that a published patch turned out bad, which
 * `withheld` says without anything being re-released.
 */

/** Engine versions never to be offered, whatever else is true of them. */
export const withheld: readonly string[] = [];

const API = "https://api.github.com";
const REPO = `${engineReleasesRepo.owner}/${engineReleasesRepo.name}`;

export type EngineProblem =
  | "none"
  | "contract"
  | "bridge"
  | "target"
  | "unreachable";

export type EngineOffer =
  | {
      available: true;
      engine: string;
      manifest: string;
      signature: string;
      archive: { href: string; sha256: string; size: number };
    }
  | { available: false; problem: EngineProblem };

type GitHubRelease = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  assets: { name: string; browser_download_url: string }[];
};

/**
 * Which releases an editor may be offered. `stable` is every build anybody
 * downloads; `rc` is a build made with `--dart-define=RIPPLE_ENGINE_CHANNEL=rc`
 * for testing the patch path, which is offered release candidates as well.
 * A candidate is signed like any release, so this widens what is *offered*
 * and nothing the editor accepts.
 */
export type EngineChannel = "stable" | "rc";

/**
 * `1.5.3` → `[1, 5, 3, ∞]`, `1.5.3-rc.2` → `[1, 5, 3, 2]` — so a candidate
 * sorts below the release it leads to, as semver has it — anything else →
 * null.
 */
function parse(version: string): number[] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-rc\.(\d+))?$/.exec(version);
  if (!match) return null;
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] === undefined ? Infinity : Number(match[4]),
  ];
}

function compare(a: number[], b: number[]): number {
  for (let i = 0; i < 4; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
}

export async function offerEngine(query: {
  contract: string;
  target: string;
  bridge: number;
  current: string;
  channel: EngineChannel;
}): Promise<EngineOffer> {
  const current = parse(query.current);
  if (!/^\d+\.\d+$/.test(query.contract) || !current) {
    return { available: false, problem: "contract" };
  }

  let releases: GitHubRelease[];
  try {
    const token = process.env.RIPPLE_EFFECT_METADATA;
    const response = await fetch(`${API}/repos/${REPO}/releases?per_page=100`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      console.error(`GitHub answered ${response.status} for ${REPO}/releases`);
      return { available: false, problem: "unreachable" };
    }
    releases = (await response.json()) as GitHubRelease[];
  } catch (error) {
    console.error("Could not reach the engine releases", error);
    return { available: false, problem: "unreachable" };
  }

  // The highest published release of this contract that is higher than what
  // the editor already has and not withheld — and not a candidate, unless the
  // editor is on the rc channel.
  let best: { release: GitHubRelease; version: string; key: number[] } | null =
    null;
  for (const release of releases) {
    if (release.draft) continue;
    if (release.prerelease && query.channel !== "rc") continue;
    const version = release.tag_name.replace(/^engine-v/, "");
    const key = parse(version);
    if (!key || release.tag_name === version) continue;
    // A candidate is published as a prerelease; one that was not is a mistake
    // this does not reward with stable clients.
    if (key[3] !== Infinity && query.channel !== "rc") continue;
    if (`${key[0]}.${key[1]}` !== query.contract) continue;
    if (withheld.includes(version) || compare(key, current) <= 0) continue;
    if (!best || compare(key, best.key) > 0) best = { release, version, key };
  }
  if (!best) return { available: false, problem: "none" };

  const asset = (name: string) =>
    best.release.assets.find((one) => one.name === name)?.browser_download_url;
  const manifestUrl = asset("engine-manifest.json");
  const signatureUrl = asset("engine-manifest.json.sig");
  if (!manifestUrl || !signatureUrl) {
    return { available: false, problem: "unreachable" };
  }

  let manifestText: string;
  let signature: string;
  try {
    const [manifest, sig] = await Promise.all(
      [manifestUrl, signatureUrl].map((url) =>
        fetch(url, { next: { revalidate: 3600 } }),
      ),
    );
    if (!manifest.ok || !sig.ok) return { available: false, problem: "unreachable" };
    manifestText = await manifest.text();
    signature = await sig.text();
  } catch (error) {
    console.error("Could not read an engine manifest", error);
    return { available: false, problem: "unreachable" };
  }

  // Read for routing only; the editor verifies the signature before it
  // believes any of this.
  const manifest = JSON.parse(manifestText) as {
    contract: string;
    bridge: { hash: number };
    targets: Record<string, { archive: string; sha256: string; size: number }>;
  };
  if (manifest.contract !== query.contract) {
    return { available: false, problem: "contract" };
  }
  if (manifest.bridge.hash !== query.bridge) {
    return { available: false, problem: "bridge" };
  }
  const entry = manifest.targets[query.target];
  if (!entry) return { available: false, problem: "target" };

  return {
    available: true,
    engine: best.version,
    manifest: manifestText,
    signature,
    archive: {
      href: `/go/engine/${best.release.tag_name}/${entry.archive}`,
      sha256: entry.sha256,
      size: entry.size,
    },
  };
}
