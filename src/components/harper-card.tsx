import { ProjectCard, ProjectName } from "@/components/project-card";
import { siteConfig } from "@/lib/site-config";

const HARPER = "https://writewithharper.com";

/**
 * Harper, at the foot of `/writers`. Not an integration to recommend — Harper
 * is inside the editor already, as the spelling and grammar checker — but an
 * open-source project worth knowing on its own, and a product of its own
 * besides. Harper's creator agreed to the name and the logo on 2026-11-13.
 *
 * The logo is `logo.svg` from github.com/Automattic/harper: black strokes on a
 * white rounded plate. Dark mode shows it exactly as shipped, plate and all,
 * because the strokes would vanish on the dark card and whitening them would
 * be a recoloured mark. Light mode shows a copy with only the plate removed.
 */
export function HarperCard() {
  return (
    <ProjectCard
      id="harper-heading"
      href={HARPER}
      name="Harper, the private grammar checker"
      logo={{
        light: "/logos/harper/logo-transparent.svg",
        dark: "/logos/harper/logo.svg",
        width: 101,
        height: 60,
      }}
      title="The checker in your editor is a project of its own"
      links={[
        { label: "Try Harper in your browser", href: HARPER },
        { label: "Harper on GitHub", href: "https://github.com/Automattic/harper" },
        {
          label: "How the checking works here",
          href: `${siteConfig.links.docs}/how-to/check-spelling-and-grammar/`,
        },
      ]}
      notice="Harper and the Harper logo belong to their owners and appear here with the permission of Harper's creator."
    >
      <p>
        The spelling and grammar checking in Ripple Effect is{" "}
        <ProjectName href={HARPER}>Harper</ProjectName>, created by Elijah
        Potter: a free, open-source English checker, written in Rust and
        licensed Apache-2.0, that runs entirely on your own machine. It checks
        a passage in milliseconds and needs no server, which is why your prose
        is never sent anywhere to be read.
      </p>
      <p>
        Harper isn&rsquo;t only a part of this editor. It goes wherever else
        you write: Harper Desktop for every text field on macOS, extensions for
        Chrome, Firefox and Edge, plugins for Obsidian, VS Code and Neovim, and
        a full editor in the browser. If you like how it reads your passages,
        take it with you.
      </p>
    </ProjectCard>
  );
}
