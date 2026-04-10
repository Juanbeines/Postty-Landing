"use client";

/**
 * ProblemCardsStack — Scroll-linked stacking problem cards (Canva + Agencia)
 *
 * Archived from src/app/page.tsx on 2026-04-10. Removed from the live landing
 * page so the hero goes directly into the "Qué hace Postty" section.
 *
 * To restore:
 * 1. Import `ProblemCardsStack` in page.tsx
 * 2. Render `<ProblemCardsStack />` between the Hero and WhatPosttyDoesSection
 *
 * Assets required in frontend/public/:
 *   /card-canva.png, /card-1-mobile.png, /card-2.png, /card-2-mobile.png
 *
 * Two problem cards stacked with scroll-linked animation:
 * - The section is 200vh tall with a sticky inner that pins for the whole scroll.
 * - Card 1 (Canva) sits in place, then scales down at 0.3→0.55.
 * - Card 2 (agencia) starts below, slides up at 0.3→0.65 and fades in at 0.3→0.45,
 *   landing on top so card 1 is fully covered.
 *
 * Uses a manual scroll tracker rather than framer's useScroll-with-target since
 * that hook was silently failing to track in this layout (sticky child + inline
 * height style).
 */

import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export function ProblemCardsStack() {
  const containerRef = useRef<HTMLElement>(null);
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        scrollYProgress.set(0);
        return;
      }
      const raw = -rect.top / scrollable;
      scrollYProgress.set(Math.max(0, Math.min(1, raw)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollYProgress]);

  const card1Scale = useTransform(scrollYProgress, [0.3, 0.55], [1, 0.92]);
  const card2Y = useTransform(scrollYProgress, [0.3, 0.65], [700, 0]);
  const card2Opacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="-mt-12 md:-mt-24"
      style={{ height: "200vh" }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center px-0 sm:px-6 md:px-3">
        <div className="relative w-full max-w-[1800px] md:translate-x-10">
          {/* Card 1 (Canva) */}
          <motion.div
            style={{ scale: card1Scale }}
            className="relative z-10 aspect-[2/3] overflow-hidden rounded-[2rem] md:aspect-[16/9]"
          >
            <Image
              src="/card-1-mobile.png"
              alt="Cansado de gastar mil horas en Canva haciendo contenido para tu marca"
              fill
              sizes="100vw"
              className="object-cover md:hidden"
              priority
            />
            <Image
              src="/card-canva.png"
              alt="Cansado de gastar mil horas en Canva haciendo contenido para tu marca"
              fill
              sizes="(max-width: 1800px) 100vw, 1800px"
              className="hidden object-cover md:block"
              priority
            />
            <div className="absolute inset-0 hidden flex-col items-center justify-center gap-6 px-6 text-center sm:gap-8 md:flex md:gap-10">
              <div className="h-[22px] shrink-0" aria-hidden="true" />
              <h3 className="font-heading max-w-3xl translate-y-[5px] text-lg font-bold leading-[1.2] tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                ¿Cansado de gastar mil horas en Canva
                <br className="hidden sm:block" />
                {" "}haciendo contenido para tu marca?
              </h3>
              <svg
                width="44"
                height="22"
                viewBox="0 0 48 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="translate-y-5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
              >
                <path d="M4 4l20 16L44 4" />
              </svg>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            style={{ y: card2Y, opacity: card2Opacity }}
            className="absolute inset-0 z-20 overflow-hidden rounded-[2rem]"
          >
            <Image
              src="/card-2-mobile.png"
              alt="Seguís pagando una agencia de marketing que no te da resultados"
              fill
              sizes="100vw"
              className="object-cover md:hidden"
              priority
            />
            <Image
              src="/card-2.png"
              alt="Seguís pagando una agencia de marketing que no te da resultados"
              fill
              sizes="(max-width: 1800px) 100vw, 1800px"
              className="hidden object-cover md:block"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
