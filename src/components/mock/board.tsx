"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type Wire = {
  id: string;
  /** `data-port` of the output it leaves. */
  from: string;
  /** `data-port` of the input it arrives at. */
  to: string;
};

type Drawn = Wire & { d: string };

/**
 * A stretch of canvas: cards placed by the caller, and the wires between
 * their ports drawn here.
 *
 * **The wires are measured, not computed.** Each end is the centre of the
 * element carrying its `data-port`, read after layout — so a card is laid out
 * by its own rows exactly as `NodeCard` draws them, and nothing here repeats
 * `CardMetrics`' arithmetic. The read is divided by the board's own scale, so
 * a board shrunk with a CSS transform to fit a phone still lands its wires on
 * its ports.
 *
 * The curve is `fl_nodes_v2`'s default, a horizontal cubic whose handles
 * reach half the distance out of each port, and the stroke is `outline` at
 * 2px, `CanvasTheme`'s wire. Each path carries `data-wire` so a section can
 * draw it in with GSAP; `onReady` says when they exist.
 */
export function Board({
  wires,
  className,
  style,
  children,
  onReady,
}: {
  wires: Wire[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onReady?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState<Drawn[]>([]);
  const [fonts, setFonts] = useState(false);

  const measure = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const scale = root.offsetWidth ? box.width / root.offsetWidth : 1;
    const centre = (id: string) => {
      const port = root.querySelector(`[data-port="${id}"]`);
      if (!port) return null;
      const r = port.getBoundingClientRect();
      const x = (r.left + r.width / 2 - box.left) / scale;
      const y = (r.top + r.height / 2 - box.top) / scale;
      // Before the first layout settles a read can come back as nothing;
      // the observer below measures again once it has.
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    };
    const next: Drawn[] = [];
    for (const wire of wires) {
      const a = centre(wire.from);
      const b = centre(wire.to);
      if (!a || !b) continue;
      const reach = Math.max(40, Math.abs(b.x - a.x) / 2);
      next.push({
        ...wire,
        d: `M${a.x} ${a.y} C${a.x + reach} ${a.y} ${b.x - reach} ${b.y} ${b.x} ${b.y}`,
      });
    }
    setDrawn(next);
  }, [wires]);

  useLayoutEffect(() => {
    measure();
    const root = ref.current;
    if (!root) return;
    // Fonts arriving and the viewport changing both move a port.
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    let live = true;
    document.fonts?.ready.then(() => {
      if (!live) return;
      measure();
      setFonts(true);
    });
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [measure]);

  // Ready means every wire has a path, measured in the faces it will be read
  // in: a passage set in the fallback face wraps differently, and every
  // choice under it moves when Literata arrives.
  useLayoutEffect(() => {
    if (fonts && drawn.length === wires.length) onReady?.();
  }, [drawn, fonts, wires.length, onReady]);

  return (
    <div ref={ref} className={cn("relative", className)} style={style}>
      {/* Under the cards, as on the canvas: a wire runs into a port, not over
          the card it belongs to. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        {drawn.map((wire) => (
          <path
            key={wire.id}
            data-wire={wire.id}
            d={wire.d}
            fill="none"
            stroke="var(--outline)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </svg>
      {children}
    </div>
  );
}
