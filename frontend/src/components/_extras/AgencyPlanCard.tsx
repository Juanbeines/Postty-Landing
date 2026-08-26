"use client";

/**
 * The "Agencia" pricing card, pulled out of `page.tsx` when the landing
 * repositioned onto e-commerce (ICP change, 2026-08). Parked here rather
 * than deleted so it can be dropped back in when the agency plan is real.
 *
 * Two reasons it came out:
 *  1. The page now targets e-commerce that already bill well, and a
 *     "Personalizado / Agendar reunión" card pulls that audience into a
 *     sales conversation instead of self-serve checkout.
 *  2. The backend plan it advertises does not exist yet. See
 *     `Postty-Prod/backend/entitlements.py` — the "agency" plan is
 *     scaffolding that inherits Pro entitlements literally; multi-cliente,
 *     team seats and white-label all sit behind feature flags defaulting to
 *     false. So "Hasta 5 marcas" and "Hasta 10 usuarios en tu equipo" below
 *     are not deliverable as written. Fix that before restoring the card.
 *
 * Self-contained per the `_extras` convention: owns its feature list and the
 * Calendly URL. Restoring is an import + a JSX tag inside the pricing grid,
 * plus widening that grid back to `lg:grid-cols-4` and re-adding "agency" to
 * the `hoveredCard` union in `PricingSection`.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/pixel";

const AGENCY_CALENDLY = "https://calendly.com/soporte-posttyai/30min";

const agencyFeatures = [
  "Hasta 5 marcas",
  "Hasta 10 usuarios en tu equipo",
  "Ads e imágenes de Contenido ilimitadas",
  "Personalización absoluta",
  "Edits infinitos por imagen",
  "Modelos Pro de IA",
];

type Props = {
  /** The card currently hovered in the pricing grid — drives the mascot. */
  activeCard: string;
  setHoveredCard: (card: "agency" | null) => void;
};

export function AgencyPlanCard({ activeCard, setHoveredCard }: Props) {
  return (
    <div
      className="relative lg:mt-14"
      onMouseEnter={() => setHoveredCard("agency")}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <motion.div
        animate={{ y: activeCard === "agency" ? 0 : 50, opacity: activeCard === "agency" ? 1 : 0 }}
        initial={false}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="pointer-events-none absolute left-1/2 top-0 z-0 -translate-x-1/2"
        style={{ width: 120, height: 120, marginTop: -55 }}
      >
        <Image src="/mascot.png" alt="Postty mascot" width={120} height={120} className="drop-shadow-xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 rounded-3xl border border-white/70 bg-white/55 p-[1.53rem] shadow-[0_4px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
      >
        <h3 className="font-heading text-[2rem] font-medium text-[#0D1522]">Agencia</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-[1.75rem] font-semibold tracking-tight text-[#0D1522]">Personalizado</span>
        </div>

        <p className="mt-3 text-[0.78rem] leading-relaxed text-[#0D1522]/65">
          Sos una agencia o tenés un equipo manejando varias marcas
        </p>

        <a
          href={AGENCY_CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("Lead", {
            content_name: "agency_meeting",
            content_category: "agency",
          })}
          className="mt-6 block w-full rounded-full bg-[#0D1522]/[0.06] py-[0.66rem] text-center text-[0.78rem] font-semibold text-[#0D1522] transition hover:bg-[#0D1522]/[0.10]"
        >
          Agendar reunión
        </a>

        <div className="mt-6 rounded-2xl border border-white/60 bg-white/40 p-[0.94rem] backdrop-blur-md">
          {agencyFeatures.map((feat, i) => (
            <div
              key={feat}
              className={`flex items-center justify-between py-[0.6rem] ${
                i < agencyFeatures.length - 1 ? "border-b border-[#0D1522]/[0.06]" : ""
              }`}
            >
              <span className="text-[0.78rem] font-medium text-[#0D1522]/75">{feat}</span>
              <div className="flex h-[1.15rem] w-[1.15rem] items-center justify-center rounded-full bg-[#D6F951]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
