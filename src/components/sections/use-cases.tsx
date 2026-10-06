import { Screenshot } from "@/components/screenshot";
import { BlurFade } from "@/components/velora/blur-fade";

const uses = [
  {
    title: "Tabletop prep",
    body: "A session that survives contact with the table. Branches you did not plan for are a wire away, and the components remember what the party did to them.",
  },
  {
    title: "Quest and dialogue trees",
    body: "Choices on the wires, conditions on the nodes, and an export a build pipeline can read without knowing this app exists.",
  },
  {
    title: "Game design documents",
    body: "The interesting part of the document is the paths through it, and a graph is what that shape actually looks like.",
  },
  {
    title: "Interactive fiction",
    body: "Markdown prose, real branching, several languages in one document, and a play mode to read it back as a reader would.",
  },
];

export function UseCases() {
  return (
    <section className="border-y border-border bg-card py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <BlurFade>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
                For anything whose shape is the paths through it
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                It began as a tool for D&amp;D prep. What it turned out to be is
                a place to write anything that branches.
              </p>
              <dl className="mt-8 space-y-6">
                {uses.map((use) => (
                  <div key={use.title}>
                    <dt className="font-semibold">{use.title}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">
                      {use.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <Screenshot name="files" />
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
