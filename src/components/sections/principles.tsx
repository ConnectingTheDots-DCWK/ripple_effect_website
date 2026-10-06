import { FolderOpenIcon, FileJsonIcon, GitBranchIcon } from "lucide-react";

import { BlurFade } from "@/components/velora/blur-fade";

/**
 * The three claims from the app's README, which are the strongest thing it has
 * to say against a browser-based competitor. Quoted rather than paraphrased.
 */
const principles = [
  {
    icon: FolderOpenIcon,
    title: "Everything is a file",
    body: "A project is a view onto a folder. The app writes no scaffold into it, imposes no layout and claims no ownership — open a directory you already have and it is a project.",
  },
  {
    icon: FileJsonIcon,
    title: "No proprietary, opaque format",
    body: "Boards are JSON. Prose is Markdown. Scripts are .py. Every one of them opens in any editor you already trust, and keeps working if this app disappears.",
  },
  {
    icon: GitBranchIcon,
    title: "Meant for version control",
    body: "Stable ids, sorted keys and relative paths, so a diff reads as prose and two people can work on the same story without fighting over a binary blob.",
  },
];

export function Principles() {
  return (
    <section className="border-y border-border bg-card py-16 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3 lg:px-8">
        {principles.map((principle, index) => (
          <BlurFade key={principle.title} delay={index * 0.08}>
            <div>
              <principle.icon className="size-5 text-brand" />
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {principle.body}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
