"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const avatars = [
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=57",
  "https://i.pravatar.cc/80?img=47",
  "https://i.pravatar.cc/80?img=68",
];

const revealWords = [
  "En", "Postty", "transformamos", "cómo", "los", "dueños", "de", "negocios",
  "crean", "contenido.", "Usando", "los", "últimos", "modelos", "de", "IA",
  "capturamos", "la", "esencia", "de", "tu", "marca", "para", "generar",
  "contenido", "profesional", "en", "todas", "las", "plataformas.",
  "Para", "que", "hagas", "el", "trabajo", "de", "un", "equipo", "completo",
  "sin", "contratar", "uno.",
];

const steps = [
  {
    num: "1",
    title: "Subís una foto de tu producto",
    desc: "Sacá una foto con tu celular y subila a Postty. Sin edición, sin preparación previa.",
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

const stats = [
  { value: "+300", label: "negocios generando contenido solos", color: "#022BB0" },
  { value: "1 min", label: "desde que subís tu foto hasta generar una campaña", color: "#49D3F8" },
  { value: "0", label: "experiencia en marketing requerida", color: "#D6F951" },
];


const testimonials = [
  {
    name: "María González",
    text: "Manejo todo sola y Postty básicamente me salvó la vida. Posts, historias, todo listo sin tener que supervisar nada. 10/10.",
    location: "AR - Feb 2026",
  },
  {
    name: "Carlos Medina",
    text: "Tenía miedo de que fuera como otras herramientas de IA pero esto realmente suena como mi marca. Genial para dueños de negocio ocupados.",
    location: "MX - Ene 2026",
  },
  {
    name: "Lucía Fernández",
    text: "Tenía expectativas bajas porque todas las herramientas de IA que probé se sentían super robóticas. Postty fue diferente. Capturó cómo hablamos con nuestros clientes. Funcionando el mismo día.",
    location: "AR - Feb 2026",
  },
  {
    name: "Diego Ruiz",
    text: "Nos ahorró una fortuna en freelancers. El tono coincide bastante bien entre posts y publicidad.",
    location: "CO - Ene 2026",
  },
  {
    name: "Ana Torres",
    text: "¿Contenido completo listo en minutos en vez de semanas? No lo creía hasta que lo vi pasar. Me encanta que no sean templates genéricos.",
    location: "CL - Mar 2026",
  },
  {
    name: "Valentina López",
    text: "Empezar fue facilísimo, mucho más de lo que pensaba. En 10 minutos el contenido de mi marca estaba listo.",
    location: "MX - Ene 2026",
  },
  {
    name: "Roberto Díaz",
    text: "Publicar es simple ahora. Los posts de redes sociales me llevaban HORAS. Ahora son 10 minutos por día. Increíble.",
    location: "AR - Mar 2026",
  },
  {
    name: "Elena Rossi",
    text: "Tengo una tienda chica y Postty hizo que pareciera una agencia de marketing profesional.",
    location: "AR - Ene 2026",
  },
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
    a: "Sí. Podés gestionar hasta 5 marcas en una sola cuenta de Postty. Cada una con su propio estilo, espacio de trabajo y configuración.",
  },
  {
    q: "¿Tienen prueba gratuita?",
    a: "Sí. Postty tiene un plan gratuito con 30 posts por mes para que lo pruebes sin riesgo y sin poner tarjeta de crédito.",
  },
  {
    q: "¿Es adecuado para mi tipo de negocio?",
    a: "Sí. Postty funciona para cualquier negocio. Es especialmente efectivo para marcas con productos físicos que quieren crear contenido de calidad de forma rápida y consistente.",
  },
];

/* ── Subcomponents ── */

function StepMockup1() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#F5F7FA] p-5">
      {/* Phone frame */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto w-[140px] rounded-2xl border border-[#E0E4EA] bg-white p-2 shadow-lg"
      >
        <div className="flex items-center justify-between px-1 pb-1.5">
          <div className="h-1.5 w-8 rounded-full bg-[#E0E4EA]" />
          <div className="h-3 w-3 rounded-full border border-[#E0E4EA]" />
        </div>
        <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[#49D3F8]/20 to-[#1881F1]/20">
          <motion.div
            initial={{ scale: 1.3, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex h-full items-center justify-center"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1881F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          </motion.div>
        </div>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-[#1881F1] to-[#49D3F8]"
        />
        <p className="mt-1.5 text-center text-[7px] font-semibold text-[#0D1522]/40">Subiendo foto...</p>
      </motion.div>
      {/* Floating badge */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.2 }}
        className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[8px] font-bold text-[#1881F1] shadow-md"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        Listo
      </motion.div>
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

function WordReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.65"],
  });

  return (
    <div ref={containerRef} className="mx-auto max-w-4xl px-6 pb-32 pt-6 sm:px-10 sm:pb-40 sm:pt-8 md:pb-48 md:pt-10">
      <p className="font-heading flex flex-wrap gap-x-[0.4em] gap-y-2 text-3xl font-medium leading-[1.4] text-[#0D1522]/20 sm:text-4xl md:text-[2.75rem] md:leading-[1.45]">
        {revealWords.map((word, i) => {
          const start = (i / revealWords.length) * 0.85;
          const end = start + (1 / revealWords.length) * 0.85;
          return (
            <WordSpan key={`${word}-${i}`} word={word} range={[start, end]} progress={scrollYProgress} />
          );
        })}
      </p>
    </div>
  );
}

const highlightColorMap: Record<string, string> = {
  "Postty": "#1881F1",
  "contenido.": "#022BB0",
  "marca": "#49D3F8",
  "plataformas.": "#D6F951",
  "uno.": "#70ADD4",
};

function WordSpan({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const targetColor = highlightColorMap[word];
  const opacity = useTransform(progress, range, [0.15, 1]);
  const normalColor = useTransform(progress, range, ["#0D1522", "#0D1522"]);
  const highlightColor = useTransform(
    progress,
    range,
    [targetColor ? `${targetColor}25` : "#0D1522", targetColor ?? "#0D1522"],
  );

  return (
    <motion.span
      style={{ opacity, color: targetColor ? highlightColor : normalColor }}
      className={targetColor ? "font-bold" : ""}
    >
      {word}
    </motion.span>
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

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

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
          className={`mx-auto flex w-fit items-center gap-3 rounded-full bg-white/80 px-4 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-xl ${
            scrolled ? "pointer-events-none" : ""
          }`}
        >
          <a href="#" className="font-heading text-lg font-extrabold tracking-[-0.08em] text-[#0D1522]">
            Postty
          </a>
          <nav className="hidden items-center gap-5 text-sm text-[#0D1522]/70 md:flex">
            <a href="#como-funciona" className="whitespace-nowrap transition hover:text-[#0D1522]">Cómo funciona</a>
            <a href="#funcionalidades" className="whitespace-nowrap transition hover:text-[#0D1522]">Funcionalidades</a>
            <a href="#testimonios" className="whitespace-nowrap transition hover:text-[#0D1522]">Testimonios</a>
            <a href="#faq" className="whitespace-nowrap transition hover:text-[#0D1522]">FAQ</a>
          </nav>
          <a href="#empezar" className="btn-outline-gradient shrink-0 rounded-full px-5 py-2 text-sm font-bold">
            Empezar gratis
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
            href="#empezar"
            className="btn-outline-gradient rounded-full bg-white/80 px-5 py-2.5 text-sm font-bold shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-xl"
          >
            Empezar gratis
          </motion.a>
        </motion.div>
      </div>

      <main className="flex-1 md:flex-initial">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:pt-24 md:pt-28">
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1881F1]/10 px-4 py-2 text-xs font-semibold text-[#1881F1]"
          >
            Tu Agente de marketing
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
          >
            {/* Mobile: 3 líneas */}
            <span className="sm:hidden">
              Vender en redes
              <br />
              sociales no debería
              <br />
              ser difícil.
            </span>
            {/* Web: 2 líneas */}
            <span className="hidden sm:inline">
              Vender en redes sociales
              <br />
              no debería ser difícil.
            </span>
          </motion.h1>

          {/* Métricas: mobile 2 líneas, web inline — solo una vez */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-3 text-center"
          >
            {/* Mobile: línea 1 "1 Foto. 1 Campaña." / línea 2 "1 Minuto." */}
            <div className="font-heading text-4xl font-black sm:hidden">
              <span className="text-[#022BB0]">1 Foto.</span>{" "}
              <span className="text-[#49D3F8]">1 Campaña.</span>
              <br />
              <span className="text-[#D6F951]">1 Minuto.</span>
            </div>
            {/* Web: todo en una línea */}
            <div className="hidden font-heading font-black sm:block sm:text-6xl md:text-7xl">
              <span className="text-[#022BB0]">1 Foto.</span>{" "}
              <span className="text-[#49D3F8]">1 Campaña.</span>{" "}
              <span className="text-[#D6F951]">1 Minuto.</span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-sm text-[#0D1522]/65 sm:text-lg"
          >
            Postty convierte fotos de tus productos en posts, historias y publicidad.
            Cientos de piezas de contenido generadas, mientras dormís.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <a href="#empezar" className="btn-primary inline-flex items-center gap-2 rounded-full px-9 py-4 text-base font-black text-white">
              Empezar gratis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </motion.div>

          {/* Dragon on canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative mx-auto mt-12 w-[200px] md:mt-20"
          >
            <div className="dragon-shadow absolute bottom-0 left-1/2 h-4 w-32 -translate-x-1/2 rounded-[50%]" />
            <Image
              src="/mascot.png"
              alt="Postty mascot"
              width={200}
              height={200}
              className="relative z-10 mx-auto drop-shadow-2xl"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-[#0D1522]/[0.06] bg-[#F5F7FA]/70 px-5 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          >
            <div className="flex -space-x-2.5">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-[#0D1522]/70">
              <span className="font-bold text-[#0D1522]">4.99/5</span> de{" "}
              <span className="font-bold text-[#0D1522]">324</span> clientes ⭐
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Word-by-word reveal ── */}
      <WordReveal />

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

      {/* ── Stats ── */}
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
                <p className="font-heading text-4xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="mt-2 text-sm text-[#0D1522]/60">{stat.label}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>


      {/* ── Privacy ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-3xl font-black sm:text-4xl md:text-5xl">
            Grandes poderes vienen con
          </h2>
          <p className="mt-2 font-heading text-2xl font-black sm:text-3xl md:text-4xl">
            <span className="bg-gradient-to-r from-[#022BB0] via-[#1881F1] to-[#49D3F8] bg-clip-text text-transparent">gran privacidad.</span>
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[#0D1522]/60">
            Tu marca es tu mayor activo. La protegemos con encriptación completa,
            cero intercambio de datos y control absoluto en tus manos.
          </p>
          <div className="relative mx-auto mt-10 w-[130px]">
            <div className="dragon-shadow absolute bottom-0 left-1/2 h-3 w-24 -translate-x-1/2 rounded-[50%]" />
            <Image src="/mascot.png" alt="Postty mascot" width={130} height={130} className="relative z-10" />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 -top-4 z-20"
              style={{ perspective: "600px" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1881F1] to-[#49D3F8]"
                style={{
                  transform: "rotateY(-10deg) rotateX(8deg)",
                  boxShadow: "0 8px 20px rgba(24,129,241,0.35), 0 2px 4px rgba(24,129,241,0.2), inset 0 1px 0 rgba(255,255,255,0.3), 0 -2px 0 rgba(0,0,0,0.1)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonios" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-center text-3xl font-black sm:text-4xl">
            Hecho por fundadores, para fundadores que quieren vender sin preocuparse por el marketing.
          </h2>
          <div className="relative mt-12">
            <div
              className="columns-1 gap-4 sm:columns-2 lg:columns-3"
              style={{
                maskImage: "linear-gradient(to bottom, black 45%, transparent 90%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 90%)",
              }}
            >
            {testimonials.map((t) => (
              <motion.blockquote
                key={t.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="mb-4 break-inside-avoid rounded-2xl bg-[#F5F7FA] p-5"
              >
                <p className="text-sm font-bold">{t.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#0D1522]/70">{t.text}</p>
                <p className="mt-3 text-xs text-[#0D1522]/40">{t.location}</p>
              </motion.blockquote>
            ))}
            </div>
          </div>
          <p className="mt-8 text-center text-sm font-bold text-[#0D1522]">
            +300 dueños de negocio usan Postty
          </p>
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
              href="#"
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
            <p className="mt-2 text-sm text-[#0D1522]/50">support@postty.com</p>
          </div>
          <div className="flex flex-wrap gap-10 text-sm">
            <div>
              <p className="mb-2 font-bold text-[#0D1522]/40">Legal</p>
              <a href="#" className="block text-[#0D1522]/60 transition hover:text-[#0D1522]">Política de reembolso</a>
              <a href="#" className="mt-1 block text-[#0D1522]/60 transition hover:text-[#0D1522]">Privacidad</a>
              <a href="#" className="mt-1 block text-[#0D1522]/60 transition hover:text-[#0D1522]">Términos de servicio</a>
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
    </div>
  );
}
