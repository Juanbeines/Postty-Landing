"use client";

/**
 * GiftOverlay — full-screen lead-capture modal.
 *
 * Architecture:
 *   Renders as ONE scene (not two screens). The same DOM tree mounts for
 *   both steps; elements just shift position or fade in/out:
 *     - <h2> title is always rendered (no remount, no flicker).
 *     - Subtitle area reserves height with min-h; the text fades in at
 *       step 2 (and crossfades to "Te enviamos..." on submit).
 *     - The gift <Image> is rendered ONCE inside a `motion.div layout`.
 *       When step 2 appears, the sibling pill mounts beside it, and
 *       framer-motion animates the gift's flex-derived position from
 *       centered → left automatically (no x-pixel calculations).
 *     - "Ver regalo" is absolute on top of the gift; it fades out on
 *       step → 2 via AnimatePresence.
 *     - "50% OFF" pill mounts as a flex sibling of the gift at step 2,
 *       sliding in from the right with a slight delay so the gift's
 *       layout shift can lead the choreography.
 *
 * Trigger:
 *   Once per session (sessionStorage flag), TRIGGER_DELAY_MS after the
 *   pricing section (#pricing) first intersects the viewport.
 *
 * What it does NOT capture — read before "fixing" this:
 *   Nothing. There is no form and no lead is POSTed anywhere. The single CTA
 *   is a WhatsApp link, and a click-to-chat link never exposes the user's
 *   number to the page — no browser API does. The number only ever appears in
 *   Postty's WhatsApp Business inbox, and only if the person actually hits
 *   send, which the page also cannot detect. This is a deliberate product
 *   call (zero friction over a stored lead), not an oversight: an earlier
 *   revision asked for the number in an input precisely because that is the
 *   ONLY way to get it into the database. If lead capture is ever wanted
 *   back, that input is what has to return.
 *
 * The discount does not depend on any of it — it is applied when the overlay
 * OPENS, so closing with the X, ESC, or never touching WhatsApp all still
 * unlock the price and the Pro-badge confetti.
 *
 * Styling rules:
 *   - GLASS: "Ver regalo" pill, and the discount pill (solid Pro
 *     gradient is the same shade — visually feels like glass-on-page).
 *   - The CTA is btn-lime-sweep, permanently .is-filled (nothing to
 *     validate), with the brand-green WhatsApp glyph.
 */

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/pixel";
import {
  applyGiftDiscount,
  markGiftOverlayClosed,
  onGiftOpenRequested,
} from "@/lib/giftDiscount";
import { buildGiftWhatsAppUrl } from "@/lib/whatsapp";
import Confetti from "@/components/Confetti";

const SESSION_KEY = "postty_gift_overlay_seen";
const TRIGGER_SELECTOR = "#pricing";
/* Two triggers race; whichever resolves first opens the overlay and cancels
   the other. Both are tuned around one goal: the visitor should be looking at
   the discounted price, not the list price.
     - PRICING_DELAY_MS covers the fast scroller who jumps straight to pricing.
       One second, just long enough not to feel like a trap door — it used to
       be 8s, which left them staring at full price the whole time.
     - PAGE_LOAD_DELAY_MS covers the slow reader who is still up the page. It
       fires regardless of scroll position so the discount is already applied
       by the time they arrive. 20s interrupted people mid-carousel, well
       before they had any reason to care about a discount; 35s lands closer
       to pricing without waiting so long that it never fires. */
const PRICING_DELAY_MS = 1000;
const PAGE_LOAD_DELAY_MS = 35000;

type Step = 0 | 1 | 2; // 0 = hidden

export default function GiftOverlay() {
  const [step, setStep] = useState<Step>(0);
  /* Set once the user taps through to WhatsApp. Not a claim that they sent
     anything — the page can't know that — just that the handoff happened. */
  const [submitted, setSubmitted] = useState(false);
  const [returned, setReturned] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiOn, setConfettiOn] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
  /* Pending timers from "Ver regalo", so closing mid-choreography can cancel
     them (see the cleanup effect below). */
  const revealTimers = useRef<number[]>([]);

  /* Trigger — a page-load timer and a pricing-visibility timer race each
     other; the first to fire opens the overlay once and tears the other down.
     Either way it is a single, predictable nudge per session. */
  /* Guards live in refs because `open` is now shared between the timers and
     the corner teaser, and must stay idempotent across both. */
  const firedRef = useRef(false);
  const timersRef = useRef<{
    load?: number;
    pricing?: number;
    observer?: IntersectionObserver;
  }>({});

  /* `force` is what separates the two kinds of trigger. The timers must
     fire at most once per session, so they call open() and are stopped by
     firedRef. The corner mascot is a deliberate click and must work every
     time, so it calls open(true) and skips that guard. */
  const open = useCallback((force = false) => {
    if (firedRef.current && !force) return;
    firedRef.current = true;
    // Mark seen before anything else, so a reload mid-animation can't
    // queue a second run.
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
    // Whichever trigger lost the race must not fire afterwards.
    if (timersRef.current.load !== undefined) window.clearTimeout(timersRef.current.load);
    if (timersRef.current.pricing !== undefined) window.clearTimeout(timersRef.current.pricing);
    timersRef.current.observer?.disconnect();
    setStep(1);
    // Apply the discount the MOMENT the overlay opens — the gift itself
    // is the trigger, not the submit. The user gets the discount whether
    // they submit, close with the X, or just dismiss.
    // Load-bearing for the confetti: PricingSection's burst reads
    // giftBadgeRef, and that pill only mounts once the discount is
    // applied. Deferring this to submit would silently kill it.
    applyGiftDiscount();
  }, []);

  /* The corner teaser opens the gift on click, through the same `open`,
     forcing past the once-per-session guard. */
  useEffect(() => onGiftOpenRequested(() => open(true)), [open]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        // The overlay already fired in a previous page load of this
        // session — make sure the discount is locked in (covers users
        // whose session predates the "apply on open" change).
        applyGiftDiscount();
        return;
      }
    } catch { /* ignore */ }

    timersRef.current.load = window.setTimeout(open, PAGE_LOAD_DELAY_MS);

    const target = document.querySelector<HTMLElement>(TRIGGER_SELECTOR);
    if (target) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || timersRef.current.pricing !== undefined) return;
          timersRef.current.pricing = window.setTimeout(open, PRICING_DELAY_MS);
          observer.disconnect();
        },
        // Fires as soon as 10% of the pricing section is visible — on
        // mobile the section is tall, a higher threshold meant the user
        // had to scroll deep before the timer even started.
        { threshold: 0.1 },
      );
      timersRef.current.observer = observer;
      observer.observe(target);
    }

    const timers = timersRef.current;
    return () => {
      timers.observer?.disconnect();
      if (timers.load !== undefined) window.clearTimeout(timers.load);
      if (timers.pricing !== undefined) window.clearTimeout(timers.pricing);
    };
  }, [open]);

  /* Lock body scroll */
  useEffect(() => {
    if (step > 0) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [step]);

  /* Closing always lands the user on the pricing cards.
     PricingSection fires its confetti on the Pro badge ~200ms after this,
     reading the badge's on-screen rect — so if the user had scrolled away
     during the 8s trigger delay, the burst would go off somewhere they
     aren't looking (or off-screen entirely). The jump is done WHILE the
     overlay still covers the viewport, so it's invisible: the modal lifts
     and the discounted Pro card is simply there. Scroll is unlocked first
     because the body lock would otherwise swallow the programmatic scroll. */
  const close = useCallback(() => {
    document.body.style.overflow = "";
    document.querySelector("#pricing")?.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
    setStep(0);
    markGiftOverlayClosed();
  }, []);

  /* ESC to close */
  useEffect(() => {
    if (step === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, close]);

  /* Notices the user coming back from WhatsApp, purely to reward it — the
     number is already stored, so nothing depends on this firing. It won't
     fire at all inside the Instagram/Facebook in-app browsers, which is
     fine: they just see the normal submitted state. `pageshow` covers iOS
     restoring the page from bfcache, where visibilitychange can stay quiet. */
  useEffect(() => {
    if (!submitted || returned) return;
    const onBack = () => { if (!document.hidden) setReturned(true); };
    document.addEventListener("visibilitychange", onBack);
    window.addEventListener("pageshow", onBack);
    return () => {
      document.removeEventListener("visibilitychange", onBack);
      window.removeEventListener("pageshow", onBack);
    };
  }, [submitted, returned]);

  /* Clears the pending "Ver regalo" timers when the overlay closes. Without
     this, an ESC inside the first 380ms lets the queued setStep(2) pop the
     overlay straight back open. Keyed on step (not unmount) because closing
     renders null from the SAME instance — it never unmounts. */
  useEffect(() => {
    if (step !== 0) return;
    revealTimers.current.forEach(window.clearTimeout);
    revealTimers.current = [];
  }, [step]);

  // Real unmount (route change). Empty deps so the 1→2 transition can't clear
  // the still-pending confetti-off timer.
  useEffect(() => () => revealTimers.current.forEach(window.clearTimeout), []);

  if (step === 0) return null;

  const handleVerRegalo = () => {
    setConfettiKey((k) => k + 1);
    setConfettiOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setConfettiOn(true);
    revealTimers.current.push(window.setTimeout(() => setStep(2), 380));
    revealTimers.current.push(window.setTimeout(() => setConfettiOn(false), 2200));
  };

  /* The anchor's own href does the navigating — this only records the click
     and flips the overlay to its post-handoff state. Deliberately does NOT
     preventDefault. */
  const handleWhatsAppClick = () => {
    if (!submitted) {
      trackEvent("Lead", {
        content_name: "gift_overlay_whatsapp",
        content_category: "contacto_whatsapp",
        content_ids: ["gift_50pct_off_basic"],
        content_type: "lead_magnet",
      });
    }
    // The discount was already applied when the overlay opened (per spec —
    // the gift itself is the trigger). Nothing here gates it.
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-4 pb-24 sm:pb-40">
      {/* X close */}
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute right-5 top-5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center text-2xl font-light text-[#0D1522]/35 transition hover:text-[#0D1522]/70 sm:right-8 sm:top-8"
      >
        ×
      </button>

      {confettiOn && <Confetti key={confettiKey} originX={confettiOrigin.x} originY={confettiOrigin.y} />}

      <div className="flex w-full flex-col items-center">
        {/* Title — always rendered, never remounts. Stays put while content
            below grows/shrinks (parent flex centers the whole stack). */}
        <h2 className="font-heading text-center text-2xl font-semibold text-[#0D1522] sm:text-3xl">
          ¡Te ganaste un regalo!
        </h2>

        {/* Gift + (Ver regalo | 50% OFF pill). Same side-by-side flex-row
            at every breakpoint — gift on the left, pill on the right with
            a negative-ml overlap and the gift on top (z-10) at the overlap
            zone. To fit on a 360-wide viewport we shrink the gift to
            w-[200px] on mobile (desktop stays at w-[360px]). */}
        <div className="mt-4 flex w-full max-w-[820px] items-center justify-center sm:mt-6">
          {/* GIFT — single instance, same size in both steps. The `layout`
              prop makes it animate position smoothly when the pill appears
              as a sibling. `z-10` keeps the gift ALWAYS on top of the pill
              from frame zero — without it, the pill (second in DOM order)
              briefly renders in front during its enter animation and then
              snaps behind, which reads as a visual flicker. */}
          <motion.div
            layout
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 shrink-0"
          >
            <Image
              src="/gift.webp"
              alt="Regalo de Postty"
              width={420}
              height={420}
              className="h-auto w-[200px] drop-shadow-[0_20px_40px_rgba(24,129,241,0.25)] sm:w-[360px]"
              priority
            />

            {/* "Ver regalo" — step 1 only, absolute on top of the gift.
                Fades out as we transition to step 2. */}
            <AnimatePresence>
              {step === 1 && (
                <motion.button
                  key="ver-regalo"
                  type="button"
                  onClick={handleVerRegalo}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-white/70 bg-white/35 px-8 py-3.5 text-base font-semibold text-[#0D1522] shadow-[0_8px_32px_rgba(13,21,34,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/55 sm:px-10 sm:py-4"
                >
                  Ver regalo
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 50% OFF pill — step 2 only. Static flex sibling at all
              breakpoints; slides in from the right and overlaps the gift's
              right edge via negative ml. z-0 so the gift (z-10) covers the
              pill at the overlap zone. */}
          <AnimatePresence>
            {step === 2 && (
              <motion.div
                key="discount-pill"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ duration: 0.45, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-0 -ml-12 rounded-full px-6 py-4 shadow-[0_12px_40px_rgba(24,129,241,0.35)] sm:-ml-32 sm:py-8 sm:pl-[95px] sm:pr-10"
                style={{
                  background: "linear-gradient(160deg, #1881F1, #49D3F8)",
                }}
              >
                {/* "50% OFF" — chartreuse gradient */}
                <p
                  className="font-heading text-3xl font-semibold leading-none tracking-tight sm:text-6xl"
                  style={{
                    background: "linear-gradient(135deg, #D6F951 0%, #b5ff00 50%, #eeff64 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  50% OFF
                </p>
                {/* "en plan Basic" — soft white→light-blue gradient */}
                <p
                  className="mt-2 text-base font-medium sm:text-xl"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #cfe7ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  en plan Basic
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtitle + Form + Cerrar — only step 2. Subtitle now lives
            directly ABOVE the phone input (not above the gift). */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              key="form-area"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-2 flex flex-col items-center sm:mt-3"
            >
              {/* Subtitle — one fixed-height slot, three crossfading states. */}
              <div className="mb-2 h-6 sm:mb-3 sm:h-7">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={submitted ? (returned ? "back" : "sent") : "ask"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    className="text-center text-sm text-[#0D1522]/70 sm:text-base"
                  >
                    {submitted
                      ? returned
                        ? "¡Volviste! Cerrá y mirá tu nuevo precio"
                        : "¡Listo! Ya aplicamos tu descuento al plan Basic"
                      : "Escribinos por WhatsApp para reclamarlo"}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* The one CTA — a real anchor, not a scripted window.open, so
                  no popup blocker can ever eat the handoff. It stays clickable
                  after the first tap: if the user bounced off WhatsApp without
                  sending, or lost the tab, tapping again just reopens it. */}
              <a
                href={buildGiftWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                aria-label={submitted ? "Abrir WhatsApp de nuevo" : "Enviar mensaje por WhatsApp"}
                className="btn-lime-sweep is-filled group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent px-8 py-2.5 text-sm font-medium text-[#0D1522] transition-colors"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {/* Ink, not brand green — the glyph sits on chartreuse and
                      reads as one piece with the label. */}
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#0D1522" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                  </svg>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={submitted ? "again" : "enviar"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {submitted ? "Abrir de nuevo" : "Enviar mensaje"}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </a>

              <AnimatePresence>
                {submitted && (
                  <motion.button
                    key="cerrar"
                    type="button"
                    onClick={close}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className={`mt-5 cursor-pointer text-sm transition ${
                      returned
                        ? "font-medium text-[#0D1522]"
                        : "font-medium text-[#0D1522]/70 hover:text-[#0D1522]"
                    }`}
                  >
                    {returned ? "Cerrar y ver mi precio" : "Cerrar"}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Confetti now lives in @/components/Confetti */
