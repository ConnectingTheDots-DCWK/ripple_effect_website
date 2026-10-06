import { siteConfig } from "@/lib/site-config";
import type { Post } from "@/lib/blog";

/**
 * Schema.org objects, in one place so the product is described once.
 *
 * **Two things are deliberately absent and should stay absent.**
 * `aggregateRating` and `review`, because there are none and inventing them
 * is the fraud that got rich results restricted in the first place — the same
 * rule the rest of this site follows about numbers. And `FAQPage`, which the
 * FAQ section is a perfect fit for and which would earn nothing: Google
 * narrowed FAQ rich results to well-known government and health sites, so the
 * markup is now weight with no result behind it.
 */

/**
 * The application, as one entity with one identity.
 *
 * The same `@id` on `/` and `/download` is what says these are two pages
 * about one thing rather than two competing products. Without it a crawler
 * has two `SoftwareApplication`s with the same name and has to guess.
 */
const APP_ID = `${siteConfig.url}/#app`;

export function softwareApplication(version?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: siteConfig.name,
    alternateName: siteConfig.slug,
    description: siteConfig.description,
    // Schema's own enumeration. A narrative and game-design tool is a design
    // application before it is a developer one, whatever its file formats look
    // like.
    applicationCategory: "DesignApplication",
    operatingSystem: "Linux, Windows, macOS",
    url: siteConfig.url,
    downloadUrl: `${siteConfig.url}/download`,
    // Dropped by `JSON.stringify` when there is no published release, which is
    // the correct behaviour: an absent version is better than a stale one.
    softwareVersion: version,
    license: siteConfig.links.licence,
    screenshot: `${siteConfig.url}/screenshots/board-dark.png`,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
    },
    // The free tier as it actually is. There is a paid tier planned and it has
    // no price, so it is not here — a second `Offer` with no `price` would be
    // describing something that does not exist yet.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function blogPosting(post: Post) {
  const url = `${siteConfig.url}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    mainEntityOfPage: url,
    url,
    // `headline` is the one a search result shows, so it takes the literal
    // title when the post has one; the piece keeps its own name beside it.
    headline: post.seoTitle ?? post.title,
    alternativeHeadline: post.seoTitle ? post.title : undefined,
    description: post.description,
    datePublished: post.date,
    // The same date, honestly, because nothing tracks edits yet. When
    // something does, this is where it goes — and `sitemap.ts` wants it too.
    dateModified: post.date,
    image: `${url}/opengraph-image`,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.publisher.name,
      url: siteConfig.url,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${siteConfig.url}/blog`,
      name: `${siteConfig.name} — Blog`,
    },
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${siteConfig.url}${step.path}`,
    })),
  };
}
