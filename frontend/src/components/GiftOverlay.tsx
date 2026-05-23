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
 *     - "20% OFF" pill mounts as a flex sibling of the gift at step 2,
 *       sliding in from the right with a slight delay so the gift's
 *       layout shift can lead the choreography.
 *
 * Trigger:
 *   Once per session (sessionStorage flag) when the user reaches the
 *   testimonials section (#testimonios).
 *
 * Styling rules:
 *   - GLASS: "Ver regalo" pill, and the discount pill (solid Pro
 *     gradient is the same shade — visually feels like glass-on-page).
 *   - NOT GLASS / NO SHADOW: email input + arrow button (plain white).
 *     Arrow button auto-paints chartreuse (.is-filled) when the email
 *     is valid; after submit it stays chartreuse with a check icon.
 */

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/pixel";

const SESSION_KEY = "postty_gift_overlay_seen";
const TRIGGER_SELECTOR = "#pricing";
const TRIGGER_DELAY_MS = 3000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = 0 | 1 | 2; // 0 = hidden

export default function GiftOverlay() {
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiOn, setConfettiOn] = useState(false);
  /* Input width tracked in state so the wrapper width can match the input
     exactly per breakpoint (260 mobile / 320 sm+). Without matching them,
     the wrapper retains its base size on mobile and leaves dead space
     between the input's right edge and the arrow button. */
  const [inputWidth, setInputWidth] = useState(260);

  useEffect(() => {
    const update = () => setInputWidth(window.innerWidth >= 640 ? 320 : 260);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const emailValid = EMAIL_RE.test(email.trim());

  /* Trigger — when #pricing intersects the viewport, wait TRIGGER_DELAY_MS
     before opening the overlay. The delay lets the user read pricing for a
     few seconds (and starts to think about it) before the gift interrupts.
     If they scroll away during the wait, the timer still completes — the
     intent is a single, predictable nudge per session. */
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch { /* ignore */ }
    const target = document.querySelector<HTMLElement>(TRIGGER_SELECTOR);
    if (!target) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Mark seen immediately so the page reload / rapid re-scroll
          // can't queue up a second timer.
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
          timer = window.setTimeout(() => setStep(1), TRIGGER_DELAY_MS);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  /* Lock body scroll */
  useEffect(() => {
    if (step > 0) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [step]);

  /* ESC to close */
  useEffect(() => {
    if (step === 0) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setStep(0); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  if (step === 0) return null;

  const handleVerRegalo = () => {
    setConfettiKey((k) => k + 1);
    setConfettiOn(true);
    window.setTimeout(() => setStep(2), 380);
    window.setTimeout(() => setConfettiOn(false), 2200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || submitted) return;
    trackEvent("Lead", {
      content_category: "gift_overlay",
      content_ids: ["gift_20pct_off"],
      content_type: "lead_magnet",
      currency: "ARS",
    });
    setSubmitted(true);
  };

  const close = () => setStep(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-4">
      {/* X close */}
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute right-5 top-5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center text-2xl font-light text-[#0D1522]/35 transition hover:text-[#0D1522]/70 sm:right-8 sm:top-8"
      >
        ×
      </button>

      {confettiOn && <Confetti key={confettiKey} />}

      <div className="flex w-full flex-col items-center">
        {/* Title — always rendered, never remounts. Stays put while content
            below grows/shrinks (parent flex centers the whole stack). */}
        <h2 className="font-heading text-center text-2xl font-black text-[#0D1522] sm:text-3xl">
          ¡Te ganaste un regalo!
        </h2>

        {/* Gift + (Ver regalo | 20% OFF pill). Same side-by-side flex-row
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

          {/* 20% OFF pill — step 2 only. Static flex sibling at all
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
                {/* "20% OFF" — chartreuse gradient */}
                <p
                  className="font-heading text-3xl font-black leading-none tracking-tight sm:text-6xl"
                  style={{
                    background: "linear-gradient(135deg, #D6F951 0%, #b5ff00 50%, #eeff64 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  20% OFF
                </p>
                {/* "Plan mensual" — soft white→light-blue gradient */}
                <p
                  className="mt-2 text-base font-medium sm:text-xl"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #cfe7ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Plan mensual
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtitle + Form + Cerrar — only step 2. Subtitle now lives
            directly ABOVE the email input (not above the gift). */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              key="form-area"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-2 flex flex-col items-center sm:mt-3"
            >
              {/* Subtitle — crossfades on submit between
                  "Agregá tu mail..." ↔ "Te enviamos un mail..." */}
              <div className="mb-2 h-6 sm:mb-3 sm:h-7">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={submitted ? "sent" : "ask"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    className="text-center text-sm text-[#0D1522]/70 sm:text-base"
                  >
                    {submitted ? "Te enviamos un mail con el regalo" : "Agregá tu mail para obtenerlo"}
                  </motion.p>
                </AnimatePresence>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center"
                style={{ gap: submitted ? 0 : 10 }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: submitted ? 0 : inputWidth,
                    opacity: submitted ? 0 : 1,
                  }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="quieroeldescuento@gmail.com"
                    disabled={submitted}
                    autoComplete="email"
                    className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm text-[#0D1522] outline-none placeholder:text-[#0D1522]/40 focus:border-gray-300 disabled:opacity-100"
                    style={{ backgroundColor: "#ffffff", width: inputWidth }}
                  />
                </motion.div>
                <button
                  type="submit"
                  disabled={!emailValid || submitted}
                  aria-label={submitted ? "Enviado" : "Enviar"}
                  className={[
                    "btn-lime-sweep group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                    emailValid || submitted
                      ? "is-filled cursor-pointer border-transparent"
                      : "cursor-not-allowed border-gray-200",
                  ].join(" ")}
                >
                  <span className="relative z-10 flex h-full w-full items-center justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                      {submitted ? (
                        <motion.svg
                          key="check"
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.4 }}
                          transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 18 }}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0D1522"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          key="arrow"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.2 }}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={emailValid ? "#0D1522" : "#D1D5DB"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-colors"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              </form>

              <AnimatePresence>
                {submitted && (
                  <motion.button
                    key="cerrar"
                    type="button"
                    onClick={close}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="mt-5 cursor-pointer text-sm font-medium text-[#0D1522]/70 transition hover:text-[#0D1522]"
                  >
                    Cerrar
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

/* Confetti — N particles flying outward from screen center with gravity + spin */
function Confetti() {
  const PARTICLES = 60;
  const COLORS = ["#1881F1", "#49D3F8", "#D6F951", "#022BB0", "#b5ff00", "#FFFFFF"];

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
      <div className="relative h-0 w-0">
        {Array.from({ length: PARTICLES }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / PARTICLES + (Math.random() - 0.5) * 0.4;
          const distance = 260 + Math.random() * 380;
          const x = Math.cos(angle) * distance;
          const yLateral = Math.sin(angle) * distance;
          const color = COLORS[i % COLORS.length];
          const size = 6 + Math.random() * 8;
          const duration = 1.4 + Math.random() * 0.9;
          const rotate = (Math.random() - 0.5) * 1080;
          const round = Math.random() > 0.55 ? "50%" : "2px";
          return (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                x,
                y: yLateral + 520,
                opacity: 0,
                rotate,
                scale: 0.6,
              }}
              transition={{ duration, ease: [0.2, 0.55, 0.4, 1] }}
              className="absolute block"
              style={{
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: round,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
