"use client";

/**
 * WhatsApp links used across the landing.
 *
 * Two shapes, and the difference matters:
 *
 * - `WHATSAPP_URL` is the WhatsApp Business short-link. It hides the number
 *   and the greeting is configured on WhatsApp's side — it does NOT accept a
 *   `?text=` param. This is what the header, hero and footer CTAs use.
 *
 * - `buildGiftWhatsAppUrl()` needs a custom prefilled message so a gift lead
 *   is distinguishable from a hero click once it lands in the inbox, which
 *   forces the `wa.me/<number>` form. That requires the raw number, so it
 *   comes from an env var and degrades back to the short-link when unset.
 */

export const WHATSAPP_URL =
  "https://api.whatsapp.com/message/3PFUF7MKQFCDB1?autoload=1&app_absent=0";

/** E.164 digits only — no `+`, no spaces.
 *
 *  Hardcoded default (same pattern as NEXT_PUBLIC_META_PIXEL_ID in pixel.ts):
 *  this is the number customers are invited to message, so it isn't a secret,
 *  and baking it in means a missing Amplify env var can't silently downgrade
 *  the gift link back to an untracked short-link. The env var still wins when
 *  set, so the number can be swapped without a code change. */
const WA_NUMBER = (process.env.NEXT_PUBLIC_WA_NUMBER || "5491179506000").replace(/\D/g, "");

/** Kept short on purpose: the longer the prefill, the likelier it gets
 *  deleted before the user hits send. */
const GIFT_MESSAGE = "¡Hola! Quiero un super descuento";

export function buildGiftWhatsAppUrl(): string {
  if (!WA_NUMBER) return WHATSAPP_URL; // env not set — fail safe, never break the CTA
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(GIFT_MESSAGE)}`;
}
