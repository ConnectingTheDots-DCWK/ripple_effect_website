"use client";

import { useSyncExternalStore } from "react";

/**
 * `"unknown"` is the server's answer and is never a stored value. It exists so
 * that nothing which depends on a choice renders before the browser has been
 * asked what the choice was — see `useConsent`.
 */
export type Consent = "granted" | "denied" | "unset" | "unknown";

const KEY = "ripple-consent";

const listeners = new Set<() => void>();
let cached: Consent | undefined;

/**
 * **A choice that cannot be stored is read as `"denied"`, not as `"unset"`.**
 * `localStorage` throws outright when a browser is set to block site data, and
 * the two candidate answers there are a banner that reappears on every single
 * page load, or no banner and nothing loaded. The second is the better one in
 * both directions: a browser blocking site data would very likely refuse the
 * cookie the banner is asking about anyway, so `"unset"` would be nagging
 * about a decision that has already been made elsewhere and cannot be recorded
 * here in any case.
 */
function read(): Consent {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "granted" || stored === "denied" ? stored : "unset";
  } catch {
    return "denied";
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  // `key` is null when the whole store is cleared, which counts.
  if (event.key !== null && event.key !== KEY) return;
  cached = undefined;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Consent {
  return (cached ??= read());
}

const getServerSnapshot = (): Consent => "unknown";

/**
 * The one cookie any of this is about — Buy Me a Coffee's, set host-only on
 * `/`, which is where it was found on a clean profile.
 */
const WIDGET_COOKIE = "visited";

/**
 * Record a choice, and tell every subscriber on this tab and the others.
 *
 * **Withdrawing has to actually withdraw, which takes two things beyond
 * writing "denied" down.** The cookie the widget already set is deleted,
 * because a decline that leaves it on the device has undone nothing the
 * visitor was objecting to. And if the widget was live on this page, the page
 * is reloaded: unmounting the `<Script>` element does not unload a third-party
 * script that has already run, so a reload is the only way to be able to say
 * it is not loaded and have that be true. Both are skipped when there was
 * nothing to withdraw, so an ordinary first-visit decline is silent.
 */
export function setConsent(value: "granted" | "denied") {
  const withdrawing = value === "denied" && getSnapshot() === "granted";

  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Nothing can be remembered, but the page in front of the visitor should
    // still do what they just asked it to for as long as they are on it.
  }
  cached = value;

  if (value === "denied") {
    document.cookie = `${WIDGET_COOKIE}=; path=/; max-age=0`;
  }

  notify();

  if (withdrawing) location.reload();
}

/**
 * The visitor's answer about the one optional cookie this site has.
 *
 * **`getServerSnapshot` returns `"unknown"` and nothing renders for it**,
 * which is the same shape `ReleaseBanner` uses and for the same reason. The
 * answer lives in `localStorage`, the server has no access to it, and a
 * component that guessed would either flash a banner at somebody who already
 * decided or flash the absence of one at somebody who has not. So the markup
 * ships with neither the banner nor anything it gates, and both settle on the
 * first client render.
 */
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
