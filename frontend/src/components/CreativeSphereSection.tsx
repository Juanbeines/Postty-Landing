"use client";

/**
 * CreativeSphereSection — the "lluvia de creativos" that replaced the old
 * StarConcept/Nüa testimonial section.
 *
 * A SPHERE of ad creatives spinning slowly and infinitely left→right, cards
 * BENT around the surface like tiles on a globe (Juan's sketch: segments
 * hugging the sphere, not flat panels rotated in space).
 *
 * How the bend works — a flat div with rotateY can never LOOK curved, so
 * each card is split into vertical SLICES. The slices of a card sit on a
 * shared local cylinder (`rotateY(δ) translateZ(Rl)` inside a preserve-3d
 * container), which makes the artwork physically wrap. Rotating that inner
 * container spins the card's arc segment to its current longitude, while
 * the outer wrapper translates it to its screen position. Slices carry
 * `backface-visibility: hidden`, so as a card crosses the sphere's edge its
 * far slices wink out one by one — visually it slides behind the horizon
 * exactly like geography on a turning globe.
 *
 * Why not one big preserve-3d scene: per-card opacity would flatten it and
 * the browser's depth sort breaks (back cards painted over front ones — a
 * bug we shipped once). Each card is its own tiny 3D scene; BETWEEN cards
 * the paint order is an explicit zIndex from cos(longitude).
 *
 * Per-frame cost: 2 style writes per card (wrapper + inner rotation), rAF,
 * zero React re-renders. Slice geometry is static per container width.
 *
 * The creatives are AI-generated demo ads (Postty's production model) for
 * fictional brands, deliberately containing NO brand names.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type BandCard = { src: string; phase: number; band: -1 | 0 | 1; size: number };

/* Bands = globe latitudes: equator biggest, north/south rings smaller and on
   a reduced radius. Phases staggered so cards never align into columns.
 *
 * Phase 0 = dead front-center at t0, and the ring turns left→right, so the
 * NEXT card to reach the front is the one at 315 (it starts front-left).
 * The two strongest creatives own those two slots on purpose — that pair is
 * the first thing the section shows. Don't reshuffle without keeping them. */
const BANDS: BandCard[] = [
  { src: "moda-2",     phase: 0,   band: 0,  size: 1.0  }, // ← hero: "BÁSICOS QUE SON BÁSICOS"
  { src: "skincare-1", phase: 315, band: 0,  size: 1.0  }, // ← next in: "PIEL EN CALMA"
  { src: "gastro-1",   phase: 45,  band: 0,  size: 0.96 },
  { src: "saas-1",     phase: 90,  band: 0,  size: 1.0  },
  { src: "fitness-1",  phase: 135, band: 0,  size: 0.96 },
  { src: "cafe-2",     phase: 180, band: 0,  size: 0.94 },
  { src: "running-1",  phase: 225, band: 0,  size: 1.0  },
  { src: "deco-2",     phase: 270, band: 0,  size: 0.96 },
  { src: "cafe-1",     phase: 18,  band: 1,  size: 0.84 },
  { src: "joyas-2",    phase: 78,  band: 1,  size: 0.78 },
  { src: "helado-1",   phase: 138, band: 1,  size: 0.84 },
  { src: "moda-1",     phase: 198, band: 1,  size: 0.78 },
  { src: "saas-2",     phase: 258, band: 1,  size: 0.84 },
  { src: "deco-1",     phase: 318, band: 1,  size: 0.78 },
  { src: "gastro-2",   phase: 42,  band: -1, size: 0.82 },
  { src: "running-2",  phase: 102, band: -1, size: 0.78 },
  { src: "joyas-1",    phase: 162, band: -1, size: 0.82 },
  { src: "skincare-2", phase: 222, band: -1, size: 0.78 },
  { src: "fitness-2",  phase: 282, band: -1, size: 0.82 },
  { src: "pan-1",      phase: 342, band: -1, size: 0.78 },
];

const SLICES = 9;         // vertical strips per card — more = smoother bend
const FULL_TURN_S = 55;   // slow — one full revolution
const HOVER_BOOST = 1.15; // extra growth on hover (sphere keeps spinning)
const LAT_RADIUS = 0.8;   // outer bands' radius vs equator
const BEND = 0.82;        // local cylinder radius vs R — lower = harder bend

export default function CreativeSphereSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hovered = useRef<number>(-1);
  const hoverLerp = useRef<number[]>(new Array(BANDS.length).fill(0));
  const spinning = useRef(false);
  const [stageW, setStageW] = useState(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Hold the ring at rotation 0 until the section is actually on screen.
     The two hero creatives sit at phase 0 / 315, and that opening pair is
     the whole point — if the clock ran from page load, the sphere would
     already be ~60° in by the time anyone scrolled down here. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          spinning.current = true;
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Geometry shared by the frame loop and the static slice JSX.
  // Radius is deliberately small vs card width: neighbors on the ring
  // almost touch ("mínimo mínimo espacio"), overlapping slightly as they
  // leave the center.
  const R = Math.min(Math.max(stageW * 0.275, 222), 432);     // equator radius — big tight globe
  const bandY = Math.min(Math.max(stageW * 0.125, 90), 156);  // latitude offset
  const baseW = Math.min(Math.max(stageW * 0.335, 235), 470); // XL cards
  const Rl = R * BEND;                                        // bend radius

  useEffect(() => {
    if (!stageW) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = performance.now();
    let rot = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!reduceMotion && spinning.current) rot = (rot + (360 / FULL_TURN_S) * dt) % 360;

      for (let i = 0; i < BANDS.length; i++) {
        const card = cardRefs.current[i];
        const inner = innerRefs.current[i];
        if (!card || !inner) continue;

        const { phase, band, size } = BANDS[i];
        const a = (((rot + phase) % 360) + 360) % 360;
        const rad = (a * Math.PI) / 180;
        const sin = Math.sin(rad);
        const cos = Math.cos(rad); // 1 = front center, -1 = back

        const r = band === 0 ? R : R * LAT_RADIUS;
        const x = sin * r;
        const y = band * -bandY;

        const target = hovered.current === i ? 1 : 0;
        hoverLerp.current[i] += (target - hoverLerp.current[i]) * Math.min(1, dt * 9);

        const frontness = Math.max(0, cos);
        // High floor: side cards stay chunky so the ring reads packed —
        // shrinking them too much is what created the gaps. Center cards
        // get an extra-strong boost so the front of the globe dominates.
        const scale = (0.72 + 0.52 * frontness) * size * (1 + (HOVER_BOOST - 1) * hoverLerp.current[i]);

        // Wrapper: screen position + size. The signed angle spins the inner
        // arc segment to its longitude; slices past 90° hide themselves via
        // backface-visibility = the card slips behind the horizon.
        const signed = a <= 180 ? a : a - 360;
        card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
        inner.style.transform = `translateZ(${-Rl}px) rotateY(${signed}deg) rotateX(${band * 7}deg)`;

        card.style.zIndex = String(Math.round((cos + 1) * 500) + Math.round(hoverLerp.current[i] * 40));
        const opacity = cos < -0.12 ? 0 : Math.min(1, 0.22 + 0.78 * ((cos + 0.12) / 1.12));
        card.style.opacity = String(opacity);
        card.style.pointerEvents = cos > 0.1 ? "auto" : "none";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stageW, R, bandY, Rl]);

  return (
    <section id="creativos" className="overflow-hidden px-4 py-16 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
      >
        Creativos hechos con Postty
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-3 max-w-md text-center text-base text-[#0D1522]/55 sm:text-lg"
      >
        Sin diseñadores, sin agencias. Listos para publicar.
      </motion.p>

      <div
        ref={stageRef}
        className="relative mx-auto mt-10 h-[580px] max-w-[1440px] sm:h-[700px] md:mt-14 md:h-[820px]"
      >
        {BANDS.map((c, i) => {
          const cardW = baseW * c.size;
          const cardH = cardW * 1.25; // 4:5
          const sliceW = cardW / SLICES;
          // Angular width of one slice on the local bend cylinder
          const phi = (sliceW / Rl) * (180 / Math.PI);
          return (
            <div
              key={c.src}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{ width: cardW, height: cardH, opacity: 0, perspective: 900 }}
              onMouseEnter={() => { hovered.current = i; }}
              onMouseLeave={() => { hovered.current = -1; }}
            >
              <div
                ref={(el) => { innerRefs.current[i] = el; }}
                className="relative h-full w-full will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                {Array.from({ length: SLICES }, (_, j) => {
                  const delta = (j - (SLICES - 1) / 2) * phi;
                  return (
                    <div
                      key={j}
                      className="absolute top-0 h-full"
                      style={{
                        left: "50%",
                        width: sliceW + 0.7, // hairline overlap kills seams
                        marginLeft: -(sliceW + 0.7) / 2,
                        transform: `rotateY(${delta}deg) translateZ(${Rl}px)`,
                        backfaceVisibility: "hidden",
                        backgroundImage: `url(/creatives/${c.src}.webp)`,
                        backgroundSize: `${SLICES * 100}% 100%`,
                        backgroundPositionX: `${(j / (SLICES - 1)) * 100}%`,
                        borderRadius:
                          j === 0 ? "16px 0 0 16px" : j === SLICES - 1 ? "0 16px 16px 0" : "0",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
