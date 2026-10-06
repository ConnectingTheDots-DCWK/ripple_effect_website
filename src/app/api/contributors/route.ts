import { NextResponse } from "next/server";

import { supportRepo } from "@/lib/go";

export const runtime = "nodejs";

/**
 * The support repository's contributors, for the app's About box.
 *
 * The app used to ask `api.github.com` itself, with the repository's owner
 * compiled in and a token compiled in beside it to buy a rate limit. Asked
 * here instead, the owner is `go.ts`'s to change and the rate limit is this
 * cache's: one GitHub call an hour, however many About boxes open. The
 * `RIPPLE_EFFECT_METADATA` token is used when present, for the rate limit —
 * a fine-grained token reads any public repository — and the read works
 * without it.
 *
 * GitHub's array is handed on with the five fields the app reads and nothing
 * else, in GitHub's own names, so `GitHubContributor.fromJson` parses either.
 * Sorting and dropping bots stay the app's, which already did both.
 */
export async function GET() {
  const token = process.env.RIPPLE_EFFECT_METADATA;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${supportRepo.owner}/${supportRepo.name}/contributors?per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) {
      console.error(`GitHub answered ${response.status} for contributors`);
      return NextResponse.json([], { status: 502 });
    }
    const people = (await response.json()) as Array<Record<string, unknown>>;
    return NextResponse.json(
      people.map(({ login, html_url, avatar_url, contributions, type }) => ({
        login,
        html_url,
        avatar_url,
        contributions,
        type,
      })),
      { headers: { "Cache-Control": "public, s-maxage=3600" } },
    );
  } catch (error) {
    console.error("Contributors unreachable", error);
    return NextResponse.json([], { status: 502 });
  }
}
