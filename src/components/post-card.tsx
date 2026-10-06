import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { PostMeta } from "@/components/post-meta";
import type { PostSummary } from "@/lib/blog";

/** `.replace` with a regex built from user input needs its metacharacters out. */
function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The matched terms, marked.
 *
 * A capturing group in the separator makes `String.split` keep what it split
 * on, at the odd indices — which is the whole implementation. The regex is
 * built with `i` and no `g`, so `lastIndex` never carries between calls.
 */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "giu");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-sm bg-primary/20 px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * One post on `/blog`.
 *
 * Carries no `"use client"` of its own and must not gain one: it is rendered
 * by `BlogList`, which is a client component, so this is already in that
 * bundle — and it is also rendered during the build, which is what puts the
 * cards in the HTML for a crawler that never runs the script.
 *
 * `snippet` replaces the description when a post matched only on its body,
 * because a card whose visible text does not contain what you typed reads as
 * a bug in the search rather than as a result.
 */
export function PostCard({
  post,
  terms = [],
  snippet,
}: {
  post: PostSummary;
  terms?: string[];
  snippet?: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-border bg-card p-7 transition-colors hover:border-primary/40"
    >
      <PostMeta post={post} />
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-primary lg:text-2xl">
        <Highlight text={post.title} terms={terms} />
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground text-pretty">
        <Highlight text={snippet ?? post.description} terms={terms} />
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Read post
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export { escapeRegExp };
