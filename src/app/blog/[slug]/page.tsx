import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { PostMeta } from "@/components/post-meta";
import { allPosts, findPost, formatDate } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";
import { blogPosting, breadcrumbs } from "@/lib/structured-data";

import "../post.css";

/**
 * Every slug is named here, so both this route and its social card are
 * prerendered at build time and the `content/` directory is never read to
 * answer a request. See the note in `src/lib/blog.ts` about what would have to
 * change if that stopped being true.
 */
export function generateStaticParams() {
  return allPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};

  // `seoTitle` when the post has one, because this is the line a search
  // result shows and the `<h1>` below keeps the piece's own name either way.
  const title = post.seoTitle ?? post.title;

  return {
    title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description: post.description,
      publishedTime: post.date,
      url: `/blog/${post.slug}`,
    },
    twitter: { title, description: post.description },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.body);

  // The list is newest first, so the *next* entry is the older post.
  const posts = allPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = posts[index + 1];

  return (
    <article className="mx-auto max-w-3xl px-4 pt-36 pb-24 lg:px-8 lg:pt-44">
      <JsonLd data={blogPosting(post)} />
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        All posts
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          {post.description}
        </p>
        <PostMeta
          post={{ ...post, dateLabel: formatDate(post.date) }}
          className="mt-6"
        />
      </header>

      {/*
       * The one `dangerouslySetInnerHTML` on the site, and the reason it is
       * not dangerous here: the HTML was produced during `next build` from a
       * Markdown file in this repository, by a pipeline that drops raw HTML
       * (`src/lib/markdown.ts`). Nothing a reader can send reaches it. If a
       * post ever comes from somewhere else — a CMS, a form, anybody who is
       * not a committer — this is the line that has to be sanitised first.
       */}
      <div
        className="post mt-12 border-t border-border pt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {(newer || older) && (
        <nav
          aria-label="More posts"
          className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {newer ? (
            <Link
              href={`/blog/${newer.slug}`}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ArrowLeftIcon className="size-3.5" />
                Newer
              </span>
              <span className="mt-2 block text-sm font-semibold tracking-tight text-pretty transition-colors group-hover:text-primary">
                {newer.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {older && (
            <Link
              href={`/blog/${older.slug}`}
              className="group rounded-lg border border-border bg-card p-5 text-right transition-colors hover:border-primary/40 sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-muted-foreground">
                Older
                <ArrowRightIcon className="size-3.5" />
              </span>
              <span className="mt-2 block text-sm font-semibold tracking-tight text-pretty transition-colors group-hover:text-primary">
                {older.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
