import Link from "next/link";

import { RippleMark, Wordmark } from "@/components/ripple-mark";
import { siteConfig } from "@/lib/site-config";

const groups = [
  {
    title: "Product",
    links: [
      { text: "Features", href: "/#features" },
      { text: "Download", href: "/download" },
      { text: "Docs", href: siteConfig.links.docs },
      { text: "Pricing", href: "/pricing" },
      { text: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Project",
    links: [
      { text: "Support", href: siteConfig.links.support },
      { text: "Report a bug", href: siteConfig.links.issues },
      { text: "Discussions", href: siteConfig.links.discussions },
      { text: "Buy me a coffee", href: siteConfig.links.funding },
      // ?source= fills the form's hidden field, the same way the waitlist
      // button does it — the app is expected to send most of the answers, and
      // this is what tells the two apart afterwards.
      {
        text: "Satisfaction survey",
        href: `${siteConfig.links.survey}?source=website-footer`,
      },
    ],
  },
  {
    // The legal site, which is a third Vercel project over this repository.
    // "Licence" used to sit in Project and point at a LICENSE file on GitHub;
    // the EULA replaces that licence, so it moves here and points at the
    // document rather than at a copy of it.
    //
    // Two entries mention privacy and they are not the same thing. The
    // *Privacy Notice* is the formal one and covers the application, this
    // site and the service. *Cookies and analytics* is this site's own page —
    // narrower, in plainer words, and the one the consent banner links,
    // because a banner asking about one cookie should land you somewhere that
    // is about that cookie.
    title: "Legal",
    links: [
      { text: "Licence (EULA)", href: siteConfig.legal.eula },
      { text: "Terms of Service", href: siteConfig.legal.terms },
      { text: "Privacy Notice", href: siteConfig.legal.privacy },
      { text: "Sub-processors", href: siteConfig.legal.subprocessors },
      { text: "Cookies and analytics", href: "/privacy" },
    ],
  },
  {
    // "Open source" rather than "Built on": the docking layout is public and
    // ours and the app does not stand on it yet, and a heading that said it
    // did would be the one claim in this column a reader could catch out.
    // The list is the docs page's list — three of ours, then the interpreter
    // that is not — and the two are kept the same length by hand.
    title: "Open source",
    links: [
      { text: "fl_nodes_v2", href: siteConfig.links.editor },
      { text: "fl_panel", href: siteConfig.links.docking },
      { text: "dart_read_time", href: siteConfig.links.readTime },
      { text: "monty", href: siteConfig.links.monty },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-14">
      {/*
        Five blocks since Legal arrived, so the single row is an lg rule now
        and md gets two columns rather than four squeezed ones. The brand
        block keeps its extra width wherever the row is whole.
      */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <RippleMark size={24} className="text-brand" />
            <Wordmark />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A desktop tool for writing interactive stories as graphs, over a
            folder on your own disk.
          </p>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="text-sm font-semibold">{group.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <li key={link.text}>
                  {link.href.startsWith("http") ? (
                    // Another host is a plain anchor. A new tab for somebody
                    // else's site; the docs are ours, and half the product,
                    // so they open where the reader is.
                    <a
                      href={link.href}
                      rel="noopener"
                      target={link.href === siteConfig.links.docs ? undefined : "_blank"}
                      className="transition-colors hover:text-foreground"
                    >
                      {link.text}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {link.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-border px-4 pt-6 text-xs text-muted-foreground md:flex-row lg:px-8">
        <span className="flex items-center gap-2">
          {siteConfig.copyright}
          <span aria-hidden>·</span>
          {/*
            The canonical notice, not this site's own page. Somebody who looks
            for "privacy" in a footer bottom bar is looking for the document,
            and the narrower page is one row up under Legal.
          */}
          <a
            href={siteConfig.legal.privacy}
            rel="noopener"
            target="_blank"
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </a>
        </span>
        <span>
          Proprietary software. The source is not published; the node editor
          underneath it is.
        </span>
      </div>
    </footer>
  );
}
