"use client";

import { useCallback, useRef, useState } from "react";
import { CircleStopIcon, CirclePlayIcon, LetterTextIcon, PlusIcon } from "lucide-react";

import { Board, type Wire } from "@/components/mock/board";
import { FitWidth } from "@/components/mock/fit-width";
import {
  CardRule,
  ChoiceRow,
  NodeCard,
  PickerRow,
  ProsePreview,
} from "@/components/mock/node-card";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";
import { drawWire, wire } from "./draw";

const PROSE =
  "The lamp hasn’t been lit in three nights. Below the tower the bell on the reef is ringing with nobody to ring it, and the boat you came in has slipped its rope.";

const WIRES: Wire[] = [
  { id: "start", from: "hero-start:out", to: "hero-lamp:in" },
  { id: "climb", from: "hero-lamp:c0", to: "hero-light:in" },
  { id: "shore", from: "hero-lamp:c1", to: "hero-tide:in" },
];

const W = 960;
const H = 300;

/**
 * A board being written while you watch: a Start wires into a passage, the
 * passage's prose arrives, and its two choices wire out to two endings — what
 * the app is, in about four seconds, drawn with the app's own card. It plays
 * once, when it scrolls into view.
 */
export function StoryBoard() {
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
        const card = (name: string) => `[data-card="${name}"]`;
        const draw = (id: string) => drawWire(wire(el, id)!, { duration: 0.5 });

        gsap.set("[data-card]", { autoAlpha: 0, y: 8 });
        gsap.set("[data-word]", { autoAlpha: 0 });
        gsap.set("[data-choice]", { autoAlpha: 0, x: -6 });

        tl.to(card("start"), { autoAlpha: 1, y: 0, duration: 0.4 })
          .add(draw("start"))
          .to(card("lamp"), { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.1")
          .to("[data-word]", { autoAlpha: 1, duration: 0.05, stagger: 0.035 })
          .to("[data-choice]", { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.12 })
          .add(draw("climb"))
          .to(card("light"), { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.15")
          .add(draw("shore"), "-=0.1")
          .to(card("tide"), { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.15");
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    // Hidden until the timeline can take it, so the finished board does not
    // flash before it is drawn; a reader who asked for less motion is never
    // made to wait for it.
    <div ref={root} className={ready ? undefined : "motion-safe:invisible"}>
      <FitWidth width={W} height={H}>
        <Board wires={WIRES} onReady={onReady} style={{ width: W, height: H }}>
          <div data-card="start" className="absolute" style={{ left: 0, top: 48 }}>
            <NodeCard family="entry" icon={CirclePlayIcon} title="Start" outId="hero-start:out" />
          </div>
          <div data-card="lamp" className="absolute" style={{ left: 336, top: 0 }}>
            <NodeCard family="prose" icon={LetterTextIcon} title="The lamp room" inId="hero-lamp:in">
              <PickerRow value="the-keeper-the-lamp-room" />
              <ProsePreview>
                {PROSE.split(" ").map((word, i) => (
                  <span key={i} data-word>
                    {word}{" "}
                  </span>
                ))}
              </ProsePreview>
              <CardRule />
              <div data-choice>
                <ChoiceRow label="Climb to the lamp" outputId="hero-lamp:c0" />
              </div>
              <div data-choice>
                <ChoiceRow label="Go down to the shore" outputId="hero-lamp:c1" />
              </div>
              <div data-choice className="relative">
                <ChoiceRow label="Drag out for a new choice" outputId="hero-lamp:c2" muted />
                <PlusIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </NodeCard>
          </div>
          <div data-card="light" className="absolute" style={{ left: 692, top: 136 }}>
            <NodeCard family="terminal" icon={CircleStopIcon} title="Light in the window" inId="hero-light:in" />
          </div>
          <div data-card="tide" className="absolute" style={{ left: 692, top: 232 }}>
            <NodeCard family="terminal" icon={CircleStopIcon} title="The tide takes the boat" inId="hero-tide:in" />
          </div>
        </Board>
      </FitWidth>
    </div>
  );
}
