"use client";

import { gsap } from "@/lib/gsap";

/**
 * Hides a wire so a timeline can draw it in, and returns the tween that
 * does. The dash is as long as the path, so an offset of the whole length is
 * nothing drawn and zero is all of it.
 */
export function drawWire(path: SVGPathElement, vars: gsap.TweenVars = {}) {
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  return gsap.to(path, {
    strokeDashoffset: 0,
    duration: 0.6,
    ease: "power1.inOut",
    // Drawn, the dash goes: a board measures its wires again when the page
    // reflows, and a dash cut to the old length would leave the new one
    // half drawn.
    onComplete: () => {
      gsap.set(path, { clearProps: "strokeDasharray,strokeDashoffset" });
    },
    ...vars,
  });
}

/** The wire with this id inside `root`, if `Board` has drawn it yet. */
export function wire(root: Element | null, id: string) {
  return root?.querySelector<SVGPathElement>(`[data-wire="${id}"]`) ?? null;
}
