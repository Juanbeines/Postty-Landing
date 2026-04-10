"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const avatars = [
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=57",
  "https://i.pravatar.cc/80?img=47",
  "https://i.pravatar.cc/80?img=68",
];

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

const businessTypes = [
  { name: "Agencias", emoji: "🏢", top: "8%", left: "4%", rotate: -6 },
  { name: "Productos digitales", emoji: "🖥️", top: "2%", left: "30%", rotate: 4 },
  { name: "Fitness", emoji: "💪", top: "4%", left: "62%", rotate: -2 },
  { name: "Servicios", emoji: "💼", top: "14%", left: "80%", rotate: 5 },
  { name: "SaaS", emoji: "🚀", top: "72%", left: "2%", rotate: -4 },
  { name: "Gastronomía", emoji: "🍽️", top: "76%", left: "28%", rotate: -3 },
  { name: "E-commerce", emoji: "🛍️", top: "74%", left: "56%", rotate: 3 },
  { name: "Apps móviles", emoji: "📱", top: "70%", left: "80%", rotate: -5 },
];

const faqItems = [
  {
    q: "¿Qué es Postty?",
    a: "Postty es tu herramienta todo-en-uno para crear contenido. Genera posts, historias y publicidad que se ven y suenan como si los hubiera hecho tu propio equipo. Sin templates genéricos. Contenido perfecto para tu marca, listo para publicar.",
  },
  {
    q: "¿En qué se diferencia Postty de otras herramientas de IA?",
    a: "Postty fue construido para dueños de negocio reales, no para marketers expertos. Aprende tu estilo, entiende a tus clientes y genera contenido que convierte. No necesitás saber nada de marketing ni diseño.",
  },
  {
    q: "¿Necesito saber de marketing o diseño para usarlo?",
    a: "No. Postty fue hecho para personas que quieren resultados rápidos, no una curva de aprendizaje. Subís una foto y listo.",
  },
  {
    q: "¿Qué tipo de contenido puede generar Postty?",
    a: "Todo lo que necesitás para crecer: posts para feed, historias, publicidad pagada, carruseles y más. Siempre alineado con el estilo de tu marca.",
  },
  {
    q: "¿Puedo manejar múltiples marcas en una cuenta?",
    a: "Sí. Podés gestionar hasta 4 marcas en una sola cuenta de Postty. Cada una con su propio estilo, espacio de trabajo y configuración.",
  },
  {
    q: "¿Tienen prueba gratuita?",
    a: "Sí. Postty te genera 4 ads gratis para que pruebes la herramienta sin compromiso. Después de esa prueba, podés elegir un plan y seguir creando tus campañas.",
  },
  {
    q: "¿Es adecuado para mi tipo de negocio?",
    a: "Sí. Postty funciona para cualquier negocio. Es especialmente efectivo para marcas con productos físicos que quieren crear contenido de calidad de forma rápida y consistente.",
  },
  {
    q: "¿Puedo editar mis Ads generados?",
    a: "Sí. Cada Ad que genera Postty se puede editar. En el plan Basic tenés 1 edit por Ad para ajustar lo que necesites. En el plan Pro, los edits son ilimitados: podés modificar tus Ads todas las veces que quieras hasta que queden perfectos.",
  },
];

/* ── Subcomponents ── */

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


/**
 * Starts playing the video once it scrolls into view, and then loops
 * infinitely. Muted + playsInline so mobile browsers allow autoplay.
 */
function ScrollTriggeredVideo({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || started) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setStarted(true);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [started]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
    />
  );
}

type CaptionStyle = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

type BrandTestimonial = {
  name: string;
  subtitle: string;
  image: string;
  stat1: { value: string; suffix?: string; label: readonly [string, string] };
  stat2: { value: string; suffix?: string; label: readonly [string, string] };
};

const brandTestimonials: ReadonlyArray<BrandTestimonial> = [
  {
    name: "StarConcept",
    subtitle: "Marca de ropa",
    image: "/starconcept.png",
    stat1: {
      value: "4.2x",
      suffix: "roas",
      label: ["Más conversión de Ads", "en las campañas de meta"],
    },
    stat2: {
      value: "0",
      label: ["Agencias de", "marketing"],
    },
  },
  {
    name: "Nüa Skinhouse",
    subtitle: "Estética profesional",
    image: "/nua.jpg",
    stat1: {
      value: "+40",
      label: ["Horas mensuales", "ahorradas en Canva"],
    },
    stat2: {
      value: "0",
      label: ["Diseñadores", "contratados"],
    },
  },
];

const whatPosttyDoesItems: ReadonlyArray<{
  title: readonly [string, string];
  video: string;
  caption: readonly [string, string];
  widthClass: string;
  captionStyle: CaptionStyle;
}> = [
  {
    title: ["Contenido para", "Instagram y Facebook"],
    video: "/videos/feed.mp4",
    caption: ["Para que te olvides de", "Canva para siempre"],
    widthClass: "max-w-[280px]",
    // Glass caption sits at the BOTTOM tip of the LEFT side of the phone,
    // bumped up 20px from the very bottom.
    captionStyle: { bottom: "calc(6% + 80px)", left: "-16px" },
  },
  {
    title: ["Campañas en Meta", "con Ads profesionales"],
    video: "/videos/campagin.mp4",
    caption: ["Para que no gastes dinero en", "Agencias de marketing"],
    widthClass: "max-w-[280px]",
    // Glass caption sits at the TOP of the RIGHT side of the phone.
    captionStyle: { top: "8%", right: "-24px" },
  },
  {
    title: ["Photoshoot", "para tu tienda virtual"],
    video: "/videos/product.mp4",
    caption: ["Para que no gastes dinero en", "fotografía y edición"],
    widthClass: "max-w-[290px]",
    // Glass caption sits VERY LOW on the LEFT, almost at the phone's edge.
    captionStyle: { bottom: "1%", left: "-20px" },
  },
];

function WhatPosttyDoesSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 md:px-10 md:py-28">
      <h2 className="font-heading text-center text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
        Qué hace Postty
      </h2>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-16 md:mt-20 md:grid-cols-3 md:gap-10">
        {whatPosttyDoesItems.map((item) => (
          <div key={item.title.join(" ")} className="flex flex-col items-center">
            {/* Title */}
            <h3 className="font-heading text-center text-lg font-bold leading-tight sm:text-xl">
              {item.title[0]}
              <br />
              {item.title[1]}
            </h3>

            {/* Video container — relative host for the floating glass caption.
                outer has overflow-visible so the pill can poke off the edges. */}
            <div className={`relative mt-8 aspect-[9/16] w-full ${item.widthClass}`}>
              {/* Video wrapper — overflow-hidden here so rounded corners clip */}
              <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                <ScrollTriggeredVideo
                  src={item.video}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Glass caption — floating pill over the video, random-ish
                  position on the sides. Matches the header's glass pill.
                  Position is set via inline style so calc() + negative offsets
                  work reliably across Tailwind JIT + Turbopack. */}
              <div
                style={item.captionStyle}
                className="absolute z-10 max-w-[80%] rounded-2xl bg-white/15 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-xl backdrop-saturate-150"
              >
                <p className="whitespace-nowrap text-center text-[13px] font-semibold leading-snug text-[#0D1522]">
                  {item.caption[0]}
                  <br />
                  {item.caption[1]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  const [hoveredCard, setHoveredCard] = useState<"basic" | "pro" | null>("pro");

  const basicFeatures = [
    "Hasta 1 marca",
    "Máximo de 3 campañas",
    "Hasta 60 Ads generados",
    "1 Edit por Ad",
  ];

  const proFeatures = [
    "Hasta 4 marcas",
    "Campañas ilimitadas",
    "Ads infinitos",
    "Acceso a mejores modelos de IA",
    "Edits ilimitados por Ad",
  ];

  const activeCard = hoveredCard ?? "pro";

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-black sm:text-4xl md:text-5xl"
        >
          Precios simples
        </motion.h2>

        <div className="relative mt-16 grid items-start gap-8 sm:grid-cols-2">
          {/* Basic Card */}
          <div
            className="relative self-start"
            onMouseEnter={() => setHoveredCard("basic")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Mascot for Basic — hides/shows vertically */}
            <motion.div
              animate={{ y: activeCard === "basic" ? 0 : 50, opacity: activeCard === "basic" ? 1 : 0 }}
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
              transition={{ duration: 0.5 }}
              className="relative z-10 rounded-3xl bg-white p-8 shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
            >
            <h3
              className="font-heading text-center text-5xl font-black sm:text-6xl"
              style={{
                background: "linear-gradient(135deg, #1881F1, #49D3F8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Basic
            </h3>

            <div className="mt-4 flex items-baseline justify-center gap-2">
              <span className="text-xs font-semibold text-[#0D1522]/40">ARS</span>
              <span className="font-heading text-4xl font-black text-[#0D1522]">$39,999</span>
              <span className="text-sm font-medium text-[#0D1522]/50">x mes</span>
            </div>

            <div className="mt-8 rounded-2xl bg-[#F8F9FB] p-5">
              {basicFeatures.map((feat, i) => (
                <div
                  key={feat}
                  className={`flex items-center justify-between py-3.5 ${
                    i < basicFeatures.length - 1 ? "border-b border-[#0D1522]/[0.06]" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-[#0D1522]/70">{feat}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D6F951]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                </div>
              ))}
            </div>

            <a href="https://app.posttyai.com" className="mt-8 block w-full rounded-full border border-[#0D1522]/[0.07] bg-[#F5F7FA] py-3.5 text-center text-sm font-bold text-[#0D1522] transition hover:bg-[#ECEEF2]">
              Empezar ahora
            </a>
            </motion.div>
          </div>

          {/* Pro Card */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredCard("pro")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Mascot for Pro — hides/shows vertically */}
            <motion.div
              animate={{ y: activeCard === "pro" ? 0 : 50, opacity: activeCard === "pro" ? 1 : 0 }}
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
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 overflow-hidden rounded-3xl p-8 text-white"
              style={{ background: "linear-gradient(160deg, #1881F1, #49D3F8)" }}
            >
            <h3
              className="font-heading text-center text-5xl font-black sm:text-6xl"
              style={{
                background: "linear-gradient(135deg, #b5ff00, #eeff64)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pro
            </h3>

            <div className="mt-4 flex items-baseline justify-center gap-2">
              <span className="text-xs font-semibold text-white/50">ARS</span>
              <span className="font-heading text-4xl font-black text-white">$84,999</span>
              <span className="text-sm font-medium text-white/60">x mes</span>
            </div>

            <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              {proFeatures.map((feat, i) => (
                <div
                  key={feat}
                  className={`flex items-center justify-between py-3.5 ${
                    i < proFeatures.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-white/90">{feat}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D6F951]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://app.posttyai.com"
              className="mt-8 block w-full rounded-full py-3.5 text-center text-sm font-bold text-[#0D1522] transition hover:shadow-lg hover:brightness-105"
              style={{ background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
            >
              Convertirme en Pro
            </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessTypesSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);
  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  return (
    <section className="px-4 py-28" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="relative mx-auto max-w-5xl">
        <div className="relative mx-auto min-h-[200px] md:min-h-[420px]">
          {businessTypes.map((biz, i) => (
            <RepelPill key={biz.name} biz={biz} i={i} mousePos={mousePos} />
          ))}

          <div className="pointer-events-none relative z-10 flex min-h-[200px] items-center justify-center md:min-h-[420px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-center text-4xl font-black leading-tight sm:text-5xl md:text-6xl"
            >
              Funciona para cualquier
              <br />
              tipo de negocio
            </motion.h2>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2 md:hidden">
            {businessTypes.map((biz, i) => (
              <motion.div
                key={biz.name}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              >
                <span className="text-base">{biz.emoji}</span>
                <span className="text-sm font-semibold text-[#0D1522]/70">{biz.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RepelPill({ biz, i, mousePos }: { biz: typeof businessTypes[0]; i: number; mousePos: { x: number; y: number } }) {
  const pillRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (!pillRef.current || mousePos.x === 0 && mousePos.y === 0) return;
    const rect = pillRef.current.getBoundingClientRect();
    const pillCenterX = rect.left + rect.width / 2;
    const pillCenterY = rect.top + rect.height / 2;
    const dx = pillCenterX - mousePos.x;
    const dy = pillCenterY - mousePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 180;

    if (dist < radius) {
      const force = (1 - dist / radius) * 45;
      const angle = Math.atan2(dy, dx);
      x.set(Math.cos(angle) * force);
      y.set(Math.sin(angle) * force);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [mousePos, x, y]);

  return (
    <motion.div
      ref={pillRef}
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      className="absolute hidden md:flex"
      style={{ top: biz.top, left: biz.left, x: springX, y: springY }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
        className="cursor-default"
      >
        <div
          className="flex items-center gap-2.5 rounded-2xl bg-white px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]"
          style={{ transform: `rotate(${biz.rotate}deg)` }}
        >
          <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]">{biz.emoji}</span>
          <span className="text-sm font-semibold text-[#0D1522]/70">{biz.name}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FAQItem({ item }: { item: (typeof faqItems)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0D1522]/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-heading flex w-full items-center justify-between py-5 text-left text-base font-semibold text-[#0D1522] sm:text-lg"
      >
        {item.q}
        <span className="ml-4 shrink-0 text-xl text-[#1881F1]">{open ? "−" : "+"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[#0D1522]/65">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegalModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#0D1522]/10 bg-white px-6 py-4">
              <h2 className="font-heading text-lg font-black text-[#0D1522]">{title}</h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#0D1522]/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: "calc(85vh - 65px)" }}>
              <div className="prose prose-sm max-w-none text-[#0D1522]/80 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-[#0D1522] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#0D1522] [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-[#0D1522] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_p]:mb-3 [&_a]:text-[#1881F1] [&_a]:underline">
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [legalModal, setLegalModal] = useState<"tyc" | "privacy" | null>(null);
  const [showHeroCTA, setShowHeroCTA] = useState(false);
  const [showHeroPopups, setShowHeroPopups] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    let upLock = false;

    const handler = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY <= 10) {
        setScrolled(false);
      } else if (delta > 2) {
        setScrolled(true);
      } else if (delta < -4 && !upLock) {
        setScrolled(false);
        upLock = true;
        setTimeout(() => { upLock = false; }, 120);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0D1522] md:min-h-0">
      <div className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
        {/* Layer 1: Pill (visible when not scrolled) */}
        <motion.header
          animate={{
            opacity: scrolled ? 0 : 1,
            scale: scrolled ? 0.95 : 1,
            y: scrolled ? -8 : 0,
            filter: scrolled ? "blur(6px)" : "blur(0px)",
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className={`mx-auto flex w-fit items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl backdrop-saturate-150 ${
            scrolled ? "pointer-events-none" : ""
          }`}
        >
          <a href="#" className="font-heading text-lg font-extrabold tracking-[-0.08em] text-[#0D1522]">
            Postty
          </a>
          <nav className="hidden items-center gap-5 text-sm text-[#0D1522]/70 md:flex">
            <a href="#como-funciona" className="whitespace-nowrap transition hover:text-[#0D1522]">Cómo funciona</a>
            <a href="#testimonios" className="whitespace-nowrap transition hover:text-[#0D1522]">Clientes</a>
            <a href="#faq" className="whitespace-nowrap transition hover:text-[#0D1522]">FAQ</a>
          </nav>
          <a href="https://app.posttyai.com" className="shrink-0 rounded-full bg-white/15 px-5 py-2 text-sm font-bold text-[#0D1522] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:bg-white/25">
            Iniciar sesión
          </a>
        </motion.header>

        {/* Layer 2: Split — mascot left, CTA right (visible on scroll) */}
        <motion.div
          animate={{
            opacity: scrolled ? 1 : 0,
            filter: scrolled ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6 ${
            scrolled ? "" : "pointer-events-none"
          }`}
        >
          <motion.a
            animate={{
              x: scrolled ? 0 : 120,
              scale: scrolled ? 1 : 0.7,
            }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            href="#"
            className="flex h-12 items-center justify-center px-2"
          >
            <span className="font-heading text-base font-extrabold tracking-[-0.08em] text-[#0D1522]">Postty</span>
          </motion.a>
          <motion.a
            animate={{
              x: scrolled ? 0 : -120,
              scale: scrolled ? 1 : 0.7,
            }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            href="https://app.posttyai.com"
            className="btn-outline-gradient rounded-full bg-white/80 px-5 py-2.5 text-sm font-bold shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-xl"
          >
            Iniciar sesión
          </motion.a>
        </motion.div>
      </div>

      <main className="flex-1 md:flex-initial">
      {/* ── Hero ── */}
      <section className="relative h-screen overflow-hidden bg-black">
        {isMobile !== null && (
          <video
            key={isMobile ? "mobile" : "desktop"}
            src={isMobile ? "/hero-mobile.mp4" : "/hero.mp4"}
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              if (video.currentTime >= 11 && !showHeroCTA) {
                setShowHeroCTA(true);
              }
              // Desktop: show notification popups in the last 2 seconds
              if (
                !isMobile &&
                video.duration &&
                video.currentTime >= video.duration - 2 &&
                !showHeroPopups
              ) {
                setShowHeroPopups(true);
              }
              // On mobile, pause 0.5s before the natural end so the final
              // text frame stays visible (otherwise it fades out).
              if (
                isMobile &&
                video.duration &&
                video.currentTime >= video.duration - 0.5
              ) {
                video.pause();
              }
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* ── Hero notification popups — desktop only.
            Glass pills with circular avatar + quoted pain point.
            Triggered by video time (last 2 seconds), staggered, then stay static. ── */}
        {/* ── Hero notification popups — desktop only.
            Outer div = absolute position + mouse parallax via CSS vars.
            Inner motion.div = entrance animation + glass styling.
            María above the title, Juan top-right. ── */}
        <AnimatePresence>
          {showHeroPopups && !isMobile && (
            <>
              {/* Sofía — above the title, left side */}
              <div
                className="pointer-events-none absolute z-20 hidden md:block"
                style={{ left: "calc(5% + 20px)", top: "calc(28% + 40px)" }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl backdrop-saturate-150"
                >
                  <Image
                    src="https://i.pravatar.cc/80?img=47"
                    alt="Sofía"
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Sofía, 27 años</p>
                    <p className="text-[11px] text-white/80">&ldquo;Cansada de gastar mil horas en Canva&rdquo;</p>
                  </div>
                </motion.div>
              </div>

              {/* Juan — top-right */}
              <div
                className="pointer-events-none absolute right-[5%] top-[22%] z-20 hidden md:block"
              >
                <motion.div
                  initial={{ opacity: 0, x: 30, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl backdrop-saturate-150"
                >
                  <Image
                    src="https://i.pravatar.cc/80?img=12"
                    alt="Juan"
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Juan, 32 años</p>
                    <p className="text-[11px] text-white/80">&ldquo;Cansado de pagar agencias de marketing que no rinden&rdquo;</p>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHeroCTA && (
            <motion.div
              initial={{ y: 40, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="pointer-events-none absolute inset-x-0 bottom-[22%] flex justify-center md:bottom-[36%]"
            >
              <motion.a
                href="https://app.posttyai.com"
                className="group pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-white/15 px-10 py-[18px] text-lg font-black text-[#0D1522] shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[6px]"
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 340, damping: 22 }}
              >
                Empezar gratis
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 ease-out group-hover:translate-x-[2px]"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Problem cards removed — archived in src/components/_extras/ProblemCardsStack.tsx */}

      {/* ── Qué hace Postty ── */}
      <WhatPosttyDoesSection />

      {/* ── Brands testimonial (StarConcept + Nüa Skinhouse) ──
          Two cards side-by-side, each with a plush hero image + 3 glass
          pills (brand name top-left, stat 1 bottom-left, stat 2 bottom-right).
          id="testimonios" so the header "Clientes" link anchors here. */}
      <section id="testimonios" className="px-4 py-20 sm:px-6 sm:py-28 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="font-heading text-center text-2xl font-black leading-[1.2] tracking-tight sm:text-3xl md:text-4xl"
          >
            Los dueños suben contenido 10x más rápido
            <br className="hidden sm:block" />
            {" "}y su dinero invertido en Ads rinde 3x más con Postty
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 gap-8 md:mt-20 md:grid-cols-2 md:gap-10">
            {brandTestimonials.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative aspect-[5/4] overflow-hidden rounded-[2rem]"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
                  const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
                  e.currentTarget.style.setProperty("--cx", `${nx * 4}px`);
                  e.currentTarget.style.setProperty("--cy", `${ny * 3}px`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty("--cx", "0px");
                  e.currentTarget.style.setProperty("--cy", "0px");
                }}
              >
                {/* Plush hero image — fills the entire card, rounded via parent overflow-hidden */}
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />

                {/* Brand name — glass pill, top-left + parallax */}
                <div
                  className="absolute left-6 top-6 z-10 rounded-2xl bg-white/15 px-5 py-3 shadow-[0_8px_32px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150"
                  style={{ transform: "translate(var(--cx, 0px), var(--cy, 0px))", transition: "transform 0.3s ease-out" }}
                >
                  <p className="font-heading text-base font-bold leading-tight text-[#0D1522] sm:text-lg">
                    {brand.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#0D1522]/60 sm:text-sm">
                    {brand.subtitle}
                  </p>
                </div>

                {/* Stat 1 — glass pill, bottom-left + parallax (opposite direction) */}
                <div
                  className="absolute bottom-6 left-6 z-10 rounded-2xl bg-white/15 px-5 py-3 shadow-[0_8px_32px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150"
                  style={{ transform: "translate(calc(var(--cx, 0px) * -0.8), calc(var(--cy, 0px) * -0.6))", transition: "transform 0.3s ease-out" }}
                >
                  <p className="font-heading flex items-end text-4xl font-black leading-none tracking-tight text-[#0D1522] sm:text-5xl">
                    {brand.stat1.value}
                    {brand.stat1.suffix && (
                      <span className="font-heading ml-1.5 text-xs font-bold tracking-normal text-[#0D1522]/60 sm:text-sm">
                        {brand.stat1.suffix}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-[11px] leading-snug text-[#0D1522]/70 sm:text-xs">
                    {brand.stat1.label[0]}
                    <br />
                    {brand.stat1.label[1]}
                  </p>
                </div>

                {/* Stat 2 — glass pill, bottom-right + parallax (different direction) */}
                <div
                  className="absolute bottom-6 right-6 z-10 rounded-2xl bg-white/15 px-5 py-3 shadow-[0_8px_32px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150"
                  style={{ transform: "translate(calc(var(--cx, 0px) * 0.6), calc(var(--cy, 0px) * -1))", transition: "transform 0.3s ease-out" }}
                >
                  <p className="font-heading text-4xl font-black leading-none tracking-tight text-[#0D1522] sm:text-5xl">
                    {brand.stat2.value}
                  </p>
                  <p className="mt-2 text-[11px] leading-snug text-[#0D1522]/70 sm:text-xs">
                    {brand.stat2.label[0]}
                    <br />
                    {brand.stat2.label[1]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
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


      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── Funcionalidades ── */}
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

      {/* ── Business types ── */}
      <BusinessTypesSection />

      {/* ── Content calendar ── */}
      <section className="px-4 py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
          {/* Left column: text */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-semibold text-[#0D1522]/40">Ads y contenido ilimitados</p>
            <h2 className="font-heading mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              Llená tu calendario de contenido.
              <br />
              <span className="bg-gradient-to-r from-[#022BB0] via-[#1881F1] to-[#49D3F8] bg-clip-text text-transparent">3 meses de anticipación.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[#0D1522]/60 leading-relaxed md:mx-0">
              Vos descansás. Postty no. Trabaja en segundo plano generando contenido
              mientras dormís. Así a la mañana revisás, elegís y publicás antes del
              mediodía.
            </p>
          </div>

          {/* Right column: iPhone — mismo tamaño y aspecto en mobile y web */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-[250px] min-w-[250px] shrink-0"
            style={{ perspective: "1200px" }}
          >
            <div
              className="relative w-[250px]"
              style={{ transform: "rotateY(-10deg) rotateX(4deg)" }}
            >
              {/* iPhone frame */}
              <div className="rounded-[2.4rem] border-[2.5px] border-[#1C1C1E] bg-[#1C1C1E] p-[2px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]" style={{ aspectRatio: "9 / 19.5" }}>
                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-[8px] z-20 h-[14px] w-[56px] -translate-x-1/2 rounded-full bg-[#1C1C1E]" />
                {/* Screen */}
                <div className="relative flex h-full flex-col overflow-hidden rounded-[2.2rem] bg-white">
                  {/* Status bar */}
                  <div className="flex shrink-0 items-center justify-between px-5 pb-1 pt-8">
                    <span className="text-[9px] font-semibold text-[#0D1522]">9:41</span>
                    <div className="flex items-center gap-1 opacity-60">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#0D1522"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                      <svg width="12" height="10" viewBox="0 0 24 16" fill="#0D1522"><rect x="0" y="2" width="20" height="12" rx="2" ry="2" stroke="#0D1522" strokeWidth="1.5" fill="none"/><rect x="2" y="4" width="14" height="8" rx="1" fill="#0D1522"/><path d="M22 6v4a2 2 0 000-4z"/></svg>
                    </div>
                  </div>

                  {/* Calendar content */}
                  <div className="flex flex-1 flex-col justify-between gap-3 px-4 pb-5 pt-3">
                    {/* Próximo post */}
                    <div className="rounded-xl bg-[#F5F7FA] p-2.5">
                      <p className="text-[8px] font-bold text-[#0D1522]/40">Próximo post</p>
                      <div className="mt-1.5 flex gap-2">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-[#1881F1] to-[#49D3F8]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[9px] font-semibold text-[#0D1522]">Historia · Mañana 10:00</p>
                          <p className="truncate text-[7px] text-[#0D1522]/50">Listo para publicar</p>
                        </div>
                      </div>
                    </div>

                    {/* Calendar completo — 4 filas */}
                    <div>
                      <p className="text-[9px] font-bold text-[#0D1522]/35">Marzo 2026</p>
                      <div className="mt-1.5 grid grid-cols-7 gap-1 text-center text-[7px] font-medium text-[#0D1522]/25">
                        {["L","M","X","J","V","S","D"].map(d => <span key={d}>{d}</span>)}
                      </div>
                      <div className="mt-1 grid grid-cols-7 gap-1">
                        {Array.from({ length: 28 }, (_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.015, duration: 0.25 }}
                            className={`flex min-h-[28px] w-full items-center justify-center rounded-lg text-[8px] font-bold ${
                              i < 24
                                ? i % 4 === 0
                                  ? "bg-[#022BB0] text-white"
                                  : i % 4 === 1
                                    ? "bg-[#1881F1] text-white"
                                    : i % 4 === 2
                                      ? "bg-[#49D3F8] text-white"
                                      : "bg-[#D6F951] text-[#0D1522]"
                                : "bg-[#F5F7FA] text-[#0D1522]/30"
                            }`}
                          >
                            {i + 1}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Post con métricas */}
                    <div className="rounded-xl border border-[#E8ECF0] bg-white p-2.5">
                      <p className="text-[8px] font-bold text-[#0D1522]/40">Mejor post esta semana</p>
                      <div className="mt-1.5 flex gap-2">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg p-[2px]" style={{ background: "linear-gradient(135deg, #022BB0, #1881F1, #49D3F8, #D6F951)" }}>
                          <div className="relative h-full w-full overflow-hidden rounded-[6px] bg-white">
                            {/* Carrusel: 3 slides separados */}
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex flex-1 items-end justify-between px-1 pb-4">
                                <div className="h-[70%] w-[26%] shrink-0 rounded-md bg-gradient-to-br from-[#022BB0]/40 to-[#1881F1]/25" />
                                <div className="h-[75%] w-[28%] shrink-0 rounded-md bg-gradient-to-br from-[#1881F1]/50 to-[#49D3F8]/35 shadow-sm" />
                                <div className="h-[70%] w-[26%] shrink-0 rounded-md bg-gradient-to-br from-[#49D3F8]/40 to-[#D6F951]/25" />
                              </div>
                            {/* Indicadores de slide */}
                            <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
                              <span className="h-1 w-1 rounded-full bg-[#0D1522]/25" />
                              <span className="h-1 w-1 rounded-full bg-[#1881F1]" />
                              <span className="h-1 w-1 rounded-full bg-[#0D1522]/25" />
                            </div>
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-semibold text-[#0D1522]">Carrusel · 12 Mar</p>
                          <div className="mt-1.5 flex gap-3 text-[7px]">
                            <span className="font-bold text-[#8DB800]">4.2% CTR</span>
                            <span className="font-bold text-[#1881F1]">2.1k alcance</span>
                            <span className="font-bold text-[#49D3F8]">89 conv.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-xl bg-[#F5F7FA] p-2.5 text-center">
                        <p className="text-[10px] font-bold text-[#1881F1]">93 ads</p>
                        <p className="text-[6px] text-[#0D1522]/35">programados</p>
                      </div>
                      <div className="flex-1 rounded-xl bg-[#F5F7FA] p-2.5 text-center">
                        <p className="text-[10px] font-bold text-[#8DB800]">25 días</p>
                        <p className="text-[6px] text-[#0D1522]/35">cubiertos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflection */}
              <div className="absolute -bottom-6 left-1/2 h-12 w-[80%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#1881F1]/15 via-[#49D3F8]/10 to-[#D6F951]/8 blur-xl" />
            </div>
          </motion.div>
        </div>
      </section>


      {/* ── FAQ ── */}
      <section id="faq" className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-3xl font-black sm:text-4xl">Preguntas frecuentes</h2>
          <div className="mt-10">
            {faqItems.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="empezar" className="px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[#1881F1] to-[#022BB0] px-6 py-16 text-center text-white sm:px-12">
          <div className="relative mx-auto mb-6 w-[100px]">
            <div className="absolute bottom-0 left-1/2 h-3 w-20 -translate-x-1/2 rounded-[50%] bg-black/15 blur-md" />
            <Image src="/mascot.png" alt="Postty mascot" width={100} height={100} className="relative z-10 mx-auto drop-shadow-lg" />
          </div>
          <h2 className="font-heading text-3xl font-black sm:text-5xl">
            ¿Listo para no estresarte más con tus ventas online?
          </h2>
          <div className="mt-8">
            <a
              href="https://app.posttyai.com"
              className="inline-flex items-center gap-2 rounded-full bg-[#D6F951] px-8 py-4 text-base font-black text-[#0D1522] shadow-[0_4px_14px_rgba(214,249,81,0.4)] transition hover:shadow-[0_6px_20px_rgba(214,249,81,0.5)] hover:brightness-105"
            >
              Empezar gratis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      </main>

      {/* ── Footer ── */}
      <footer className="px-4 py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="font-heading text-xl font-extrabold tracking-[-0.08em] text-[#0D1522]">Postty</p>
            <p className="mt-2 text-sm text-[#0D1522]/50">soporte@posttyai.com</p>
          </div>
          <div className="flex flex-wrap gap-10 text-sm">
            <div>
              <p className="mb-2 font-bold text-[#0D1522]/40">Legal</p>
              <button onClick={() => setLegalModal("privacy")} className="block text-[#0D1522]/60 transition hover:text-[#0D1522]">Política de privacidad</button>
              <button onClick={() => setLegalModal("tyc")} className="mt-1 block text-[#0D1522]/60 transition hover:text-[#0D1522]">Términos de servicio</button>
            </div>
            <div>
              <p className="mb-2 font-bold text-[#0D1522]/40">Empresa</p>
              <a href="#como-funciona" className="block text-[#0D1522]/60 transition hover:text-[#0D1522]">Cómo funciona</a>
              <a href="#testimonios" className="mt-1 block text-[#0D1522]/60 transition hover:text-[#0D1522]">Testimonios</a>
            </div>
            <div>
              <p className="mb-2 font-bold text-[#0D1522]/40">Recursos</p>
              <a href="#faq" className="block text-[#0D1522]/60 transition hover:text-[#0D1522]">FAQ</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl pt-6 text-center text-xs text-[#0D1522]/40">
          © {new Date().getFullYear()} Postty. Todos los derechos reservados.
        </div>
      </footer>

      {/* ── Legal Modals ── */}
      <LegalModal open={legalModal === "privacy"} onClose={() => setLegalModal(null)} title="Política de Privacidad">
        <p className="text-xs text-[#0D1522]/50 mb-4">Última actualización: 13 de marzo de 2026</p>

        <h2>Responsable del tratamiento</h2>
        <p>Juan Martin Beines Furcada, con domicilio en Echeverria 1200, CP 1617, Buenos Aires, Argentina.</p>
        <p>Correo electrónico: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></p>

        <h2>Datos que recopilamos</h2>
        <ul>
          <li><strong>Autenticación:</strong> UID Firebase, email, nombre, foto (vía Google Sign-In)</li>
          <li><strong>Tienda:</strong> URL, productos, precios, imágenes (scraping automático)</li>
          <li><strong>Marca:</strong> Colores, tipografías, tono, logo (análisis de tu sitio)</li>
          <li><strong>Campañas:</strong> Borradores, conversaciones con IA, piezas generadas</li>
          <li><strong>Pagos:</strong> ID de suscripción, plan, estado (MercadoPago)</li>
          <li><strong>Uso:</strong> Contadores, feedback, calificaciones</li>
        </ul>

        <h2>Finalidad del tratamiento</h2>
        <ul>
          <li>Prestar el servicio de generación de campañas</li>
          <li>Gestionar tu cuenta y suscripción</li>
          <li>Aplicar límites según tu plan</li>
          <li>Mejorar el servicio y corregir errores</li>
          <li>Comunicar actualizaciones y soporte</li>
        </ul>

        <h2>Base legal</h2>
        <ul>
          <li><strong>Ejecución de contrato:</strong> para prestarte el servicio</li>
          <li><strong>Consentimiento:</strong> al registrarte y aceptar los TyC</li>
          <li><strong>Interés legítimo:</strong> para mejorar el servicio y prevenir fraude</li>
        </ul>

        <h2>Servicios de terceros</h2>
        <ul>
          <li><strong>Firebase (Google):</strong> Autenticación</li>
          <li><strong>Gemini (Google):</strong> IA conversacional y análisis</li>
          <li><strong>Nano Banana (Google):</strong> Generación de imágenes</li>
          <li><strong>MercadoPago:</strong> Pagos y suscripciones</li>
          <li><strong>Meta:</strong> Publicación de ads (opcional)</li>
        </ul>

        <h2>Almacenamiento y seguridad</h2>
        <ul>
          <li>Base de datos PostgreSQL con cifrado en tránsito</li>
          <li>Acceso restringido por roles</li>
          <li>No almacenamos datos de tarjetas (MercadoPago los gestiona)</li>
        </ul>

        <h2>Retención</h2>
        <ul>
          <li>Mientras tu cuenta esté activa</li>
          <li>30 días después de solicitar eliminación (para backup)</li>
          <li>Datos anonimizados pueden conservarse indefinidamente para análisis agregado</li>
        </ul>

        <h2>Transferencia internacional</h2>
        <p>Tus datos pueden procesarse en servidores de Google (EE.UU.) y otros países donde operan nuestros proveedores. Estos cumplen con estándares de protección adecuados.</p>

        <h2>Tus derechos (ARCO)</h2>
        <p>Tenés derecho a acceder, rectificar, suprimir y oponerte al tratamiento de tus datos.</p>

        <h3>Acceso</h3>
        <p>Podés solicitar qué datos personales tenemos sobre vos.</p>

        <h3>Rectificación</h3>
        <p>Podés pedir que corrijamos datos inexactos o incompletos.</p>

        <h3>Supresión (Cancelación)</h3>
        <p>Podés solicitar que eliminemos tus datos personales. Esto implica:</p>
        <ul>
          <li>Eliminación de tu cuenta</li>
          <li>Eliminación de campañas, borradores y piezas generadas</li>
          <li>Cancelación de suscripción activa (sin reembolso del período en curso)</li>
        </ul>
        <p>Excepciones: Podemos retener datos si existe obligación legal o para defensa en reclamos.</p>

        <h3>Oposición</h3>
        <p>Podés oponerte al tratamiento de tus datos para fines específicos (ej: comunicaciones de marketing).</p>

        <h3>Cómo ejercer tus derechos</h3>
        <ol>
          <li>Enviá un email a <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a> con asunto &quot;Solicitud ARCO&quot;</li>
          <li>Indicá: tu nombre, email de la cuenta, y qué derecho querés ejercer</li>
          <li>Te responderemos en un plazo máximo de 10 días hábiles</li>
          <li>Podemos pedirte verificación de identidad</li>
        </ol>

        <h2>Cambios</h2>
        <p>Notificaremos cambios por email o en la plataforma. El uso continuado implica aceptación.</p>

        <h2>Contacto</h2>
        <p>Correo electrónico: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></p>
        <p>Sitio web: <a href="https://posttyai.com">https://posttyai.com</a></p>

        <p className="mt-6 text-xs text-[#0D1522]/40">Autoridad de control: Si considerás que tus derechos no fueron respetados, podés reclamar ante la Agencia de Acceso a la Información Pública (AAIP) — <a href="https://www.argentina.gob.ar/aaip">https://www.argentina.gob.ar/aaip</a></p>
      </LegalModal>

      <LegalModal open={legalModal === "tyc"} onClose={() => setLegalModal(null)} title="Términos y Condiciones de Uso">
        <p className="text-xs text-[#0D1522]/50 mb-4">Última actualización: 13 de marzo de 2026</p>

        <h2>1. Introducción</h2>
        <p>Bienvenido/a a Postty (en adelante, &quot;la Plataforma&quot;, &quot;el Servicio&quot; o &quot;Postty&quot;), una plataforma de generación de campañas publicitarias para Meta (Facebook e Instagram) asistida por inteligencia artificial, operada por Juan Martin Beines Furcada (en adelante, &quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la Empresa&quot;), con domicilio en Echeverria 1200, CP 1617, Buenos Aires, Argentina.</p>
        <p>Al acceder, registrarse o utilizar Postty, usted (en adelante, &quot;el Usuario&quot;) acepta estos Términos y Condiciones (en adelante, &quot;los Términos&quot;). Si no está de acuerdo con alguna de estas condiciones, le solicitamos que no utilice el Servicio.</p>

        <h2>2. Descripción del Servicio</h2>
        <p>Postty es una herramienta de marketing digital que permite a emprendedores y dueños de tiendas online:</p>
        <ul>
          <li>Extraer productos de su tienda online (Shopify, Tiendanube y otras plataformas de e-commerce) mediante análisis automatizado de su sitio web.</li>
          <li>Analizar la identidad de marca (Brand DNA), incluyendo colores, tipografías, tono de comunicación e identidad visual, a partir de la URL de su tienda.</li>
          <li>Generar campañas publicitarias para Meta Ads mediante un agente conversacional impulsado por inteligencia artificial.</li>
          <li>Crear piezas publicitarias (imágenes estáticas, carruseles, creativos estilo UGC) utilizando generación de imágenes con IA.</li>
          <li>Editar y redimensionar las piezas publicitarias generadas.</li>
          <li>Subir campañas directamente a Meta Ads Manager (funcionalidad sujeta a disponibilidad y autorización previa).</li>
        </ul>

        <h2>3. Registro y Cuenta de Usuario</h2>
        <h3>3.1. Registro</h3>
        <p>Para utilizar Postty, el Usuario debe registrarse mediante su cuenta de Google a través de Firebase Authentication. Al registrarse, el Usuario autoriza a Postty a acceder a su nombre, dirección de correo electrónico y foto de perfil de Google.</p>
        <h3>3.2. Veracidad de la información</h3>
        <p>El Usuario garantiza que la información proporcionada durante el registro es verídica, completa y actualizada. Postty no se responsabiliza por información falsa o desactualizada provista por el Usuario.</p>
        <h3>3.3. Seguridad de la cuenta</h3>
        <p>El Usuario es responsable de mantener la seguridad de su cuenta de Google y de cualquier actividad que ocurra bajo su cuenta en Postty. En caso de acceso no autorizado, el Usuario deberá notificarlo de inmediato.</p>

        <h2>4. Planes y Suscripciones</h2>
        <h3>4.1. Plan Gratuito (Free / Trial)</h3>
        <p>Postty ofrece un plan gratuito con las siguientes limitaciones:</p>
        <ul>
          <li>1 marca (URL de tienda) vinculada a la cuenta.</li>
          <li>Hasta 4 piezas publicitarias generadas por prueba.</li>
          <li>Límites diarios en generación de Brand DNA, campañas y ediciones.</li>
          <li>La URL de la tienda utilizada en la prueba gratuita queda vinculada a la cuenta (&quot;brand lock&quot;).</li>
        </ul>
        <h3>4.2. Plan Básico</h3>
        <ul>
          <li>1 marca vinculada.</li>
          <li>Hasta 4 borradores de campañas guardados.</li>
          <li>Límites diarios ampliados en generación de campañas y ediciones.</li>
          <li>Precio: según lo indicado en la página de precios de la Plataforma (facturado mensualmente).</li>
        </ul>
        <h3>4.3. Plan Pro</h3>
        <ul>
          <li>Hasta 4 marcas vinculadas.</li>
          <li>Hasta 20 borradores de campañas guardados.</li>
          <li>Límites diarios significativamente mayores.</li>
          <li>Ediciones ilimitadas por pieza publicitaria.</li>
          <li>Precio: según lo indicado en la página de precios de la Plataforma (facturado mensualmente).</li>
        </ul>
        <h3>4.4. Facturación y Pagos</h3>
        <p>Los pagos se procesan a través de MercadoPago. Al suscribirse a un plan pago, el Usuario:</p>
        <ul>
          <li>Autoriza el cobro recurrente mensual a través de MercadoPago.</li>
          <li>Acepta los Términos y Condiciones de MercadoPago.</li>
          <li>Entiende que Postty no almacena datos de tarjetas de crédito o débito; estos son gestionados exclusivamente por MercadoPago.</li>
        </ul>
        <h3>4.5. Cancelación</h3>
        <p>El Usuario puede cancelar su suscripción en cualquier momento. La cancelación será efectiva al finalizar el período de facturación vigente. No se otorgan reembolsos por períodos parciales ya cobrados, salvo que la legislación aplicable disponga lo contrario.</p>

        <h2>5. Uso Aceptable</h2>
        <p>El Usuario se compromete a:</p>
        <ul>
          <li>Utilizar Postty únicamente para fines legales y conforme a estos Términos.</li>
          <li>No utilizar la Plataforma para generar contenido que sea ilegal, fraudulento, difamatorio, obsceno, discriminatorio o que infrinja derechos de terceros.</li>
          <li>No intentar eludir, desactivar o interferir con las medidas de seguridad, los límites de uso o los controles de acceso de la Plataforma.</li>
          <li>No realizar ingeniería inversa, descompilar o desensamblar cualquier parte del Servicio.</li>
          <li>No utilizar bots, scripts automatizados o métodos similares para acceder al Servicio más allá de las interfaces proporcionadas.</li>
          <li>No revender, sublicenciar ni redistribuir el acceso al Servicio sin autorización expresa.</li>
        </ul>

        <h2>6. Propiedad Intelectual</h2>
        <h3>6.1. Propiedad de Postty</h3>
        <p>La Plataforma, incluyendo pero no limitado a su código fuente, diseño, logotipos, marca &quot;Postty&quot;, algoritmos de IA, y la interfaz de usuario, son propiedad exclusiva de Postty y están protegidos por las leyes de propiedad intelectual aplicables.</p>
        <h3>6.2. Contenido generado por IA</h3>
        <p>Las piezas publicitarias, textos, imágenes y demás contenido generado por la inteligencia artificial de Postty a solicitud del Usuario podrán ser utilizados libremente por el Usuario para sus campañas publicitarias. No obstante:</p>
        <ul>
          <li>Postty no garantiza que el contenido generado sea original ni que no infrinja derechos de terceros.</li>
          <li>El Usuario es el único responsable de verificar la idoneidad, legalidad y originalidad del contenido antes de publicarlo.</li>
          <li>Postty se reserva el derecho de utilizar el contenido generado de forma anonimizada con fines de mejora del Servicio y entrenamiento de modelos.</li>
        </ul>
        <h3>6.3. Contenido del Usuario</h3>
        <p>El Usuario retiene la propiedad sobre los datos que proporciona (URL de su tienda, productos, identidad de marca). Al utilizar el Servicio, el Usuario otorga a Postty una licencia limitada, no exclusiva y revocable para procesar dicho contenido con el fin de prestar el Servicio.</p>

        <h2>7. Recopilación y Tratamiento de Datos Personales</h2>
        <h3>7.1. Datos recopilados</h3>
        <p>Postty recopila y procesa los siguientes datos:</p>
        <ul>
          <li><strong>Datos de autenticación:</strong> UID de Firebase, correo electrónico, nombre y foto de perfil de Google.</li>
          <li><strong>Datos de uso:</strong> URL de tienda, productos extraídos, identidad de marca, borradores de campañas, historial de conversaciones con el agente de IA, piezas publicitarias generadas.</li>
          <li><strong>Datos de suscripción:</strong> ID de suscripción de MercadoPago, plan contratado, estado del pago.</li>
          <li><strong>Datos de uso del servicio:</strong> contadores de uso, retroalimentación del Usuario (calificaciones y comentarios).</li>
        </ul>
        <h3>7.2. Finalidad del tratamiento</h3>
        <p>Los datos se utilizan para:</p>
        <ul>
          <li>Prestar y mejorar el Servicio.</li>
          <li>Gestionar la cuenta y suscripción del Usuario.</li>
          <li>Aplicar límites de uso según el plan contratado.</li>
          <li>Mejorar los modelos de inteligencia artificial (de forma anonimizada).</li>
          <li>Comunicar actualizaciones, novedades y soporte.</li>
        </ul>
        <h3>7.3. Servicios de terceros</h3>
        <p>Postty utiliza los siguientes servicios de terceros que pueden procesar datos del Usuario:</p>
        <ul>
          <li><strong>Google Firebase</strong> — Autenticación y gestión de sesiones.</li>
          <li><strong>Google Gemini (IA)</strong> — Análisis de productos, extracción de Brand DNA, generación de campañas y prompts creativos.</li>
          <li><strong>Nano Banana</strong> — Generación de imágenes publicitarias.</li>
          <li><strong>MercadoPago</strong> — Procesamiento de pagos y suscripciones.</li>
          <li><strong>Meta (Facebook/Instagram)</strong> — Subida de campañas a Meta Ads Manager (cuando el Usuario lo autorice).</li>
        </ul>
        <h3>7.4. Almacenamiento</h3>
        <p>Los datos se almacenan en bases de datos PostgreSQL. Postty implementa medidas de seguridad razonables para proteger los datos, pero no puede garantizar una seguridad absoluta.</p>
        <h3>7.5. Retención de datos</h3>
        <p>Los datos del Usuario se conservan mientras la cuenta esté activa. El Usuario puede solicitar la eliminación de su cuenta y datos enviando un correo electrónico a <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a>.</p>

        <h2>8. Limitaciones del Servicio y Descargo de Responsabilidad</h2>
        <h3>8.1. Servicio &quot;tal cual&quot;</h3>
        <p>Postty se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;, sin garantías de ningún tipo, ya sean expresas o implícitas.</p>
        <h3>8.2. Contenido generado por IA</h3>
        <p>Postty no garantiza:</p>
        <ul>
          <li>La exactitud, calidad, originalidad o efectividad del contenido publicitario generado.</li>
          <li>Que el contenido generado cumpla con las políticas publicitarias de Meta u otras plataformas.</li>
          <li>Que el contenido generado no infrinja derechos de propiedad intelectual de terceros.</li>
          <li>Resultados comerciales específicos derivados del uso del contenido generado.</li>
        </ul>
        <p>El Usuario es el único responsable de revisar, aprobar y asumir las consecuencias del uso del contenido generado.</p>
        <h3>8.2.5. Rechazo por Meta</h3>
        <p>Las piezas publicitarias generadas por Postty se crean siguiendo las mejores prácticas de la industria para Meta Ads. Sin embargo, Postty no garantiza la aprobación de los anuncios por parte de Meta. El Usuario es el único responsable de:</p>
        <ul>
          <li>Revisar que el contenido cumpla con las Políticas de Publicidad de Meta antes de publicar.</li>
          <li>Realizar las modificaciones necesarias si Meta rechaza un anuncio.</li>
          <li>Asumir las consecuencias de cualquier violación a las políticas de Meta.</li>
        </ul>
        <p>Postty queda exento de toda responsabilidad por rechazos, suspensiones de cuenta, o cualquier otra acción tomada por Meta contra el Usuario o sus anuncios.</p>
        <h3>8.3. Disponibilidad</h3>
        <p>Postty no garantiza que el Servicio estará disponible de forma ininterrumpida o libre de errores. Nos reservamos el derecho de realizar mantenimientos, actualizaciones o modificaciones al Servicio sin previo aviso.</p>
        <h3>8.4. Límites de uso</h3>
        <p>El Servicio está sujeto a límites de uso (rate limits) por usuario, por minuto y por día, según el plan contratado. Estos límites pueden modificarse en cualquier momento.</p>

        <h2>9. Limitación de Responsabilidad</h2>
        <p>En la máxima medida permitida por la ley aplicable:</p>
        <ul>
          <li>Postty no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos derivados del uso o imposibilidad de uso del Servicio.</li>
          <li>La responsabilidad total de Postty frente al Usuario no excederá el monto efectivamente abonado por el Usuario en los últimos 3 (tres) meses previos al evento que dio lugar al reclamo.</li>
          <li>Postty no será responsable por pérdidas derivadas de la dependencia del Usuario en el contenido generado por la inteligencia artificial.</li>
        </ul>

        <h2>10. Modificaciones</h2>
        <h3>10.1. Modificaciones al Servicio</h3>
        <p>Postty se reserva el derecho de modificar, suspender o discontinuar cualquier aspecto del Servicio en cualquier momento, incluyendo funcionalidades, planes, precios y límites de uso.</p>
        <h3>10.2. Modificaciones a los Términos</h3>
        <p>Postty podrá actualizar estos Términos en cualquier momento. Las modificaciones serán notificadas al Usuario a través de la Plataforma o por correo electrónico. El uso continuado del Servicio después de la notificación constituye aceptación de los Términos modificados.</p>

        <h2>11. Terminación</h2>
        <h3>11.1. Por el Usuario</h3>
        <p>El Usuario puede dejar de utilizar el Servicio y cancelar su cuenta en cualquier momento.</p>
        <h3>11.2. Por Postty</h3>
        <p>Postty se reserva el derecho de suspender o cancelar la cuenta de cualquier Usuario que:</p>
        <ul>
          <li>Viole estos Términos o el uso aceptable del Servicio.</li>
          <li>Realice actividades fraudulentas o ilegales.</li>
          <li>Abuse de los límites de uso o intente eludirlos.</li>
        </ul>
        <p>La terminación no exime al Usuario de las obligaciones adquiridas durante el período de vigencia.</p>

        <h2>12. Ley Aplicable y Jurisdicción</h2>
        <p>Estos Términos se regirán e interpretarán conforme a las leyes de la República Argentina. Cualquier controversia derivada de estos Términos será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando las partes a cualquier otro fuero que pudiera corresponderles.</p>

        <h2>13. Contacto</h2>
        <p>Para cualquier consulta, reclamo o solicitud relacionada con estos Términos o el Servicio, el Usuario puede comunicarse a:</p>
        <ul>
          <li>Correo electrónico: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></li>
          <li>Sitio web: <a href="https://posttyai.com">https://posttyai.com</a></li>
        </ul>

        <h2>14. Disposiciones Generales</h2>
        <ul>
          <li>Si alguna cláusula de estos Términos fuera declarada inválida o inaplicable, las restantes cláusulas continuarán en pleno vigor y efecto.</li>
          <li>La falta de ejercicio por parte de Postty de cualquier derecho previsto en estos Términos no constituirá una renuncia al mismo.</li>
          <li>Estos Términos constituyen el acuerdo completo entre el Usuario y Postty en relación con el uso del Servicio, y reemplazan cualquier acuerdo o comunicación previa.</li>
        </ul>
      </LegalModal>
    </div>
  );
}
