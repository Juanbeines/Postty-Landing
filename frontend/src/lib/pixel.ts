'use client';

/**
 * Meta Pixel + CAPI utilities — landing-side.
 *
 * Strategy:
 *  - Each event is fired through both browser pixel (fbq) and server-side CAPI
 *    with the SAME event_id so Meta deduplicates them (single conversion per event).
 *  - fbclid is captured on landing → persisted in localStorage (90d TTL) → re-applied
 *    to every outbound CTA URL so attribution survives cross-domain to app.posttyai.com.
 *  - CAPI request is fire-and-forget (sendBeacon) so it survives the page unload that
 *    happens immediately after a CTA click.
 */

import { useEffect, useState } from 'react';

export const PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '1460082568860443';

const CAPI_ENDPOINT =
  process.env.NEXT_PUBLIC_META_CAPI_ENDPOINT ||
  'https://app.posttyai.com/api/pixel-event';

// QA TESTING — hardcoded fallback so events route to Meta Test Events panel.
// ⚠️ REMOVE the fallback ('TEST17139') once Test Events validation passes; otherwise
// every production conversion is flagged as test and Meta won't optimize against them.
const TEST_EVENT_CODE = process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE || 'TEST17139';

const APP_BASE_URL = 'https://app.posttyai.com';
const FBCLID_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const FBCLID_KEY = 'postty_fbclid';
const FBCLID_TIME_KEY = 'postty_fbclid_t';

declare global {
  interface Window {
    fbq: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
    _fbq: unknown;
  }
}

/* ── Event ID generation (RFC 4122 v4) ── */

export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ── fbclid capture & persistence ── */

export function persistFbclid(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');
    if (fbclid) {
      localStorage.setItem(FBCLID_KEY, fbclid);
      localStorage.setItem(FBCLID_TIME_KEY, String(Date.now()));
    }
  } catch {
    /* localStorage unavailable (private mode etc.) — silently ignore */
  }
}

export function getFbclid(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const ts = Number(localStorage.getItem(FBCLID_TIME_KEY) || 0);
    if (!ts || Date.now() - ts > FBCLID_TTL_MS) {
      localStorage.removeItem(FBCLID_KEY);
      localStorage.removeItem(FBCLID_TIME_KEY);
      return null;
    }
    return localStorage.getItem(FBCLID_KEY);
  } catch {
    return null;
  }
}

export function appendFbclidToUrl(url: string): string {
  const fbclid = getFbclid();
  if (!fbclid) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('fbclid')) {
      u.searchParams.set('fbclid', fbclid);
    }
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * React hook: returns app.posttyai.com URL with fbclid appended (after hydration).
 * SSR/static-export returns the bare URL; client mount swaps it in.
 */
export function useAppUrl(baseUrl: string = APP_BASE_URL): string {
  const [url, setUrl] = useState(baseUrl);
  useEffect(() => {
    setUrl(appendFbclidToUrl(baseUrl));
  }, [baseUrl]);
  return url;
}

/**
 * React hook: deep-link into the app's trial that auto-fires the MercadoPago
 * checkout for a given plan + period. The app reads ``?plan``/``?period`` after
 * sign-in (sessionStorage intent) and runs the same checkout the /trial pricing
 * cards do. ``flow=trial`` shows the trial welcome copy on the login screen.
 * fbclid is appended after hydration (same as ``useAppUrl``) for attribution.
 */
export function useCheckoutUrl(
  plan: 'basic' | 'pro',
  period: 'monthly' | 'annual',
): string {
  return useAppUrl(`${APP_BASE_URL}/?plan=${plan}&period=${period}&flow=trial`);
}

/* ── CAPI ── */

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function buildFbc(): string | null {
  const existing = getCookie('_fbc');
  if (existing) return existing;
  const fbclid = getFbclid();
  if (!fbclid) return null;
  // Format per Meta CAPI spec: fb.<subdomain_index>.<creation_time>.<fbclid>
  return `fb.1.${Date.now()}.${fbclid}`;
}

function sendCapi(
  eventName: string,
  eventId: string,
  customData: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;

  const payload = {
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      fbp: getCookie('_fbp'),
      fbc: buildFbc(),
    },
    custom_data: customData,
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      // sendBeacon survives page unload — critical for click-then-navigate CTAs.
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(CAPI_ENDPOINT, blob);
      return;
    }
    void fetch(CAPI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      mode: 'cors',
    }).catch(() => {
      /* CAPI failure non-fatal — browser pixel still fired */
    });
  } catch {
    /* swallow */
  }
}

/* ── Public tracking API ── */

export function trackEvent(
  eventName: string,
  customData: Record<string, unknown> = {},
): void {
  const eventId = generateEventId();

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, customData, { eventID: eventId });
  }

  sendCapi(eventName, eventId, customData);
}

export function trackPageView(): void {
  trackEvent('PageView');
}
