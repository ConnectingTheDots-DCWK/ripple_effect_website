import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlurFade } from "@/components/velora/blur-fade";
import { siteConfig } from "@/lib/site-config";

/**
 * Five questions that are all asked in earnest, answered without hedging.
 * The two awkward ones — it is not open source, and it is not code-signed —
 * are here on purpose: somebody finds both out within a minute of downloading,
 * and finding out from the page is better than finding out from Gatekeeper.
 */
const faq = [
  {
    q: "Is it open source?",
    a: (
      <>
        No. {siteConfig.name} is proprietary and the source is not published.
        Three packages of ours around it are public and do take pull requests:
        the node editor underneath it,{" "}
        <a
          href={siteConfig.links.editor}
          target="_blank"
          rel="noopener"
          className="text-primary underline underline-offset-4"
        >
          fl_nodes_v2
        </a>{" "}
        — <Link
          href="/blog/a-node-body-is-an-ordinary-widget"
          className="text-primary underline underline-offset-4"
        >
          here is how it works
        </Link>{" "}
        — the reading-time estimate under every passage,{" "}
        <a
          href={siteConfig.links.readTime}
          target="_blank"
          rel="noopener"
          className="text-primary underline underline-offset-4"
        >
          dart_read_time
        </a>{" "}
        —{" "}
        <Link
          href="/blog/counting-a-read-in-fifty-four-languages"
          className="text-primary underline underline-offset-4"
        >
          here is how it counts
        </Link>{" "}
        — and the docking layout being built for its workspace,{" "}
        <a
          href={siteConfig.links.docking}
          target="_blank"
          rel="noopener"
          className="text-primary underline underline-offset-4"
        >
          fl_panel
        </a>
        , which is public before the app uses it —{" "}
        <Link
          href="/blog/docking-is-a-tree-and-a-tab-is-a-name"
          className="text-primary underline underline-offset-4"
        >
          here is what is in it
        </Link>
        . The Python interpreter,{" "}
        <a
          href={siteConfig.links.monty}
          target="_blank"
          rel="noopener"
          className="text-primary underline underline-offset-4"
        >
          monty
        </a>
        , is open source too, and not ours.
      </>
    ),
  },
  {
    q: "Does my work belong to me?",
    a: (
      <>
        Yes, and the licence says so in as many words: “{siteConfig.ownership}”
        The formats are plain JSON and Markdown, so nothing you write is
        reachable only through this app.
      </>
    ),
  },
  {
    q: "Does it phone home?",
    a: (
      <>
        Twice without asking, and both are nameable. Once per launch it asks
        this site whether a newer version exists — a plain request for the
        release number, carrying nothing about you or your project — and the
        About box fetches the contributor list from api.github.com if you open
        it. There is no account, no sync, and no background telemetry of any
        kind: nothing counts what you do, and nothing you write leaves the
        machine.
        <br />
        <br />
        The one exception asks first, every time. After a crash, the next
        launch shows you the report it saved — every file, its size and what is
        in it — and sends it only if you say yes to that report. There is no
        &ldquo;always send&rdquo; setting and no &ldquo;never send&rdquo; one,
        because the moment you can actually judge the question is when you can
        see what would go. Anonymous usage statistics are planned on the same
        terms: opt-in, with the complete list of what would be sent in front of
        the question, and switchable off afterwards.{" "}
        <a
          href={siteConfig.legal.privacy}
          target="_blank"
          rel="noopener"
          className="text-primary underline underline-offset-4"
        >
          The Privacy Notice
        </a>{" "}
        is the full account.
      </>
    ),
  },
  {
    q: "What kind of Python is it?",
    a: (
      <>
        <a
          href={siteConfig.links.monty}
          target="_blank"
          rel="noopener"
          className="text-primary underline underline-offset-4"
        >
          monty
        </a>
        , a restricted Python subset compiled to Rust. It is Python-shaped
        rather than Python-portable: there is no standard library, no{" "}
        <code className="font-mono text-[0.85em]">import requests</code> and no{" "}
        <code className="font-mono text-[0.85em]">class</code>. Dicts,
        functions, comprehensions, f-strings and a handful of modules are there.
        The app carries a panel that probes the interpreter and reports what it
        actually supports, rather than asking you to trust a list like this one.
      </>
    ),
  },
  {
    q: "Are the builds signed?",
    a: (
      <>
        Not yet. Windows shows SmartScreen’s “Windows protected your PC”
        once — More info, then Run anyway — and macOS Gatekeeper blocks the
        .dmg on first launch. Linux needs none of this. Certificates from an
        authority anyone recognises are a known next step rather than an
        oversight; a self-signed one, which we tried, buys nothing a user can
        tell apart from no certificate at all.
      </>
    ),
  },
];

export function Faq() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <BlurFade>
          <h2 className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
            Questions worth asking first
          </h2>
        </BlurFade>
        <BlurFade delay={0.1}>
          <Accordion type="single" collapsible className="mt-8 w-full">
            {faq.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
      </div>
    </section>
  );
}
