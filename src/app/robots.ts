import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    // The two API routes answer with a redirect and a JSON blob; there is
    // nothing in either for a crawler, and /api/download issues a signed URL
    // per request.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
