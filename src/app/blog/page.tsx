import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { BlogList } from "@/components/blog-list";
import { summaries } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on what the app does, how it is built, what shipped and where it is going.",
  // So a reader's browser and their feed reader both find it without being
  // told where it is.
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
};

export default function BlogPage() {
  const posts = summaries();

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={
          <>
            Notes from the <span className="text-primary">workbench</span>
          </>
        }
        description="What a feature is actually for, what shipped, where this is going, and the pieces we build in the open along the way."
      />

      <section className="pb-28">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nothing published yet.
          </p>
        ) : (
          // Bodies are not sent with this: the cards carry metadata only, and
          // `BlogList` fetches the search index the first time somebody types.
          <BlogList posts={posts} />
        )}
      </section>
    </>
  );
}
