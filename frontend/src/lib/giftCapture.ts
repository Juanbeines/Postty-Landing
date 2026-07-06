"use client";

/**
 * Sends a gift-overlay email to the Postty backend so the lead shows up in the
 * admin dashboard ("Gift emails" tab).
 *
 * Contract is owned by the Postty-Prod backend:
 *   POST https://app.posttyai.com/api/landing/gift-capture
 *   - Public: no auth / token / API key.
 *   - CORS enabled for posttyai.com + www.posttyai.com.
 *   - Idempotent: the backend dedupes by email, so re-sending the same mail is safe.
 *   - Only `email` is required; the rest adds context for the dashboard.
 *
 * Usage is fire-and-forget with a result: callers should FAIL OPEN — never
 * block the gift flow on a network error (until the backend endpoint is
 * deployed the POST returns 404, which we simply log and swallow).
 */

const GIFT_CAPTURE_ENDPOINT =
  "https://app.posttyai.com/api/landing/gift-capture";

export type GiftCaptureResult = { ok: true } | { ok: false; error: string };

/** Reads utm_source/medium/campaign from the current URL for attribution. */
function readUtm():
  | { source?: string; medium?: string; campaign?: string }
  | undefined {
  if (typeof window === "undefined") return undefined;
  const q = new URLSearchParams(window.location.search);
  const source = q.get("utm_source") || undefined;
  const medium = q.get("utm_medium") || undefined;
  const campaign = q.get("utm_campaign") || undefined;
  if (!source && !medium && !campaign) return undefined;
  return { source, medium, campaign };
}

export async function captureGiftLead(params: {
  email: string;
  name?: string;
  phone?: string;
  campaign?: string;
}): Promise<GiftCaptureResult> {
  const { email, name, phone, campaign } = params;
  const utm = readUtm();
  const body = JSON.stringify({
    email,
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
    ...(campaign ? { campaign } : {}),
    ...(utm ? { utm } : {}),
  });

  const attempt = async (): Promise<GiftCaptureResult> => {
    const res = await fetch(GIFT_CAPTURE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      // keepalive lets the request survive the page unload that can follow a
      // CTA click right after submitting the gift form.
      keepalive: true,
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: (err as { error?: string }).error || `http_${res.status}` };
  };

  try {
    return await attempt();
  } catch {
    // Network / CORS failure — retry once, then fail open.
    try {
      return await attempt();
    } catch {
      return { ok: false, error: "network" };
    }
  }
}
