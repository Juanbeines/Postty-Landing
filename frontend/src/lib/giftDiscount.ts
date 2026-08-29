"use client";

/**
 * Shared "gift discount applied" state across the landing.
 *
 * The GiftOverlay fires `applyGiftDiscount()` the moment the overlay
 * first APPEARS on screen — not when the user submits the email. The
 * gift itself is the trigger: once the user has been shown the offer
 * (whether they submit the email, close with the X, or just dismiss),
 * the 20% OFF on the Basic plan is locked in for the session.
 *
 * Storage is sessionStorage (NOT localStorage) so the discount resets
 * cleanly per browser session — the next visit starts at the full
 * price and re-triggers the gift overlay flow.
 *
 * A custom window event lets components in the same tab re-read the
 * flag immediately (the native `storage` event only fires in OTHER
 * tabs).
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "postty_gift_discount_applied";
const EVENT_NAME = "postty:gift-discount";
const CLOSED_KEY = "postty_gift_overlay_closed";
const CLOSED_EVENT = "postty:gift-overlay-closed";
/* PricingSection's confetti fires once per open→close cycle. The key lives
   here, not there, because resetGiftCycle() has to clear it. */
const CONFETTI_KEY = "postty_gift_confetti_fired";

/* The deadline is the one piece of gift state that must OUTLIVE the session:
   a seven-day countdown that resets when the browser closes is not a
   countdown. localStorage, unlike everything else in this module. */
const DEADLINE_KEY = "postty_gift_deadline";
const GIFT_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Milliseconds left on this browser's gift window. Null when no gift was
 * ever claimed here; zero or less once the window has closed.
 */
export function giftMsRemaining(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEADLINE_KEY);
    if (!raw) return null;
    const at = Number(raw);
    return Number.isFinite(at) ? at - Date.now() : null;
  } catch {
    return null;
  }
}

/** True once this browser's seven days are up. */
export function giftExpired(): boolean {
  const left = giftMsRemaining();
  return left !== null && left <= 0;
}

/**
 * Whole days left, 1..7, or null when there is nothing to count down.
 * Rounds UP so the final stretch under 24h still reads as a day.
 */
export function useGiftDaysLeft(): number | null {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const read = () => {
      const left = giftMsRemaining();
      setDays(left === null || left <= 0 ? null : Math.max(1, Math.ceil(left / DAY_MS)));
    };
    read();
    // Re-read when the discount lands, when the tab regains focus, and once a
    // minute — so a tab left open overnight rolls to the next number.
    window.addEventListener(EVENT_NAME, read);
    window.addEventListener("focus", read);
    const t = window.setInterval(read, 60_000);
    return () => {
      window.removeEventListener(EVENT_NAME, read);
      window.removeEventListener("focus", read);
      window.clearInterval(t);
    };
  }, []);

  return days;
}

export function applyGiftDiscount(): void {
  if (typeof window === "undefined") return;
  // A browser that already burned its seven days does not get another run.
  if (giftExpired()) return;
  try {
    // Stamp the deadline the FIRST time only. Later visits re-apply the
    // discount for the new session but must not push the date forward, or
    // the countdown would restart on every visit and never expire.
    if (!localStorage.getItem(DEADLINE_KEY)) {
      localStorage.setItem(DEADLINE_KEY, String(Date.now() + GIFT_WINDOW_DAYS * DAY_MS));
    }
  } catch {
    /* localStorage unavailable (private mode) — the discount still applies
       for this session, it just cannot be time-boxed. */
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    /* sessionStorage unavailable — silently ignore */
  }
}

export function useGiftDiscount(): boolean {
  // Always start false on first render so SSR matches the hydration pass;
  // the useEffect below flips it to true on the client if the flag is set.
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const read = () => {
      // Once the seven days are up the cards must stop showing a discounted
      // price, or they would contradict the countdown that just hit zero.
      if (giftExpired()) {
        setApplied(false);
        return;
      }
      try {
        setApplied(sessionStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        setApplied(false);
      }
    };
    read();

    // Same-tab updates (the native storage event doesn't fire for
    // sessionStorage writes in the same tab — only across tabs/windows)
    const onCustom = () => read();
    window.addEventListener(EVENT_NAME, onCustom);
    return () => {
      window.removeEventListener(EVENT_NAME, onCustom);
    };
  }, []);

  return applied;
}

/**
 * GiftOverlay calls this when it closes (X button, ESC key, "Cerrar"
 * link, or backdrop click). Persists a sessionStorage flag so a page
 * reload still knows the user already saw + dismissed the gift, and
 * dispatches a same-tab event so PricingSection can fire its confetti
 * exactly when the overlay disappears.
 */
export function markGiftOverlayClosed(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CLOSED_KEY, "1");
    window.dispatchEvent(new Event(CLOSED_EVENT));
  } catch {
    /* ignore */
  }
}

export function useGiftOverlayClosed(): boolean {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setClosed(sessionStorage.getItem(CLOSED_KEY) === "1");
      } catch {
        setClosed(false);
      }
    };
    read();
    const onCustom = () => read();
    window.addEventListener(CLOSED_EVENT, onCustom);
    return () => {
      window.removeEventListener(CLOSED_EVENT, onCustom);
    };
  }, []);

  return closed;
}

/* ── Manual trigger ───────────────────────────────────────────────────────
   The overlay opens itself on two timers (page load, pricing in view). The
   corner teaser is a THIRD way in, and it lives outside GiftOverlay, so it
   asks via an event rather than reaching into that component's state. */

const OPEN_EVENT = "postty:gift-open";

/** Ask the GiftOverlay to open now. No-op if it already fired this session. */
/** True once this cycle's confetti has gone off. */
export function giftConfettiFired(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(CONFETTI_KEY) === "1";
  } catch {
    return false;
  }
}

export function markGiftConfettiFired(): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(CONFETTI_KEY, "1"); } catch { /* ignore */ }
}

/**
 * Rearm the gift for another run, called whenever the overlay OPENS.
 *
 * Both "closed" and "confetti fired" are sticky within a session, which was
 * correct while the gift could only appear once. The corner mascot reopens it
 * on demand, so without this the second close and every one after it produced
 * nothing: the confetti key blocked the burst, and `closed` staying true meant
 * PricingSection's effect never even re-ran, since its dependencies never
 * changed back.
 */
export function resetGiftCycle(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CLOSED_KEY);
    sessionStorage.removeItem(CONFETTI_KEY);
  } catch {
    /* ignore */
  }
  // Same-tab listeners must see `closed` flip back to false, or the next
  // close would not register as a change.
  window.dispatchEvent(new Event(CLOSED_EVENT));
}

/* ── The close signal ────────────────────────────────────────────────────
   PricingSection's confetti used to key off `useGiftOverlayClosed()`, a
   boolean derived from sessionStorage and watched through an effect's
   dependency array. That has too many ways to sit in a state that never
   re-fires: the flag already true from an earlier cycle, the dependency not
   actually changing, a stale guard surviving in storage.

   A close is an EDGE, so it is modelled as one. The event only exists at the
   instant it happens, cannot be "already true", and needs no reset. */

const JUST_CLOSED_EVENT = "postty:gift-just-closed";

/** Fired by GiftOverlay.close(), every single time it closes. */
export function notifyGiftJustClosed(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(JUST_CLOSED_EVENT));
}

/** Subscribe to closes; returns an unsubscribe function. */
export function onGiftJustClosed(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(JUST_CLOSED_EVENT, fn);
  return () => window.removeEventListener(JUST_CLOSED_EVENT, fn);
}

export function requestGiftOpen(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** GiftOverlay subscribes with this; returns an unsubscribe function. */
export function onGiftOpenRequested(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_EVENT, fn);
  return () => window.removeEventListener(OPEN_EVENT, fn);
}
