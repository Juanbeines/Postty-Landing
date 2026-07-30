/**
 * DEPRECATED — "Plataformas soportadas" as a 4-card grid.
 *
 * Archived 2026-07-30 in favor of the app carousel at
 * src/components/AppsCarousel.tsx (same `#plataformas` anchor, same
 * OAuth copy, same per-platform "Disponible hoy" / "Próximamente"
 * states — those exist for the Google Ads developer-token review, so
 * whatever replaces this must keep declaring them).
 *
 * Self-contained (data + logo helper included). Not imported anywhere.
 */

"use client";

import { motion } from "framer-motion";

const platformCards: ReadonlyArray<{
  name: string;
  logo: "meta" | "instagram" | "google-ads" | "tiktok";
  status: string;
  live: boolean;
  desc: string;
}> = [
  {
    name: "Meta",
    logo: "meta",
    status: "Disponible hoy",
    live: true,
    desc: "Publicá tus campañas en Facebook directamente desde Postty.",
  },
  {
    name: "Instagram",
    logo: "instagram",
    status: "Disponible hoy",
    live: true,
    desc: "Creá y publicá contenido y anuncios para Instagram.",
  },
  {
    name: "Google Ads",
    logo: "google-ads",
    status: "Próximamente",
    live: false,
    desc: "Campañas con imágenes y videos creados por inteligencia artificial.",
  },
  {
    name: "TikTok",
    logo: "tiktok",
    status: "Próximamente",
    live: false,
    desc: "Llegá a nuevas audiencias con contenido pensado para TikTok.",
  },
];

const LOGO_LABELS: Record<(typeof platformCards)[number]["logo"], string> = {
  meta: "Meta",
  instagram: "Instagram",
  "google-ads": "Google Ads",
  tiktok: "TikTok",
};

function PlatformLogo({ name }: { name: (typeof platformCards)[number]["logo"] }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${name}.svg`}
      alt={LOGO_LABELS[name]}
      width={36}
      height={36}
      className="h-9 w-9 object-contain"
    />
  );
}

export default function PlatformCardsSection() {
  return (
    <section id="plataformas" className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-[1100px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
        >
          Publicá en las plataformas más importantes
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-[#0D1522]/65 sm:text-base"
        >
          Postty se conecta con tus cuentas publicitarias de forma 100% segura.
          Vos mantenés el control total.
        </motion.p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:mt-14 lg:grid-cols-4">
          {platformCards.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center rounded-2xl border border-white/70 bg-white/45 px-6 py-8 text-center shadow-[0_4px_16px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_2px_10px_rgba(13,21,34,0.06)]">
                <PlatformLogo name={platform.logo} />
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold tracking-tight text-[#0D1522] sm:text-xl">
                {platform.name}
              </h3>
              <span
                className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  platform.live
                    ? "bg-[#0D1522] text-white"
                    : "border border-[#0D1522]/15 bg-white/40 text-[#0D1522]/60"
                }`}
              >
                {platform.status}
              </span>
              <p className="mt-3 text-xs leading-relaxed text-[#0D1522]/60 sm:text-sm">
                {platform.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
