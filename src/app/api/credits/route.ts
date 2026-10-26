import { NextResponse } from "next/server";

import { creditRepos } from "@/lib/go";

export const runtime = "nodejs";

/**
 * Everybody the app's About page credits, by section (#271).
 *
 * `/api/contributors` stays as it was, because every build before 1.6 asks it
 * and reads a bare array; this is the shape a 1.6 About page reads:
 *
 * - `team` — the collaborators on the application's own repository. It is
 *   private, so nothing but a token can read it: `RIPPLE_EFFECT_METADATA`,
 *   whose metadata permission covers the organisation's repositories. Without
 *   the token the section is empty, never an error.
 * - `translators` — each language's `CONTRIBUTORS` in the public translations
 *   repository, a person per line as they asked to be credited, optionally
 *   followed by an `https` link.
 * - `integrations` — the four bindings' contributors, in the order the page
 *   draws them.
 *
 * Each list is asked on its own and one GitHub could not answer is empty, so a
 * slow repository costs its own section and not the page. The creator is not
 * filtered here: the app draws them apart and drops them from every list,
 * because it is the app that knows who it calls the creator. Bots are dropped
 * here, as the app drops them from the old list. One GitHub call per list an
 * hour, however many About pages open.
 */
export async function GET() {
  const [team, translators, ...integrations] = await Promise.all([
    people(`repos/${creditRepos.owner}/${creditRepos.app}/collaborators?affiliation=all`),
    contributorsFiles(),
    ...creditRepos.integrations.map((repo) =>
      people(`repos/${creditRepos.owner}/${repo.name}/contributors`),
    ),
  ]);
  return NextResponse.json(
    {
      team: team ?? [],
      translators: translators ?? [],
      integrations: creditRepos.integrations.map((repo, i) => ({
        id: repo.id,
        people: integrations[i] ?? [],
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=3600" } },
  );
}

type Person = {
  login: unknown;
  html_url: unknown;
  avatar_url: unknown;
  contributions: unknown;
  type: unknown;
};

type Translator = { language: string; name: string; url: string | null };

async function github(path: string, raw = false): Promise<Response | null> {
  const token = process.env.RIPPLE_EFFECT_METADATA;
  try {
    const response = await fetch(`https://api.github.com/${path}`, {
      headers: {
        Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      console.error(`GitHub answered ${response.status} for ${path}`);
      return null;
    }
    return response;
  } catch (error) {
    console.error(`GitHub unreachable for ${path}`, error);
    return null;
  }
}

/** A list of GitHub accounts, in GitHub's own field names, bots dropped. */
async function people(path: string): Promise<Person[] | null> {
  const response = await github(`${path}${path.includes("?") ? "&" : "?"}per_page=100`);
  if (!response) return null;
  const list = (await response.json()) as Array<Record<string, unknown>>;
  return list
    .filter((one) => one.type !== "Bot")
    .map(({ login, html_url, avatar_url, contributions, type }) => ({
      login,
      html_url,
      avatar_url,
      contributions: contributions ?? null,
      type,
    }));
}

/** Every language's `CONTRIBUTORS`, in tag order. */
async function contributorsFiles(): Promise<Translator[] | null> {
  const listing = await github(
    `repos/${creditRepos.owner}/${creditRepos.translations}/contents/languages`,
  );
  if (!listing) return null;
  const entries = (await listing.json()) as Array<{ name: string; type: string }>;
  const languages = entries
    .filter((entry) => entry.type === "dir")
    .map((entry) => entry.name)
    .sort();
  const files = await Promise.all(
    languages.map(async (language) => {
      const file = await github(
        `repos/${creditRepos.owner}/${creditRepos.translations}/contents/languages/${language}/CONTRIBUTORS`,
        true,
      );
      return file ? parseContributors(language, await file.text()) : [];
    }),
  );
  return files.flat();
}

/**
 * One person per line, as they want to be credited, optionally followed by a
 * link — the translations repository's CONTRIBUTING.md. Blank lines and `#`
 * comments are skipped. Only an `https` link is kept: the app opens it, and a
 * line in a public repository is not somewhere to take a scheme from.
 */
function parseContributors(language: string, text: string): Translator[] {
  const credited: Translator[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^(.*?)\s+<?(\S+?)>?$/.exec(trimmed);
    const link = match?.[2];
    if (match && link && /^\S+:\/\//.test(link)) {
      // A link in another scheme is dropped and the name kept.
      const url = link.startsWith("https://") ? link : null;
      credited.push({ language, name: match[1].trim(), url });
    } else if (!/^\S+:\/\//.test(trimmed)) {
      credited.push({ language, name: trimmed, url: null });
    }
  }
  return credited;
}
