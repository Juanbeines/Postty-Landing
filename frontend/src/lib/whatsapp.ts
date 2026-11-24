"use client";

/**
 * WhatsApp links used across the landing.
 *
 * Two shapes, and the difference matters:
 *
 * - `WHATSAPP_URL` is the WhatsApp Business short-link. It hides the number
 *   and does NOT accept a `?text=` param. It is only the fallback now.
 *
 * - `buildWhatsAppUrl()` (header, pricing and footer CTAs) and
 *   `buildGiftWhatsAppUrl()` (the gift overlay) each prefill their own
 *   message, so a gift lead is distinguishable from a general one once it
 *   lands in the inbox. A prefilled message forces the `wa.me/<number>` form.
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

/** One per landing locale. The bracket is left for the user to replace
 *  with their store or Instagram link. */
const GENERAL_MESSAGE = {
  es: "Hola Postty, quiero dejar de preocuparme por las redes y pauta, ¿me ayudan? Esta es mi marca [insertar link de tienda o instagram].",
  en: "Hi Postty, I want to stop worrying about social media and ads, can you help me? This is my brand [insert store or Instagram link].",
} as const;

/** Kept short on purpose: the longer the prefill, the likelier it gets
 *  deleted before the user hits send. One per landing locale. */
const GIFT_MESSAGE = {
  es: "Hola Postty, quiero un super descuento para mi plan",
  en: "Hi Postty, I'd like a super discount for my plan",
} as const;

export function buildWhatsAppUrl(locale: keyof typeof GENERAL_MESSAGE = "es"): string {
  if (!WA_NUMBER) return WHATSAPP_URL; // env not set — fail safe, never break the CTA
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(GENERAL_MESSAGE[locale])}`;
}

export function buildGiftWhatsAppUrl(locale: keyof typeof GIFT_MESSAGE = "es"): string {
  if (!WA_NUMBER) return WHATSAPP_URL; // env not set — fail safe, never break the CTA
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(GIFT_MESSAGE[locale])}`;
}
