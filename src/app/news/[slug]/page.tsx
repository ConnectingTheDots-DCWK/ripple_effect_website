import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { NewsBanner } from "@/components/news-banner";
import { allArticles, findArticle, formatDate } from "@/lib/news";
import { renderMarkdown } from "@/lib/markdown";

import "../../blog/post.css";

/** Every slug is named, so nothing reads `content/news` to answer a request. */
export function generateStaticParams() {
  return allArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      url: `/news/${article.slug}`,
    },
    twitter: { title: article.title, description: article.description },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const html = await renderMarkdown(article.body);

  return (
    <article className="mx-auto max-w-3xl px-4 pt-36 pb-24 lg:px-8 lg:pt-44">
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        All news
      </Link>

      <header className="mt-8">
        <NewsBanner article={article} as="h1" priority />
        <p className="mt-4 text-sm text-muted-foreground">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
        </p>
      </header>

      {/*
       * The same reasoning as the blog's one `dangerouslySetInnerHTML`: this
       * HTML was produced during `next build` from a Markdown file in this
       * repository, by a pipeline that drops raw HTML. Nothing a reader sends
       * reaches it.
       */}
      <div className="post mt-10" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
