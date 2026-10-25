"use client";

import { useRef } from "react";
import { BoxIcon, FileCodeIcon, SlidersHorizontalIcon } from "lucide-react";

import { Code } from "./code";
import { cn } from "@/lib/utils";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

/**
 * A table the way the app lays out a component's attributes or the console
 * variables: a name, its type, its value. A row may carry `data-tick` with
 * the values it moves through, for an animation to step it.
 */
export function TypedTable({
  title,
  icon: Icon,
  rows,
  className,
}: {
  title: string;
  icon: typeof BoxIcon;
  rows: { name: string; type: string; value: string; tick?: string[] }[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[16px] border border-border bg-card font-ui", className)}>
      <div className="flex h-9 items-center gap-2 border-b border-border px-4 text-[13px] text-muted-foreground">
        <Icon className="size-4" />
        <span className="truncate">{title}</span>
      </div>
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border last:border-0">
              <td className="py-2 pl-4 font-code">{row.name}</td>
              <td className="py-2 font-code text-xs text-muted-foreground">{row.type}</td>
              <td className="py-2 pr-4 text-right font-code">
                <span
                  data-tick={row.tick?.join("|")}
                  className="inline-block rounded-[6px] px-1.5 transition-colors"
                >
                  {row.value}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SCRIPT = `# weather.py — how hard the storm blows tonight
keeper = component("Keeper")
gust = roll + keeper["nerve"]

if gust > 15:
    storm = "gale"
else:
    storm = "squall"`;

/**
 * Scripting and the systems a story keeps, side by side: a Script node's
 * Python reading an entity's attribute, the entity's sheet, and the console
 * variables — one of which moves while you watch, the way the live panel
 * shows it during play.
 */
export function Systems() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", root.current);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
        tl.from(panels, { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.15, ease: "power3.out" });
        for (const cell of gsap.utils.toArray<HTMLElement>("[data-tick]", root.current)) {
          const values = (cell.dataset.tick ?? "").split("|").filter(Boolean);
          values.slice(1).forEach((value) => {
            tl.to(cell, { backgroundColor: "color-mix(in srgb, var(--foreground) 12%, transparent)", duration: 0.2 }, "+=0.7")
              .call(() => {
                cell.textContent = value;
              })
              .to(cell, { backgroundColor: "transparent", duration: 0.6 });
          });
        }
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-4">
      <div data-panel>
        <Code
          code={SCRIPT}
          lang="python"
          title={
            <>
              <FileCodeIcon className="size-4" />
              weather.py
            </>
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div data-panel>
          <TypedTable
            title="Keeper · entity"
            icon={BoxIcon}
            rows={[
              { name: "nerve", type: "int", value: "4" },
              { name: "lantern", type: "bool", value: "true" },
              { name: "pack", type: "list<string>", value: "[3 items]" },
            ]}
          />
        </div>
        <div data-panel>
          <TypedTable
            title="Console variables"
            icon={SlidersHorizontalIcon}
            rows={[
              { name: "lamp_oil", type: "int", value: "3", tick: ["3", "2", "1"] },
              { name: "storm", type: "string", value: "squall", tick: ["squall", "gale"] },
              { name: "bell_rung", type: "bool", value: "false" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
