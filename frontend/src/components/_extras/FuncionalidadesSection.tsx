"use client";
import { motion } from "framer-motion";

const funcionalidades = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="dna-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#022BB0"/><stop offset="1" stopColor="#1881F1"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#dna-g)" opacity="0.15"/>
        <path d="M10 8c3 2 6 2 9 0M10 12c3 2 6 2 9 0M10 16c3 2 6 2 9 0M10 20c3 2 6 2 9 0M10 24c3 2 6 2 9 0" stroke="url(#dna-g)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="10" cy="8" r="2" fill="#022BB0"/><circle cx="19" cy="8" r="2" fill="#1881F1"/>
        <circle cx="10" cy="16" r="2" fill="#022BB0"/><circle cx="19" cy="16" r="2" fill="#1881F1"/>
        <circle cx="10" cy="24" r="2" fill="#022BB0"/><circle cx="19" cy="24" r="2" fill="#1881F1"/>
      </svg>
    ),
    title: "Genera contenido con tu ADN de marca",
    desc: "Extrae tu estilo, colores y tono de tu Instagram. Cada ad parece hecho por tu equipo.",
    color: "#022BB0",
    gradient: "from-[#022BB0]/10 to-[#1881F1]/5",
    borderColor: "border-[#022BB0]/15",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="search-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1881F1"/><stop offset="1" stopColor="#49D3F8"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#search-g)" opacity="0.15"/>
        <circle cx="14" cy="14" r="6" stroke="url(#search-g)" strokeWidth="2.5"/>
        <path d="M19 19l5 5" stroke="#1881F1" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="2.5" fill="#49D3F8" opacity="0.5"/>
      </svg>
    ),
    title: "Investiga tu mercado por vos",
    desc: "Analiza competidores, define tu audiencia y estudia qué ads funcionan en tu categoría.",
    color: "#1881F1",
    gradient: "from-[#1881F1]/10 to-[#49D3F8]/5",
    borderColor: "border-[#1881F1]/15",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="rocket-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#49D3F8"/><stop offset="1" stopColor="#1881F1"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#rocket-g)" opacity="0.15"/>
        <path d="M16 6c-2 4-3 8-3 12h6c0-4-1-8-3-12z" fill="url(#rocket-g)"/>
        <path d="M13 18l-2 4h10l-2-4" fill="#1881F1" opacity="0.6"/>
        <circle cx="16" cy="14" r="2" fill="white" opacity="0.8"/>
        <path d="M14 22l2 4 2-4" fill="#49D3F8"/>
      </svg>
    ),
    title: "Crea y publica la campaña completa",
    desc: "10 ads en los formatos que mejor venden. Carousels, videos, fotos. Directo a Meta Ads.",
    color: "#49D3F8",
    gradient: "from-[#49D3F8]/10 to-[#D6F951]/5",
    borderColor: "border-[#49D3F8]/20",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="chart-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D6F951"/><stop offset="1" stopColor="#8DB800"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#chart-g)" opacity="0.15"/>
        <rect x="7" y="18" width="4" height="8" rx="1.5" fill="#D6F951"/>
        <rect x="14" y="12" width="4" height="14" rx="1.5" fill="#8DB800"/>
        <rect x="21" y="8" width="4" height="18" rx="1.5" fill="url(#chart-g)"/>
        <path d="M9 16l5-5 4 2 5-6" stroke="#8DB800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="7" r="2" fill="#D6F951"/>
      </svg>
    ),
    title: "Optimiza solo, vos descansás",
    desc: "Sabe qué vende y qué no. Ajusta la campaña. Te avisa y sugiere la próxima.",
    color: "#8DB800",
    gradient: "from-[#D6F951]/15 to-[#8DB800]/5",
    borderColor: "border-[#8DB800]/20",
  },
];

export default function FuncionalidadesSection() {
  return (
    <section id="funcionalidades" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-heading text-3xl font-black sm:text-4xl md:text-5xl">
            De la foto a las ventas.{" "}
            <span className="bg-gradient-to-r from-[#022BB0] via-[#1881F1] to-[#49D3F8] bg-clip-text text-transparent">
              Sin escalas.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#0D1522]/55">
            Postty maneja el ciclo completo de marketing para que vos te enfoques en tu negocio.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {funcionalidades.map((feat, i) => (
            <motion.article
              key={feat.title}
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{
                y: -6,
                boxShadow: `0 20px 40px -12px ${feat.color}22, 0 8px 20px -8px rgba(0,0,0,0.08)`,
                transition: { duration: 0.3 },
              }}
              className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${feat.gradient} ${feat.borderColor} p-8 transition-all duration-300`}
              style={{ perspective: "800px" }}
            >
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${feat.color}18, ${feat.color}08)`,
                  boxShadow: `0 4px 12px ${feat.color}15`,
                }}
              >
                {feat.icon}
              </div>

              <h3
                className="font-heading text-xl font-black sm:text-2xl"
                style={{ color: feat.color }}
              >
                {feat.title}
              </h3>
              <p className="mt-3 leading-relaxed text-[#0D1522]/60">
                {feat.desc}
              </p>

              <div
                className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-2xl transition-all duration-500 group-hover:opacity-[0.12] group-hover:blur-3xl"
                style={{ background: feat.color }}
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
