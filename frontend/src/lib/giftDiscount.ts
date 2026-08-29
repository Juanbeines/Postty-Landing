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
