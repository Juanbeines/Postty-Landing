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

export function applyGiftDiscount(): void {
  if (typeof window === "undefined") return;
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
