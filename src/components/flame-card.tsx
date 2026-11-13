import { ProjectCard, ProjectName } from "@/components/project-card";
import { siteConfig } from "@/lib/site-config";

const FLAME = "https://flame-engine.org";

/**
 * Ripple Effect with Flame, at the foot of `/developers`. Flame's maintainer
 * agreed to the name and the logo on 2026-11-13.
 *
 * The two lockups are Flame's own files from github.com/flame-engine/brand,
 * byte for byte except the viewBox, trimmed from its 1600×1600 canvas to the
 * drawn area: Flame ships one for a white background and one for a dark.
 */
export function FlameCard() {
  return (
    <ProjectCard
      id="flame-heading"
      href={FLAME}
      name="Flame, the Flutter game engine"
      logo={{
        light: "/logos/flame/lockup-for-white-background.svg",
        dark: "/logos/flame/lockup-for-dark-background.svg",
        width: 180,
        height: 59,
      }}
      title="A story engine and a game engine, both in Dart"
      links={[
        {
          label: "The Flame example game",
          href: "https://github.com/ConnectingTheDots-DCWK/ripple_effect_dart_integration/tree/main/example/flame_player",
        },
        { label: "The Dart binding", href: `${siteConfig.links.docs}/reference/binding-dart/` },
        { label: "Get started with Flame", href: FLAME },
      ]}
      notice="Flame and the Flame logo belong to the Flame Engine project and appear here with its permission."
    >
      <p>
        <ProjectName href={FLAME}>Flame</ProjectName> is the open-source game
        engine for Flutter: a game loop, components, sprites, input, collisions
        and audio, on every platform Flutter reaches. Ripple Effect brings the
        part a game engine leaves to you — the story, written and played
        through by writers in the editor, then run inside your game by{" "}
        <code className="font-code text-xs">ripplefx_engine</code> from pub.dev.
      </p>
      <p>
        Flame draws the world; the story decides what happens in it. Choices,
        countdowns and what characters remember come from the campaign, and
        your components show them however your game looks. The editor is a
        Flutter app too, so from the first draft to the shipped game it is one
        ecosystem — a good place to start a narrative game.
      </p>
    </ProjectCard>
  );
}
