import { NextResponse } from "next/server";

import {
  channels,
  type LatestRelease,
  loadReleases,
} from "@/lib/releases";

export const runtime = "nodejs";

/**
 * What the latest release contains, with each asset's download pointed back at
 * this site rather than at GitHub — the asset URLs themselves need the token.
 *
 * When there is nothing, it says **why**. `{ published: false }` alone covers
 * four causes — no release, no token, a token that cannot see the repository,
 * and GitHub being unreachable — of which one is fine and three are outages
 * that look identical to it. `curl /api/releases` is now a diagnosis rather
 * than a restatement of the symptom.
 *
 * The reason names a class of problem and never a value: no token, no header,
 * no repository path that is not already public in the app's own metadata.
 *
 * **The top level is Stable, byte for byte what it was before channels**, so
 * an installed 1.5.0 — which reads only that — can never be offered a preview.
 * `channels` beside it carries every public channel's newest release in the
 * same shape, or `null` for a channel with nothing in it, and a build that
 * knows about channels picks from it on its own machine: the request takes no
 * parameter, because which channel somebody follows is information about them
 * and the update check is promised to carry none. See `CHANNELS` in
 * `src/lib/releases.ts`.
 */
export async function GET() {
  const { releases, problem } = await loadReleases();
  const stable = releases.stable;
  const listed = Object.fromEntries(
    channels.map((channel) => {
      const release = releases[channel];
      return [channel, release ? body(release) : null];
    }),
  );

  if (!stable) {
    return NextResponse.json({
      published: false,
      problem,
      assets: [],
      channels: listed,
    });
  }

  return NextResponse.json({ ...body(stable), channels: listed });
}

function body(release: LatestRelease) {
  return {
    published: true,
    version: release.version,
    tag: release.tag,
    publishedAt: release.publishedAt,
    assets: release.assets.map((asset) => ({
      ...asset,
      href: `/api/download/${asset.id}`,
    })),
    certificate: release.certificate
      ? {
          ...release.certificate,
          href: `/api/download/${release.certificate.id}`,
        }
      : null,
  };
}
