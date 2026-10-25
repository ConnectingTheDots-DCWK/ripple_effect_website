"use client";

import { useRef } from "react";
import { BookPlusIcon, CheckIcon, FileTextIcon, ScrollTextIcon } from "lucide-react";

import { Code } from "./code";
import { gsap, motionOK, useGSAP } from "@/lib/gsap";

const TIER = {
  spelling: "decoration-mark-spelling",
  grammar: "decoration-mark-grammar",
  style: "decoration-mark-style",
};

/**
 * A wavy underline in the colour `ripple_grammar` gives a finding of its
 * kind (`ProseMarks`), at the twice-the-font's thickness it draws.
 */
function Squiggle({ children, tier }: { children: string; tier: keyof typeof TIER }) {
  return (
    <span
      data-squiggle
      className={`underline decoration-wavy decoration-2 underline-offset-[5px] ${TIER[tier]}`}
    >
      {children}
    </span>
  );
}

/**
 * The passage editor with the checker at work: two problems found as the
 * paragraph is written, and the corrections menu open on one — the
 * suggestion first, then *Add to dictionary*, then where the finding came
 * from.
 */
export function GrammarEditor() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
        tl.from("[data-squiggle]", {
          textDecorationColor: "transparent",
          duration: 0.5,
          stagger: 0.4,
          delay: 0.3,
        }).from(
          "[data-menu]",
          { autoAlpha: 0, y: -6, scale: 0.97, transformOrigin: "top left", duration: 0.35, ease: "power2.out" },
          "+=0.3"
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="overflow-hidden rounded-[16px] border border-border bg-card font-ui">
      <div className="flex h-9 items-center gap-2 border-b border-border px-4 text-[13px] text-muted-foreground">
        <FileTextIcon className="size-4" />
        the-keeper-the-lamp-room
        <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[11px]">English (UK)</span>
      </div>
      <div className="px-6 py-6 font-prose text-[16px] leading-[1.65]">
        <p>
          The lamp hasn&rsquo;t been lit in three nights. Below the tower the
          bell on the reef is ringing with nobody to ring it, and{" "}
          <Squiggle tier="grammar">their</Squiggle> is a boat at the jetty.
          Whoever came in it was no <Squiggle tier="style">magic user</Squiggle>.
        </p>
        <div
          data-menu
          className="mt-3 ml-[18%] w-64 overflow-hidden rounded-[12px] border border-border bg-popover font-ui text-[13px] shadow-sm"
        >
          <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
            Did you mean “there”?
          </div>
          <div className="flex items-center gap-2 px-3 py-2 font-medium">
            <CheckIcon className="size-4 text-go" />
            there
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
            <BookPlusIcon className="size-4" />
            Add to dictionary
          </div>
          <div className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
            Powered by Harper
          </div>
        </div>
      </div>
    </div>
  );
}

const RULE = `# The setting's own word for a spellcaster.
expr main [(magic user), (magic-user)]

let message "This setting calls them spellwrights."
let description "Suggests the setting's own word."
let kind "Style"
let becomes "spellwright"

test "A magic user knocked at the gate." "A spellwright knocked at the gate."
allows "The spellwright knocked at the gate."`;

/**
 * A style rule in the editor that writes them: Weir, Harper's rule
 * language, as the template the app opens a new rule on — a phrase to look
 * for, the message, the suggestion, and the two tests that hold it, passing.
 */
export function WeirEditor() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        gsap.from("[data-test-result]", {
          autoAlpha: 0,
          x: -8,
          duration: 0.4,
          stagger: 0.25,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-3">
      <Code
        lang="weir"
        code={RULE}
        title={
          <>
            <ScrollTextIcon className="size-4" />
            .ripple/style/spellwright.weir
          </>
        }
      />
      <ul className="grid gap-2 font-ui text-[13px] sm:grid-cols-2">
        <li data-test-result className="flex items-center gap-2 rounded-[12px] border border-border bg-card px-3 py-2">
          <CheckIcon className="size-4 shrink-0 text-go" />
          <span className="truncate">test — becomes “spellwright”</span>
        </li>
        <li data-test-result className="flex items-center gap-2 rounded-[12px] border border-border bg-card px-3 py-2">
          <CheckIcon className="size-4 shrink-0 text-go" />
          <span className="truncate">allows — left alone</span>
        </li>
      </ul>
    </div>
  );
}
