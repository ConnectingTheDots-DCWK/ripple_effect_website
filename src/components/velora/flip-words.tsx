"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface FlipWordsProps {
  words: string[];
  /** How long each word stays on screen, in milliseconds. */
  duration?: number;
  className?: string;
}

/**
 * Cycles a single word inside a sentence, blurring one out as the next
 * arrives.
 *
 * **An invisible copy of the longest word holds the space open.** Without it
 * every flip reflows the line — and since the heading it sits in is
 * `text-balance`, reflowing this line moves the one above it too. This is the
 * load-bearing part of the component and the reason it is not four lines long.
 *
 * Two departures from velora's original, both about where the word sits:
 *
 * - **The reserved box is in flow and the words are absolute over it**, rather
 *   than all of them being cells of an `inline-grid`. A grid establishes its
 *   own baseline, and a baseline synthesised from a grid is not reliably the
 *   text baseline of the sentence around it; an ordinary inline-block whose
 *   only in-flow content is a line of text is. In a 36px heading a baseline
 *   off by two pixels is visible.
 * - **The word is flush left in its box**, which only works because it is the
 *   last word of the sentence — see the headline it is used in. Mid-sentence
 *   the slack would open a hole before the next word and centring would be the
 *   lesser evil; at the end of a line the slack falls off the end, and "and
 *   it's free" keeps the spacing of ordinary text.
 *
 * Reduced motion gets the first word, statically — not a slower flip. The
 * flip is the entire component, and a sentence that quietly rewrites itself is
 * precisely what somebody who asked for less motion asked to be spared.
 */
export function FlipWords({
  words,
  duration = 2600,
  className,
}: FlipWordsProps) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      duration
    );
    return () => clearInterval(interval);
  }, [words.length, duration, reducedMotion]);

  if (reducedMotion) {
    return <span className={cn(className)}>{words[0]}</span>;
  }

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      data-slot="flip-words"
      className={cn("relative inline-block", className)}
    >
      <span aria-hidden className="invisible">
        {longest}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="absolute inset-0 flex items-center"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
