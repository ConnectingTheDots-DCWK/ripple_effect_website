import { FeatureBlock, SectionIntro } from "@/components/feature-block";
import { AppWindow } from "@/components/mock/app-window";
import { Diff } from "@/components/mock/diff";
import { Formats } from "@/components/mock/formats";
import { Systems } from "@/components/mock/systems";
import { Reveal } from "@/components/reveal";

/**
 * The three things that set the app apart, which is what the home page is
 * about now — the features are on the pages written for each audience.
 *
 * Every claim is one the app's own prose already makes. Two it deliberately
 * does not: that nothing ever leaves the machine (the update check, the news
 * and a crash report do — see the privacy page), and any number about speed.
 */
export function Differentiators() {
  return (
    <section id="features" className="scroll-mt-16 py-16 lg:py-24">
      <Reveal className="mx-auto max-w-6xl px-4 lg:px-8">
        <SectionIntro eyebrow="Why this one" title="What sets it apart" />

        <div className="mt-14 space-y-24 lg:space-y-32">
          <FeatureBlock
            eyebrow="Local, native, fast"
            title="Your story lives on your disk, not in a browser tab"
            mock={<AppWindow />}
            points={[
              "No account to make, and no project uploaded anywhere",
              "Editing, playing and checking your spelling all happen on your machine, online or not",
              "A native canvas that draws a zoomed-out board as sketches, so a big one stays quick",
              "Cloud features are planned as an option, never a requirement",
            ]}
          >
            <p>
              Ripple Effect is a desktop application, and a project is a folder
              you already have. The app writes no scaffold into it and claims
              no ownership: open a directory and it is a project.
            </p>
          </FeatureBlock>

          <FeatureBlock
            flip
            eyebrow="Scripting and game systems"
            title="The systems a game needs, built in"
            mock={<Systems />}
            points={[
              "A sandboxed Python subset, in Script nodes and inside the prose itself",
              "Components and entities: describe a goblin once, spawn six",
              "Typed console variables, watched live while the story plays",
              "Callback events that tell your game what the story just did",
            ]}
          >
            <p>
              Entities with typed attributes, console variables and host
              callbacks are part of the story&rsquo;s model, not a convention
              you rebuild in every project. Where a wire is not enough, Python
              is.
            </p>
          </FeatureBlock>

          <FeatureBlock
            eyebrow="Fits your pipeline"
            title="Built to sit inside the tools you already use"
            mock={
              <div className="grid grid-cols-1 gap-4">
                <Formats />
                <Diff />
              </div>
            }
            points={[
              "Stable ids and relative paths, so a change reads as a change in review",
              "Version control built into the editor, over the repository you already have",
              "A compiled campaign is a folder a build pipeline reads without the editor",
            ]}
          >
            <p>
              Boards are JSON, prose is Markdown and scripts are{" "}
              <code className="font-code text-sm">.py</code> — every one opens
              in an editor you already trust and keeps working if this app
              disappears. And agents, in your terminal or on your desktop, can
              read and edit a project through its MCP server.
            </p>
          </FeatureBlock>
        </div>
      </Reveal>
    </section>
  );
}
