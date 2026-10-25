"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Draws a picture of fixed size at that size where it fits, and scaled down
 * to the column where it does not.
 *
 * A board is laid out in the canvas's own pixels — a card is 268 wide
 * whatever the window — so a phone gets the same board smaller, as the app
 * would show it zoomed out, rather than a board re-flowed into a shape the
 * app never draws. `Board` divides its measurements by this scale, so the
 * wires stay on their ports.
 */
export function FitWidth({
  width,
  height,
  children,
  className,
}: {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / width));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} className={className} style={{ height: height * scale }}>
      <div
        className="origin-top-left"
        style={{
          width,
          height,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          // Centred while it fits with room to spare.
          marginInline: scale === 1 ? "auto" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
