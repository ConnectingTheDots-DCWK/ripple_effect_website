import { allArticles, type Article, type Banner } from "@/lib/news";
import { siteConfig } from "@/lib/site-config";

/**
 * The news feed — and, unlike the blog's, a feed the app reads.
 *
 * RSS 2.0, so any feed reader can follow it, plus one namespace of our own
 * for the two things RSS has no element for and the app needs: the banner, and
 * the body as **Markdown**. The app draws a body with the same Markdown widget
 * it draws everything else with, and handing it HTML would mean a second
 * renderer for one screen. `<description>` stays the plain one-sentence
 * excerpt, which is what every other reader shows.
 *
 * **The namespace is a contract with installed builds**, so it is versioned in
 * its URI, `…/ns/news/1`. The app's reader matches elements by that URI and
 * never by the `rfx:` prefix, and a new kind of banner is something it already
 * draws as a flat neutral rather than refuses. A change that an installed build
 * would misread wants `…/2`, side by side with `…/1` for as long as builds
 * that only know `1` are about.
 *
 * Site-relative addresses in the body — every image, which `src/lib/news.ts`
 * insists on, and any link to a page here — are made absolute, because a feed
 * has no page for a relative address to resolve against. They all name
 * this site, which is the only host the app will fetch a picture from.
 *
 * Thirty items: once per launch on every installation, the feed is the one
 * file here whose size is paid for over and over, and an item older than the
 * newest thirty is not news.
 *
 * `force-static`, so it is built with the site and costs a function
 * invocation exactly never.
 */
export const dynamic = "force-static";

const NEWS_NAMESPACE = "https://ripplefx.app/ns/news/1";

const LIMIT = 30;

function banner(banner: Banner, alt: string | undefined): string {
  switch (banner.kind) {
    case "image":
      return `<rfx:banner kind="image" src="${siteConfig.url}${banner.src}" alt="${escape(alt ?? "")}" />`;
    case "colour":
      return `<rfx:banner kind="colour" colour="${banner.colour}" />`;
    case "gradient":
      return `<rfx:banner kind="gradient" from="${banner.from}" to="${banner.to}" />`;
  }
}

/**
 * Site-relative addresses made absolute, and the body wrapped so no
 * character of it needs escaping. A body containing `]]>` would close the
 * section early, so that one sequence is split across two sections — the
 * standard way, and invisible to any XML reader.
 */
function body(markdown: string): string {
  const absolute = markdown.replace(
    /(\]\()\/(?!\/)/g,
    (_, opening: string) => `${opening}${siteConfig.url}/`
  );
  return `<![CDATA[${absolute.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function item(article: Article): string {
  const url = `${siteConfig.url}/news/${article.slug}`;
  return `    <item>
      <title>${escape(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${article.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(article.description)}</description>
      ${banner(article.banner, article.bannerAlt)}
      <rfx:body type="text/markdown">${body(article.body.trim())}</rfx:body>
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
  const articles = allArticles().slice(0, LIMIT);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:rfx="${NEWS_NAMESPACE}">
  <channel>
    <title>${escape(siteConfig.name)} — News</title>
    <link>${siteConfig.url}/news</link>
    <atom:link href="${siteConfig.url}/news/feed.xml" rel="self" type="application/rss+xml" />
    <description>What changed for the people who use the app: bindings, integrations, and anything that needs doing.</description>
    <language>en</language>
${articles.map(item).join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
