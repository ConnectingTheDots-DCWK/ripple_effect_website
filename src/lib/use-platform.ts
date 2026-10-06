"use client";

import { useSyncExternalStore } from "react";

import type { Platform } from "@/lib/releases";

/**
 * Which desktop platforms the visitor is probably on, or an empty list.
 *
 * An empty list is a real answer and a common one — a phone, a tablet, a
 * Chromebook, anything unrecognised — and it means "do not aim at anything",
 * not "detection failed".
 *
 * `useSyncExternalStore` rather than an effect: the server has no user agent
 * to read, so the two renders genuinely differ, and this is the hook that
 * exists for a value the server cannot know. The snapshots are memoised
 * because the hook compares them by identity and a fresh array each call is an
 * infinite render.
 *
 * A Linux visitor gets **both** formats, in `.deb`-first order. Nothing in a
 * user agent says whether a machine wants apt or dnf, so anything more
 * specific would be a guess presented as an answer; what the caller does with
 * the ambiguity is the caller's problem to state out loud.
 */
const NONE: Platform[] = [];

let cached: Platform[] | undefined;

function clientSnapshot(): Platform[] {
  if (cached === undefined) {
    const ua = navigator.userAgent;

    // Order matters, and every branch below exists because a naive one was
    // wrong when it was tested against real strings.
    //
    // iOS first: an iPhone's user agent contains "like Mac OS X", so a plain
    // /Mac OS X/ test offers a .dmg to a phone.
    //
    // An iPad in desktop mode is the case with no token to match at all — it
    // reports as "Macintosh" and nothing else distinguishes it. Touch points
    // do: a Mac reports 0, an iPad reports 5.
    //
    // Chrome OS carries "X11" and would otherwise be handed a .deb. Crostini
    // could arguably install one, which is exactly why it should be a choice
    // somebody makes on the download page rather than a button that assumes.
    if (/iPhone|iPad|iPod/i.test(ua)) cached = NONE;
    else if (/CrOS/i.test(ua)) cached = NONE;
    else if (/Windows/i.test(ua)) cached = ["windows"];
    else if (/Mac OS X|Macintosh/i.test(ua))
      cached = navigator.maxTouchPoints > 1 ? NONE : ["macos"];
    else if (/Linux|X11/i.test(ua) && !/Android/i.test(ua))
      cached = ["linux-deb", "linux-rpm"];
    else cached = NONE;
  }
  return cached;
}

const subscribe = () => () => {};
const serverSnapshot = () => NONE;

export function useDetectedPlatforms(): Platform[] {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
