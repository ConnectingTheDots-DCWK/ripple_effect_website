import { allPosts, searchableText } from "@/lib/blog";

/**
 * The search index: one entry per post, carrying only the body text.
 *
 * **The metadata is deliberately not in here.** Title, description, category
 * and date are already on `/blog` — the server rendered them into the cards
 * and handed them to `BlogList` as props — so putting them in the index too
 * would ship every one of them twice. The client matches metadata from the
 * moment the page loads and matches body text from the moment this arrives,
 * which is also why the fetch can be lazy without the box feeling broken.
 *
 * `force-static` prerenders it, so it is a file on the CDN rather than a
 * function invocation. It grows with the blog and nothing else does: the page
 * stays the same size whether there are three posts or three hundred, because
 * this is only fetched when somebody actually types.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const index = allPosts().map((post) => ({
    slug: post.slug,
    text: searchableText(post.body),
  }));

  return new Response(JSON.stringify(index), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
