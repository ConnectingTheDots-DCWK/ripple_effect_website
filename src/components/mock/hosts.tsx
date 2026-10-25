"use client";

import { useRef } from "react";
import { AppWindowIcon, CpuIcon, GlobeIcon, SmartphoneIcon, WrenchIcon } from "lucide-react";

import { gsap, motionOK, useGSAP } from "@/lib/gsap";

const HOSTS = [
  { icon: CpuIcon, title: "Your own engine", body: "over the C ABI" },
  { icon: WrenchIcon, title: "An in-house tool", body: "C#, Dart or C++" },
  { icon: GlobeIcon, title: "A web page", body: "a WebAssembly component" },
  { icon: SmartphoneIcon, title: "A phone", body: "Android and iOS builds" },
];

/**
 * One engine and the places it runs, drawn as a hub: the lines out to each
 * host draw in as the diagram arrives, then each host lights in turn.
 */
export function Hosts() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const lines = gsap.utils.toArray<SVGLineElement>("[data-spoke]", root.current);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
        tl.from("[data-hub]", { autoAlpha: 0, scale: 0.9, duration: 0.5, ease: "back.out(1.6)" });
        lines.forEach((line, i) => {
          const length = Math.hypot(
            Number(line.getAttribute("x2")) - Number(line.getAttribute("x1")),
            Number(line.getAttribute("y2")) - Number(line.getAttribute("y1"))
          );
          tl.fromTo(
            line,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut" },
            i === 0 ? ">" : "<0.12"
          );
        });
        tl.from("[data-host]", { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.1, ease: "power3.out" }, "<0.1");
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative font-ui">
      {/* The spokes, behind the cards: from the hub at the centre to each
          corner card's inner edge. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden size-full sm:block"
      >
        {[
          [26, 22],
          [74, 22],
          [26, 78],
          [74, 78],
        ].map(([x, y]) => (
          <line
            key={`${x}-${y}`}
            data-spoke
            x1={50}
            y1={50}
            x2={x}
            y2={y}
            stroke="var(--outline)"
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 2 }}
          />
        ))}
      </svg>
      <div className="relative grid gap-4 sm:grid-cols-2 sm:gap-x-24 sm:gap-y-24">
        {HOSTS.map((host) => (
          <div
            key={host.title}
            data-host
            className="flex items-center gap-3 rounded-[16px] border border-border bg-card px-4 py-3"
          >
            <host.icon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{host.title}</p>
              <p className="truncate text-xs text-muted-foreground">{host.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div
        data-hub
        className="relative mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-foreground/30 bg-background px-4 py-2 text-sm font-medium sm:absolute sm:top-1/2 sm:left-1/2 sm:mt-0 sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        <AppWindowIcon className="size-4 text-brand" />
        The engine
      </div>
    </div>
  );
}
