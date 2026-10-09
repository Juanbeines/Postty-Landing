"use client";

/**
 * HeroFan — the lead ad on a phone in someone's hand, four more fanned
 * behind it on a studio set.
 *
 * On load the phone comes up from below the frame tipped toward the viewer,
 * the way a hand lifts a phone to look at it, and settles dead centre; then
 * the side cards deal out. The hand is a still photo that never moves; only
 * the thumb is animated, as an image sequence drawn on a canvas — 57 frames
 * of a real thumb flexing and swiping (from Veo footage, stabilised against
 * the phone and cut down to the thumb's area, edges blended into the still).
 * Code plays the swipe, holds, and plays it again, forever; at the frame
 * where the thumb starts to drag, the next post slides onto the screen and
 * every side card moves one place.
 *
 * The section is taller than the viewport and its stage is sticky, so the
 * first stretch of scroll drives the exit instead of moving the page. The
 * CTA is the vanishing point: the phone tips back and recedes until it
 * fades, and the side cards fly outward toward the top corners.
 *
 * The scroll value goes through a spring before it reaches any transform:
 * raw wheel input arrives in steps, and without the smoothing it ratchets.
 */

import {
  animate,
  AnimatePresence,
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/i18n/locale";
import { trackEvent } from "@/lib/pixel";

/* All geometry is in `u`, a unit tied to the viewport (see STAGE_VARS) so the
   set keeps its proportions on every screen. */
const U = "var(--u)";
const u = (n: number) => `calc(${n} * ${U})`;

/* Side cards: 9:16, 56u tall at full size. */
const CARD_H = 56;
const CARD_W = (CARD_H * 9) / 16;

/* The phone. SCREEN_H is the display's height; the rest is measured off the
   hand still (hero-hand-arm.webp — the forearm extended past the original
   frame, so it runs off-screen instead of ending in a fade), whose screen is
   a transparent rounded rectangle — PHONE.* are that hole's position and size
   as fractions of the image (radius as a fraction of its width), so the post
   sits behind it. */
const SCREEN_H = 62;
const PHONE = { left: 0.076057, top: 0.014159, width: 0.345318, height: 0.552499, radius: 0.047187, aspect: 1441 / 1922 };
/* Screen width in u: the hole's pixel aspect (its fractions × the photo's aspect). */
const SCREEN_W = (SCREEN_H * PHONE.width * PHONE.aspect) / PHONE.height;
/* The thumb sequence (hero-thumb-sheet-v2.webp): frames laid out in a grid,
   covering ROI — the thumb's area, as fractions of the still. PRESS is the
   frame where the thumb starts dragging; the posts move there. HOLD is the
   pause between swipes. */
const THUMB_SEQ = {
  src: "/hero-thumb-sheet-v2.webp",
  roi: { left: 0.229008, top: 0.208117, width: 0.370576, height: 0.416233 },
  frame: { w: 328, h: 490 },
  cols: 8,
  count: 57,
  fps: 24,
  press: 16,
};
const HOLD = 1.6; // s between swipes

/* Tilt, in rotateX degrees (negative = top edge toward the viewer). REST is
   the lean the phone keeps while it sits in the centre; ARRIVE is how much
   MORE it is leaning in the first frame, before it settles. PERSPECTIVE is
   the camera distance for both — shorter = the top flares wider. */
const REST_TILT = -10;
const ARRIVE_TILT = -32;
const PERSPECTIVE = 760;

/* The screen content is drawn a hair larger than the hole, so a pixel of
   wobble in the footage never opens a gap at the bezel. */
const OVERSCAN = 0.012;

/* Where the middle of the set sits, and the copy offsets, per breakpoint.
   --title-shift / --cta-shift: on phones the headline drops and the CTA rises
   once the set has receded, closing the gap it leaves. */
const STAGE_VARS =
  "[--u:min(0.9vh,1.35vw)] [--fan-top:59%] [--title-shift:15vh] [--cta-shift:-22vh] md:[--u:min(0.82vh,1.5vw)] md:[--fan-top:70%] md:[--title-shift:0px] md:[--cta-shift:0px]";
const FAN_TOP = "var(--fan-top)";

/* The five posts, in carousel order. Position p (-2 … 2, left to right)
   shows POSTS[(base + p) mod 5]; each swipe adds one to `base`, so every post
   moves one place to the left and the one on the right lands on the phone. */
const POSTS = [
  "/hero-posts/sneaker-diseno.webp",
  "/hero-posts/burger-break.webp",
  "/hero-posts/post-4.webp",
  "/hero-posts/perfume-lumina.webp",
  "/hero-posts/beauty-rimel.webp",
];
const N = POSTS.length;

/* Side positions (p ≠ 0): resting offset from the centre in u, tilt, scale,
   stacking, and where the card flies to on scroll (vw / vh). */
const SIDES: Record<number, { x: number; y: number; r: number; s: number; z: number; flyX: number; flyY: number }> = {
  [-2]: { x: -35, y: 15, r: -38, s: 0.8, z: 1, flyX: -10, flyY: -9 },
  [-1]: { x: -22, y: 5, r: -15, s: 0.9, z: 2, flyX: -6, flyY: -6 },
  [1]: { x: 22, y: 5, r: 15, s: 0.9, z: 2, flyX: 6, flyY: -6 },
  [2]: { x: 35, y: 15, r: 38, s: 0.8, z: 1, flyX: 10, flyY: -9 },
};


/* Per-locale copy. `cards` follows POSTS order. The ad images carry Spanish
   headlines; English alt text describes the ad instead of quoting it. No
   engagement numbers: on a phone screen and mid-swipe they read as noise. */
const COPY = {
  es: {
    title: "Contenido y Ads",
    titleEnd: "para tu marca",
    srOnly: " — Postty, agente de marketing con IA: contenido y ads para tu marca, para Meta y Google, en minutos, sin agencias ni community managers",
    sub: "Sin agencias, sin CMs.",
    cta: "Probar gratis",
    post: "Postear",
    cards: [
      { alt: "Ad de zapatillas: Diseño que se siente." },
      { alt: "Ad gastronómico: Tomate un break." },
      { alt: "Ad de zapatillas: De 8 AM a tu última salida." },
      { alt: "Ad de perfume: Olé a verano." },
      { alt: "Ad de belleza: Tu nuevo rimel. Sale con vos." },
    ] as { alt: string }[],
  },
  en: {
    title: "Content and Ads",
    titleEnd: "for your brand",
    srOnly: " — Postty, the AI marketing agent: content and ads for your brand, for Meta and Google, in minutes, without agencies or social media managers",
    sub: "No agencies, no social media managers.",
    cta: "Try it free",
    post: "Post",
    cards: [
      { alt: "Ad for designer sneakers" },
      { alt: "Ad for a burger restaurant" },
      { alt: "Ad for everyday sneakers" },
      { alt: "Ad for a summer perfume" },
      { alt: "Ad for a new mascara" },
    ] as { alt: string }[],
  },
};

const mod = (n: number) => ((n % N) + N) % N;

/* One side card. The outer wrapper carries the scroll exit; the inner one
   the deal-in to its resting place — two animations cannot share one
   transform. The outer wrapper is the set-centred box, so scaling it pulls
   the card in toward the phone as both recede: they leave together. Its
   image cross-fades when a swipe hands it a new post. */
function SideCard({ pos, idx, p, off, alt }: {
  pos: number; idx: number; p: MotionValue<number>; off: boolean; alt: string;
}) {
  const c = SIDES[pos];
  const fx = useTransform(p, [0, 0.85], ["0vw", off ? "0vw" : `${c.flyX}vw`]);
  const fy = useTransform(p, [0, 0.85], ["0vh", off ? "0vh" : `${c.flyY}vh`]);
  const fs = useTransform(p, [0, 0.85], [1, off ? 1 : 0.68]);
  const fo = useTransform(p, [0.3, 0.85], [1, 0]);
  return (
    <motion.div style={{ x: fx, y: fy, scale: fs, opacity: fo, zIndex: c.z }} className="absolute inset-0">
      <motion.div
        initial={off ? false : { x: "0%", y: "0%", rotate: 0, scale: 0.9, opacity: 0 }}
        animate={{ x: `${(c.x / CARD_W) * 100}%`, y: `${(c.y / CARD_H) * 100}%`, rotate: c.r, scale: c.s, opacity: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 18, delay: 1.1 + (2 - c.z) * 0.08 }}
        className="absolute inset-0 overflow-hidden rounded-[1.4rem] bg-white shadow-[0_24px_60px_-18px_rgba(40,34,28,0.35),0_2px_6px_rgba(40,34,28,0.08)] ring-1 ring-black/5"
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={idx}
            src={POSTS[idx]}
            alt={alt}
            loading="eager"
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 h-full w-full select-none object-cover"
          />
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function HeroFan({ appUrl }: { appUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const t = useCopy(COPY);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  /* The phone never sits flat: at rest it leans its top toward the viewer
     (REST_TILT, negative rotateX = top edge closer, so wider), as in the
     reference shot. On the way out it swings from that lean to tipping back,
     shrinks into the distance, then fades. The side cards share this angle. */
  const phoneTilt = useTransform(p, [0, 0.85], [reduce ? 0 : REST_TILT, reduce ? 0 : 38]);
  const phoneScale = useTransform(p, [0, 0.85], [1, reduce ? 1 : 0.55]);
  const phoneLift = useTransform(p, [0, 0.85], ["0vh", reduce ? "0vh" : "-5vh"]);
  const phoneOpacity = useTransform(p, [0.45, 0.9], [1, 0]);

  /* Light on the hand, as a key light moving over the object: it arrives
     nearly in silhouette (like the reference shot), comes up to full light
     as it settles in the centre, and falls off again as it recedes. Only the
     hand and phone body take it — the screen makes its own light. */
  const lightIn = useMotionValue(reduce ? 1 : 0.18);
  useEffect(() => {
    if (reduce) return;
    const c = animate(lightIn, 1, { duration: 1.9, delay: 0.35, ease: [0.33, 0, 0.2, 1] });
    return () => c.stop();
  }, [reduce, lightIn]);
  const lightOut = useTransform(p, [0.05, 0.8], [1, reduce ? 1 : 0.36]);
  const handFilter = useTransform([lightIn, lightOut], ([a, b]: number[]) => {
    const l = a * b;
    // A dim subject also loses a little contrast-flatness: lift contrast as it darkens.
    return `brightness(${l.toFixed(3)}) contrast(${(1 + (1 - l) * 0.18).toFixed(3)})`;
  });
  const close = useTransform(p, [0.3, 0.85], [0, reduce ? 0 : 1]);
  const titleShift = useTransform(close, (v) => `calc(${v} * var(--title-shift))`);
  const ctaShift = useTransform(close, (v) => `calc(${v} * var(--cta-shift))`);

  /* ── The swipe: a frame sequence on a canvas ─────────────────────────
     Starts once the phone has landed and the sheet has loaded; runs only
     while the hero is at rest at the top (scrolling, a hidden tab or reduced
     motion stop it between swipes). Between swipes the canvas is cleared and
     the full still shows — its thumb is the sequence's resting pose. During a
     swipe the full still is hidden and a copy with the thumb's area cut out
     shows instead: the canvas paints that whole area (hand included), and a
     canvas cannot erase the resting thumb underneath it. */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);
  const [base, setBase] = useState(0);
  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    const still = stillRef.current;
    if (!cv || !ctx || !still || reduce) return;
    const showFull = (on: boolean) => { still.style.opacity = on ? "1" : "0"; };
    const { w, h } = THUMB_SEQ.frame;
    cv.width = w;
    cv.height = h;
    const sheet = new Image();
    let ready = false;
    let landed = false;
    sheet.onload = () => { ready = true; };
    const land = window.setTimeout(() => { landed = true; sheet.src = THUMB_SEQ.src; }, 1500);
    let raf = 0;
    let start = -1;          // performance.now() when the current swipe began
    let wait = performance.now() + 900; // first swipe shortly after landing
    let drawn = -1;
    let pressed = false;
    const tick = (now: number) => {
      const idle = landed && ready && !document.hidden && p.get() < 0.04;
      if (start < 0) {
        if (idle && now >= wait) { start = now; pressed = false; }
      } else {
        const k = Math.floor(((now - start) / 1000) * THUMB_SEQ.fps);
        if (k >= THUMB_SEQ.count) {
          showFull(true);
          ctx.clearRect(0, 0, w, h);
          drawn = -1;
          start = -1;
          wait = now + HOLD * 1000;
        } else if (k !== drawn) {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(sheet, (k % THUMB_SEQ.cols) * w, Math.floor(k / THUMB_SEQ.cols) * h, w, h, 0, 0, w, h);
          if (drawn < 0) showFull(false); // first frame is on the canvas: now hide the resting thumb
          drawn = k;
          if (!pressed && k >= THUMB_SEQ.press) { pressed = true; setBase((b) => b + 1); }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.clearTimeout(land); cancelAnimationFrame(raf); };
  }, [reduce, p]);

  const centre = mod(base);

  const cta = (extra: string) => (
    <motion.a
      href={appUrl}
      onClick={() => trackEvent("Lead", { content_name: "hero_cta_probar_gratis", content_category: "trial_intent" })}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55 }}
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`group pointer-events-auto items-center gap-2.5 rounded-full bg-[#0D1522] px-9 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(13,21,34,0.45)] md:px-8 md:py-3.5 md:text-base ${extra}`}
    >
      {t.cta}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 ease-out group-hover:translate-x-[2px]"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </motion.a>
  );

  return (
    <section ref={ref} id="inicio" className="relative h-[180vh]">
      {/* No backdrop of its own: the studio is the page-wide StudioBackdrop,
          which is fixed, so it sits exactly where this sticky stage does. */}
      <div className={`sticky top-0 h-screen overflow-hidden ${STAGE_VARS}`}>
        {/* Side cards. Their box is a card-sized box at the set's centre;
            each card is offset from it. On the way out the whole group tips
            back with the phone — same angle, same perspective, same hinge
            line (the phone's 60% height, in this box's terms) — so the set
            recedes as one plane instead of the phone tilting alone. */}
        <motion.div
          className="absolute left-1/2"
          style={{
            width: u(CARD_W),
            height: u(CARD_H),
            top: FAN_TOP,
            marginLeft: u(-CARD_W / 2),
            marginTop: u(-CARD_H / 2),
            rotateX: phoneTilt,
            y: phoneLift,
            transformPerspective: PERSPECTIVE,
            transformOrigin: `50% ${50 + ((0.6 - 0.5) * SCREEN_H * 100) / CARD_H}%`,
          }}
        >
          {[-2, -1, 1, 2].map((pos) => {
            const idx = mod(base + pos);
            return (
              <SideCard key={pos} pos={pos} idx={idx} p={p} off={!!reduce} alt={t.cards[idx].alt} />
            );
          })}
        </motion.div>

        {/* The phone. Its box is the SCREEN, centred on the set; the hand
            photo is placed around it so its transparent hole lines up. Outer
            layer: scroll exit. Inner layer: the drop-in. */}
        <motion.div
          style={{
            width: u(SCREEN_W),
            height: u(SCREEN_H),
            top: FAN_TOP,
            marginLeft: u(-SCREEN_W / 2),
            marginTop: u(-SCREEN_H / 2),
            rotateX: phoneTilt,
            scale: phoneScale,
            y: phoneLift,
            opacity: phoneOpacity,
            transformPerspective: PERSPECTIVE,
            transformOrigin: "50% 60%",
            zIndex: 5,
          }}
          className="absolute left-1/2 will-change-transform"
        >
          {/* The arrival, as in the reference shot: the first frame is the
              hand and phone huge, filling the screen and tipped TOWARD the
              viewer — top edge closer, so wider — the way you lift a phone to
              look at it; then it pulls back, shrinking into the centre, and
              settles flat and square to the camera. */}
          <motion.div
            initial={reduce ? false : { y: "16vh", rotateX: ARRIVE_TILT, scale: 2.15 }}
            animate={{ y: 0, rotateX: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 42, damping: 15, mass: 1.3, delay: 0.2 }}
            style={{ transformPerspective: PERSPECTIVE, transformOrigin: "50% 90%" }}
            className="absolute inset-0"
          >
            {/* Screen content: the post fills the whole display, like a
                story, with the system chrome floating over it. */}
            <div
              className="absolute overflow-hidden bg-[#0D1522]"
              style={{
                inset: `-${OVERSCAN * 100}%`,
                borderRadius: u(PHONE.radius * (SCREEN_W / PHONE.width)),
              }}
            >
              {/* The post. A swipe slides a two-post strip one width left:
                  the outgoing post and the incoming one travel as one piece,
                  so no gap ever opens between them. */}
              <motion.div
                key={centre}
                initial={base === 0 ? false : { x: "0%" }}
                animate={{ x: "-50%" }}
                transition={{ duration: 0.55, ease: [0.45, 0, 0.25, 1] }}
                className="absolute inset-y-0 left-0 flex"
                style={{ width: "200%" }}
              >
                {[mod(centre - 1), centre].map((i, k) => (
                  <img
                    key={k}
                    src={POSTS[i]}
                    alt={k === 1 ? t.cards[i].alt : ""}
                    aria-hidden={k === 0 ? true : undefined}
                    loading="eager"
                    fetchPriority={k === 1 ? "high" : "auto"}
                    draggable={false}
                    className="h-full w-1/2 select-none object-cover"
                  />
                ))}
              </motion.div>

              {/* Legibility washes for the chrome. */}
              <div aria-hidden="true" className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/35 to-transparent" style={{ height: u(9) }} />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent" style={{ height: u(13) }} />

              {/* Status bar */}
              <div
                className="absolute inset-x-0 top-0 flex items-center justify-between font-semibold text-white"
                style={{ height: u(5), padding: `0 ${u(3)}`, fontSize: u(1.45) }}
              >
                <span>9:41</span>
                <span className="flex items-center" style={{ gap: u(0.55) }} aria-hidden="true">
                  <svg viewBox="0 0 18 12" fill="currentColor" style={{ width: u(1.7) }}><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" style={{ width: u(1.7) }}><path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5.2 12.5a10 10 0 0 1 13.6 0"/><path d="M8.6 16.2a5 5 0 0 1 6.8 0"/></svg>
                  <svg viewBox="0 0 28 13" fill="none" style={{ width: u(2.4) }}><rect x="0.5" y="0.5" width="24" height="12" rx="3.5" stroke="currentColor" opacity=".5"/><rect x="2.5" y="2.5" width="18" height="8" rx="2" fill="currentColor"/><rect x="25.5" y="4.5" width="2" height="4" rx="1" fill="currentColor" opacity=".5"/></svg>
                </span>
              </div>
              {/* Dynamic Island */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
                style={{ top: u(1.05), width: u(SCREEN_W * 0.31), height: u(2.9) }}
              />

              {/* "Postear" — glass, white Instagram glyph, at the foot of the
                  screen. Decorative: the real CTA is "Probar gratis". */}
              <div aria-hidden="true" className="absolute inset-x-0 flex justify-center" style={{ bottom: u(1.8) }}>
                <span
                  className="flex items-center rounded-full border border-white/35 bg-white/15 font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-md"
                  style={{ gap: u(0.75), padding: `${u(0.8)} ${u(2.6)}`, fontSize: u(1.45) }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ width: u(2), height: u(2) }}>
                    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                    <circle cx="12" cy="12" r="4.3" />
                    <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
                  </svg>
                  {t.post}
                </span>
              </div>
            </div>

            {/* The hand takes the moving key light (handFilter); the screen does not. */}
            <motion.div style={{ filter: handFilter }} className="pointer-events-none absolute inset-0">
            {/* The hand: a still that never moves (screen cut out, edges
                faded where the photo ends), with the thumb's canvas on top. */}
            <div
              className="pointer-events-none absolute"
              style={{
                width: `${100 / PHONE.width}%`,
                left: `${(-PHONE.left / PHONE.width) * 100}%`,
                top: `${(-PHONE.top / PHONE.height) * 100}%`,
                aspectRatio: `${PHONE.aspect}`,
              }}
            >
              <img
                src="/hero-hand-arm-hole.webp"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 h-full w-full select-none"
              />
              <img
                ref={stillRef}
                src="/hero-hand-arm.webp"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 h-full w-full select-none"
              />
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="absolute"
                style={{
                  left: `${THUMB_SEQ.roi.left * 100}%`,
                  top: `${THUMB_SEQ.roi.top * 100}%`,
                  width: `${THUMB_SEQ.roi.width * 100}%`,
                  height: `${THUMB_SEQ.roi.height * 100}%`,
                }}
              />
            </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Copy. Phone: headline on top, CTA under the phone. Desktop: the
            headline, subhead and CTA stacked above the phone — the CTA sits
            at the set's vanishing point. */}
        <motion.div style={{ y: titleShift }} className="pointer-events-none absolute inset-x-0 top-[20%] z-10 flex flex-col items-center px-4 text-center md:top-[13%]">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="font-heading text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#0D1522] sm:text-5xl md:text-[3.15rem]"
          >
            {t.title}<br className="md:hidden" /> {t.titleEnd}
            <span className="sr-only">{t.srOnly}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-3 font-heading text-xl font-semibold tracking-[-0.02em] text-[#0D1522] md:mt-2 md:text-[1.45rem]"
          >
            {t.sub}
          </motion.p>
          {cta("mt-5 hidden md:inline-flex")}
        </motion.div>

        {/* Phone only: the CTA sits under the phone's screen. */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-10 flex justify-center md:hidden"
          style={{ top: `calc(${FAN_TOP} + ${u(SCREEN_H / 2)} + 22px)`, y: ctaShift }}
        >
          {cta("inline-flex")}
        </motion.div>
      </div>
    </section>
  );
}
