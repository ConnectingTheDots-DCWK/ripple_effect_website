"use client";

import { useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, Gamepad2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

type Message = {
  /** Which way it goes: from the game into the story, or back. */
  to: "story" | "game";
  /** What it is, in the binding's own spelling. */
  code: string;
  /** What it means, for a reader who does not speak the API. */
  note: string;
};

/**
 * A minute of play as the traffic between a game and the story, both ways,
 * in the JavaScript binding's own calls and effects (`@ripplefx/player`'s
 * `Session` and `Effect`). Nothing here is invented: every verb and every
 * effect kind is in the binding.
 */
const MESSAGES: Message[] = [
  { to: "story", code: "session.writeCvar('zone', 'jetty')", note: "The player walked onto the jetty." },
  { to: "game", code: "{ kind: 'changed', cvars: [zone] }", note: "The story saw it, and says what moved." },
  { to: "game", code: "callback  reachedTheJetty", note: "A named moment the writer declared — cvar.changed, aimed at zone." },
  { to: "story", code: "session.choose(1)", note: "The game takes “Take the boat” — no button pressed." },
  { to: "game", code: "{ kind: 'show', passage }", note: "The next passage, for the game to draw its own way." },
  { to: "game", code: "callback  brannocTrusts", note: "entity.field.changed, aimed at Brannoc’s trust." },
  { to: "story", code: "session.entities", note: "Read the cast: Brannoc { trust: 3 }, every attribute typed." },
];

/**
 * The game on one side, the story on the other, and what crosses between
 * them, arriving one message at a time.
 */
export function TwoWay() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-message]", root.current);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
        rows.forEach((row) => {
          const fromLeft = row.dataset.message === "story";
          tl.from(row, { autoAlpha: 0, x: fromLeft ? -24 : 24, duration: 0.45, ease: "power3.out" }, "+=0.15");
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="overflow-hidden rounded-[16px] border border-border bg-card font-ui">
      <div className="grid grid-cols-2 border-b border-border text-[13px] font-medium">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Gamepad2Icon className="size-4 text-muted-foreground" />
          Your game
        </div>
        <div className="flex items-center justify-end gap-2 border-l border-border px-4 py-2.5">
          The story
          <BookOpenIcon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <ol className="divide-y divide-border">
        {MESSAGES.map((m) => (
          <li
            key={m.code}
            data-message={m.to}
            className={cn("flex items-start gap-3 px-4 py-3", m.to === "game" && "flex-row-reverse text-right")}
          >
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                m.to === "story" ? "border-foreground/40 text-foreground" : "border-border text-muted-foreground"
              )}
            >
              {m.to === "story" ? <ArrowRightIcon className="size-3.5" /> : <ArrowLeftIcon className="size-3.5" />}
            </span>
            <div className="min-w-0">
              <p className="truncate font-code text-[12.5px]">{m.code}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
