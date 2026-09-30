"use client";

/**
 * CreativeSphereSection — 9:16 creatives standing on the rim of a big
 * invisible circle, turning slowly clockwise, with a Ads / Posts / Videos selector.
 *
 * Replaced the 3D sphere (archived at _extras/CreativeSphereSection.tsx).
 *
 * Geometry: every card hangs off ONE container with
 * `rotate(θ) translateY(-Rc)`, so it stands radially on the circle like a
 * spoke. The container is what spins
 * (a CSS animation in globals.css) — a single composited rotation for the
 * whole ring, no per-frame JS. Slots are fixed (SLOTS around the full
 * circle) and a tab's creatives repeat to fill them; Rc is derived from the
 * card width so neighbours keep an even gap and about five fit across a
 * full-width screen.
 *
 * All creatives are AI-generated for fictional brands — no real brand marks.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import IgStats, { type Stats } from "@/components/IgStats";

type Tab = "ads" | "posts" | "videos";

const TABS: { id: Tab; label: string }[] = [
  { id: "ads", label: "Ads" },
  { id: "posts", label: "Posts" },
  { id: "videos", label: "Videos" },
];

const CREATIVES: Record<Tab, string[]> = {
  ads: ["01b", "02b", "03b", "04b", "05", "06b", "07b", "08c", "09b", "10"].map((n) => `/creatives-v3/ads/ad-${n}.webp`),
  posts: ["02", "03", "04", "05", "06", "07", "08-b", "09", "10-b"].map((n) => `/creatives-v3/posts/post-${n}.webp`),
  videos: [], // coming later
};

/* Small-account numbers on purpose (30–500 likes): the point is "this is
   what a normal brand posts", not viral proof. Deterministic per slot so
   server and client render the same thing. */
function statsFor(i: number): Stats {
  const r = (seed: number) => {
    const x = Math.sin(i * 97.13 + seed * 13.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const likes = Math.round(30 + r(1) * 470);
  const comments = Math.max(2, Math.round(likes * (0.03 + r(2) * 0.09)));
  const views = Math.round(likes * (6 + r(3) * 8));
  const fmt = (n: number) => n.toLocaleString("es-AR");
  return { likes: fmt(likes), comments: fmt(comments), views: fmt(views) };
}

const SLOTS = 26;           // cards around the full circle
const STEP = (2 * Math.PI) / SLOTS;
const GAP = 1.02;           // centre-to-centre distance vs card width — nearly touching
const PAD = 28;             // room above the top card for its shadow
const FADE = 190;           // px over which the ring dissolves at the section's bottom edge
const BELOW = 0.6;          // room under the top card for the ring's sides, in card heights

export default function CreativeSphereSection() {
  const ref = useRef<HTMLElement>(null);
  const [w, setW] = useState(1280);
  const [tab, setTab] = useState<Tab>("posts");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cardW = Math.min(Math.max(w * 0.15, 150), 290);
  const cardH = (cardW * 16) / 9;
  const Rc = (cardW * GAP) / (2 * Math.sin(STEP / 2)); // orbit of card centres
  const cy = PAD + cardH / 2 + Rc;                     // circle centre, from stage top
  const stageH = PAD + cardH + cardH * BELOW;

  const items = CREATIVES[tab];

  return (
    /* `isolate` keeps the cards' stacking inside this section, so the gift
       overlay (z-[100]) always paints over it. */
    <section
      ref={ref}
      id="creativos"
      className="relative isolate overflow-hidden pt-20 md:pt-24"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-5xl px-4 text-center font-heading text-3xl font-semibold tracking-tight text-[#0D1522] sm:text-4xl md:text-5xl"
      >
        Contenido, Ads, Videos UGC y mucho más
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="mt-4 px-4 text-center text-base leading-relaxed text-[#0D1522]/65 sm:text-lg md:text-xl"
      >
        Hecho por Postty, para el mercado argentino
      </motion.p>

      {/* Format selector — underline tabs on one shared track. */}
      <div role="tablist" aria-label="Formato" className="relative mx-auto mt-10 flex w-fit gap-10 md:mt-14 md:gap-16">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#0D1522]/[0.07]" />
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative pb-2 font-heading text-lg transition-colors md:text-2xl ${
              tab === t.id ? "text-[#0D1522]" : "text-[#0D1522]/55 hover:text-[#0D1522]"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span
                layoutId="creative-tab-bar"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#A6E35A]"
              />
            )}
          </button>
        ))}
      </div>

      {/* The ring's sides run off the bottom of the section. A mask fades
          the cards out over the last FADE px so there is no hard crop line,
          and a blur band over the same strip (below) softens them as they
          go — a progressive blur rather than a cut. */}
      <div
        className="creative-wheel-stage relative mt-6 md:mt-10"
        style={{
          height: stageH,
          maskImage: `linear-gradient(to bottom, #000 calc(100% - ${FADE}px), transparent)`,
          WebkitMaskImage: `linear-gradient(to bottom, #000 calc(100% - ${FADE}px), transparent)`,
        }}
      >
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              {/* The wheel. Its box is the orbit circle; cards hang off its centre. */}
              <div
                className="creative-wheel absolute will-change-transform"
                style={{ width: Rc * 2, height: Rc * 2, left: `calc(50% - ${Rc}px)`, top: cy - Rc }}
              >
                {Array.from({ length: SLOTS }, (_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 overflow-hidden rounded-[18px] bg-white shadow-[0_18px_40px_-14px_rgba(13,21,34,0.35),0_2px_6px_rgba(13,21,34,0.08)]"
                    style={{
                      width: cardW,
                      height: cardH,
                      marginLeft: -cardW / 2,
                      marginTop: -cardH / 2,
                      transform: `rotate(${(360 / SLOTS) * i}deg) translateY(${-Rc}px)`,
                    }}
                  >
                    <img
                      src={items[i % items.length]}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full select-none object-cover"
                    />
                    <IgStats stats={statsFor(i)} unit={(n) => `${(n * cardH) / 64}px`} />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="soon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 text-center font-heading text-xl text-[#0D1522]/45 md:text-2xl"
              style={{ top: PAD + cardH * 0.55 }}
            >
              Próximamente
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 backdrop-blur-[10px]"
        style={{
          height: FADE,
          // Faded out at BOTH ends. A backdrop blur that is still on at the
          // section's bottom edge leaves a visible seam where blurred studio
          // meets sharp studio; tapering it to zero there removes the line.
          maskImage: "linear-gradient(to top, transparent, #000 40%, #000 60%, transparent)",
          WebkitMaskImage: "linear-gradient(to top, transparent, #000 40%, #000 60%, transparent)",
        }}
      />
    </section>
  );
}
