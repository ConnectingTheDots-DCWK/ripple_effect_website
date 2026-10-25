"use client";

import { useCallback, useRef, useState } from "react";
import { IdCardIcon, LetterTextIcon, ScaleIcon, TimerIcon, VariableIcon } from "lucide-react";

import { Board, type Wire } from "./board";
import { FitWidth } from "./fit-width";
import { wire } from "./draw";
import { CardRule, ChoiceRow, NodeCard, PickerRow, PortRow, ProsePreview } from "./node-card";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

const W = 1040;
const H = 430;

const WIRES: Wire[] = [
  { id: "trust", from: "dc-brannoc:trust", to: "dc-cmp1:a" },
  { id: "guard0", from: "dc-cmp1:result", to: "dc-gate:g0" },
  { id: "zone", from: "dc-zone:value", to: "dc-cmp2:a" },
  { id: "guard1", from: "dc-cmp2:result", to: "dc-gate:g1" },
];

/** A literal typed on a port's row, as the card draws one. */
function Literal({ children, tick }: { children: string; tick?: string }) {
  return (
    <span
      data-tick={tick}
      className="ml-2 inline-block rounded-[6px] border border-outline bg-card px-2 py-0.5 font-code text-xs"
    >
      {children}
    </span>
  );
}

/**
 * A passage whose choices are not all buttons. One opens only once a
 * relationship has grown — an entity's `trust`, which the story and the game
 * both move — and one once the player stands somewhere in the game's world,
 * a console variable the game writes. Each reaches the choice through its
 * guard, the boolean input a wired choice grows. The third is taken by the
 * passage itself when its countdown runs out.
 *
 * Drawn with the app's own cards rather than a picture of a game: what is
 * being shown is the wiring, and the game is whatever the reader makes.
 */
export function Decisions() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const el = root.current!;
        const trust = el.querySelector<HTMLElement>("[data-tick='trust']")!;
        const zone = el.querySelector<HTMLElement>("[data-tick='zone']")!;
        const lit = { stroke: "var(--foreground)", strokeWidth: 3, duration: 0.3 };
        const unlit = { stroke: "var(--outline)", strokeWidth: 2, duration: 0.3 };
        const set = (cell: HTMLElement, text: string) => () => {
          cell.textContent = text;
        };
        const pulse = (cell: HTMLElement) =>
          gsap.fromTo(
            cell,
            { backgroundColor: "color-mix(in srgb, var(--foreground) 16%, transparent)" },
            { backgroundColor: "color-mix(in srgb, var(--foreground) 0%, transparent)", duration: 0.8 }
          );

        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 1.2,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play pause resume pause",
          },
        });
        tl.call(set(trust, "1"))
          .call(set(zone, "\"lighthouse\""))
          .set("[data-choice-row='0'], [data-choice-row='1']", { opacity: 0.35 })
          .set([wire(el, "guard0"), wire(el, "guard1")], unlit)
          .set("[data-ring]", { strokeDashoffset: 0 })
          // The relationship grows, over the story and over play.
          .call(set(trust, "2"), [], "+=0.8")
          .add(pulse(trust), "<")
          .call(set(trust, "3"), [], "+=0.9")
          .add(pulse(trust), "<")
          .to(wire(el, "guard0"), lit, "+=0.2")
          .to("[data-choice-row='0']", { opacity: 1, duration: 0.3 }, "<")
          // The player walks onto the jetty; the game says so.
          .call(set(zone, "\"jetty\""), [], "+=0.9")
          .add(pulse(zone), "<")
          .to(wire(el, "guard1"), lit, "+=0.2")
          .to("[data-choice-row='1']", { opacity: 1, duration: 0.3 }, "<")
          // And the tide waits for nobody.
          .to("[data-ring]", { strokeDashoffset: 50.3, duration: 3, ease: "none" }, "+=0.4")
          .fromTo(
            "[data-choice-row='2']",
            { backgroundColor: "color-mix(in srgb, var(--foreground) 0%, transparent)" },
            { backgroundColor: "color-mix(in srgb, var(--foreground) 10%, transparent)", duration: 0.25, yoyo: true, repeat: 1 }
          );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <div ref={root}>
      <div className="overflow-hidden rounded-[16px] border border-border bg-board p-6">
        <FitWidth width={W} height={H}>
          <Board wires={WIRES} onReady={onReady} style={{ width: W, height: H }}>
            <div className="absolute" style={{ left: 0, top: 10 }}>
              <NodeCard family="data" icon={IdCardIcon} title="Brannoc" width={250}>
                <PortRow input="exec" output="completed" inputId="dc-b:exec" outputId="dc-b:completed" />
                <PickerRow value="Brannoc · entity" />
                <PortRow output="trust" outputKind="data" outputId="dc-brannoc:trust">
                  <Literal tick="trust">1</Literal>
                </PortRow>
              </NodeCard>
            </div>
            <div className="absolute" style={{ left: 320, top: 40 }}>
              <NodeCard family="data" icon={ScaleIcon} title="Comparator" width={210}>
                <PortRow input="a" inputKind="data" inputId="dc-cmp1:a" output="result" outputKind="data" outputId="dc-cmp1:result" />
                <PortRow input="b" inputKind="data" inputId="dc-cmp1:b">
                  <span className="ml-1 font-code text-xs text-muted-foreground">≥</span>
                  <Literal>3</Literal>
                </PortRow>
              </NodeCard>
            </div>

            <div className="absolute" style={{ left: 0, top: 240 }}>
              <NodeCard family="data" icon={VariableIcon} title="Get variable" width={250}>
                <PortRow input="exec" output="completed" inputId="dc-z:exec" outputId="dc-z:completed" />
                <PickerRow value="zone" />
                <PortRow output="value" outputKind="data" outputId="dc-zone:value">
                  <Literal tick="zone">&quot;lighthouse&quot;</Literal>
                </PortRow>
              </NodeCard>
            </div>
            <div className="absolute" style={{ left: 320, top: 270 }}>
              <NodeCard family="data" icon={ScaleIcon} title="Comparator" width={210}>
                <PortRow input="a" inputKind="data" inputId="dc-cmp2:a" output="result" outputKind="data" outputId="dc-cmp2:result" />
                <PortRow input="b" inputKind="data" inputId="dc-cmp2:b">
                  <span className="ml-1 font-code text-xs text-muted-foreground">==</span>
                  <Literal>&quot;jetty&quot;</Literal>
                </PortRow>
              </NodeCard>
            </div>

            <div className="absolute" style={{ left: 640, top: 0 }}>
              <NodeCard family="prose" icon={LetterTextIcon} title="The harbour gate" inId="dc-gate:in" width={330}>
                <PickerRow value="the-keeper-the-harbour-gate" />
                <ProsePreview className="h-[72px]">
                  Brannoc has the only key to the harbour gate, and the tide is
                  already turning.
                </ProsePreview>
                <CardRule />
                <PortRow input="when · Ask for the key" inputKind="data" inputId="dc-gate:g0" />
                <PortRow input="when · Take the boat" inputKind="data" inputId="dc-gate:g1" />
                <CardRule />
                <div data-choice-row="0">
                  <ChoiceRow label="Ask Brannoc for the key" outputId="dc-gate:c0" />
                </div>
                <div data-choice-row="1">
                  <ChoiceRow label="Take the boat" outputId="dc-gate:c1" />
                </div>
                <div data-choice-row="2" className="relative">
                  <ChoiceRow label="Wait for the tide" outputId="dc-gate:c2" />
                  <TimerIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="flex h-[26px] items-center gap-2 px-2.5 text-[12.5px] text-muted-foreground">
                  <svg viewBox="0 0 20 20" className="size-4 -rotate-90" aria-hidden>
                    <circle cx={10} cy={10} r={8} fill="none" stroke="var(--border)" strokeWidth={2.5} />
                    <circle
                      data-ring
                      cx={10}
                      cy={10}
                      r={8}
                      fill="none"
                      stroke="var(--foreground)"
                      strokeWidth={2.5}
                      strokeDasharray={50.3}
                      strokeDashoffset={0}
                    />
                  </svg>
                  30 s, then <span className="text-foreground/85">Wait for the tide</span>
                </div>
              </NodeCard>
            </div>
          </Board>
        </FitWidth>
      </div>
    </div>
  );
}
