"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * GSAP, registered once. Import `gsap`, `ScrollTrigger` and `useGSAP` from
 * here rather than from the packages, so no component can run an animation
 * before its plugins are known.
 *
 * Every animation on the page goes through `gsap.matchMedia()` with
 * `motionOK` as the condition it plays under: a reader who asked for less
 * motion gets the finished picture, still and complete, never a half-drawn
 * one.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

export const motionOK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };

// For a developer's console; never in a production build.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  Object.assign(window, { gsap, ScrollTrigger });
}
