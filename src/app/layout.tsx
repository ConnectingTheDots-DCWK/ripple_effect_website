import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgress } from "@/components/velora/scroll-progress";
import { ReleaseBanner } from "@/components/release-banner";
import { SupportWidget } from "@/components/support-widget";
import { ConsentBanner } from "@/components/consent-banner";
import { fetchLatestRelease } from "@/lib/releases";
import { siteConfig } from "@/lib/site-config";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — branching narrative, drawn as graphs`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  keywords: [
    "branching narrative",
    "interactive fiction",
    "game design tool",
    "dialogue tree editor",
    "quest design",
    "node graph editor",
    "arcweave alternative",
    "twine alternative",
    "tabletop rpg prep",
    "visual scripting",
  ],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — branching narrative, drawn as graphs`,
    description: siteConfig.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — branching narrative, drawn as graphs`,
    description: siteConfig.tagline,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The layout asks, so the banner is available on every route rather than
  // only on the two that already needed a release. It is the same cached
  // fetch the hero and /download make — `revalidate: 300` on the request
  // itself — so this costs one call for the whole site, not one per page.
  const latest = await fetchLatestRelease();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {/* Above the bar rather than beside it: the header is fixed at
              top-0, so the progress line rides its top edge at z-60 and the
              page keeps every pixel of its 64px. */}
          <ScrollProgress />
          <SiteHeader />
          {latest && (
            <ReleaseBanner
              version={latest.version}
              tag={latest.tag}
              publishedAt={latest.publishedAt}
            />
          )}
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
        <SupportWidget />
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
