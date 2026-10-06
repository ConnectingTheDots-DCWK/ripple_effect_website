import { NextResponse } from "next/server";

import { loadLatestRelease } from "@/lib/releases";

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
 */
export async function GET() {
  const { release, problem } = await loadLatestRelease();

  if (!release) {
    return NextResponse.json({ published: false, problem, assets: [] });
  }

  return NextResponse.json({
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
  });
}
