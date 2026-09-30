"use client";

/**
 * HeroFan — five finished ads fanned like a hand of cards on a studio set.
 *
 * The section is taller than the viewport and its stage is sticky, so the
 * first stretch of scroll drives an animation instead of moving the page:
 * the whole fan tips backwards around its BOTTOM edge — the top recedes
 * toward a vanishing point while the base stays planted on the studio
 * floor — and dissolves into the backdrop. One transform on one wrapper,
 * so it is a single composited layer and stays smooth.
 *
 * The scroll value goes through a spring before it reaches the transform:
 * raw wheel input arrives in steps, and without the smoothing the tilt
 * visibly ratchets.
 */

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

import IgStats, { type Stats } from "@/components/IgStats";
import { trackEvent } from "@/lib/pixel";

/* All geometry is in `u`, a unit that is 1vh on wide screens and shrinks
   with the width on phones, so the fan keeps its proportions on both. It and
   the fan's vertical position are CSS variables set per breakpoint on the
   stage (see STAGE_VARS), because phones use a different layout: headline
   on top, fan below it, CTA under the fan. */
const U = "var(--u)";
const u = (n: number) => `calc(${n} * ${U})`;

/* Centre card height 64u at 9:16; the side cards are scaled copies of that box
   (inner pair 90%, outer pair 80%). Order is back-to-front: the outer pair sits
   under the inner pair, which sits under the centre card. */
const CARD_H = 64;
const CARD_W = (CARD_H * 9) / 16;
/* Where the centre card's middle sits. Desktop: 51%, a little under the
   headline at 44%. Phone: 56%, below a headline that moves to the top. */
const FAN_TOP = "var(--fan-top)";
/* --title-shift / --cta-shift: how far the phone headline drops and the
   phone CTA rises once the fan has receded, so the two close the gap it
   leaves and end up centred together. Zero on desktop, where the copy
   already sits over the middle of the set. */
const STAGE_VARS =
  "[--u:min(0.9vh,1.35vw)] [--fan-top:56%] [--title-shift:18vh] [--cta-shift:-24vh] md:[--u:min(1vh,1.5vw)] md:[--fan-top:51%] md:[--title-shift:0px] md:[--cta-shift:0px]";

type Slot = { src: string; alt: string; x: number; y: number; r: number; s: number; z: number; stats: Stats };

const SLOTS: Slot[] = [
  { src: "/hero-posts/perfume-lumina.webp", alt: "Ad de perfume: Olé a verano.", x: -40, y: 17, r: -38, s: 0.8, z: 1, stats: { likes: "8.912", comments: "143", views: "61,2 mil" } },
  { src: "/hero-posts/post-4.webp", alt: "Ad de zapatillas: De 8 AM a tu última salida.", x: 40, y: 17, r: 38, s: 0.8, z: 1, stats: { likes: "15,7 mil", comments: "402", views: "118 mil" } },
  { src: "/hero-posts/beauty-rimel.webp", alt: "Ad de belleza: Tu nuevo rimel. Sale con vos.", x: -25, y: 6, r: -15, s: 0.9, z: 2, stats: { likes: "21,3 mil", comments: "586", views: "164 mil" } },
  { src: "/hero-posts/burger-break.webp", alt: "Ad gastronómico: Tomate un break.", x: 25, y: 6, r: 15, s: 0.9, z: 2, stats: { likes: "6.487", comments: "97", views: "43,8 mil" } },
  { src: "/hero-posts/sneaker-diseno.webp", alt: "Ad de zapatillas: Diseño que se siente.", x: 0, y: 0, r: 0, s: 1, z: 3, stats: { likes: "12,4 mil", comments: "318", views: "86,5 mil" } },
];

/* Pulls a card back toward the centre card as the fan recedes. A wrapper of
   its own, because the card inside is already animating x/y for its deal-in
   and two animations cannot share one transform. */
function Gather({ p, c, off, children }: { p: MotionValue<number>; c: Slot; off: boolean; children: React.ReactNode }) {
  const k = useTransform(p, [0, 0.85], [0, off ? 0 : 0.8]);
  const x = useTransform(k, (v) => `${(-c.x / CARD_W) * 100 * v}%`);
  const y = useTransform(k, (v) => `${(-c.y / CARD_H) * 100 * v}%`);
  return (
    <motion.div style={{ x, y, zIndex: c.z }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

export default function HeroFan({ appUrl }: { appUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  /* Three things at once, so the hand reads as sliding AWAY rather than
     just tipping over: it tips back on its bottom hinge, shrinks toward the
     middle of the set (distance), and — per card, below — gathers in toward
     the centre card, the way parallel lines converge on a vanishing point. */
  const rotateX = useTransform(p, [0, 0.85], [0, reduce ? 0 : 62]);
  const scale = useTransform(p, [0, 0.85], [1, reduce ? 1 : 0.42]);
  const lift = useTransform(p, [0, 0.85], ["0vh", reduce ? "0vh" : "-6vh"]);
  const fanOpacity = useTransform(p, [0.35, 0.9], [1, 0]);
  const shadowOpacity = useTransform(p, [0, 0.6], [1, 0]);
  const close = useTransform(p, [0.3, 0.85], [0, reduce ? 0 : 1]);
  const titleShift = useTransform(close, (v) => `calc(${v} * var(--title-shift))`);
  const ctaShift = useTransform(close, (v) => `calc(${v} * var(--cta-shift))`);

  const cta = (extra: string) => (
    <motion.a
      href={appUrl}
      onClick={() => trackEvent("Lead", { content_name: "hero_cta_probar_gratis", content_category: "trial_intent" })}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55 }}
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`group pointer-events-auto items-center gap-2.5 rounded-full bg-[#0D1522] px-9 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(13,21,34,0.45)] md:text-lg ${extra}`}
    >
      Probar gratis
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 ease-out group-hover:translate-x-[2px]"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </motion.a>
  );

  return (
    <section ref={ref} id="inicio" className="relative h-[180vh]">
      {/* No backdrop of its own: the studio is the page-wide StudioBackdrop,
          which is fixed, so it sits exactly where this sticky stage does. */}
      <div className={`sticky top-0 h-screen overflow-hidden ${STAGE_VARS}`}>
        {/* Contact shadow on the floor, under the fan's base. It fades as
            the cards lie down, since a card flat on the floor casts none. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: shadowOpacity, width: u(90), height: u(8), top: `calc(${FAN_TOP} + ${u(CARD_H / 2 + 12)})` }}
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(40,34,28,0.22),transparent)] blur-md"
        />

        {/* The fan. Its box is the centre card's box, so transform-origin
            "50% 100%" is that card's bottom edge — the hinge the whole hand
            folds back on. */}
        <motion.div
          style={{
            rotateX,
            scale,
            opacity: fanOpacity,
            x: "-50%",
            y: lift,
            // Vertical centring via margin: framer owns `y` for the lift, and
            // `y` / `translateY` are the same channel.
            marginTop: u(-CARD_H / 2),
            transformPerspective: 1100,
            transformOrigin: "50% 100%",
            width: u(CARD_W),
            height: u(CARD_H),
            top: FAN_TOP,
          }}
          className="absolute left-1/2 will-change-transform"
        >
          {SLOTS.map((c, i) => (
            <Gather key={c.src} p={p} c={c} off={!!reduce}>
              <motion.div
                /* Deal-in on load: every card starts stacked on the centre one
                   and springs out to its slot. */
                initial={reduce ? false : { x: "0%", y: "0%", rotate: 0, scale: 0.96, opacity: 0 }}
                /* Offsets as a % of the card's own size (framer cannot tween
                   into a calc()), which is the same thing since every card
                   fills the fan's box. */
                animate={{ x: `${(c.x / CARD_W) * 100}%`, y: `${(c.y / CARD_H) * 100}%`, rotate: c.r, scale: c.s, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 + (2 - c.z) * 0.08 }}
                className="absolute inset-0 overflow-hidden rounded-[1.4rem] bg-white shadow-[0_24px_60px_-18px_rgba(40,34,28,0.35),0_2px_6px_rgba(40,34,28,0.08)] ring-1 ring-black/5"
              >
                <img
                  src={c.src}
                  alt={c.alt}
                  loading="eager"
                  fetchPriority={i === SLOTS.length - 1 ? "high" : "auto"}
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />
                <IgStats stats={c.stats} unit={u} />
              </motion.div>
            </Gather>
          ))}
        </motion.div>

        {/* Desktop: copy sits in front of the fan, over the lower half of the
            cards as in the mockup, with a soft white halo that keeps it
            legible on top of photographs. Phone: it moves above the fan
            instead, where it needs no halo. */}
        <motion.div style={{ y: titleShift }} className="pointer-events-none absolute inset-x-0 top-[16%] z-10 flex flex-col items-center px-4 text-center md:top-[44%] md:pt-[calc(var(--u)*2)]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 hidden md:block h-[150%] w-[min(900px,110vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(247,246,244,0.92),rgba(247,246,244,0.6)_55%,transparent)]"
          />
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="font-heading text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#0D1522] sm:text-5xl md:text-[4rem]"
          >
            Contenido y Ads para tu marca
            <span className="sr-only"> — Postty, agente de marketing con IA: contenido y ads para tu marca, para Meta y Google, en minutos, sin agencias ni community managers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-3 font-heading text-xl font-semibold tracking-[-0.02em] text-[#0D1522] md:text-[2rem]"
          >
            Sin agencias, sin CMs.
          </motion.p>
          {cta("mt-7 hidden md:inline-flex")}
        </motion.div>

        {/* Phone only: the CTA sits right under the centre card. */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-10 flex justify-center md:hidden"
          style={{ top: `calc(${FAN_TOP} + ${u(CARD_H / 2)} + 40px)`, y: ctaShift }}
        >
          {cta("inline-flex")}
        </motion.div>
      </div>
    </section>
  );
}
