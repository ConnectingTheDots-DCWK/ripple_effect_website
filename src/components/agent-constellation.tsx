"use client";

import { useRef, useState, type RefObject } from "react";
import { EllipsisIcon } from "lucide-react";

import { AnimatedBeam } from "@/components/velora/animated-beam";
import { RippleMark } from "@/components/ripple-mark";
import { IconTile, LogoTile } from "@/components/logo-tile";
import { mcpClients, mcpOthers } from "@/lib/integrations";

const SEATS = [...mcpClients, mcpOthers];
/** Distance from the centre to a client, as a share of the square's side. */
const RADIUS = 0.36;

/**
 * Evenly spaced around a circle, starting at the top — with five of them that
 * is a regular pentagon, which is what five things arranged around one thing
 * gives you.
 *
 * Computed rather than written out, so a sixth client is one entry in
 * `mcpClients` and not a second set of coordinates to keep in step with the
 * first.
 */
function seat(i: number) {
  const angle = (-90 + (360 / SEATS.length) * i) * (Math.PI / 180);
  return {
    left: `${50 + RADIUS * 100 * Math.cos(angle)}%`,
    top: `${50 + RADIUS * 100 * Math.sin(angle)}%`,
  };
}

/**
 * The app in the middle, the clients around it, a beam running from each one
 * inwards.
 *
 * **Inwards is the direction the thing actually works**, and it was worth
 * getting right rather than picking whichever looked better. The server lives
 * inside the running app; a client spawns the bridge and connects to it. So
 * each beam starts at a client and arrives at the mark, never the other way
 * round — the app does not reach out to anybody, which is also the answer the
 * FAQ gives about phoning home.
 *
 * There is no screenshot of this feature because there is nothing to
 * photograph: the whole of it is a socket, a sidecar and two switches in a
 * settings dialog. A picture of a settings dialog would say less than this
 * does.
 *
 * **The endpoint refs have to be stable objects.** `AnimatedBeam` lists
 * `fromRef` in its effect's dependencies; hand it a fresh `{ current: … }`
 * each render and the effect re-runs on every render, and since it ends in
 * `setSize({ … })` — a new object, so never `Object.is`-equal to the last —
 * that is a render loop rather than a redundant measurement.
 *
 * They are held in `useState` rather than in a `useRef` whose `.current` is an
 * array, which is the more obvious spelling and is what `react-hooks/refs`
 * exists to reject: reading a ref during render is exactly the thing the rule
 * catches, and the lazy `useState` initialiser gives the same
 * built-once-and-never-again object without touching a ref to get at it.
 */
export function AgentConstellation() {
  const container = useRef<HTMLDivElement>(null);
  const centre = useRef<HTMLDivElement>(null);
  const [seats] = useState<RefObject<HTMLDivElement | null>[]>(() =>
    SEATS.map(() => ({ current: null }))
  );

  return (
    <div
      ref={container}
      className="relative mx-auto aspect-square w-full max-w-[26rem]"
    >
      {/* Beams first, so the discs paint over them rather than under. The SVG
          is pointer-events-none, so it never intercepts a click meant for a
          logo behind it. */}
      {SEATS.map((client, i) => (
        <AnimatedBeam
          key={client.name}
          containerRef={container}
          fromRef={seats[i]}
          toRef={centre}
          duration={4.5}
          delay={i * 0.55}
          pathOpacity={0.22}
        />
      ))}

      {SEATS.map((client, i) => (
        <div
          key={client.name}
          ref={seats[i]}
          style={seat(i)}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          {client.src ? (
            <LogoTile {...client} src={client.src} />
          ) : (
            <IconTile {...client}>
              <EllipsisIcon className="size-6" />
            </IconTile>
          )}
          {/* Absolute, so the label hangs below the disc without enlarging the
              box the beam is aimed at — the endpoint has to be the centre of
              the mark, not the centre of the mark and its caption. */}
          <span className="absolute inset-x-0 top-full mt-2 text-center text-xs font-medium whitespace-nowrap text-muted-foreground">
            {client.name}
          </span>
        </div>
      ))}

      <div
        ref={centre}
        className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card"
      >
        <RippleMark size={40} className="text-brand" />
      </div>
    </div>
  );
}
