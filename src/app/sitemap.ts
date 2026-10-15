import type { MetadataRoute } from "next";

import { allPosts } from "@/lib/blog";
import { allArticles } from "@/lib/news";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/download", "/pricing", "/privacy", "/blog", "/news"].map(
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

  const news = allArticles().map((article) => ({
    url: `${siteConfig.url}/news/${article.slug}`,
    lastModified: new Date(`${article.date}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...pages, ...posts, ...news];
}
