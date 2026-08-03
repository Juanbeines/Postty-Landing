/**
 * "Cómo funciona" — one-glance flow diagram.
 *
 * Left  : the platforms you connect (logos ride the rails INTO the card).
 * Center: the glass card, octopus peeking from behind (same treatment as
 *         the pricing cards), where Postty generates the content.
 * Right : the results, as glass pills riding the rails back OUT.
 *
 * Everything loops forever. The chips ride real CSS motion paths whose `d`
 * strings are shared with the <svg> that paints the rails, so a chip is
 * always exactly on its line. Because `offset-path: path()` resolves
 * against the containing block in raw pixels, a stage keeps its authored
 * size and shrinks with a transform to fit its container — SVG, chips and
 * text all scale together (see useStageScale).
 *
 * Under `lg` the horizontal stage would be unreadable, so a second stage
 * takes over: the same diagram stood on its end as a vertical funnel —
 * logos pour down into the card, results stream out the bottom.
 *
 * The keyframes/utility classes (.flow-chip, .rail-dash, .mascot-float)
 * live in src/app/globals.css.
 */

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ── Stage geometry (design units — everything below is in these px) ── */
const STAGE_W = 1120;
const STAGE_H = 440;

const BOX = { x: 362, y: 144, w: 396, h: 152 };

/** Where the rails reach the outer edges (fanned out). The middle pair is
    spread wide enough that a one-line label clears both chip rows. */
const OUTER_Y = [54, 146, 294, 386];
/** Where the rails meet the card — a tight cluster, so the fan is wide. */
const INNER_Y = [172, 204, 236, 268];

/* All four rails run flat until BEND_A and finish their sweep at BEND_B.
   Sharing one bend window keeps them strictly ordered (they can never
   cross or crowd each other), and starting it late leaves the vertical
   middle clear all the way out to x≈240, which is where the step labels
   sit. */
const BEND_A = 210;
const BEND_B = 410;
const CTRL = (BEND_B - BEND_A) * 0.4;

/** Straight run → S-curve → straight run, left side (outer ➝ card). */
const railIn = (i: number, from: number, to: number) => {
  const o = OUTER_Y[i];
  const n = INNER_Y[i];
  return `M${from} ${o}L${BEND_A} ${o}C${BEND_A + CTRL} ${o} ${BEND_B - CTRL} ${n} ${BEND_B} ${n}L${to} ${n}`;
};

/** Mirror of the above around the stage centre (card ➝ outer). */
const railOut = (i: number, from: number, to: number) => {
  const mxa = STAGE_W - BEND_A;
  const mxb = STAGE_W - BEND_B;
  const o = OUTER_Y[i];
  const n = INNER_Y[i];
  return `M${from} ${n}L${mxb} ${n}C${mxb + CTRL} ${n} ${mxa - CTRL} ${o} ${mxa} ${o}L${to} ${o}`;
};

/* Painted rails bleed past the travelled section on both ends: out to the
   stage edge, and in under the card. */
const RAIL_IN_VISUAL = OUTER_Y.map((_, i) => railIn(i, 8, 520));
const RAIL_IN_TRAVEL = OUTER_Y.map((_, i) => railIn(i, 28, 470));
const RAIL_OUT_VISUAL = OUTER_Y.map((_, i) => railOut(i, 600, 1112));
const RAIL_OUT_TRAVEL = OUTER_Y.map((_, i) => railOut(i, 650, 1000));

/* ── Mobile stage: the same diagram stood on its end ──
   A real vertical funnel — four rails carry the logos down into the card,
   and a single centre rail streams the results back out. The outputs get
   one shared rail on purpose: the pills are ~150px wide, so any fan wide
   enough to separate them would not fit a phone. */
const M_W = 360;
const M_H = 760;
const M_BOX = { x: 30, y: 300, w: 300, h: 160 };
/** Where the logo rails start, spread across the top. */
const M_OUTER_X = [46, 142, 218, 314];
/** Where they meet the card — clustered, so it reads as a funnel. */
const M_INNER_X = [150, 170, 190, 210];
const M_CENTER = 180;

const mRailIn = (i: number, from: number, to: number) => {
  const xo = M_OUTER_X[i];
  const xi = M_INNER_X[i];
  return `M${xo} ${from}L${xo} 160C${xo} 220 ${xi} 250 ${xi} 310L${xi} ${to}`;
};

const M_RAIL_IN_VISUAL = M_OUTER_X.map((_, i) => mRailIn(i, 40, 360));
const M_RAIL_IN_TRAVEL = M_OUTER_X.map((_, i) => mRailIn(i, 76, 340));
const M_RAIL_OUT_VISUAL = `M${M_CENTER} 430L${M_CENTER} 700`;
const M_RAIL_OUT_TRAVEL = `M${M_CENTER} 450L${M_CENTER} 688`;

/* ── Content ── */
const SOURCES: ReadonlyArray<{ file: string; label: string }> = [
  { file: "mercadolibre", label: "Mercado Libre" },
  { file: "tiendanube", label: "Tiendanube" },
  { file: "instagram", label: "Instagram" },
  { file: "facebook", label: "Facebook" },
  { file: "meta", label: "Meta" },
  { file: "google-ads", label: "Google Ads" },
  { file: "tiktok", label: "TikTok" },
];

/* Untitled UI icons (MIT) — 24×24, stroked, so they inherit currentColor
   and stay crisp at any scale. */
const ICON_PATHS: Record<string, ReadonlyArray<string>> = {
  announcement: [
    "M22 8v3.9999m-11.75-6.5H6.8c-1.6802 0-2.5202 0-3.162.327a3 3 0 0 0-1.311 1.311C2 7.7797 2 8.6198 2 10.3v1.2c0 .9319 0 1.3978.1522 1.7654.203.49.5924.8794 1.0824 1.0824C3.6022 14.5 4.0681 14.5 5 14.5v4.25c0 .2322 0 .3483.0096.446a2 2 0 0 0 1.7944 1.7944C6.9017 21 7.0178 21 7.25 21s.3483 0 .446-.0096a2 2 0 0 0 1.7944-1.7944c.0096-.0977.0096-.2138.0096-.446V14.5h.75c1.7664 0 3.9272.9469 5.5943 1.8557.9725.5301 1.4588.7952 1.7773.7562.2953-.0362.5186-.1688.6917-.4108.1867-.2609.1867-.7831.1867-1.8274V5.1262c0-1.0443 0-1.5664-.1867-1.8274-.1731-.242-.3964-.3746-.6917-.4108-.3185-.039-.8048.2261-1.7773.7563-1.6671.9087-3.8279 1.8556-5.5943 1.8556",
  ],
  image: [
    "M16.2 21H6.9314c-.6059 0-.9088 0-1.049-.1198a.5.5 0 0 1-.1738-.4194c.0145-.1839.2287-.3981.657-.8265l8.503-8.5029c.396-.396.5941-.5941.8224-.6682a1 1 0 0 1 .618 0c.2283.0741.4264.2722.8224.6682L21 15v1.2M16.2 21c1.6802 0 2.5202 0 3.162-.327a3 3 0 0 0 1.311-1.311C21 18.7202 21 17.8802 21 16.2M16.2 21H7.8c-1.6802 0-2.5202 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.7202 3 17.8802 3 16.2V7.8c0-1.6802 0-2.5202.327-3.162a3 3 0 0 1 1.311-1.311C5.2798 3 6.1198 3 7.8 3h8.4c1.6802 0 2.5202 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.2798 21 6.1198 21 7.8v8.4M10.5 8.5c0 1.1046-.8954 2-2 2s-2-.8954-2-2 .8954-2 2-2 2 .8954 2 2",
  ],
  play: [
    "M12 22c5.5228 0 10-4.4772 10-10S17.5228 2 12 2 2 6.4772 2 12s4.4772 10 10 10",
    "M9.5 8.9653c0-.4772 0-.7159.0997-.8491a.5.5 0 0 1 .3647-.1991c.166-.0118.3667.1172.7682.3753l4.7206 3.0347c.3484.2239.5226.3359.5827.4783a.5.5 0 0 1 0 .3892c-.0601.1424-.2343.2544-.5827.4783l-4.7206 3.0347c-.4015.2581-.6022.3872-.7682.3753a.5.5 0 0 1-.3647-.1991C9.5 15.7506 9.5 15.512 9.5 15.0347z",
  ],
  target: [
    "M16 8V5l3-3 1 2 2 1-3 3zm0 0-4 3.9999M22 12c0 5.5228-4.4772 10-10 10S2 17.5228 2 12 6.4772 2 12 2m5 10c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5",
  ],
};

const OUTPUTS: ReadonlyArray<{ label: string; icon: keyof typeof ICON_PATHS }> = [
  { label: "Campañas en Meta", icon: "announcement" },
  { label: "Posts para feed", icon: "image" },
  { label: "Videos UGC", icon: "play" },
  { label: "Ads profesionales", icon: "target" },
];

const IN_DURATION = 13;
const OUT_DURATION = 13;

/* ── Pieces shared by the desktop stage and the mobile stack ── */

function LogoBubble({ file, label, size = 48 }: { file: string; label: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[0_6px_18px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md backdrop-saturate-150"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logos/${file}.svg`}
        alt={label}
        className="object-contain"
        style={{ width: size * 0.52, height: size * 0.52 }}
      />
    </span>
  );
}

function OutputPill({ label, icon }: { label: string; icon: keyof typeof ICON_PATHS }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white/85 px-4 py-2 text-[13px] font-semibold text-[#0D1522]/85 shadow-[0_6px_18px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl backdrop-saturate-150">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[15px] w-[15px] shrink-0 text-[#1881F1]"
        aria-hidden="true"
      >
        {ICON_PATHS[icon].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      {label}
    </span>
  );
}

/** The white glass card — no border, octopus behind it. */
function CoreCard({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[28px] bg-white/55 px-8 py-8 text-center shadow-[0_10px_44px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl backdrop-saturate-150 ${className}`}
      style={style}
    >
      <h3 className="font-heading text-[22px] font-semibold leading-tight tracking-tight text-[#0D1522]">
        Postty genera Posts, Ads, historias,
      </h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#0D1522]/55">
        todo con el estilo de tu marca
      </p>
    </div>
  );
}

function Mascot({ size }: { size: number }) {
  return (
    <div className="mascot-float pointer-events-none" style={{ width: size, height: size }}>
      <Image src="/mascot.png" alt="" width={size} height={size} className="drop-shadow-xl" />
    </div>
  );
}

/**
 * Scales a fixed-size stage down to whatever width its container gets.
 * `offset-path: path()` resolves against the containing block in raw
 * pixels, so the stage has to keep its authored size and shrink with a
 * transform instead of reflowing. The observed node is a zero-height
 * sizer: the wrapper's own height depends on `scale`, so observing it
 * would feed its resize back into the observer.
 */
function useStageScale(designWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const next = Math.min(1, entry.contentRect.width / designWidth);
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  return { ref, scale };
}

/** Soft blue gradients for the rails, in both orientations. */
function RailGradients({ vertical = false }: { vertical?: boolean }) {
  const dir = vertical ? { x1: "0", y1: "0", x2: "0", y2: "1" } : { x1: "0", y1: "0", x2: "1", y2: "0" };
  const suffix = vertical ? "-v" : "";
  return (
    <defs>
      <linearGradient id={`rail-in${suffix}`} {...dir}>
        <stop offset="0%" stopColor="#49D3F8" stopOpacity="0" />
        <stop offset="30%" stopColor="#49D3F8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#1881F1" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id={`rail-out${suffix}`} {...dir}>
        <stop offset="0%" stopColor="#1881F1" stopOpacity="0.5" />
        <stop offset="70%" stopColor="#49D3F8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#49D3F8" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/** A rail: the hairline plus the dotted flow on top of it. */
function Rail({ d, gradient, delay }: { d: string; gradient: string; delay: number }) {
  return (
    <g>
      <path d={d} stroke={`url(#${gradient})`} strokeWidth="1.4" />
      {/* Zero-length dashes + round caps = perfect dots. */}
      <path
        className="rail-dash"
        d={d}
        stroke={`url(#${gradient})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray="0.1 92"
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  );
}

/* ── Section ── */

export default function HowItWorksFlow() {
  const { ref: deskSizer, scale: deskScale } = useStageScale(STAGE_W);
  const { ref: mobSizer, scale: mobScale } = useStageScale(M_W);

  return (
    <section id="como-funciona" className="px-4 py-16 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
      >
        Cómo funciona
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-3 max-w-md text-center text-base text-[#0D1522]/55 sm:text-lg"
      >
        Tres pasos, de tu URL a campañas activas.
      </motion.p>

      {/* ── Desktop: the full horizontal diagram ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto mt-1 hidden w-full max-w-[1120px] lg:block"
        style={{ height: STAGE_H * deskScale }}
      >
        <div ref={deskSizer} className="absolute inset-x-0 top-0 h-0" aria-hidden="true" />
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${deskScale})` }}
        >
          {/* Rails */}
          <svg
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            className="absolute inset-0 h-full w-full"
            fill="none"
            aria-hidden="true"
          >
            <RailGradients />
            {RAIL_IN_VISUAL.map((d, i) => (
              <Rail key={`in-${i}`} d={d} gradient="rail-in" delay={i * 0.5} />
            ))}
            {RAIL_OUT_VISUAL.map((d, i) => (
              <Rail key={`out-${i}`} d={d} gradient="rail-out" delay={i * 0.5 + 0.25} />
            ))}
          </svg>

          {/* Step labels — parked in the clear band between the middle
              rails, vertically centred on the card. */}
          <div
            className="absolute flex items-center"
            style={{ left: 30, top: 200, width: 312, height: 40 }}
          >
            <p className="whitespace-nowrap font-heading text-[15px] font-semibold tracking-tight text-[#0D1522]/75">
              Conectás Postty con tu tienda y redes
            </p>
          </div>
          <div
            className="absolute flex items-center justify-end"
            style={{ left: 778, top: 200, width: 312, height: 40 }}
          >
            <p className="whitespace-nowrap font-heading text-[15px] font-semibold tracking-tight text-[#0D1522]/75">
              Postty optimiza tus redes y campañas
            </p>
          </div>

          {/* Incoming logos — 7 logos cycling across 4 rails, evenly spaced
              in time via negative delays so the stage is already full on
              first paint. */}
          {SOURCES.map((source, i) => {
            const rail = i % RAIL_IN_TRAVEL.length;
            return (
              <div
                key={source.file}
                className="flow-chip"
                style={
                  {
                    "--path": `path("${RAIL_IN_TRAVEL[rail]}")`,
                    "--dur": `${IN_DURATION}s`,
                    "--delay": `-${((i * IN_DURATION) / SOURCES.length).toFixed(2)}s`,
                    "--rest": `${12 + i * 11}%`,
                    "--fx": "4px",
                    "--fy": `${OUTER_Y[rail] - 24}px`,
                  } as React.CSSProperties
                }
              >
                <LogoBubble file={source.file} label={source.label} />
              </div>
            );
          })}

          {/* Outgoing results — spawn behind the card and slide out. */}
          {OUTPUTS.map((output, i) => (
            <div
              key={output.label}
              className="flow-chip"
              style={
                {
                  "--path": `path("${RAIL_OUT_TRAVEL[i]}")`,
                  "--dur": `${OUT_DURATION}s`,
                  "--delay": `-${((i * OUT_DURATION) / OUTPUTS.length).toFixed(2)}s`,
                  "--rest": `${45 + i * 12}%`,
                  "--fx": "880px",
                  "--fy": `${OUTER_Y[i] - 17}px`,
                } as React.CSSProperties
              }
            >
              <OutputPill label={output.label} icon={output.icon} />
            </div>
          ))}

          {/* Octopus — behind the card, peeking over the top edge, exactly
              like the pricing cards. */}
          <div className="absolute z-[5]" style={{ left: BOX.x + BOX.w / 2 - 65, top: BOX.y - 58 }}>
            <Mascot size={130} />
          </div>

          {/* Card */}
          <CoreCard
            className="absolute z-10"
            style={{ left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h }}
          />
        </div>
      </motion.div>

      {/* ── Mobile / tablet: the same diagram as a vertical funnel ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto mt-6 w-full max-w-[360px] lg:hidden"
        style={{ height: M_H * mobScale }}
      >
        <div ref={mobSizer} className="absolute inset-x-0 top-0 h-0" aria-hidden="true" />
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: M_W, height: M_H, transform: `scale(${mobScale})` }}
        >
          <svg
            viewBox={`0 0 ${M_W} ${M_H}`}
            className="absolute inset-0 h-full w-full"
            fill="none"
            aria-hidden="true"
          >
            <RailGradients vertical />
            {M_RAIL_IN_VISUAL.map((d, i) => (
              <Rail key={`m-in-${i}`} d={d} gradient="rail-in-v" delay={i * 0.5} />
            ))}
            <Rail d={M_RAIL_OUT_VISUAL} gradient="rail-out-v" delay={0.25} />
          </svg>

          {/* Step label — only the opening one on mobile. The closing
              "Postty optimiza tus redes y campañas" line is desktop-only:
              at this width it landed on the fold and read as clutter. */}
          <div className="absolute inset-x-0 top-0 text-center">
            <p className="font-heading text-[15px] font-semibold tracking-tight text-[#0D1522]/75">
              Conectás Postty con tu tienda y redes
            </p>
          </div>

          {/* Logos funnelling down into the card */}
          {SOURCES.map((source, i) => {
            const rail = i % M_RAIL_IN_TRAVEL.length;
            return (
              <div
                key={source.file}
                className="flow-chip"
                style={
                  {
                    "--path": `path("${M_RAIL_IN_TRAVEL[rail]}")`,
                    "--dur": `${IN_DURATION}s`,
                    "--delay": `-${((i * IN_DURATION) / SOURCES.length).toFixed(2)}s`,
                    "--rest": `${12 + i * 11}%`,
                    "--fx": `${M_OUTER_X[rail] - 24}px`,
                    "--fy": "52px",
                  } as React.CSSProperties
                }
              >
                <LogoBubble file={source.file} label={source.label} />
              </div>
            );
          })}

          {/* Results streaming out the bottom, single file down one rail —
              four pills, evenly spaced in time, so they never overlap. */}
          {OUTPUTS.map((output, i) => (
            <div
              key={output.label}
              className="flow-chip"
              style={
                {
                  "--path": `path("${M_RAIL_OUT_TRAVEL}")`,
                  "--dur": `${OUT_DURATION}s`,
                  "--delay": `-${((i * OUT_DURATION) / OUTPUTS.length).toFixed(2)}s`,
                  "--rest": `${18 + i * 22}%`,
                  "--fx": "105px",
                  "--fy": `${500 + i * 52}px`,
                } as React.CSSProperties
              }
            >
              <OutputPill label={output.label} icon={output.icon} />
            </div>
          ))}

          {/* Octopus behind the card */}
          <div className="absolute z-[5]" style={{ left: M_CENTER - 58, top: M_BOX.y - 52 }}>
            <Mascot size={116} />
          </div>

          <CoreCard
            className="absolute z-10"
            style={{ left: M_BOX.x, top: M_BOX.y, width: M_BOX.w, height: M_BOX.h }}
          />
        </div>
      </motion.div>
    </section>
  );
}
