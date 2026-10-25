"use client";

import { useRef } from "react";
import { AudioLinesIcon, LetterTextIcon, LockIcon, Volume2Icon } from "lucide-react";

import { gsap, motionOK, useGSAP } from "@/lib/gsap";

type Clip = { start: number; length: number; label: string; seed: number };
type Lane = { name: string; locked?: boolean; clips: Clip[] };

/**
 * A soundscape as its tab draws it: named lanes, each clip with its
 * waveform, on one timeline — a music bed under the scene, rain over it, and
 * a bell on its own rhythm, a play and then a rest. Positions are fractions
 * of the timeline's width.
 */
const LANES: Lane[] = [
  { name: "Music", locked: true, clips: [{ start: 0, length: 1, label: "harbour-at-night.ogg · loop", seed: 3 }] },
  { name: "Rain", clips: [{ start: 0.08, length: 0.84, label: "rain-on-slate.ogg · loop", seed: 7 }] },
  {
    name: "Bell",
    clips: [
      { start: 0.18, length: 0.1, label: "bell", seed: 11 },
      { start: 0.5, length: 0.1, label: "bell", seed: 13 },
      { start: 0.82, length: 0.1, label: "bell", seed: 17 },
    ],
  },
];

/** A clip's waveform, as bars whose heights are fixed by its seed. */
function Waveform({ seed, bars, labelled }: { seed: number; bars: number; labelled?: boolean }) {
  return (
    <div className={`flex h-full items-center gap-[2px] px-1.5 ${labelled ? "pt-3.5" : ""}`} aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        const h = 22 + (((i + 1) * seed * 37) % 70);
        return <span key={i} className="w-[2px] shrink-0 rounded-full bg-foreground/35" style={{ height: `${h}%` }} />;
      })}
    </div>
  );
}

export function Soundscape() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        gsap.fromTo(
          "[data-playhead]",
          { left: "0%" },
          {
            left: "100%",
            duration: 12,
            ease: "none",
            repeat: -1,
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play pause resume pause",
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-4 font-ui">
      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        <div className="flex h-9 items-center gap-2 border-b border-border px-4 text-[13px] text-muted-foreground">
          <AudioLinesIcon className="size-4" />
          harbour-night.soundscape.json
          <span className="ml-auto font-code text-xs">0:00 — 2:00</span>
        </div>
        <div className="grid grid-cols-[84px_1fr]">
          {LANES.map((lane) => (
            <div key={lane.name} className="contents">
              <div className="flex h-14 items-center gap-1.5 border-b border-border px-3 text-[13px] last:border-0">
                {lane.name}
                {lane.locked && <LockIcon className="size-3 text-muted-foreground" />}
              </div>
              <div className="relative h-14 border-b border-l border-border bg-board">
                {lane.clips.map((clip, i) => (
                  <div
                    key={i}
                    className="absolute inset-y-2 overflow-hidden rounded-[6px] border border-border bg-accent"
                    style={{ left: `${clip.start * 100}%`, width: `${clip.length * 100}%` }}
                    title={clip.label}
                  >
                    <Waveform seed={clip.seed} bars={Math.max(6, Math.round(clip.length * 90))} labelled={clip.length > 0.3} />
                    {clip.length > 0.3 && (
                      <span className="absolute top-0.5 left-2 truncate text-[10.5px] text-muted-foreground">
                        {clip.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div />
          <div className="relative h-0">
            <span
              data-playhead
              aria-hidden
              className="absolute bottom-0 left-[38%] h-[168px] w-px bg-foreground/70"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-2 rounded-[12px] border border-border bg-card px-3 py-2">
          <LetterTextIcon className="size-4 text-node-prose" />
          At the gates
          <span className="text-muted-foreground">plays</span>
          <span className="font-code text-xs">harbour-night</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-[12px] border border-border bg-card px-3 py-2 text-muted-foreground">
          <Volume2Icon className="size-4" />
          …until a passage brings its own, or silence
        </span>
      </div>
    </div>
  );
}
