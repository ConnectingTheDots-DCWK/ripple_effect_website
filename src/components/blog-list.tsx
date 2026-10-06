"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { PostCard, escapeRegExp } from "@/components/post-card";
import { BlurFade } from "@/components/velora/blur-fade";
import type { PostSummary } from "@/lib/blog";

/*
 * Search over the posts.
 *
 * **Case-insensitive substring matching, every term required, and no more
 * than that.** No stemming, no fuzzy matching, no inverted index and no
 * library. A blog is tens of posts, a person typing into a box on a page they
 * are already looking at usually knows roughly what they want, and the cost of
 * pretending otherwise is a dependency that has to be understood and kept.
 * If this ever needs ranking that a human would call clever, that is the
 * moment to reach for something — not before.
 *
 * **What it searches, and when.** Title, description and category come from
 * props and are matchable from the moment the page loads. The body text lives
 * in `/blog/search.json` and is fetched the first time somebody types, so the
 * page's weight does not grow with the archive. The consequence is honest and
 * worth knowing: for the width of one network round trip, a query matches
 * metadata only. Nothing about the box says otherwise, because a spinner over
 * a list that is already correct-so-far would be worse than the wait.
 *
 * **No `?q=` in the URL.** A filter over a list the reader is looking at is
 * not a destination, and putting it in the URL means either a router push per
 * keystroke or `useSearchParams`, which on a static page drags a Suspense
 * boundary in behind it. Neither is worth a shareable filter.
 */

type IndexEntry = { slug: string; text: string };

/**
 * Module-level, so React's development double-invocation of effects reuses
 * one request instead of racing two, and so navigating away and back does not
 * fetch again. Cleared on failure, so the next keystroke is a retry.
 */
let indexRequest: Promise<Map<string, string>> | null = null;

function loadIndex(): Promise<Map<string, string>> {
  indexRequest ??= fetch("/blog/search.json")
    .then((response) => {
      if (!response.ok) throw new Error(`search index: ${response.status}`);
      return response.json() as Promise<IndexEntry[]>;
    })
    .then((entries) => new Map(entries.map((e) => [e.slug, e.text])))
    .catch((error) => {
      indexRequest = null;
      throw error;
    });
  return indexRequest;
}

/** Roughly a line and a half of body text around the first match. */
function excerpt(text: string, pattern: RegExp): string | undefined {
  const found = pattern.exec(text);
  if (!found) return undefined;

  const start = Math.max(0, found.index - 90);
  const end = Math.min(text.length, found.index + found[0].length + 110);
  // Snap to whitespace so the excerpt does not open mid-word.
  const from = start === 0 ? 0 : text.indexOf(" ", start) + 1;
  const to = end === text.length ? end : text.lastIndexOf(" ", end);

  return `${from > 0 ? "… " : ""}${text.slice(from, to)}${to < text.length ? " …" : ""}`;
}

interface Result {
  post: PostSummary;
  /** How many terms are in the title. The only ranking signal. */
  inTitle: number;
  snippet?: string;
}

export function BlogList({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<Map<string, string> | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const terms = useMemo(
    () => query.trim().split(/\s+/).filter(Boolean),
    [query]
  );

  const searching = terms.length > 0;

  useEffect(() => {
    if (!searching || index) return;
    loadIndex().then(setIndex, () => {
      // Metadata-only search still works, so there is nothing to tell anyone.
    });
  }, [searching, index]);

  /** `/` focuses the box, the way it does on a page that expects to be read. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      input.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo<Result[] | null>(() => {
    if (!searching) return null;

    const patterns = terms.map((term) => new RegExp(escapeRegExp(term), "iu"));
    const matched: Result[] = [];

    for (const post of posts) {
      const meta = `${post.title} ${post.description} ${post.category}`;
      const body = index?.get(post.slug) ?? "";

      if (!patterns.every((p) => p.test(meta) || p.test(body))) continue;

      matched.push({
        post,
        inTitle: patterns.filter((p) => p.test(post.title)).length,
        // Only when the card's own words do not contain the query.
        snippet: patterns.some((p) => p.test(meta))
          ? undefined
          : excerpt(body, patterns[0]),
      });
    }

    matched.sort(
      (a, b) => b.inTitle - a.inTitle || b.post.date.localeCompare(a.post.date)
    );
    return matched;
  }, [searching, terms, posts, index]);

  const shown: Result[] =
    results ?? posts.map((post) => ({ post, inTitle: 0 }));

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8">
      <div role="search" className="relative">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            if (query) setQuery("");
            else event.currentTarget.blur();
          }}
          aria-label="Search posts"
          placeholder="Search posts"
          // Chromium and WebKit draw their own clear button inside a
          // `type=search`, which would sit beside ours.
          className="h-10 pr-11 pl-10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        ) : (
          <kbd
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground sm:block"
          >
            /
          </kbd>
        )}
      </div>

      {/* Announced rather than drawn: the count is obvious to anyone who can
          see the list, and unavailable to anyone who cannot. */}
      <p aria-live="polite" className="sr-only">
        {results
          ? `${results.length} ${results.length === 1 ? "post matches" : "posts match"} ${query}`
          : `${posts.length} posts`}
      </p>

      <div className="mt-6 space-y-5">
        {shown.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No posts match <span className="text-foreground">{query}</span>.
          </p>
        ) : (
          shown.map(({ post, snippet }, i) =>
            // The reveal is for arriving at the page, not for typing into it.
            // Fading every card back in on each keystroke is a strobe.
            searching ? (
              <PostCard
                key={post.slug}
                post={post}
                terms={terms}
                snippet={snippet}
              />
            ) : (
              <BlurFade key={post.slug} delay={Math.min(i * 0.08, 0.32)}>
                <PostCard post={post} />
              </BlurFade>
            )
          )
        )}
      </div>
    </div>
  );
}
