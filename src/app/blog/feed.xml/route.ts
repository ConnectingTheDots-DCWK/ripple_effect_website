import { allPosts, type Post } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

/**
 * The feed.
 *
 * A blog whose whole purpose is to be read by people who follow projects
 * should be followable without a visit, and RSS is thirty lines and no
 * dependency. It is a route handler rather than a file in `public/` because
 * the posts are the source of truth and a hand-written XML file would be a
 * second list — the thing `src/lib/blog.ts` exists to avoid.
 *
 * `force-static` prerenders it at build time, so it costs a function
 * invocation exactly never.
 */
export const dynamic = "force-static";

/** Items carry the excerpt and a link, not the post. The feed is an index. */
function item(post: Post): string {
  const url = `${siteConfig.url}/blog/${post.slug}`;
  return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <category>${escape(post.category)}</category>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
    </item>`;
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET(): Response {
  const posts = allPosts();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.name)} — Blog</title>
    <link>${siteConfig.url}/blog</link>
    <atom:link href="${siteConfig.url}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on what the app does, how it is built, what shipped and where it is going.</description>
    <language>en</language>
${posts.map(item).join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
