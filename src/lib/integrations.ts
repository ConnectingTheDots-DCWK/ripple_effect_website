/**
 * The two constellations: the MCP clients that can drive the app, and the git
 * hosts it can push to.
 *
 * **The provider marks are the app's own files**, copied from
 `* assets/providers/` in the application repository — the same four the agents
 * dialog draws — so the site cannot end up showing a logo the app does not.
 * `tool/` has no copy step for them; they are four files that change about
 * never, and a build step to keep four files in sync is more moving parts than
 * the drift it prevents.
 *
 * **Every one of them is drawn on a white disc, including the ones that would
 * survive without it.** Two of the seven are near-black — OpenAI is `#000000`,
 * GitHub `#161614` — and vanish on the dark ground the site opens in; Ollama
 * is black too. Tinting those to `currentColor` was the other option and is
 * worse: it is somebody's mark, and a recoloured mark is a wrong mark. Giving
 * only those three a disc would have been visibly inconsistent, so all of them
 * get one, in both themes. It is the treatment a logo row usually gets anyway.
 */

export interface Mark {
  /** Under `public/logos/`. */
  src: string;
  /** The company or project, as it writes it. */
  name: string;
  href: string;
  /** Shown under the mark and read by a screen reader. */
  label: string;
}

/**
 * Five, and the fifth is the honest one: the app implements MCP rather than
 * integrating with four vendors, so a list of exactly four would misdescribe
 * it. "Anything else" links to the protocol's own client list rather than to
 * one more product.
 *
 * The order is the order they are placed around the pentagon, clockwise from
 * the top. It is not a ranking; it puts the two marks with a colour of their
 * own — Claude and Gemini — opposite each other rather than adjacent.
 */
export const mcpClients: Mark[] = [
  {
    src: "/logos/claude.svg",
    name: "Claude",
    href: "https://claude.ai",
    label: "Claude",
  },
  {
    src: "/logos/openai.svg",
    name: "ChatGPT",
    href: "https://chatgpt.com",
    label: "ChatGPT",
  },
  {
    src: "/logos/gemini.svg",
    name: "Gemini",
    href: "https://gemini.google.com",
    label: "Gemini",
  },
  {
    src: "/logos/ollama.svg",
    name: "Ollama",
    href: "https://ollama.com",
    label: "Ollama",
  },
];

/**
 * The fifth point of the pentagon, drawn from the icon set rather than a mark.
 *
 * `src?: undefined` rather than simply omitting `src`: it makes this and
 * `Mark` a discriminated union, so `client.src ? … : …` narrows to one or the
 * other. Leave it off and TypeScript narrows an `in` check to `src: unknown`,
 * which is not assignable to anything.
 */
export interface IconMark {
  src?: undefined;
  name: string;
  href: string;
  label: string;
}

export const mcpOthers: IconMark = {
  name: "Anything else",
  href: "https://modelcontextprotocol.io/clients",
  label: "Anything else that speaks MCP",
};

export const gitHosts: Mark[] = [
  {
    src: "/logos/github.svg",
    name: "GitHub",
    href: "https://github.com",
    label: "GitHub",
  },
  {
    src: "/logos/gitlab.svg",
    name: "GitLab",
    href: "https://gitlab.com",
    label: "GitLab",
  },
  {
    src: "/logos/gitea.svg",
    name: "Gitea",
    href: "https://about.gitea.com",
    label: "Gitea",
  },
];
