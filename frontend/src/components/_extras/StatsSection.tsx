"use client";

/**
 * StatsSection — "IA entrenada para generar contenido que vende"
 *
 * Archived from src/app/page.tsx on 2026-04-09. Removed from the live landing
 * page per product decision but kept here so we can drop it back into page.tsx
 * if we ever want it again.
 *
 * To restore:
 * 1. Import `StatsSection` in page.tsx
 * 2. Render `<StatsSection />` where you want it (was originally between the
 *    "How it works" step mockups and the "Privacy" section)
 *
 * Self-contained: owns its own `stats` data, no external deps beyond
 * framer-motion. Tailwind classes are matched to the rest of the landing.
 */

import { motion } from "framer-motion";

const stats = [
  { value: "+300", label: "negocios generando contenido solos", color: "#022BB0" },
  { value: "5 min", label: "desde que subís tu foto hasta generar una campaña", color: "#49D3F8" },
  { value: "0", label: "experiencia en marketing requerida", color: "#D6F951" },
];

export function StatsSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-heading text-3xl font-black sm:text-4xl">
            IA entrenada para generar contenido que vende
          </h2>
          <p className="mt-3 text-[#0D1522]/60">
            Esto no es solo IA. Es inteligencia de contenido.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="rounded-2xl bg-[#F5F7FA] p-5 text-center"
            >
              <p className="font-heading text-4xl font-black" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-[#0D1522]/60">{stat.label}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
