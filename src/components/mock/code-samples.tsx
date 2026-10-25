"use client";

import { useRef, useState } from "react";

import { Code, type Lang } from "@/components/mock/code";
import { LanguageLogo, type LogoName } from "@/components/language-logo";
import { cn } from "@/lib/utils";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

type Binding = {
  name: string;
  logo: LogoName;
  /** Where it is installed from, and that registry's mark when it has one. */
  from: string;
  fromLogo?: LogoName;
  install: string;
  installLang: Lang;
  lang: Lang;
  code: string;
};

/**
 * One loop over a campaign in each binding, lifted from each binding's own
 * README and trimmed — never written for the page — with its install step in
 * the package manager's own words.
 */
export const BINDINGS: Binding[] = [
  {
    name: "TypeScript",
    logo: "typescript",
    from: "npm",
    fromLogo: "npm",
    install: "npm install @ripplefx/player",
    installLang: "sh",
    lang: "ts",
    code: `import { Campaign, Player } from '@ripplefx/player';

const campaign = await Campaign.load('/campaigns/the-keeper/');
const player = new Player(campaign.session({ seed: Date.now() }), {
  onEffect(effect) {
    if (effect.kind === 'show') drawPassage(effect.passage);
  },
});
player.start();`,
  },
  {
    name: "C++",
    logo: "cpp",
    from: "CMake",
    install: `include(FetchContent)
FetchContent_Declare(ripple_effect
    GIT_REPOSITORY https://github.com/ConnectingTheDots-DCWK/ripple_effect_c_cpp_integration
    GIT_TAG vX.Y.Z)   # the release you pin
FetchContent_MakeAvailable(ripple_effect)
target_link_libraries(my_game PRIVATE Ripple::cpp)`,
    installLang: "cmake",
    lang: "cpp",
    code: `const auto campaign = ripple::Campaign::open_dir("campaigns/the-keeper");
ripple::SessionConfig config;
config.board = campaign.manifest().entries.front();
ripple::Session session = ripple::Session::create(campaign, config);

for (ripple::Effects batch = session.start();;) {
    const ripple::Effect& turn = batch.back();   // the Turn comes last
    if (ripple::is_over(turn)) break;
    if (auto* shown = std::get_if<ripple::Show>(&turn)) {
        draw(shown->passage);
        batch = session.choose(pick(shown->passage));
    }
}`,
  },
  {
    name: "C#",
    logo: "csharp",
    from: "NuGet",
    fromLogo: "nuget",
    install: `dotnet add package RippleFx.Engine
dotnet add package RippleFx.Engine.Native   # or RippleFx.Engine.Native.NoPython`,
    installLang: "sh",
    lang: "cs",
    code: `using var campaign = Campaign.OpenDirectory("campaigns/the-keeper");
using var session = Session.Create(campaign,
    new SessionConfig { Board = campaign.Manifest.Entries[0] });

for (var batch = session.Start(); ;)
{
    var turn = batch[batch.Count - 1];            // the Turn comes last
    if (turn.IsOver) break;
    batch = turn switch
    {
        Effect.Show shown => session.Choose(Pick(shown.Passage)),
        Effect.Hold hold => WaitThenElapsed(session, hold.Ms),
        Effect.Ask asked => session.Answer(Fill(asked.Prompt)),
        _ => throw new InvalidOperationException(),
    };
}`,
  },
  {
    name: "Dart",
    logo: "dart",
    from: "pub.dev",
    fromLogo: "dart",
    install: "dart pub add ripplefx_engine        # or: flutter pub add ripplefx_engine",
    installLang: "sh",
    lang: "dart",
    code: `final campaign = await Campaign.openDirectory('campaigns/the-keeper');
final session = Session.create(
  campaign,
  SessionConfig(board: campaign.manifest.entries.first),
);

for (var batch = session.start(); !batch.last.isOver;) {
  batch = switch (batch.last) {                     // the Turn comes last
    Show(:final passage) => session.choose(pick(passage)),
    Hold(:final ms) => await wait(ms, session.elapsed),
    Ask(:final prompt) => session.answer(fill(prompt)),
    _ => throw StateError('every batch ends on a Turn'),
  };
}`,
  },
];

/** The four bindings as tabs: the language's mark on each, the install step above the loop. */
export function Languages() {
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const binding = BINDINGS[index];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        gsap.from("[data-line]", { autoAlpha: 0, x: -6, duration: 0.25, stagger: 0.015 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [index], revertOnUpdate: true }
  );

  return (
    <div ref={root}>
      <div role="tablist" aria-label="Language" className="mb-3 flex flex-wrap gap-1.5">
        {BINDINGS.map((b, i) => (
          <button
            key={b.name}
            role="tab"
            type="button"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "inline-flex items-center gap-2 rounded-[8px] border px-3 py-1.5 font-ui text-sm transition-colors",
              i === index
                ? "border-foreground bg-card text-foreground"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <LanguageLogo name={b.logo} size={16} decorative />
            {b.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={binding.name} className="grid grid-cols-1 gap-3">
        <Code
          code={binding.install}
          lang={binding.installLang}
          title={
            <>
              {binding.fromLogo && <LanguageLogo name={binding.fromLogo} size={14} decorative />}
              {binding.from}
            </>
          }
        />
        <Code code={binding.code} lang={binding.lang} />
      </div>
    </div>
  );
}
