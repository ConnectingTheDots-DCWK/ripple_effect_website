import type { Metadata } from "next";
import { LanguagesIcon, MicIcon, PlayIcon, RouteIcon } from "lucide-react";

import { AudienceHero } from "@/components/audience-hero";
import { FeatureBlock, SectionIntro } from "@/components/feature-block";
import { mockFonts } from "@/components/mock/fonts";
import { Overview } from "@/components/mock/overview";
import { GrammarEditor, WeirEditor } from "@/components/mock/writing";
import { Reveal } from "@/components/reveal";
import { Cta } from "@/components/sections/cta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "For writers and narrative designers",
  description:
    "Write branching stories in prose: spelling and grammar checked on your own machine, house-style rules you write yourself, and a map of how every chapter hands the story on.",
  alternates: { canonical: "/writers" },
};

const docs = (path: string) => `${siteConfig.links.docs}/${path}/`;

const ALSO = [
  {
    icon: MicIcon,
    title: "Say it, and it is typed",
    body: "Press the microphone over a passage or a note and speak: your words are typed at the cursor, heard on your own computer by a model you download once.",
  },
  {
    icon: LanguagesIcon,
    title: "Every language in one passage",
    body: "One document per passage holds every translation, and a translation that has fallen behind its source says so.",
  },
  {
    icon: RouteIcon,
    title: "Every way a reader gets here",
    body: "Pick two passages and every route between them is drawn, each in its own colour, across boards.",
  },
  {
    icon: PlayIcon,
    title: "Read it as a player will",
    body: "Press play and walk the story; put it down, edit the board, and pick it back up where you were.",
  },
];

/**
 * The page for writers and narrative designers: the checker, the house
 * style, and the map of the chapters. Every claim is the app's own — the
 * grammar feature's notes, the Weir template, the overview's — and the
 * checking stays English-only until Harper says otherwise.
 */
export default function WritersPage() {
  return (
    <div className={mockFonts}>
      <AudienceHero
        eyebrow="For writers and narrative designers"
        title="Write prose, and keep the structure in view"
        primary={{ label: "Get the editor", href: "/download" }}
        secondary={{ label: "How the checking works", href: docs("how-to/check-spelling-and-grammar") }}
      >
        <p>
          A passage is prose in a writing pane set like a book, and the board
          around it is where the story&rsquo;s shape lives. Ripple Effect
          checks your English as you write, holds your house style, and maps
          how every chapter hands the story on.
        </p>
      </AudienceHero>

      <Reveal className="mx-auto max-w-6xl space-y-24 px-4 pb-8 lg:space-y-32 lg:px-8">
        <FeatureBlock
          eyebrow="Spelling and grammar"
          title="A second reader that never leaves your machine"
          mock={<GrammarEditor />}
          points={[
            "English in your dialect — American, British, Canadian, Australian or Indian — from the passage’s own language",
            "Checked locally by Harper, so your prose is never sent anywhere to be read",
            "The names you already declared — boards, variables, callbacks — count as words",
            "Python in the prose is never checked, and a project dictionary travels with the story",
          ]}
        >
          <p>
            Squiggles appear as you type, coloured by kind — spelling, grammar,
            style — and the corrections menu offers the fix, a word for the
            dictionary, and where the finding came from.
          </p>
        </FeatureBlock>

        <FeatureBlock
          flip
          eyebrow="Your house style"
          title="Rules of your own, written in Weir"
          mock={<WeirEditor />}
          points={[
            "One rule per file in .ripple/style/, committed with the story",
            "Each rule carries its own tests, run a moment after you stop typing",
            "A rule that does not compile never takes the others with it",
            "An agent can read and write them too, through the app’s MCP server",
          ]}
        >
          <p>
            Your setting calls them spellwrights, not magic users; your
            series never says &ldquo;okay&rdquo;. Weir is Harper&rsquo;s rule
            language: a phrase to look for, what to say about it, what it
            should become — and the checker holds every passage to it.
          </p>
          <p>
            <a
              href={docs("how-to/write-a-style-rule")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Write a style rule
            </a>
          </p>
        </FeatureBlock>

        <FeatureBlock
          wide
          eyebrow="Script navigation"
          title="See how the chapters hand the story on"
          mock={<Overview />}
          points={[
            "A start marker where a thread begins, a stop where one ends",
            "A jump into the middle of a chapter says where it lands",
            "Play or open any chapter straight from its card",
            "The same layout every time, so a screenshot means the same thing tomorrow",
          ]}
        >
          <p>
            A read-only map of the whole project, laid out left to right in the
            order the story reaches things — the view you want before a
            rewrite, and the one to hand an editor who has never seen the
            project.
          </p>
        </FeatureBlock>

        <div className="pt-4">
          <SectionIntro title="And the rest of the writing desk" />
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {ALSO.map((item) => (
              <div key={item.title} data-reveal>
                <item.icon className="size-5 text-brand" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Cta />
    </div>
  );
}
