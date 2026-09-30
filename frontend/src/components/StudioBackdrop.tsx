"use client";

/**
 * StudioBackdrop — the photo-studio set behind the whole landing.
 *
 * One fixed, full-viewport layer under every section (all transparent). It
 * holds the same empty infinity cove lit three ways — from above, from the
 * left and from the right, all neutral greys — and it changes in two ways:
 *
 * 1. Per section. Each section is assigned a light (LIGHTS, by element id).
 *    Whichever section crosses the middle of the viewport sets the light,
 *    and the photos cross-fade to it over ~1.4s — so entering a section
 *    reads as the set being re-lit for it.
 * 2. Continuously, with scroll. The set drifts like a slow camera move, and
 *    a soft beam of light travels across it, so it never sits still even
 *    inside one section.
 *
 * The three photos are Nano Banana edits of ONE generated studio, so only the
 * light moves between them. Everything animated here is opacity/transform —
 * compositor-only, no layout work.
 */

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

type Light = "top" | "left" | "right";

/* Section id → its light, in page order. */
const LIGHTS: [string, Light][] = [
  ["inicio", "top"],
  ["como-funciona", "left"],
  ["creativos", "right"],
  ["plataformas", "left"],
  ["pricing", "top"],
  ["equipo", "right"],
  ["faq", "left"],
  ["empezar", "top"],
];

const SRC: Record<Exclude<Light, "top">, string> = {
  left: "/studio-left-soft.webp",
  right: "/studio-right-soft.webp",
};

function useActiveLight(): Light {
  const [light, setLight] = useState<Light>("top");
  useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let next: Light = "top";
      // Last section whose top has passed the middle of the screen wins, so
      // gaps between sections keep the previous light instead of flashing.
      for (const [id, l] of LIGHTS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) next = l;
      }
      setLight(next);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return light;
}

export default function StudioBackdrop() {
  const light = useActiveLight();
  const { scrollY } = useScroll();
  const s = useSpring(scrollY, { stiffness: 60, damping: 20, mass: 0.6 });

  /* Slow camera drift: a gentle figure-eight tied to scroll position. The
     set is scaled up so the drift never reveals an edge. */
  const x = useTransform(s, (v) => `${Math.sin(v / 1400) * 2.2}%`);
  const y = useTransform(s, (v) => `${Math.cos(v / 1900) * 1.6}%`);
  const scale = useTransform(s, (v) => 1.08 + Math.sin(v / 2600) * 0.025);

  /* A soft beam sweeping across the set, back and forth as you scroll. */
  const beamX = useTransform(s, (v) => `${50 + Math.sin(v / 1100) * 38}%`);
  const beamY = useTransform(s, (v) => `${36 + Math.cos(v / 1700) * 14}%`);
  const beam = useTransform(
    [beamX, beamY],
    ([bx, by]) => `radial-gradient(ellipse 42% 55% at ${bx} ${by}, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)`,
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#EDEDED]">
      <motion.div style={{ x, y, scale }} className="absolute inset-0 will-change-transform">
        {/* Base: light from above — the hero's frame, portrait crop on phones. */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/hero-studio-mobile-soft.webp" />
          <img
            src="/hero-studio-soft.webp"
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        {(Object.keys(SRC) as Exclude<Light, "top">[]).map((l) => (
          <motion.img
            key={l}
            src={SRC[l]}
            alt=""
            initial={false}
            animate={{ opacity: light === l ? 1 : 0 }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ))}
      </motion.div>
      <motion.div style={{ backgroundImage: beam }} className="absolute inset-0" />
    </div>
  );
}
