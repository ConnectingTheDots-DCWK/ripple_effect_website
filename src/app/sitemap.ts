import type { MetadataRoute } from "next";

import { allPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

if (siteConfig.urlIsFallback) {
  console.warn(
    `NEXT_PUBLIC_SITE_URL is not set. Canonical links, the sitemap, og:url and the ` +
      `RSS feed will all claim this site lives at ${siteConfig.url}.`
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/download", "/pricing", "/privacy", "/blog"].map(
    (path) => ({
      url: `${siteConfig.url}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  // Posts carry their publication date and change once in a blue moon, which
  // is worth telling a crawler rather than letting them inherit "weekly".
  const posts = allPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
