/**
 * StackingCards — REFERENCE / TEMPLATE
 *
 * Extracted from the original hero section. Not currently rendered anywhere,
 * kept here as a template for the scroll-driven card-stacking animation so
 * the same effect can be reused for other sections.
 *
 * How the effect works:
 * - The outer <section> is 220vh tall and holds a sticky child.
 * - The sticky child stays pinned for the length of the section, so you
 *   scroll "inside" it and `scrollYProgress` goes from 0 → 1 across the
 *   whole container.
 * - Card 1 sits in place, then scales down + shifts up when progress is in
 *   the 0.3 → 0.55 range (the "outgoing" card).
 * - Card 2 starts 700px below, fades in at progress 0.3 → 0.45, and slides
 *   up to y=14 at progress 0.3 → 0.65 (the "incoming" card that stacks on top).
 *
 * Dependencies: `useRef`, `useScroll`, `useTransform`, `motion` from
 * framer-motion + `Image` from next/image. Bring those back into page.tsx
 * (or this file) when re-activating.
 *
 * To reuse for other card pairs:
 * 1. Duplicate this component, rename it.
 * 2. Adjust the content inside Card 1 / Card 2 (headline, gradient bg,
 *    accent shapes, image).
 * 3. Keep the transforms (card1Scale/Y, card2Y/Opacity) or tweak the input
 *    ranges to change when each card starts/ends its animation.
 * 4. Render <YourStackingCards /> from page.tsx where you need it.
 */

"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function StackingCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const card1Scale = useTransform(scrollYProgress, [0.3, 0.55], [1, 0.82]);
  const card1Y = useTransform(scrollYProgress, [0.3, 0.55], [0, -50]);
  const card2Y = useTransform(scrollYProgress, [0.3, 0.65], [700, 14]);
  const card2Opacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);

  return (
    <section ref={containerRef} style={{ height: "220vh" }} className="relative mt-24 md:mt-0">
      <div className="sticky top-0 flex h-screen items-center px-4 sm:px-6 md:px-10">
        <div className="relative mx-auto w-full max-w-6xl">
          {/* Card 1 */}
          <motion.div
            style={{ scale: card1Scale, y: card1Y }}
            className="relative z-10 overflow-hidden rounded-[2rem]"
          >
            <div
              className="relative flex min-h-[420px] flex-col justify-center overflow-hidden p-10 text-white sm:min-h-[480px] md:flex-row md:items-center md:p-14 lg:p-16"
              style={{ background: "linear-gradient(135deg, #004aad, #1881f1)" }}
            >
              {/* Lime accent — aligned with "5 minutos" text, cut by bottom edge */}
              <div
                className="absolute -bottom-[50px] h-20 w-[290px] rounded-[3rem] sm:h-24 sm:w-[330px] md:w-[360px]"
                style={{ background: "linear-gradient(135deg, #8eff00, #d2ff64)", left: "calc(2.5rem + 70px)" }}
              />

              <div className="relative z-10 flex-1 md:max-w-[65%]">
                <h3 className="font-heading text-[2.7rem] font-black leading-[1.05] sm:text-[3.1rem] md:text-[3.6rem]">
                  ¿Cansad@ de gastar horas y horas creando contenido para tu marca?
                </h3>
                <div className="mt-[100px]">
                  <p className="text-sm font-medium" style={{ background: "linear-gradient(135deg, #8eff00, #d2ff64)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>20 Ads y una campaña creada desde 0 en tan sólo</p>
                  <p className="font-heading mt-2 text-[3.8rem] font-black leading-none md:text-[4.5rem]" style={{ background: "linear-gradient(135deg, #8eff00, #d2ff64)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>5 minutos</p>
                </div>
              </div>

              {/* 3D Clock image */}
              <div className="relative mt-8 flex shrink-0 items-center justify-end md:mt-0 md:-mr-36 md:w-[400px]">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="/stat-clock.png"
                    alt="Clock"
                    width={380}
                    height={380}
                    className="drop-shadow-[0_20px_40px_rgba(0,74,173,0.4)]"
                  />
                </motion.div>
                {[
                  { top: "0%", right: "5%", size: 7, color: "#D6F951", delay: 0 },
                  { top: "15%", right: "-5%", size: 5, color: "#fff", delay: 0.5 },
                  { top: "-5%", right: "25%", size: 6, color: "#49D3F8", delay: 1 },
                  { top: "75%", right: "-3%", size: 4, color: "#D6F951", delay: 0.8 },
                  { top: "82%", right: "15%", size: 5, color: "#fff", delay: 0.3 },
                  { top: "5%", right: "42%", size: 4, color: "#fff", delay: 1.2 },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2 + p.delay, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                    className="absolute rounded-full"
                    style={{ top: p.top, right: p.right, width: p.size, height: p.size, background: p.color }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 2 — stacks on top, offset so card 1 top edge peeks */}
          <motion.div
            style={{ y: card2Y, opacity: card2Opacity }}
            className="absolute inset-x-0 top-0 z-20 overflow-hidden rounded-[2rem]"
          >
            <div
              className="relative flex min-h-[270px] flex-col justify-center overflow-hidden p-8 pl-6 sm:min-h-[310px] md:flex-row md:items-center md:p-12 md:pl-8 lg:p-14 lg:pl-10"
              style={{ background: "linear-gradient(135deg, #1f79ff, #aefff8)" }}
            >
              {/* Lime accent — same style as card 1 */}
              <div
                className="absolute -bottom-[50px] h-20 w-[440px] rounded-[3rem] sm:h-24 sm:w-[480px] md:w-[510px]"
                style={{ background: "linear-gradient(135deg, #8eff00, #d2ff64)", left: "calc(2.5rem + 50px)" }}
              />

              <div className="relative z-10 flex-1 md:max-w-[65%]">
                <h3 className="font-heading text-[2.7rem] font-black leading-[1.05] text-white sm:text-[3.1rem] md:text-[3.6rem]">
                  ¿Cansad@ de no saber<br />que Ad convierte?
                </h3>
                <div className="mt-[100px]">
                  <p className="text-sm font-medium" style={{ background: "linear-gradient(135deg, #8eff00, #d2ff64)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Postty mide tus metricas y optimiza tus campañas</p>
                  <p className="font-heading mt-2 text-[3.2rem] font-black leading-none md:text-[3.8rem]" style={{ background: "linear-gradient(135deg, #8eff00, #d2ff64)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Automaticamente</p>
                </div>
              </div>

              {/* Piggy bank image */}
              <div className="relative mt-8 flex shrink-0 items-center justify-end md:mt-0 md:-mr-[150px] md:w-[400px]">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="/stat-pig.png"
                    alt="Piggy bank"
                    width={380}
                    height={380}
                    className="drop-shadow-[0_20px_40px_rgba(65,179,236,0.4)]"
                  />
                </motion.div>
                {[
                  { top: "0%", right: "8%", size: 7, color: "#1ea9ee", delay: 0 },
                  { top: "15%", right: "-3%", size: 5, color: "#fff", delay: 0.5 },
                  { top: "-5%", right: "28%", size: 6, color: "#b3efff", delay: 1 },
                  { top: "78%", right: "-3%", size: 4, color: "#1ea9ee", delay: 0.8 },
                  { top: "85%", right: "15%", size: 5, color: "#fff", delay: 0.3 },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2 + p.delay, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                    className="absolute rounded-full"
                    style={{ top: p.top, right: p.right, width: p.size, height: p.size, background: p.color }}
                  />
                ))}
              </div>

              {/* Sparkle top right */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-8 top-6 text-lg text-white/70"
              >
                ✦
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
