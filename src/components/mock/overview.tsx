"use client";

import { useCallback, useRef, useState } from "react";
import { CirclePlayIcon, CircleStopIcon, PlayIcon, WorkflowIcon } from "lucide-react";

import { Board, type Wire } from "./board";
import { FitWidth } from "./fit-width";
import { Port } from "./node-card";
import { drawWire, wire } from "./draw";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

const W = 900;
const H = 330;

type Chapter = { id: string; title: string; at: [number, number]; start?: boolean; ends?: string[] };

/**
 * A small project as script navigation draws it: a card per board, laid out
 * left to right in the order the story reaches them, a start marker where a
 * thread begins and a stop where one ends — and the arrow out of a Jump
 * labelled with where it lands, `Down → The cellar` when it names a passage.
 */
const CHAPTERS: Chapter[] = [
  { id: "arrival", title: "Arrival", at: [0, 120], start: true },
  { id: "lighthouse", title: "The lighthouse", at: [300, 30] },
  { id: "shore", title: "The shore", at: [300, 220] },
  { id: "cellar", title: "The cellar", at: [620, 30], ends: ["Light in the window"] },
  { id: "tide", title: "The tide", at: [620, 220], ends: ["The boat is gone"] },
];

const WIRES: Wire[] = [
  { id: "a-l", from: "ov-arrival:o0", to: "ov-lighthouse:in" },
  { id: "a-s", from: "ov-arrival:o1", to: "ov-shore:in" },
  { id: "l-c", from: "ov-lighthouse:o0", to: "ov-cellar:in" },
  { id: "s-t", from: "ov-shore:o0", to: "ov-tide:in" },
];

const LABELS: Record<string, string[]> = {
  arrival: ["Up to the lamp", "Down to the water"],
  lighthouse: ["Down → The cellar"],
  shore: ["Wade out"],
};

function ChapterCard({ chapter }: { chapter: Chapter }) {
  const exits = LABELS[chapter.id] ?? [];
  return (
    <div
      data-chapter
      className="absolute w-[240px] rounded-[12px] border border-border bg-accent font-ui text-foreground"
      style={{ left: chapter.at[0], top: chapter.at[1] }}
    >
      <div className="relative flex h-9 items-center gap-2 rounded-[11px] bg-foreground/[0.06] px-2.5">
        <WorkflowIcon className="size-4 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{chapter.title}</span>
        <PlayIcon className="ml-auto size-3.5 text-muted-foreground" />
        {!chapter.start && <Port id={`ov-${chapter.id}:in`} side="in" />}
      </div>
      <div className="py-1">
        {chapter.start && (
          <div className="flex h-7 items-center gap-2 px-2.5 text-[12.5px] text-node-entry">
            <CirclePlayIcon className="size-3.5" />
            The story begins here
          </div>
        )}
        {exits.map((label, i) => (
          <div key={label} className="relative flex h-7 items-center justify-end px-2.5 text-[12.5px] text-foreground/85">
            {label}
            <Port id={`ov-${chapter.id}:o${i}`} side="out" />
          </div>
        ))}
        {chapter.ends?.map((end) => (
          <div key={end} className="flex h-7 items-center gap-2 px-2.5 text-[12.5px] text-node-terminal">
            <CircleStopIcon className="size-3.5" />
            {end}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Overview() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const el = root.current;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
        const cards = gsap.utils.toArray<HTMLElement>("[data-chapter]", el);
        gsap.set(cards, { autoAlpha: 0, y: 10 });
        // Column by column, as the layout reads: left to right.
        tl.to(cards[0], { autoAlpha: 1, y: 0, duration: 0.4 })
          .add(drawWire(wire(el, "a-l")!, { duration: 0.45 }))
          .add(drawWire(wire(el, "a-s")!, { duration: 0.45 }), "<")
          .to([cards[1], cards[2]], { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.15")
          .add(drawWire(wire(el, "l-c")!, { duration: 0.45 }))
          .add(drawWire(wire(el, "s-t")!, { duration: 0.45 }), "<")
          .to([cards[3], cards[4]], { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.15");
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <div ref={root} className={ready ? undefined : "motion-safe:invisible"}>
      <div className="overflow-hidden rounded-[16px] border border-border bg-board p-6">
        <FitWidth width={W} height={H}>
          <Board wires={WIRES} onReady={onReady} style={{ width: W, height: H }}>
            {CHAPTERS.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </Board>
        </FitWidth>
      </div>
    </div>
  );
}
