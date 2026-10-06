import type { NextConfig } from "next";

import { goLinks } from "./src/lib/go";

const nextConfig: NextConfig = {
  // Deliberately *not* `output: "export"`, which is what the template shipped
  // with. The download buttons are two Node route handlers holding a GitHub
  // token that must never reach the browser, and a static export has nowhere
  // to run them. The consequence is that this deploys to Vercel rather than to
  // a static host, which is the decision that was taken.
  images: {
    // The screenshots are the only images, they are ours, and they are local.
    formats: ["image/avif", "image/webp"],
    // **A `quality` prop that is not in this list is a 400, not a fallback.**
    // Next 16 restricts the optimizer to declared qualities and ships with
    // `[75]`, so `<Image quality={60}>` renders an `img` whose every srcset
    // candidate fails — the browser shows nothing and the build says nothing.
    // 60 is here for `Cover`, which is drawn at a tenth of its opacity.
    qualities: [60, 75],
  },
  // Every address the app opens. See `src/lib/go.ts` for why each is a 307.
  async redirects() {
    return goLinks.map((link) => ({ ...link, permanent: false }));
  },
};

export default nextConfig;
