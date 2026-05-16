"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import PrivacyContent from "@/components/legal/PrivacyContent";
import TermsContent from "@/components/legal/TermsContent";
import { trackEvent, useAppUrl } from "@/lib/pixel";

const avatars = [
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=57",
  "https://i.pravatar.cc/80?img=47",
  "https://i.pravatar.cc/80?img=68",
];

/**
 * Cómo funciona — three step cards using 3D icons + glass pills.
 * Old animated-mockup version is archived at
 * src/components/_extras/HowItWorksOldSection.tsx.
 *
 * `text` is a single string rendered on ONE line via `whitespace-nowrap` —
 * the pill grows with content (it can extend beyond the icon's container
 * since the badge is absolute-positioned).
 */
const howItWorksSteps: ReadonlyArray<{
  num: string;
  icon: string;
  text: string;
}> = [
  {
    num: "1",
    icon: "/step-1.webp",
    text: "Conectás tu tienda y Postty genera el ADN de tu marca",
  },
  {
    num: "2",
    icon: "/step-2.webp",
    text: "Postty genera +100 piezas de contenido y Ads profesionales",
  },
  {
    num: "3",
    icon: "/step-3.webp",
    text: "Postty publica y optimiza tus redes y campañas",
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

type BrandTestimonial = {
  name: string;
  subtitle: string;
  image: string;
  // Single hero metric per brand. The "0 agencias" / "0 diseñadores" stat
  // was removed to free up visual space for a larger glass metric card.
  stat: { value: string; suffix?: string; label: readonly [string, string] };
};

const brandTestimonials: ReadonlyArray<BrandTestimonial> = [
  {
    name: "StarConcept",
    subtitle: "Marca de ropa",
    image: "/starconcept.png",
    stat: {
      value: "4.2x",
      suffix: "roas",
      label: ["Más conversión de Ads", "en las campañas de meta"],
    },
  },
  {
    name: "Nüa Skinhouse",
    subtitle: "Estética profesional",
    image: "/nua.jpg",
    stat: {
      value: "+40",
      label: ["Horas mensuales", "ahorradas en Canva"],
    },
  },
];

const whatPosttyDoesItems: ReadonlyArray<{
  title: string;
  subtitle: readonly [string, string];
  video: string;
}> = [
  {
    title: "Contenido para redes",
    subtitle: ["Para que no gastes más tiempo", "pensando tu próximo posteo"],
    video: "/videos/feed.mp4",
  },
  {
    title: "Campañas con Ads",
    subtitle: ["Para que no gastes dinero", "en agencias de marketing"],
    video: "/videos/campagin.mp4",
  },
  {
    title: "Photoshoot de producto",
    subtitle: ["Para que no gastes dinero", "en un estudio y fotografía"],
    video: "/videos/product.mp4",
  },
];

/**
 * Apple-style 2×2 bento grid: three product tiles + a fourth "trial" CTA tile.
 *
 * Key design decisions:
 *   - Section padding (px-3) MATCHES grid gap (gap-3) so the visual rhythm
 *     between tile-edge → screen-edge is identical to tile-to-tile spacing.
 *   - Tiles use `rounded-xl` (12px) — barely-rounded, near-rectangular per spec.
 *   - Video bg removal: source MP4s have a pure-white padding around the phone.
 *     `mix-blend-mode: darken` on the video keeps any pixel that's darker than
 *     the tile gray (#F1F2F4) and replaces brighter pixels (the white padding)
 *     with the tile gray — so the phone "floats" with no visible video frame.
 *   - Phone bottom is intentionally cropped flush with the tile's bottom edge:
 *     the aspect-[9/13] container is squarer than the source 9:16 video, and
 *     `object-cover object-top` anchors the top so the bottom gets clipped.
 *   - Mobile: single column, full-width tiles, same rules apply.
 */
function WhatPosttyDoesSection() {
  const appUrl = useAppUrl();

  return (
    // py-3 = 12px → the section's own outer padding matches the 12px rhythm
    // used everywhere else (gap-3, tile px-3, subtitle→video mt-3). Pulls the
    // whole grid up close to the hero video above.
    <section className="px-3 py-3">
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-3 md:grid-cols-2">
        {whatPosttyDoesItems.map((item) => (
          <div
            key={item.title}
            // Tile is ~20% taller than the previous pass (aspect-[7/5]→[7/6]
            // on desktop, aspect-[5/6]→[5/7] on mobile). Width is unchanged
            // — the grid column still controls it.
            // pt-12/20 keeps title+subtitle pushed down. pb-0 lets the video
            // sit flush with the tile's bottom edge again (the previous lift
            // caused unwanted bottom-cropping in too-small a viewport — by
            // letting the video container fill remaining height and overflow
            // its source vertically, the tile edge naturally crops the phone
            // bottom, which is the desired look).
            className="isolate flex aspect-[5/7] flex-col items-center overflow-hidden rounded-xl bg-[#F1F2F4] px-3 pt-12 pb-0 sm:pt-20 md:aspect-[7/6]"
          >
            <h3 className="font-heading text-center text-2xl font-black tracking-tight text-[#0D1522] sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#0D1522]/65 sm:text-base">
              {item.subtitle[0]}
              <br />
              {item.subtitle[1]}
            </p>
            {/* Video — flex-1 fills whatever vertical space is left below
                the subtitle (no fixed aspect on the container). max-w shrunk
                another ~15% (310/375 → 265/320). Height area is unchanged
                because flex-1 still consumes the remaining tile height —
                only the phone's WIDTH gets narrower. */}
            <div className="relative mt-3 w-full max-w-[265px] flex-1 overflow-hidden sm:max-w-[320px]">
              <ScrollTriggeredVideo
                src={item.video}
                className="absolute inset-0 h-full w-full object-cover object-top mix-blend-darken"
              />
            </div>
          </div>
        ))}

        {/* ── 4th tile: free-trial CTA with editorial photo ────────────────
            Full-bleed photo background with overlaid heading + glass CTA.
            Title sits over the sky portion of the photo (dark text on light
            blue is readable); CTA is centered glass with arrow + Pixel Lead.
            Aspect ratios mirror the video tiles exactly so the 2×2 grid
            stays perfectly aligned at every breakpoint. */}
        <div className="relative aspect-[5/7] overflow-hidden rounded-xl md:aspect-[7/6]">
          <Image
            src="/blonde.webp"
            alt="Dejá de estresarte por las redes y disfrutá tu domingo"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover object-center"
            priority={false}
          />
          {/* Title — lowered to match the video tiles' pt-12/20, lighter
              weight (medium) per spec so it reads as editorial copy rather
              than a heading shout. */}
          <div className="absolute inset-x-0 top-12 px-4 sm:top-20 sm:px-8">
            <h3 className="font-heading text-center text-xl font-medium leading-tight tracking-tight text-[#0D1522] sm:text-2xl md:text-3xl">
              Dejá de estresarte por las
              <br />
              redes y disfrutá tu domingo
            </h3>
          </div>
          {/* Glass CTA — vertically centered, with arrow that nudges right on
              hover. Same Pixel Lead event as before so attribution continues. */}
          <a
            href={appUrl}
            onClick={() => trackEvent("Lead", {
              content_category: "free_trial_section",
              content_ids: ["free_trial_cta"],
              content_type: "product",
              currency: "ARS",
            })}
            className="group absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full border border-white/60 bg-white/30 px-7 py-3.5 text-base font-semibold text-[#0D1522] shadow-[0_4px_24px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:bg-white/50 hover:shadow-[0_10px_36px_rgba(13,21,34,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] hover:-translate-y-[calc(50%+2px)]"
          >
            Probar gratis
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [hoveredCard, setHoveredCard] = useState<"basic" | "pro" | "agency" | null>("pro");
  const sectionRef = useRef<HTMLElement>(null);
  const appUrl = useAppUrl();

  // Fire ViewContent once per session when pricing scrolls into view (>=50%).
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const KEY = "postty_viewcontent_pricing";
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      /* sessionStorage unavailable — proceed without throttle */
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trackEvent("ViewContent", { content_category: "pricing" });
            try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const basicFeatures = [
    "Hasta 1 marca",
    "60 Ads",
    "20 Posts",
    "20 Photoshoots",
    "1 Edit por foto",
  ];

  const proFeatures = [
    "Hasta 1 marca",
    "Ads ilimitados",
    "Posts ilimitados",
    "Photoshoots ilimitados",
    "Edits ilimitados por foto",
    "Modelos Pro de IA",
  ];

  const agencyFeatures = [
    "Hasta 5 marcas",
    "Hasta 10 usuarios en tu equipo",
    "Ads ilimitados",
    "Posts ilimitados",
    "Photoshoots ilimitados",
    "Edits ilimitados por foto",
    "Modelos Pro de IA",
  ];

  const activeCard = hoveredCard ?? "pro";

  return (
    <section ref={sectionRef} id="pricing" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-black sm:text-4xl md:text-5xl"
        >
          Precios simples
        </motion.h2>

        {/* Grid uses items-start so per-card lg:mt-X offsets stagger vertically.
            Basic + Agencia sit lower; Pro sits slightly above so it reads as the
            recommended plan without needing a "Recommended" tag. */}
        <div className="relative mt-24 grid items-start gap-8 lg:grid-cols-3">
          {/* ── Basic Card ─────────────────────────────────────────────────
              Glass-on-light. Neutral palette so Pro can stand out.
              No discount, no strikethrough — single clean price. */}
          <div
            className="relative self-start lg:mt-14"
            onMouseEnter={() => setHoveredCard("basic")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Mascot — pops up when this card is the active one */}
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
              className="relative z-10 rounded-3xl border border-white/70 bg-white/55 p-8 shadow-[0_4px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            >
              {/* Title row — name top-left, subtle 20% OFF badge top-right.
                  Glass styling instead of Pro's chartreuse so Basic stays
                  visually quieter and Pro keeps the loud accent. */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-3xl font-bold text-[#0D1522]">Basic</h3>
                <div className="shrink-0 rounded-full border border-white/80 bg-white/70 px-3 py-1 shadow-[0_2px_8px_rgba(13,21,34,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md">
                  <span className="font-heading text-xs font-black text-[#0D1522]/70">20% OFF</span>
                </div>
              </div>

              {/* Price — strikethrough small on top, then large discounted.
                  $61.999 → $49.000 ≈ 20% OFF (matches the badge math).
                  Strike color is dark-on-light here, mirroring Pro's white-
                  on-blue strike — same pattern, inverted palette. */}
              <div className="mt-5">
                <div className="text-base font-semibold text-[#0D1522]/40 line-through decoration-2 decoration-[#0D1522]/40">
                  $61.999
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-5xl font-black tracking-tight text-[#0D1522]">$49.000</span>
                  <span className="text-sm font-medium text-[#0D1522]/50">/mes</span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="mt-3 text-sm leading-relaxed text-[#0D1522]/65">
                Tenés una empresa y manejás todo el marketing vos
              </p>

              {/* CTA — moved up, neutral so Pro pops */}
              <a
                href={appUrl}
                onClick={() => trackEvent("Lead", {
                  content_category: "pricing_basic",
                  content_ids: ["plan_basic"],
                  content_type: "product",
                  value: 49000,
                  currency: "ARS",
                })}
                className="mt-6 block w-full rounded-full bg-[#0D1522]/[0.06] py-3.5 text-center text-sm font-semibold text-[#0D1522] transition hover:bg-[#0D1522]/[0.10]"
              >
                Empezar ahora
              </a>

              {/* Features — inner glass block */}
              <div className="mt-6 rounded-2xl border border-white/60 bg-white/40 p-5 backdrop-blur-md">
                {basicFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-3 ${
                      i < basicFeatures.length - 1 ? "border-b border-[#0D1522]/[0.06]" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-[#0D1522]/75">{feat}</span>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D6F951]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Pro Card ───────────────────────────────────────────────────
              Solid blue gradient — only card with vivid color, only one with
              discount badge + strikethrough. The visual weight here is the
              point: Pro is the recommended plan. */}
          <div
            className="relative lg:mt-2"
            onMouseEnter={() => setHoveredCard("pro")}
            onMouseLeave={() => setHoveredCard(null)}
          >
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
              className="relative z-10 overflow-hidden rounded-3xl p-8 text-white shadow-[0_12px_40px_rgba(24,129,241,0.35)]"
              style={{ background: "linear-gradient(160deg, #1881F1, #49D3F8)" }}
            >
              {/* Title row — name top-left, discount badge top-right */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-3xl font-bold text-white">Pro</h3>
                <div
                  className="shrink-0 rounded-full px-3 py-1 shadow-[0_4px_16px_rgba(181,255,0,0.45)]"
                  style={{ background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
                >
                  <span className="font-heading text-xs font-black text-[#0D1522]">60% OFF</span>
                </div>
              </div>

              {/* Price — strikethrough small first, then large discounted.
                  Strike is white (subtle); discounted price uses chartreuse to
                  reinforce the Pro accent color used by the badge + CTA. */}
              <div className="mt-5">
                <div className="text-base font-semibold text-white/60 line-through decoration-2 decoration-white/70">
                  $211.999
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className="font-heading text-5xl font-black tracking-tight"
                    style={{
                      background: "linear-gradient(135deg, #b5ff00, #eeff64)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    $84.999
                  </span>
                  <span className="text-sm font-medium text-white/65">/mes</span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                Querés llevar tu marca al siguiente nivel sin límites
              </p>

              {/* CTA — chartreuse, only colored CTA on the page */}
              <a
                href={appUrl}
                onClick={() => trackEvent("Lead", {
                  content_category: "pricing_pro",
                  content_ids: ["plan_pro"],
                  content_type: "product",
                  value: 84999,
                  currency: "ARS",
                })}
                className="mt-6 block w-full rounded-full py-3.5 text-center text-sm font-bold text-[#0D1522] transition hover:shadow-lg hover:brightness-105"
                style={{ background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
              >
                Convertirme en Pro
              </a>

              {/* Features — inner glass block on the blue */}
              <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                {proFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-3 ${
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
            </motion.div>
          </div>

          {/* ── Agencia Card ───────────────────────────────────────────────
              Mirror of Basic (glass-on-light, neutral). No discount.
              Higher feature count + premium price tells the story by itself.
              Same lg:mt-14 as Basic so both side cards align horizontally and
              Pro reads as the elevated, recommended plan. */}
          <div
            className="relative lg:mt-14"
            onMouseEnter={() => setHoveredCard("agency")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              animate={{ y: activeCard === "agency" ? 0 : 50, opacity: activeCard === "agency" ? 1 : 0 }}
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
              className="relative z-10 rounded-3xl border border-white/70 bg-white/55 p-8 shadow-[0_4px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            >
              <h3 className="font-heading text-3xl font-bold text-[#0D1522]">Agencia</h3>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-heading text-5xl font-black tracking-tight text-[#0D1522]">$299.999</span>
                <span className="text-sm font-medium text-[#0D1522]/50">/mes</span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#0D1522]/65">
                Sos una agencia o tenés un equipo manejando varias marcas
              </p>

              <a
                href={appUrl}
                onClick={() => trackEvent("Lead", {
                  content_category: "pricing_agency",
                  content_ids: ["plan_agency"],
                  content_type: "product",
                  value: 299999,
                  currency: "ARS",
                })}
                className="mt-6 block w-full rounded-full bg-[#0D1522]/[0.06] py-3.5 text-center text-sm font-semibold text-[#0D1522] transition hover:bg-[#0D1522]/[0.10]"
              >
                Empezar ahora
              </a>

              <div className="mt-6 rounded-2xl border border-white/60 bg-white/40 p-5 backdrop-blur-md">
                {agencyFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-3 ${
                      i < agencyFeatures.length - 1 ? "border-b border-[#0D1522]/[0.06]" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-[#0D1522]/75">{feat}</span>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D6F951]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  </div>
                ))}
              </div>
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
  const springX = useSpring(x, { stiffness: 130, damping: 18 });
  const springY = useSpring(y, { stiffness: 130, damping: 18 });

  // Deterministic per-pill randomness (seeded by index) so SSR matches the client
  // and each pill drifts on its own rhythm — no synchronized bobbing.
  const seed = (n: number) => {
    const v = Math.sin((i + 1) * n * 12.9898) * 43758.5453;
    return v - Math.floor(v); // 0..1
  };
  const xAmp = 24 + seed(1) * 22;       // 24..46 px
  const yAmp = 20 + seed(2) * 22;       // 20..42 px
  const rotAmp = 4 + seed(3) * 5;        // 4..9 deg
  const duration = 5.5 + seed(4) * 3.5;  // 5.5..9 s
  const phase = seed(5) * 4;             // 0..4 s start delay so they desync

  useEffect(() => {
    if (!pillRef.current) return;
    // Mouse left the section → release the repel offset back to neutral.
    if (mousePos.x === 0 && mousePos.y === 0) {
      x.set(0);
      y.set(0);
      return;
    }
    const rect = pillRef.current.getBoundingClientRect();
    const pillCenterX = rect.left + rect.width / 2;
    const pillCenterY = rect.top + rect.height / 2;
    const dx = pillCenterX - mousePos.x;
    const dy = pillCenterY - mousePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 220;

    if (dist < radius) {
      const force = (1 - dist / radius) * 80;
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
      {/* Idle drift — animates x/y/rotate independently from the repel layer above.
          The two transforms compose: outer = mouse repel, inner = autonomous drift. */}
      <motion.div
        animate={{
          x: [0, xAmp, -xAmp * 0.7, xAmp * 0.4, 0],
          y: [0, -yAmp, -yAmp * 0.4, yAmp * 0.6, 0],
          rotate: [
            biz.rotate,
            biz.rotate + rotAmp,
            biz.rotate - rotAmp * 0.7,
            biz.rotate + rotAmp * 0.4,
            biz.rotate,
          ],
        }}
        transition={{
          duration,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="cursor-default"
      >
        <div className="flex items-center gap-2.5 rounded-2xl bg-white px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]">
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
  const appUrl = useAppUrl();

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0D1522] md:min-h-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
            <a href="#pricing" className="whitespace-nowrap transition hover:text-[#0D1522]">Precios</a>
            <a href="#faq" className="whitespace-nowrap transition hover:text-[#0D1522]">FAQ</a>
          </nav>
          <a href={appUrl} className="shrink-0 rounded-full bg-white/15 px-5 py-2 text-sm font-bold text-[#0D1522] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:bg-white/25">
            Iniciar sesión
          </a>
        </motion.header>

        {/* Layer 2: Split — mascot left, CTA right (visible on scroll) */}
        <motion.div
          animate={{
            opacity: scrolled ? 1 : 0,
            filter: scrolled ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6 ${
            scrolled ? "" : "pointer-events-none"
          }`}
        >
          <motion.a
            animate={{
              x: scrolled ? 0 : 120,
              scale: scrolled ? 1 : 0.7,
            }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            href={appUrl}
            // Standalone glass that mimics the LAYERED effect of the pill
            // version (parent pill bg-white/10 + backdrop-blur-2xl  +  button
            // bg-white/15 + backdrop-blur-xl). Combined those two layers read
            // as roughly bg-white/25 with backdrop-blur-2xl + saturate, so we
            // collapse them into one button here. Outer drop shadow comes from
            // the parent pill; inset highlight comes from the button itself.
            className="rounded-full bg-white/25 px-5 py-2 text-sm font-bold text-[#0D1522] shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl backdrop-saturate-150 transition hover:bg-white/40"
          >
            Iniciar sesión
          </motion.a>
        </motion.div>
      </div>

      <main className="flex-1 md:flex-initial">
      {/* ── Hero ── */}
      <section className="relative h-screen overflow-hidden bg-black">
        {/* SEO-critical H1: visually represented by the hero video.
            Keywords: agente, marketing, IA, contenido, ads, Meta. */}
        <h1 className="sr-only">
          Postty — Agente de marketing con IA que crea contenido y ads para Meta en 5 minutos
        </h1>
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
                    <p className="text-xs font-bold text-white">Sofía, 27 años, Community Manager</p>
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

              {/* Pilar — bottom-left, third in the sequence (delay 1.0s).
                  Mirrors Sofía's slide-in from the left so the trio reads as
                  Sofía (top-left) → Juan (top-right) → Pilar (bottom-left). */}
              <div
                className="pointer-events-none absolute z-20 hidden md:block"
                style={{ left: "calc(5% + 20px)", top: "calc(58% + 20px)" }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl backdrop-saturate-150"
                >
                  <Image
                    src="https://i.pravatar.cc/80?img=44"
                    alt="Pilar"
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Pilar, 37 años, CEO de Agencia de publicidad</p>
                    <p className="text-[11px] text-white/80">&ldquo;Siempre me quedo atrás con las tendencias de Meta&rdquo;</p>
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
                href={appUrl}
                onClick={() => trackEvent("Lead", { content_name: "hero_cta_empezar_gratis" })}
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
          Two image cards side-by-side. Each card holds a brand-name glass
          pill (top-left) and a single, prominent metric pill (bottom-left).
          The previous "0 agencias / 0 diseñadores" stat was removed to give
          the meaningful metric the visual weight it deserves.
          id="testimonios" so the header "Clientes" link anchors here. */}
      <section id="testimonios" className="px-3 py-20 sm:py-28">
        <div className="mx-auto max-w-[1500px]">
          {/* Eyebrow — Jakarta (body font), normal weight, regular case
              and natural letter-spacing per spec. */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="text-center text-sm font-normal text-[#0D1522]/40 sm:text-base"
          >
            Resultados reales
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mt-3 font-heading text-center text-2xl font-medium leading-[1.2] tracking-tight sm:text-3xl md:text-4xl"
          >
            Los dueños suben contenido <span className="font-black">10x más rápido</span>
            <br className="hidden sm:block" />
            {" "}y su dinero invertido en Ads <span className="font-black">rinde 3x más</span> con <span className="font-black">Postty</span>
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 gap-3 md:mt-20 md:grid-cols-2">
            {brandTestimonials.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                // aspect-[7/6] is slightly portrait (h/w ≈ 0.86) so cards
                // are noticeably wider than tall — a bit shorter than the
                // previous 4/5. rounded-xl matches the bento iPhone tiles
                // for a unified corner radius across the page.
                className="relative aspect-[7/6] overflow-hidden rounded-xl"
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

                {/* Hero metric — glass pill, anchored bottom-LEFT (content-
                    sized, no right- constraint). Horizontal layout: BIG
                    number on the left + label as 2 stacked lines on the
                    right, sized big enough (text-xl/text-3xl) so the two
                    label lines roughly fill the vertical height of the
                    giant 7xl/8xl number. */}
                <div
                  className="absolute bottom-4 left-4 z-10 rounded-2xl bg-white/15 px-6 py-6 shadow-[0_8px_32px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150 sm:px-8 sm:py-7"
                  style={{
                    transform: "translate(calc(var(--cx, 0px) * -0.8), calc(var(--cy, 0px) * -0.6))",
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <div className="flex items-center gap-5 sm:gap-6">
                    <p className="font-heading flex shrink-0 items-end text-7xl font-black leading-none tracking-tight text-[#0D1522] sm:text-8xl">
                      {brand.stat.value}
                      {brand.stat.suffix && (
                        <span className="font-heading ml-2 text-base font-bold tracking-normal text-[#0D1522]/60 sm:text-lg">
                          {brand.stat.suffix}
                        </span>
                      )}
                    </p>
                    <p className="text-xl font-medium leading-tight text-[#0D1522]/80 sm:text-3xl">
                      {brand.stat.label[0]}
                      <br />
                      {brand.stat.label[1]}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──
          Vertical stack (per spec — same orientation as the deprecated
          section, archived at _extras/HowItWorksOldSection.tsx). Each step
          uses the same icon-size + pill-size proportions for visual rhythm.
          The number lives in its own glass circle, sitting flush to the LEFT
          of the description pill — both glass elements visually integrated
          into the lower-center of the icon. */}
      <section id="como-funciona" className="px-4 py-16 md:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
        >
          Cómo funciona
        </motion.h2>

        <div className="mx-auto mt-12 flex max-w-[520px] flex-col gap-10 md:mt-16 md:gap-14">
          {howItWorksSteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Icon — same max-w across all 3 steps so the icon-to-pill
                  proportion is identical. Sized down vs the previous pass so
                  the badge doesn't get visually swallowed by the icon. */}
              <div className="relative w-full max-w-[260px]">
                <Image
                  src={step.icon}
                  alt={`Paso ${step.num}`}
                  width={420}
                  height={420}
                  className="h-auto w-full"
                />

                {/* Badge — number circle + description pill, both glass.
                    Sits over the icon center; `gap-1` keeps the circle
                    visually attached to the pill's left edge.
                    Mobile: pill wraps text (rounded-2xl, max-w cap so it
                    fits in the viewport).
                    sm+: pill grows horizontally to fit the single-line text
                    (rounded-full, no max-w, whitespace-nowrap). */}
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
                  {/* Glass number circle — small on mobile (h-7), bigger
                      on sm+ (h-9) to match the bigger desktop pill text */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/45 font-heading text-[11px] font-bold text-[#0D1522] shadow-[0_4px_16px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 sm:h-9 sm:w-9 sm:text-sm">
                    {step.num}
                  </div>
                  {/* Glass pill — significantly smaller on mobile, full size
                      on sm+. Mobile wraps text, sm+ stays single line. */}
                  <div className="max-w-[180px] rounded-2xl border border-white/70 bg-white/45 px-3 py-1.5 shadow-[0_4px_16px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 sm:max-w-none sm:rounded-full sm:px-6 sm:py-3">
                    <p className="text-center text-xs font-semibold leading-snug text-[#0D1522] sm:whitespace-nowrap sm:text-base sm:leading-none">
                      {step.text}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── Business types ── */}
      <BusinessTypesSection />

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
      <section id="empezar" className="px-6 py-20 sm:px-10 md:px-16">
        <div className="relative mx-auto aspect-[9/16] overflow-hidden rounded-3xl sm:aspect-video">
          {/* Mobile portrait image */}
          <Image
            src="/end-mobile.webp"
            alt="Relax with Postty"
            fill
            sizes="(max-width: 639px) 100vw, 0px"
            className="object-cover object-center sm:hidden"
          />
          {/* Desktop landscape image */}
          <Image
            src="/end.png"
            alt="Relax with Postty"
            fill
            sizes="(min-width: 640px) 100vw, 0px"
            className="hidden object-cover object-center sm:block sm:[transform:scale(2)_translate(57.5px,-15px)]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <h2 className="font-heading text-xl font-black text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)] sm:text-2xl md:text-3xl lg:text-4xl">
              ¿Listo para no estresarte más con tus redes?
            </h2>
            <div className="mt-5">
              <motion.a
                href={appUrl}
                onClick={() => trackEvent("Lead", { content_name: "final_cta_empezar_gratis" })}
                className="group inline-flex items-center gap-2 rounded-full bg-white/15 px-8 py-3.5 text-base font-black text-white shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[6px]"
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 340, damping: 22 }}
              >
                Empezar gratis
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 ease-out group-hover:translate-x-[2px]"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </motion.a>
            </div>
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
              <a
                href="/privacy"
                onClick={(e) => { e.preventDefault(); setLegalModal("privacy"); }}
                className="block text-[#0D1522]/60 transition hover:text-[#0D1522]"
              >
                Política de privacidad
              </a>
              <a
                href="/terms"
                onClick={(e) => { e.preventDefault(); setLegalModal("tyc"); }}
                className="mt-1 block text-[#0D1522]/60 transition hover:text-[#0D1522]"
              >
                Términos de servicio
              </a>
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
        <PrivacyContent />
      </LegalModal>

      <LegalModal open={legalModal === "tyc"} onClose={() => setLegalModal(null)} title="Términos y Condiciones de Uso">
        <TermsContent />
      </LegalModal>
    </div>
  );
}
