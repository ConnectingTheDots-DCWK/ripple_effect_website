import Link from "next/link";
import { LifeBuoyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLockup } from "@/components/ripple-mark";
import { siteConfig } from "@/lib/site-config";

const nav = [
  { text: "Features", href: "/#features" },
  { text: "Download", href: "/download" },
  { text: "Docs", href: siteConfig.links.docs },
  { text: "Pricing", href: "/pricing" },
  { text: "Blog", href: "/blog" },
];

export function SiteHeader() {
  return (
    // No backdrop blur. The house style has no glass in it, and the app has
    // zero BackdropFilters in the whole codebase — a frosted bar here would be
    // the first thing on either surface to break that.
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
        <BrandLockup />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {nav.map((item) =>
            // The docs live on another host, so that one is a plain anchor:
            // next/link would try to prefetch and client-navigate a URL it
            // cannot, the same split the footer already makes.
            item.href.startsWith("http") ? (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.text}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.text}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <a href={siteConfig.links.support} rel="noopener" target="_blank">
              <LifeBuoyIcon />
              Support
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
