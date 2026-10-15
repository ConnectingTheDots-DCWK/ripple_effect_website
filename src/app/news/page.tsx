import type { Metadata } from "next";
import Link from "next/link";

import { NewsBanner } from "@/components/news-banner";
import { PageHeader } from "@/components/page-header";
import { allArticles, formatDate } from "@/lib/news";

export const metadata: Metadata = {
  title: "News",
  description:
    "What changed for the people who use Ripple Effect — the news the app shows on its home screen.",
  alternates: {
    canonical: "/news",
    types: { "application/rss+xml": "/news/feed.xml" },
  },
};

/**
 * The news, as a page.
 *
 * Its main reader is the app, which fetches `/news/feed.xml` and draws each
 * item on its home screen; this page is the same items for anybody who
 * arrives from a feed reader, a link or a search. So it is a plain column of
 * banners and nothing else — no search, no categories — because a news item
 * is short and the newest one is nearly always the one somebody came for.
 */
export default function NewsPage() {
  const articles = allArticles();

  return (
    <>
      <PageHeader
        eyebrow="News"
        title={
          <>
            What&apos;s <span className="text-primary">new</span>
          </>
        }
        description="Bindings, integrations, changes worth knowing about and anything that needs doing — the same news the app shows on its home screen."
      />

      <section className="mx-auto max-w-3xl px-4 pb-28 lg:px-8">
        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground">Nothing published yet.</p>
        ) : (
          <ul className="grid gap-8">
            {articles.map((article, index) => (
              <li key={article.slug}>
                <Link href={`/news/${article.slug}`} className="group block">
                  <NewsBanner article={article} priority={index === 0} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                  </p>
                  <p className="mt-1 text-pretty transition-colors group-hover:text-primary">
                    {article.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
