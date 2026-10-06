"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    restDelta: 0.001,
  });
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      data-slot="scroll-progress"
      className={cn(
        // `via-brand-via` was in the template and there is no such token —
        // Tailwind emits nothing for it, so the two-stop gradient is what was
        // actually rendering. Say so, and use the same two stops the border
        // beam does, since this is a highlight moving over an edge too.
        "fixed inset-x-0 top-0 z-[60] h-0.75 origin-left bg-gradient-to-r from-brand-from to-brand-to",
        className
      )}
      style={{ scaleX: reducedMotion ? scrollYProgress : scaleX }}
    />
  );
}
