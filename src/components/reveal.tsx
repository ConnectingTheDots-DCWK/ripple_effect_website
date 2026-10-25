"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { gsap, motionOK, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Brings its `[data-reveal]` descendants in as they scroll into view — a
 * short rise and a fade, staggered in reading order. Classical on purpose:
 * the page is read, and motion here only says "this arrived".
 *
 * Without JavaScript, or for a reader who asked for less motion, everything
 * is simply there.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOK, () => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", root.current);
        gsap.set(targets, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(targets, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.09,
              overwrite: true,
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );
  return (
    <Tag ref={root} className={cn(className)}>
      {children}
    </Tag>
  );
}
