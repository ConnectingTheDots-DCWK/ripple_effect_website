import type { Metadata } from "next";

import { AudienceHero } from "@/components/audience-hero";
import { FeatureBlock } from "@/components/feature-block";
import { LanguageLogo, logoName, type LogoName } from "@/components/language-logo";
import { Languages } from "@/components/mock/code-samples";
import { mockFonts } from "@/components/mock/fonts";
import { Decisions } from "@/components/mock/decisions";
import { Hosts } from "@/components/mock/hosts";
import { TwoWay } from "@/components/mock/two-way";
import { Reveal } from "@/components/reveal";
import { Cta } from "@/components/sections/cta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "For game developers",
  description:
    "Ripple Effect's engine plays a branching story inside your game or tool: bindings for TypeScript, C and C++, C# and Dart, a C ABI for anything else, and callbacks for what the story did.",
  alternates: { canonical: "/developers" },
};

const docs = (path: string) => `${siteConfig.links.docs}/${path}/`;

const LANGUAGES: LogoName[] = ["typescript", "c", "cpp", "csharp", "dart", "webassembly"];

/**
 * The page for people who make games. Its promise is the engine's: the story
 * is content and logic, and how it looks is the host's — in their engine,
 * their tools, or a page. Every code sample is lifted from a binding's own
 * README and trimmed, never written for the page.
 */
export default function DevelopersPage() {
  return (
    <div className={mockFonts}>
      <AudienceHero
        eyebrow="For game developers"
        title="Story logic you can drop into any engine"
        primary={{ label: "Embed the engine", href: docs("how-to/play-a-campaign-in-your-program") }}
        secondary={{ label: "Get the editor", href: "/download" }}
        aside={
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {LANGUAGES.map((name) => (
              <li key={name} className="inline-flex items-center gap-2">
                <LanguageLogo name={name} size={20} decorative />
                {logoName(name)}
              </li>
            ))}
          </ul>
        }
      >
        <p>
          Writers build the story in the editor. The engine plays it inside
          your game and hands your code what happened — and how any of it
          looks, sounds or saves is yours.
        </p>
      </AudienceHero>

      <Reveal className="mx-auto max-w-6xl space-y-24 px-4 pb-8 lg:space-y-32 lg:px-8">
        <FeatureBlock
          wide
          eyebrow="Decisions"
          title="A choice doesn’t have to be a button"
          mock={<Decisions />}
          points={[
            "Somewhere the player goes: the game writes where they are, and a choice opens",
            "Someone the player knows: a relationship that grows over the story opens what was closed",
            "Something the player does: the game takes a choice itself, from a door, an item or a gesture",
            "The clock: a passage takes its own choice when its countdown runs out",
          ]}
        >
          <p>
            A choice is an index your game passes, so it can come from anything
            the game knows about — not only from text the player clicks. And
            every choice can carry a condition, so what is on offer follows the
            world: where the player stands, how a character feels about them,
            what a faction remembers.
          </p>
          <p>
            That works because the story and your game share their state, all
            the time, in both directions.
          </p>
        </FeatureBlock>

        <FeatureBlock
          flip
          eyebrow="Two-way, all the time"
          title="Your game and the story talk to each other"
          mock={<TwoWay />}
          points={[
            <>
              <strong className="font-medium text-foreground">Into the story:</strong> choices and answers, console
              variables written and reset, entities removed, the language changed, a save resumed.
            </>,
            <>
              <strong className="font-medium text-foreground">Out of it:</strong> every passage and question as data,
              what moved after each step — variables, entities and what the story remembers — and the full
              cast of entities with their typed attributes whenever you ask.
            </>,
            <>
              <strong className="font-medium text-foreground">Named callbacks:</strong> moments a writer declares in the
              editor on twenty kinds of event, aimed at a board, a passage, a variable, a component or a state.
            </>,
            "A callback carries no code and cannot change the story; your game decides what it means",
          ]}
        >
          <p>
            Console variables and entities are the shared memory: the story
            moves them as it plays, your game moves them as the player does,
            and each side hears about the other&rsquo;s changes. Callbacks name
            the moments that matter, so gameplay can react to the story — and
            the story to gameplay.
          </p>
          <p>
            <a
              href={docs("reference/host-callbacks")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Every event and what it can be aimed at
            </a>
          </p>
        </FeatureBlock>

        <FeatureBlock
          eyebrow="Language integrations"
          title="Four bindings, one engine"
          mock={<Languages />}
          points={[
            <>
              <strong className="font-medium text-foreground">TypeScript and JavaScript</strong> on npm:
              the engine as a WebAssembly component, and an optional Web Audio speaker for its soundscapes.
            </>,
            <>
              <strong className="font-medium text-foreground">C and C++</strong>{" "}through CMake: the engine&rsquo;s
              C ABI, fetched as a released binary, with a header-only C++17 layer over it.
            </>,
            <>
              <strong className="font-medium text-foreground">C#</strong> on NuGet:{" "}
              <code className="font-code text-xs">netstandard2.1</code>, with the engine with or without Python
              in its own package.
            </>,
            <>
              <strong className="font-medium text-foreground">Dart</strong> on pub.dev, for Flutter and Flame
              — natively, or in a browser over the same web component.
            </>,
          ]}
        >
          <p>
            Each binding is its own open repository and its own package, built
            against a published engine release and pinned to it. The bindings
            are MIT; the engine is free and royalty-free to ship, unmodified,
            inside your product.
          </p>
        </FeatureBlock>

        <FeatureBlock
          flip
          eyebrow="Built for engines that aren’t ours"
          title="Fits a custom engine, a tool, or a page"
          mock={<Hosts />}
          points={[
            "A C ABI, so anything with a foreign-function interface can host it",
            "Desktop, Android and iOS builds, and a WebAssembly component for the browser",
            "Your clock: a hold is milliseconds you wait, never a timer the engine runs",
            "Your speaker: a soundscape is a schedule your audio code plays, or ignores",
            "A no-Python engine build for hosts that want none, and an export checked against it",
          ]}
        >
          <p>
            Nothing in the engine assumes a game engine of its own, a main
            loop, an audio device or a renderer. It is a library that answers
            calls, so it fits an in-house engine, an editor tool, a server or a
            web page as readily as a commercial one.
          </p>
        </FeatureBlock>

      </Reveal>

      <Cta />
    </div>
  );
}
