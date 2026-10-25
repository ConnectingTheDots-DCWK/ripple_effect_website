"use client";

import { useCallback, useRef, useState } from "react";
import {
  CirclePlayIcon,
  CopyPlusIcon,
  Dice5Icon,
  IdCardIcon,
  LetterTextIcon,
  LogOutIcon,
  SignpostIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import { Board, type Wire } from "./board";
import { FitWidth } from "./fit-width";
import { drawWire, wire } from "./draw";
import { CardRule, ChoiceRow, NodeCard, PickerRow, PortRow, ProsePreview, TextFieldRow } from "./node-card";
import { TypedTable } from "./systems";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

/* ---------------------------------------------------------------- board */

const W = 1180;
const H = 340;

const SESSION_WIRES: Wire[] = [
  { id: "s1", from: "tt-start:out", to: "tt-gates:in" },
  { id: "s2", from: "tt-gates:c0", to: "tt-dice:exec" },
  { id: "s3", from: "tt-gates:c1", to: "tt-sewers:in" },
  { id: "s4", from: "tt-dice:completed", to: "tt-check:exec" },
];

/**
 * A session laid out as a storyboard: the party at the gates, a roll to
 * talk their way in, and the way under the walls if it fails — the next
 * chapter a board of its own, reached with a Jump.
 */
export function SessionBoard() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const el = root.current;
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
        gsap.set(cards, { autoAlpha: 0, y: 10 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } });
        tl.to(cards[0], { autoAlpha: 1, y: 0, duration: 0.35 })
          .add(drawWire(wire(el, "s1")!, { duration: 0.4 }))
          .to(cards[1], { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.1")
          .add(drawWire(wire(el, "s2")!, { duration: 0.4 }))
          .add(drawWire(wire(el, "s3")!, { duration: 0.4 }), "<")
          .to([cards[2], cards[3]], { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.1")
          .add(drawWire(wire(el, "s4")!, { duration: 0.4 }))
          .to(cards[4], { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.1");
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <div ref={root} className={ready ? undefined : "motion-safe:invisible"}>
      <div className="overflow-hidden rounded-[16px] border border-border bg-board p-6">
        <FitWidth width={W} height={H}>
          <Board wires={SESSION_WIRES} onReady={onReady} style={{ width: W, height: H }}>
            <div data-card className="absolute" style={{ left: 0, top: 30 }}>
              <NodeCard family="entry" icon={CirclePlayIcon} title="Start" outId="tt-start:out" width={180} />
            </div>
            <div data-card className="absolute" style={{ left: 240, top: 0 }}>
              <NodeCard family="prose" icon={LetterTextIcon} title="At the gates" inId="tt-gates:in">
                <PickerRow value="elsenmar-at-the-gates" />
                <ProsePreview className="h-[72px]">
                  The queue has not moved since noon, and the gate-captain is
                  turning people away by the cartload.
                </ProsePreview>
                <CardRule />
                <ChoiceRow label="Talk your way in" outputId="tt-gates:c0" />
                <ChoiceRow label="Find another way" outputId="tt-gates:c1" />
              </NodeCard>
            </div>
            <div data-card className="absolute" style={{ left: 600, top: 0 }}>
              <NodeCard family="data" icon={Dice5Icon} title="Persuasion">
                <PortRow input="exec" output="completed" inputId="tt-dice:exec" outputId="tt-dice:completed" />
                <TextFieldRow label="Roll" value="1d20 + 3" />
                <PortRow output="total" outputKind="data" outputId="tt-dice:total" />
              </NodeCard>
            </div>
            <div data-card className="absolute" style={{ left: 600, top: 250 }}>
              <NodeCard family="terminal" icon={LogOutIcon} title="Into the sewers" inId="tt-sewers:in" width={240} />
            </div>
            <div data-card className="absolute" style={{ left: 930, top: 40 }}>
              <NodeCard family="flow" icon={SignpostIcon} title="Did it work?" width={240}>
                <PortRow input="exec" output="yes" inputId="tt-check:exec" outputId="tt-check:yes" />
              </NodeCard>
            </div>
          </Board>
        </FitWidth>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- entities */

const ROSTER = ["Goblin 1", "Goblin 2", "Goblin 3", "Goblin 4", "Goblin 5", "Goblin 6"];

/**
 * The entity system in three pieces: a component described once — a name and
 * typed attributes — a Spawn card making six of it, and the roster the
 * campaign then holds, one of which the story takes away again.
 */
export function Entities() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
        tl.from("[data-entity-panel]", { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.15, ease: "power3.out" })
          .from("[data-entity]", { autoAlpha: 0, scale: 0.85, duration: 0.3, stagger: 0.08, ease: "back.out(1.7)" })
          .to("[data-entity='Goblin 3']", { opacity: 0.35, textDecorationLine: "line-through", duration: 0.4 }, "+=0.5");
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-4">
      <div data-entity-panel>
        <TypedTable
          title="Goblin.component.json"
          icon={IdCardIcon}
          rows={[
            { name: "hp", type: "int", value: "7" },
            { name: "attack", type: "string", value: "1d6" },
            { name: "loot", type: "list<asset>", value: "[2 files]" },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <div data-entity-panel>
          <NodeCard family="data" icon={CopyPlusIcon} title="Spawn" className="max-w-full">
            <PortRow input="exec" output="completed" inputId="sp:exec" outputId="sp:completed" />
            <PickerRow value="Goblin" />
            <PortRow input="name" inputKind="data" inputId="sp:name">
              <span className="ml-2 rounded-[6px] border border-outline bg-card px-2 py-0.5 font-code text-xs">Goblin</span>
            </PortRow>
            <PortRow input="count" inputKind="data" inputId="sp:count" output="entities" outputKind="data" outputId="sp:out">
              <span className="ml-2 rounded-[6px] border border-outline bg-card px-2 py-0.5 font-code text-xs">6</span>
            </PortRow>
          </NodeCard>
        </div>
        <div data-entity-panel className="rounded-[16px] border border-border bg-card p-4 font-ui">
          <p className="text-xs text-muted-foreground">Entities the campaign holds</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ROSTER.map((name) => (
              <li
                key={name}
                data-entity={name}
                className="rounded-full border border-border bg-background px-3 py-1 font-code text-xs"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- world state */

/**
 * The state of the world as console variables — typed, declared once on the
 * project's variables page — and a Variable branch card reading one, while
 * the values move the way the live panel shows them during play.
 */
export function WorldState() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
        tl.from("[data-world-panel]", { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.15, ease: "power3.out" });
        for (const cell of gsap.utils.toArray<HTMLElement>("[data-tick]", root.current)) {
          const values = (cell.dataset.tick ?? "").split("|").filter(Boolean);
          values.slice(1).forEach((value) => {
            tl.to(cell, { backgroundColor: "color-mix(in srgb, var(--foreground) 12%, transparent)", duration: 0.2 }, "+=0.6")
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
      <div data-world-panel>
        <TypedTable
          title="Console variables"
          icon={SlidersHorizontalIcon}
          rows={[
            { name: "city_alarm", type: "int", value: "0", tick: ["0", "1", "2"] },
            { name: "gates_open", type: "bool", value: "false", tick: ["false", "true"] },
            { name: "season", type: "string", value: "autumn" },
            { name: "patrons", type: "json", value: "{…}" },
          ]}
        />
      </div>
      <div data-world-panel>
        <NodeCard family="flow" icon={SignpostIcon} title="Variable branch" className="max-w-full">
          <PortRow input="exec" inputId="vb:exec" output="yes" outputId="vb:yes" />
          <PickerRow value="city_alarm" />
          <PortRow input="value" inputKind="data" inputId="vb:value" output="no" outputId="vb:no">
            <span className="ml-2 font-code text-xs text-muted-foreground">≥</span>
            <span className="ml-1.5 rounded-[6px] border border-outline bg-card px-2 py-0.5 font-code text-xs">2</span>
          </PortRow>
        </NodeCard>
      </div>
    </div>
  );
}
