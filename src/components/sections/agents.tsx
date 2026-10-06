import { PlugZapIcon, EyeIcon, PencilLineIcon } from "lucide-react";

import { BlurFade } from "@/components/velora/blur-fade";
import { Marquee } from "@/components/velora/marquee";
import { SparklesText } from "@/components/velora/sparkles-text";
import { AgentConstellation } from "@/components/agent-constellation";
import { mcpTools } from "@/lib/mcp-tools";

/**
 * Two rows running opposite ways, half the names each. One row of thirty-odd
 * is a very long belt that takes most of a minute to say anything new; two
 * shorter ones passing each other read as a surface rather than a queue. The
 * split is computed so that a tool added to the list lands on a row.
 */
const HALF = Math.ceil(mcpTools.length / 2);
const ROWS = [mcpTools.slice(0, HALF), mcpTools.slice(HALF)];

const facts = [
  {
    icon: EyeIcon,
    title: "Two switches, both off",
    body: "Agent access makes the app listen at all. Agents may edit is separate and subordinate to it. Neither is on when you install.",
  },
  {
    icon: PlugZapIcon,
    title: "A socket, never a port",
    body: "The server is inside the running app, reached over a local socket by a bridge the client spawns. Nothing is listening on the network.",
  },
  {
    icon: PencilLineIcon,
    title: "Edits go where yours go",
    body: "A board is changed through its own session, so the edit lands in your undo stack. Every write says which paths it touched, and posts to Messages.",
  },
];

export function Agents() {
  return (
    <section
      id="agents"
      className="border-t border-border py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/*
          * **`min-w-0` on both columns, and it is not defensive.** A grid item
          * defaults to `min-width: auto`, which means it refuses to shrink
          * below its content's min-content width. The tool marquee is made of
          * `whitespace-nowrap` chips, so this column's min-content width is
          * the length of sixteen tool names laid end to end — about a
          * thousand pixels. On a phone that blew the track out past the
          * viewport, and it broke *both* columns at once: the heading and the
          * paragraph ran off the right edge, and the constellation, which is
          * `mx-auto` inside the same over-wide track, was centred a few
          * hundred pixels off-screen and looked like it had failed to render.
          *
          * `overflow-hidden` on the `Marquee` itself does not help. That zeroes
          * the *automatic minimum size* of the marquee, not the min-content
          * contribution it makes to the block above it, and the grid item is
          * that block.
          */}
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <BlurFade className="min-w-0">
            <div>
              <span className="text-sm font-medium text-primary">
                Agents
              </span>
              {/*
                * Sparkles on the heading and nowhere else on the site. It is
                * the one place the page is talking about a model rather than
                * about the app, and the four-pointed star has become the
                * shorthand for that — borrowing it says in a glance what the
                * heading would otherwise spend a clause on.
                */}
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
                Hand the folder to{" "}
                <SparklesText className="text-primary">
                  an agent
                </SparklesText>{" "}
                and keep writing
              </h2>
              <p className="mt-5 text-lg text-muted-foreground text-pretty">
                Ripple Effect is an MCP server. Point Claude Code — or anything
                else that speaks the protocol — at the project you have open,
                and it works in the same folder you are working in, on the
                board you are looking at, while you are looking at it.
              </p>

              {/*
                * The tool names, verbatim. A count is a claim and a list is
                * evidence, and these are the strings a reader will type into
                * their own client tomorrow — so they are the real ones rather
                * than a tidied-up summary of them.
                */}
              <div className="mt-8 flex flex-col gap-3">
                {ROWS.map((row, i) => (
                  <Marquee
                    key={i}
                    reverse={i % 2 === 1}
                    pauseOnHover
                    repeat={3}
                    className="[--duration:36s]"
                  >
                    {row.map((tool) => (
                      <code
                        key={tool}
                        className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs whitespace-nowrap text-muted-foreground"
                      >
                        {tool}
                      </code>
                    ))}
                  </Marquee>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {mcpTools.length} tools, plus nine resources and two prompts.
                Everything that writes is behind the second switch.
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.12} className="min-w-0">
            <AgentConstellation />
          </BlurFade>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {facts.map((fact, i) => (
            <BlurFade key={fact.title} delay={i * 0.08}>
              <div>
                <fact.icon className="size-5 text-brand" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {fact.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {fact.body}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
