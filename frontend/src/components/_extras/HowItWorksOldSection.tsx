/**
 * DEPRECATED — Old "Cómo funciona" section.
 *
 * Archived 2026-05-11 in favor of the icon-based design (3D step icons +
 * glass pills) defined inline in src/app/page.tsx.
 *
 * Kept here as a complete, self-contained component (with its three animated
 * StepMockup helpers and the steps[] data) so it can be revived if needed
 * without re-deriving anything. Not imported anywhere by default.
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "1",
    title: "Agregás el link de tu tienda o subís una foto de tu producto",
    desc: "Sin preparación previa, Postty escanea todo por vos.",
  },
  {
    num: "2",
    title: "Postty genera tus Ads profesionales",
    desc: "Nuestro agente de IA crea posts, historias, publicidad y carruseles listos en 1 minuto.",
  },
  {
    num: "3",
    title: "Postty publica y optimiza los resultados",
    desc: "Tu contenido se publica automáticamente y Postty mejora los resultados con cada iteración.",
  },
];

function StepMockup1() {
  const url = "www.mitienda.com/productos";
  const [charCount, setCharCount] = useState(0);
  const [sent, setSent] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const delay = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setCharCount(i);
        if (i >= url.length) {
          clearInterval(interval);
          setTimeout(() => setSent(true), 400);
        }
      }, 70);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(delay);
  }, [inView]);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#F5F7FA] p-5">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full max-w-[220px]"
      >
        <p className="mb-2 text-center text-[9px] font-bold text-[#0D1522]/40">Pegá el link de tu tienda</p>
        <div className="flex items-center gap-2 rounded-full border border-[#E0E4EA] bg-white px-3 py-2 shadow-md">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1881F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span className="flex-1 truncate text-[11px] font-medium text-[#0D1522]/70">
            {url.slice(0, charCount)}
            {charCount < url.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block h-3 w-[1px] align-middle bg-[#1881F1]"
              />
            )}
          </span>
          <motion.button
            animate={charCount >= url.length ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`flex h-6 w-6 items-center justify-center rounded-full ${charCount >= url.length ? "bg-[#1881F1]" : "bg-[#E0E4EA]"} transition-colors`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </motion.button>
        </div>
      </motion.div>

      {sent && (
        <motion.div
          initial={{ y: 10, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: 1, ease: "linear" }}
            className="h-4 w-4 rounded-full border-2 border-[#1881F1] border-t-transparent"
          />
          <span className="text-[9px] font-bold text-[#0D1522]/60">Escaneando tu tienda...</span>
        </motion.div>
      )}

      {sent && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.5 }}
          className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[8px] font-bold text-[#1881F1] shadow-md"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          12 productos encontrados
        </motion.div>
      )}
    </div>
  );
}

function StepMockup2() {
  const cards = [
    { label: "Post Instagram", color: "from-[#1881F1] to-[#49D3F8]" },
    { label: "Historia", color: "from-[#022BB0] to-[#1881F1]" },
    { label: "Publicidad", color: "from-[#49D3F8] to-[#D6F951]" },
  ];
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-[#F5F7FA] p-5">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ y: 40, opacity: 0, rotate: idx === 0 ? -4 : idx === 2 ? 4 : 0 }}
          whileInView={{ y: 0, opacity: 1, rotate: idx === 0 ? -4 : idx === 2 ? 4 : 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 + idx * 0.2 }}
          className="absolute w-[120px] rounded-xl border border-white/80 bg-white p-2.5 shadow-lg"
          style={{
            left: `calc(50% - 60px + ${(idx - 1) * 30}px)`,
            top: `calc(50% - 60px + ${idx === 1 ? -10 : 5}px)`,
            zIndex: idx === 1 ? 10 : 5,
          }}
        >
          <div className={`h-16 rounded-lg bg-gradient-to-br ${card.color} opacity-80`} />
          <div className="mt-2 h-1.5 w-3/4 rounded-full bg-[#E0E4EA]" />
          <div className="mt-1 h-1.5 w-1/2 rounded-full bg-[#E0E4EA]" />
          <p className="mt-2 text-[7px] font-bold text-[#0D1522]/50">{card.label}</p>
        </motion.div>
      ))}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.1 }}
        className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[8px] font-bold text-[#49D3F8] shadow-md"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        3 piezas listas
      </motion.div>
    </div>
  );
}

function StepMockup3() {
  const platforms = [
    { name: "IG", color: "#E4405F" },
    { name: "Fb", color: "#1877F2" },
    { name: "TT", color: "#0D1522" },
    { name: "YT", color: "#FF0000" },
  ];
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#F5F7FA] p-5">
      <div className="flex gap-3">
        {platforms.map((p, idx) => (
          <motion.div
            key={p.name}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 + idx * 0.15 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md"
          >
            <span className="text-[10px] font-black" style={{ color: p.color }}>{p.name}</span>
          </motion.div>
        ))}
      </div>
      {/* Mini chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="mt-4 flex items-end gap-1.5"
      >
        {[28, 42, 36, 55, 48, 64, 58].map((h, idx) => (
          <motion.div
            key={idx}
            initial={{ height: 0 }}
            whileInView={{ height: h }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1 + idx * 0.08 }}
            className="w-3.5 rounded-sm bg-gradient-to-t from-[#1881F1] to-[#49D3F8]"
          />
        ))}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.6 }}
        className="mt-2 text-[8px] font-bold text-[#0D1522]/40"
      >
        Rendimiento optimizándose...
      </motion.p>
    </div>
  );
}

const stepMockups = [StepMockup1, StepMockup2, StepMockup3];

export default function HowItWorksOldSection() {
  return (
    <section id="como-funciona" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-black sm:text-4xl"
        >
          Cómo funciona Postty
        </motion.h2>

        <div className="mx-auto mt-20 max-w-4xl">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="flex gap-8 md:gap-12"
            >
              {/* Left column: continuous line + numbers */}
              <div className="relative flex w-16 shrink-0 flex-col items-center sm:w-20">
                {/* Top line segment (hidden for first step) */}
                {i > 0 && (
                  <div className="absolute left-1/2 top-0 h-8 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#49D3F8] to-[#1881F1]" />
                )}

                {/* Number */}
                <div className="relative z-10 mt-8 bg-white py-2">
                  <span className="font-heading text-5xl font-black leading-none tracking-tight text-[#0D1522] sm:text-6xl">
                    {step.num}
                  </span>
                </div>

                {/* Bottom line segment */}
                <div
                  className={`w-[3px] flex-1 rounded-full bg-gradient-to-b ${
                    i === 0
                      ? "from-[#022BB0] to-[#1881F1]"
                      : i === 1
                        ? "from-[#1881F1] to-[#49D3F8]"
                        : "from-[#49D3F8] to-[#D6F951]"
                  }`}
                />
              </div>

              {/* Right column: text + visual */}
              <div className="flex flex-1 flex-col gap-8 pb-20 pt-8 md:flex-row md:items-start md:gap-12 md:pb-24">
                {/* Text */}
                <div className="flex-1 md:max-w-sm md:pt-2">
                  <h3 className="font-heading text-2xl font-black leading-tight sm:text-3xl">{step.title}</h3>
                  <p className="mt-3 text-[#0D1522]/55 leading-relaxed">{step.desc}</p>
                </div>

                {/* Visual mockup */}
                <div className="h-52 w-full md:h-56 md:w-[380px] md:shrink-0">
                  {(() => { const Mockup = stepMockups[i]; return <Mockup />; })()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
