"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A lamp carried over the page: where the pointer is, a soft pool of warm
 * light, and inside it the canvas grid the app is drawn on — as if the page
 * were the board, and only the part under the lamp showed it.
 *
 * Put it first inside a `relative` section; it listens to that section and
 * fills it. It follows the pointer with a little lag (`quickTo`), fades in
 * when the pointer arrives and out when it leaves.
 *
 * **Only for a pointer that hovers, and only with motion allowed.** On a
 * touch screen there is no cursor to carry it, and for a reader who asked
 * for less motion a light chasing the pointer is exactly what they asked
 * not to have — in both, nothing is drawn at all.
 */
export function Lamp() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const el = ref.current!;
          const host = el.parentElement!;
          const lamp = { x: 0, y: 0, on: 0 };
          const paint = () => {
            el.style.setProperty("--lx", `${lamp.x}px`);
            el.style.setProperty("--ly", `${lamp.y}px`);
            el.style.opacity = String(lamp.on);
          };
          const toX = gsap.quickTo(lamp, "x", { duration: 0.6, ease: "power3", onUpdate: paint });
          const toY = gsap.quickTo(lamp, "y", { duration: 0.6, ease: "power3", onUpdate: paint });

          let lit = false;
          const move = (event: PointerEvent) => {
            const box = host.getBoundingClientRect();
            const x = event.clientX - box.left;
            const y = event.clientY - box.top;
            if (!lit) {
              // Arriving, the light appears where the pointer is rather
              // than sliding in from wherever it last was.
              lamp.x = x;
              lamp.y = y;
              lit = true;
              gsap.to(lamp, { on: 1, duration: 0.5, ease: "power2.out", onUpdate: paint, overwrite: "auto" });
            }
            toX(x);
            toY(y);
          };
          const leave = () => {
            lit = false;
            gsap.to(lamp, { on: 0, duration: 0.7, ease: "power2.out", onUpdate: paint, overwrite: "auto" });
          };

          host.addEventListener("pointermove", move);
          host.addEventListener("pointerleave", leave);
          return () => {
            host.removeEventListener("pointermove", move);
            host.removeEventListener("pointerleave", leave);
            el.style.opacity = "0";
          };
        }
      );
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0"
      style={{ "--lx": "50%", "--ly": "50%" } as React.CSSProperties}
    >
      {/* The light: the faintest warmth of the ember, far softer than any
          control that wears it — it is the lamp, not the accent. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(520px circle at var(--lx) var(--ly), color-mix(in srgb, var(--primary) 9%, transparent), transparent 70%)",
        }}
      />
      {/* The grid, only where the light falls. */}
      <div
        className="canvas-grid absolute inset-0"
        style={{
          maskImage: "radial-gradient(300px circle at var(--lx) var(--ly), black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(300px circle at var(--lx) var(--ly), black 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
