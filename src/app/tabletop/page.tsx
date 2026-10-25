import type { Metadata } from "next";

import { AudienceHero } from "@/components/audience-hero";
import { FeatureBlock } from "@/components/feature-block";
import { mockFonts } from "@/components/mock/fonts";
import { Soundscape } from "@/components/mock/soundscape";
import { Entities, SessionBoard, WorldState } from "@/components/mock/tabletop";
import { Reveal } from "@/components/reveal";
import { Cta } from "@/components/sections/cta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "For tabletop players and storytellers",
  description:
    "Storyboard a campaign as a board of scenes, keep every character, item and faction as an entity with typed attributes, hold the state of the world in console variables, and score each scene with a soundscape.",
  alternates: { canonical: "/tabletop" },
};

const docs = (path: string) => `${siteConfig.links.docs}/${path}/`;

/**
 * The page for tabletop players and hobbyists: storyboarding, the entities a
 * campaign tracks, and the state of the world. The example in every mock-up
 * is The City of Elsenmar's opening, the campaign that ships with the editor.
 */
export default function TabletopPage() {
  return (
    <div className={mockFonts}>
      <AudienceHero
        eyebrow="For tabletop players and storytellers"
        title="Storyboard the campaign, and track everything in it"
        primary={{ label: "Get the editor — it’s free", href: "/download" }}
        secondary={{ label: "Components and entities", href: docs("explanation/components-and-entities") }}
      >
        <p>
          Lay a campaign out as scenes on a board, keep every character, item
          and faction as an entity with typed attributes, and let console
          variables hold the state of the world while you play.
        </p>
      </AudienceHero>

      <Reveal className="mx-auto max-w-6xl space-y-24 px-4 pb-8 lg:space-y-32 lg:px-8">
        <FeatureBlock
          wide
          eyebrow="Storyboarding"
          title="Every scene a card, every choice a wire"
          mock={<SessionBoard />}
          points={[
            "The branch you didn’t plan for is a card dropped on the board and wired in",
            "Chapters are boards of their own, and a Jump hands the story on",
            "Dice in standard notation, with the usual rolls as presets",
            "Press play at the table; pause, edit the board, and pick up where you were",
          ]}
        >
          <p>
            Players go where they like. The board shows the whole session at a
            glance, and the next scene is never further away than a right-click
            on the canvas.
          </p>
        </FeatureBlock>

        <FeatureBlock
          flip
          eyebrow="Components and entities"
          title="Describe a goblin once. Spawn six."
          mock={<Entities />}
          points={[
            "A component is a name and an ordered bag of typed attributes — no schema to design first",
            "Spawn makes as many as you ask, and finds the same ones again on a second visit",
            "Cards ask who is still standing, whether one exists, and take one away",
            <>
              Python reads them too:{" "}
              <code className="font-code text-xs">component(&quot;Goblin&quot;)[&quot;hp&quot;]</code>
            </>,
          ]}
        >
          <p>
            Characters, items and factions are components; the ones the story
            makes and changes are entities. What the party did to the sword in
            chapter one is still true in chapter five, because it is the same
            sword.
          </p>
        </FeatureBlock>

        <FeatureBlock
          eyebrow="Console variables"
          title="The state of the world, typed and in view"
          mock={<WorldState />}
          points={[
            "Declared once with a type: whole numbers, numbers, switches, text, Markdown, files and JSON",
            "Get, Set and Branch cards read and write them without a line of code",
            "Scoped to one board or to the whole campaign",
            "Watched live in a panel while the story plays",
          ]}
        >
          <p>
            How alarmed the city is, whether the gates are open, which season
            it is. Console variables are the campaign&rsquo;s own ledger, and
            any card or script can read the world from them.
          </p>
          <p>
            <a
              href={docs("explanation/console-variables")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              How console variables work
            </a>
          </p>
        </FeatureBlock>

        <FeatureBlock
          flip
          eyebrow="Soundscapes"
          title="Set the mood for every scene"
          mock={<Soundscape />}
          points={[
            "A soundscape is a timeline of clips: music under a scene, rain on the roof, a bell every half minute",
            "A passage names one, and it plays from there until another passage brings its own — or silence",
            "Clips loop gaplessly, play once, or repeat with a rest between plays",
            "Lanes you can name, lock, mute and solo while you work, every clip with its waveform",
            "A one-off sound — a door, a scream, a fanfare — is a card dropped where it happens",
          ]}
        >
          <p>
            Music and ambience that follow the story at the table, without
            anybody reaching for a playlist: move on to the next scene and the
            sound moves with you.
          </p>
        </FeatureBlock>
      </Reveal>

      <Cta />
    </div>
  );
}
