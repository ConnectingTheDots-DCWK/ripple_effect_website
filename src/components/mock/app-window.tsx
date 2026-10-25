"use client";

import { useRef } from "react";
import {
  FilesIcon,
  GitBranchIcon,
  HardDriveIcon,
  SearchIcon,
  WifiOffIcon,
  WorkflowIcon,
} from "lucide-react";

import { FileTree } from "./panels";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

const FAMILIES = ["prose", "prose", "flow", "data", "prose", "entry", "terminal", "flow", "prose", "data"];

/**
 * A board far bigger than the window, as the app draws it zoomed out: every
 * card a sketch — its header in its family's colour, its rows as lines —
 * which is the level of detail the canvas switches to past a quarter of full
 * size. Laid out once, deterministically, so the picture is the same on
 * every load.
 */
const SKETCH = Array.from({ length: 54 }, (_, i) => {
  const col = i % 9;
  const row = Math.floor(i / 9);
  return {
    x: 30 + col * 150 + (row % 2) * 40,
    y: 30 + row * 120 + ((col * 37) % 40),
    rows: 2 + ((i * 7) % 4),
    family: FAMILIES[(i * 3) % FAMILIES.length],
  };
});

/**
 * The editor as a window on somebody's desk — activity bar, Explorer, a board
 * — with what makes it local said in its own chrome: the folder it is
 * reading, and nothing needing a network. Scrolling past it zooms the board
 * out, the way the canvas holds a few hundred cards without stuttering.
 */
export function AppWindow() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        gsap.fromTo(
          "[data-sketch]",
          { scale: 1.9 },
          {
            scale: 0.72,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%",
              end: "bottom 25%",
              scrub: 0.5,
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="overflow-hidden rounded-[24px] border border-border bg-card font-ui text-foreground"
    >
      <div className="flex h-10 items-center gap-2 border-b border-border px-4 text-[13px] text-muted-foreground">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </span>
        <span className="mx-auto truncate">The Keeper — Ripple Effect</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs">
          <WifiOffIcon className="size-3.5" />
          Offline
        </span>
      </div>
      <div className="grid h-[340px] grid-cols-[44px_1fr] sm:grid-cols-[44px_190px_1fr]">
        <div className="flex flex-col items-center gap-4 border-r border-border py-3 text-muted-foreground">
          <FilesIcon className="size-5 text-foreground" />
          <SearchIcon className="size-5" />
          <GitBranchIcon className="size-5" />
          <WorkflowIcon className="size-5" />
        </div>
        <div className="hidden overflow-hidden border-r border-border sm:block [&>div]:rounded-none [&>div]:border-0">
          <FileTree
            entries={[
              { name: "the-keeper", depth: 0, kind: "folder", open: true },
              { name: "chapters", depth: 1, kind: "folder", open: true },
              { name: "act-one.graph.json", depth: 2, kind: "board" },
              { name: "act-two.graph.json", depth: 2, kind: "board" },
              { name: "passages", depth: 1, kind: "folder" },
              { name: "scripts", depth: 1, kind: "folder" },
              { name: "notes.md", depth: 1, kind: "file" },
            ]}
          />
        </div>
        <div className="relative overflow-hidden bg-board">
          <div aria-hidden className="canvas-grid absolute inset-0" />
          <div data-sketch className="absolute top-0 left-0 h-[760px] w-[1400px] origin-[35%_30%]">
            {SKETCH.map((card, i) => (
              <div
                key={i}
                className="absolute w-[110px] overflow-hidden rounded-[6px] border border-border bg-accent"
                style={{ left: card.x, top: card.y }}
              >
                <div
                  className="h-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--node-${card.family}) 35%, transparent)`,
                  }}
                />
                <div className="space-y-1.5 p-2">
                  {Array.from({ length: card.rows }, (_, r) => (
                    <div
                      key={r}
                      className="h-1 rounded-full bg-foreground/15"
                      style={{ width: `${90 - ((r * 23 + i * 11) % 45)}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex h-8 items-center gap-2 border-t border-border px-4 text-xs text-muted-foreground">
        <HardDriveIcon className="size-3.5" />
        <span className="truncate font-code">~/Stories/the-keeper</span>
        <span className="ml-auto">Saved</span>
      </div>
    </div>
  );
}
