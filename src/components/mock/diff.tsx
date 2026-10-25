"use client";

import { useRef } from "react";
import { CircleStopIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

const DIFF: { mark: " " | "+" | "-"; text: string }[] = [
  { mark: " ", text: `  "connections": [` },
  { mark: " ", text: `    {` },
  { mark: " ", text: `      "id": "connection_4",` },
  { mark: " ", text: `      "type": "default",` },
  { mark: " ", text: `      "from": { "nodeId": "narration_1", "portId": "choice_0" },` },
  { mark: " ", text: `      "to": { "nodeId": "narration_2", "portId": "in" }` },
  { mark: " ", text: `    },` },
  { mark: "+", text: `    {` },
  { mark: "+", text: `      "id": "connection_9",` },
  { mark: "+", text: `      "type": "default",` },
  { mark: "+", text: `      "from": { "nodeId": "narration_1", "portId": "choice_1" },` },
  { mark: "+", text: `      "to": { "nodeId": "end_0", "portId": "in" }` },
  { mark: "+", text: `    },` },
];

export function Diff() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        gsap.from("[data-added]", {
          autoAlpha: 0,
          height: 0,
          duration: 0.3,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );
  return (
    <div ref={root} className="overflow-hidden rounded-[16px] border border-border bg-card font-ui">
      <div className="flex h-9 items-center gap-2 border-b border-border px-4 text-[13px] text-muted-foreground">
        chapters/the-lighthouse.graph.json
        <span className="ml-auto font-code text-xs text-go">+6</span>
      </div>
      <pre className="overflow-x-auto py-3 font-code text-[12.5px] leading-6">
        {DIFF.map((line, i) => (
          <div
            key={i}
            data-added={line.mark === "+" ? "" : undefined}
            className={cn(
              "flex overflow-hidden px-4",
              line.mark === "+" && "bg-go/10",
              line.mark === "-" && "bg-destructive/10"
            )}
          >
            <span
              className={cn(
                "w-5 shrink-0 select-none",
                line.mark === "+" ? "text-go" : "text-muted-foreground/60"
              )}
            >
              {line.mark}
            </span>
            <span className="whitespace-pre">{line.text}</span>
          </div>
        ))}
      </pre>
      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
        <CircleStopIcon className="size-4 text-node-terminal" />
        Go down to the shore → The tide takes the boat
      </div>
    </div>
  );
}
