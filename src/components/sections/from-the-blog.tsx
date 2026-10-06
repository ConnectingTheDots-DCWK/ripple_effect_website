import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { PostCard } from "@/components/post-card";
import { BlurFade } from "@/components/velora/blur-fade";
import { summaries } from "@/lib/blog";

/**
 * The two newest posts, on the home page.
 *
 * **It is here for the reader and for the crawler, and the second reason is
 * the one that is easy to leave out.** The blog was a leaf: nothing on the
 * site linked into it except the navbar, so the pages with whatever authority
 * this domain has passed none of it on, and a post's only route in was a
 * search that had no reason to find it yet. A block on the highest-authority
 * page gives every new post a link from it on the next deploy.
 *
 * **After the FAQ and before the call to action.** The FAQ is already "more
 * questions"; this is "more reading"; and the CTA still gets the last word,
 * which it would not if this sat below it.
 *
 * Two, not three or six. This is a pointer at the blog, not a second index of
 * it, and the card is the same `PostCard` `/blog` uses so there is no second
 * design to keep in step.
 */
export function FromTheBlog() {
  const posts = summaries().slice(0, 2);
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <BlurFade>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                From the blog
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-pretty">
                What a feature is actually for, and the pieces we build in the
                open along the way.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
            >
              All posts
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </BlurFade>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {posts.map((post, i) => (
            <BlurFade key={post.slug} delay={i * 0.08}>
              <PostCard post={post} />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
