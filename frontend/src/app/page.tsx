"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PrivacyContent from "@/components/legal/PrivacyContent";
import TermsContent from "@/components/legal/TermsContent";
import GiftCountdown from "@/components/GiftCountdown";
import GiftOverlay from "@/components/GiftOverlay";
import GiftTeaser from "@/components/GiftTeaser";
import CreativeSphereSection from "@/components/CreativeSphereSection";
import BrandContentModal from "@/components/BrandContentModal";
import Confetti from "@/components/Confetti";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import AppsCarousel from "@/components/AppsCarousel";
import { trackEvent, useAppUrl, useCheckoutUrl } from "@/lib/pixel";
import { useGiftDiscount, useGiftOverlayClosed } from "@/lib/giftDiscount";
import { WHATSAPP_URL } from "@/lib/whatsapp";
// Untitled UI icons (MIT) — the credit allowance lines.
import { Image01 as ImageIcon, VideoRecorder as VideoIcon } from "@untitledui/icons";

const avatars = [
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=57",
  "https://i.pravatar.cc/80?img=47",
  "https://i.pravatar.cc/80?img=68",
];

/**
 * Team — each person carries their own quote on their own card (see the
 * "¿Por qué Postty?" section). Array order is the desktop layout, with
 * Juan in the middle column; on mobile his card is pulled to the top
 * (`order-first`) so the CEO still leads.
 */
const teamMembers = [
  {
    name: "Dario Soria",
    role: "CTO",
    image: "/team/dari.webp",
    link: "https://www.linkedin.com/in/dario-soria-11198324/",
    quote:
      "Queremos que la IA esté al servicio de quien vende, no que sume una complejidad más.",
  },
  {
    name: "Juan Beines",
    role: "CEO",
    image: "/team/juan.webp",
    link: "https://www.linkedin.com/in/juanbeines/",
    quote:
      "Nacimos para que vender de forma digital deje de ser un problema y vuelva a ser una oportunidad.",
  },
  {
    name: "Agustina Tobias",
    role: "CMO",
    image: "/team/agustina.webp",
    link: "https://www.linkedin.com/in/agustobias/",
    quote:
      "Para que cada marca pueda enfocarse en su estrategia mientras la ejecución del contenido se resuelve sola.",
  },
];

/* Industry pills for BusinessTypesSection. Laid out as staggered rows —
   the row split is authored, not computed, so the silhouette stays balanced
   and the middle rows leave a clear channel for the headline. */
const businessRows: ReadonlyArray<ReadonlyArray<{ name: string; emoji: string }>> = [
  [
    { name: "Gastronomía", emoji: "🍽️" },
    { name: "Indumentaria", emoji: "👗" },
    { name: "Fitness", emoji: "💪" },
    { name: "Cafeterías", emoji: "☕" },
    { name: "Joyería", emoji: "💍" },
    { name: "Petshop", emoji: "🐶" },
  ],
  [
    { name: "E-commerce", emoji: "🛍️" },
    { name: "Belleza", emoji: "💄" },
    { name: "Inmobiliarias", emoji: "🏘️" },
    { name: "Panadería", emoji: "🥐" },
    { name: "Barbería", emoji: "💈" },
    { name: "Turismo", emoji: "✈️" },
  ],
  [
    { name: "SaaS", emoji: "🚀" },
    { name: "Agencias", emoji: "🏢" },
    { name: "Deco y muebles", emoji: "🛋️" },
    { name: "Nutrición", emoji: "🥗" },
    { name: "Calzado", emoji: "👟" },
  ],
  [
    { name: "Odontología", emoji: "🦷" },
    { name: "Heladerías", emoji: "🍦" },
    { name: "Eventos", emoji: "🎉" },
    { name: "Bazar", emoji: "🍳" },
  ],
  [
    { name: "Gimnasios", emoji: "🏋️" },
    { name: "Vinotecas", emoji: "🍷" },
    { name: "Fotografía", emoji: "📷" },
    { name: "Skincare", emoji: "✨" },
    { name: "Autos", emoji: "🚗" },
  ],
  [
    { name: "Educación", emoji: "📚" },
    { name: "Veterinarias", emoji: "🐾" },
    { name: "Marketing", emoji: "📣" },
    { name: "Peluquería", emoji: "💇" },
    { name: "Bicicletas", emoji: "🚲" },
    { name: "Floristería", emoji: "🌸" },
  ],
  [
    { name: "Apps móviles", emoji: "📱" },
    { name: "Arquitectura", emoji: "📐" },
    { name: "Psicología", emoji: "🧠" },
    { name: "Suplementos", emoji: "💊" },
    { name: "Librerías", emoji: "📖" },
    { name: "Seguros", emoji: "🛡️" },
  ],
];

const faqItems = [
  {
    q: "¿Qué es Postty?",
    a: "Un agente de marketing con IA. Aprende tu marca una vez y después produce todos los meses el contenido y las campañas que tu negocio necesita: videos, posts, historias y ads, con tu identidad, publicados en Instagram y Meta y optimizados solos. Hace el trabajo que hoy hacés vos, un community manager o una agencia.",
  },
  {
    q: "¿Por qué Postty y no una agencia o un community manager?",
    a: "Por volumen, velocidad y control. Una agencia te entrega unas pocas piezas por mes, con briefs, rondas de correcciones y tiempos de espera de por medio; Postty produce decenas en el mismo día y las publica sin que tengas que perseguir a nadie. Y si ya contrataste una y no te movió la aguja, acá ves el resultado antes de pagar: la prueba gratuita genera 6 piezas con tu marca real.",
  },
  {
    q: "¿En qué se diferencia Postty de otras herramientas de IA?",
    a: "Postty aprende tu marca una vez y después produce con ese criterio, sin briefs ni idas y vueltas. Un e-commerce que hoy paga una agencia o un community manager saca en una tarde el volumen de contenido y campañas que antes le llevaba un mes.",
  },
  {
    q: "¿Tengo que aprender a usar el Administrador de Meta?",
    a: "No. Postty crea las piezas, arma la campaña y la publica en tu cuenta publicitaria, y después la optimiza sola. Vos aprobás y ves los resultados; no tenés que entrar al Administrador de Anuncios ni una vez.",
  },
  {
    q: "¿Qué tipo de contenido puede generar Postty?",
    a: "Videos, posts para feed, historias, carruseles y ads para campañas pagas. El video es el formato que más pesa hoy en Meta, así que es el que Postty prioriza: Basic incluye 15 por mes y Pro 35. Todo sale con la identidad de tu marca, listo para publicar.",
  },
  {
    q: "¿Tienen prueba gratuita?",
    a: "Sí. En la prueba gratuita Postty te genera 6 ads o posts para tu perfil de Instagram y para tu perfil de Meta, sin tarjeta y sin compromiso. Para que salgan lo más personalizados posible conviene conectar tus cuentas de Instagram y Meta; si preferís no conectarlas, Postty igual genera a partir de la URL de tu página web, aunque el resultado es menos personalizado. Después podés elegir un plan y seguir creando.",
  },
  {
    q: "¿Necesito conectar mis redes para usar Postty?",
    a: "No es obligatorio, pero sí recomendado. Si conectás tus cuentas de Instagram y Meta, Postty genera contenido para tu perfil de Instagram y ads para tu perfil de Meta mucho más personalizados. Si preferís no conectarlas, Postty trabaja a partir de la URL de tu página web y genera igual, aunque el resultado es menos personalizado.",
  },
  {
    q: "¿Es adecuado para mi tipo de negocio?",
    a: "Donde más rinde es en e-commerce que ya venden y ya invierten en Meta, sobre todo marcas con catálogo de producto físico que necesitan volumen constante de contenido. También funciona bien en servicios y locales con presencia fuerte en redes. Lo que importa no es el rubro: es que ya tengas ventas andando, porque Postty escala lo que funciona.",
  },
  {
    q: "¿Puedo editar mis Ads generados?",
    a: "Sí, las veces que haga falta hasta que quede como querés. En Basic las ediciones usan créditos de tu plan, bastante menos que generar de cero. En Pro la edición de imágenes es sin límite: no te descuenta créditos.",
  },
  {
    q: "¿Cómo funcionan los créditos?",
    a: "Los créditos son la unidad con la que medimos todo lo que generás. Cada acción consume una cantidad distinta según lo que cuesta producirla: una imagen pesa mucho menos que un video, y editar cuesta bastante menos que generar de cero. Antes de confirmar cada generación te mostramos cuántos créditos usa, así siempre sabés en qué los estás gastando.",
  },
  {
    q: "¿Cuántas imágenes y videos puedo hacer por mes?",
    a: "Basic incluye 200 créditos por mes, que alcanzan para 15 videos más 30 imágenes. Pro incluye 400 créditos: 35 videos más 70 imágenes, y suma los modelos Pro de IA para video. Esa es una combinación de referencia, no un límite fijo: los créditos son tuyos y los repartís entre imágenes y videos como te sirva.",
  },
  {
    q: "¿Los créditos que no uso se acumulan para el mes siguiente?",
    a: "No. Los créditos corresponden al mes en curso y se renuevan enteros al empezar cada ciclo de facturación. Por eso conviene elegir el plan que se parezca a tu ritmo real de trabajo: si no estás seguro, escribinos por WhatsApp y te ayudamos a decidir.",
  },
  {
    q: "¿Qué pasa si una generación falla?",
    a: "No te cobramos los créditos. Si una imagen o un video falla por un problema técnico nuestro o de los modelos de IA, los créditos vuelven automáticamente a tu cuenta.",
  },
  {
    q: "¿Puedo cambiar de plan cuando quiera?",
    a: "Sí. Si pasás a un plan superior te acreditamos la diferencia de créditos prorrateada por los días que queden del mes. Si bajás de plan, el cambio se aplica al empezar el ciclo siguiente y mientras tanto conservás los créditos que ya tenías.",
  },
  {
    q: "¿En qué plataformas puedo publicar mis campañas?",
    a: "Hoy Postty publica en Meta Ads (Facebook e Instagram). Estamos integrando Google Ads para publicar campañas con las imágenes y videos generados por inteligencia artificial. TikTok llegará próximamente. En todos los casos, Postty conecta con tu cuenta publicitaria a través del proceso oficial de autorización (OAuth 2.0) — nunca almacenamos ni compartimos tus credenciales, y podés revocar el acceso cuando quieras desde tu cuenta.",
  },
];

/* Supported ad platforms (name, logo, live/"Próximamente" state and the
   OAuth copy the Google Ads review needs) now live with the section that
   renders them: src/components/AppsCarousel.tsx. */

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
  // CTA opens a carousel modal showing the brand's Postty-generated
  // content. `items` may be undefined/empty for brands whose content
  // isn't ready yet (Nüa as of now) — the button still renders but is
  // disabled.
  cta: { label: string; items?: readonly string[] };
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
    cta: {
      label: "Ver Ads",
      items: [
        "/ads/star/star-1.webp",
        "/ads/star/star-7.webp",
        "/ads/star/star-15.webp",
        "/ads/star/star-19.webp",
      ],
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
    cta: {
      label: "Ver Posts",
      items: [
        // nua-18 moved to first per request
        "/ads/nua/nua-18.webp",
        "/ads/nua/nua-8.webp",
        "/ads/nua/nua-11.webp",
        "/ads/nua/nua-13.webp",
        "/ads/nua/nua-15.webp",
      ],
    },
  },
];

const whatPosttyDoesItems: ReadonlyArray<{
  title: string;
  subtitle: string;
  video: string;
}> = [
  {
    title: "Contenido para redes",
    subtitle: "Todo el mes en 5 minutos, sin CM.",
    video: "/videos/feed.mp4",
  },
  {
    title: "Campañas de Meta",
    subtitle: "Ads profesionales, sin agencias.",
    video: "/videos/campagin.mp4",
  },
  {
    title: "Photoshoot de producto",
    subtitle: "Producciones sin estudio ni modelos.",
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
            <h3 className="font-heading text-center text-[1.65rem] font-semibold tracking-tight text-[#0D1522] sm:text-[2.05rem]">
              {item.title}
            </h3>
            <p className="mt-3 max-w-md text-balance text-center text-[0.95rem] leading-relaxed text-[#0D1522]/65 sm:text-[1.1rem]">
              {item.subtitle}
            </p>
            {/* Video — flex-1 fills whatever vertical space is left below
                the subtitle (no fixed aspect on the container). max-w shrunk
                another ~15% (310/375 → 265/320). Height area is unchanged
                because flex-1 still consumes the remaining tile height —
                only the phone's WIDTH gets narrower. */}
            <div className="relative mt-7 w-full max-w-[265px] flex-1 overflow-hidden sm:mt-9 sm:max-w-[320px]">
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
            alt="Tus findes así, sin gastar más tiempo y dinero en agencias y CMs que no suman"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover object-center"
            priority={false}
          />
          {/* Title — lowered to match the video tiles' pt-12/20, lighter
              weight (medium) per spec so it reads as editorial copy rather
              than a heading shout. */}
          <div className="absolute inset-x-0 top-12 px-4 sm:top-20 sm:px-8">
            <h3 className="font-heading mx-auto max-w-[26ch] text-balance text-center text-xl font-medium leading-tight tracking-tight text-[#0D1522] sm:text-2xl md:max-w-[40ch] md:text-3xl">
              Tus findes así, sin gastar más tiempo y dinero en agencias y CMs que no suman
            </h3>
          </div>
          {/* Glass CTA — vertically centered, with arrow that nudges right on
              hover. Same Pixel Lead event as before so attribution continues. */}
          <a
            href={appUrl}
            onClick={() => trackEvent("Lead", {
              content_name: "bento_quiero_probar",
              content_category: "trial_intent",
            })}
            className="group absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full border border-white/60 bg-white/30 px-7 py-3.5 text-base font-semibold text-[#0D1522] shadow-[0_4px_24px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:bg-white/50 hover:shadow-[0_10px_36px_rgba(13,21,34,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] hover:-translate-y-[calc(50%+2px)]"
          >
            Quiero probar
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

/**
 * BrandTestimonialsSection — testimonios (StarConcept + Nüa) cards plus
 * the eyebrow + heading. Lifted into its own component so we can host
 * the modal-open state at the section root (no need to extract a per-
 * card child or drill props into Home).
 *
 * Each card now exposes a glass "Ver Ads" / "Ver Posts" pill at the
 * top-right; clicking opens the BrandContentModal carousel for that
 * brand. Brands without `cta.items` show the pill in a disabled state
 * (visible but not clickable) — Nüa is the placeholder for now.
 */
function BrandTestimonialsSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const activeBrand = openIdx !== null ? brandTestimonials[openIdx] : null;
  const activeItems = activeBrand?.cta.items;

  return (
    <>
      <section id="testimonios" className="px-3 py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          {/* Eyebrow — Jakarta (body font), normal weight, regular case */}
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
            Los dueños suben contenido <span className="font-semibold">10x más rápido</span>
            <br className="hidden sm:block" />
            {" "}y su dinero invertido en Ads <span className="font-semibold">rinde 3x más</span> con <span className="font-semibold">Postty</span>
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 gap-3 md:mt-20 md:grid-cols-2">
            {brandTestimonials.map((brand, i) => {
              const hasContent = !!brand.cta.items && brand.cta.items.length > 0;
              return (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
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
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />

                  {/* Brand name — glass pill, top-left + parallax */}
                  <div
                    className="absolute left-5 top-5 z-10 rounded-xl bg-white/15 px-4 py-2.5 shadow-[0_8px_32px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150"
                    style={{ transform: "translate(var(--cx, 0px), var(--cy, 0px))", transition: "transform 0.3s ease-out" }}
                  >
                    <p className="font-heading text-sm font-medium leading-tight text-[#0D1522] sm:text-base">
                      {brand.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#0D1522]/60 sm:text-xs">
                      {brand.subtitle}
                    </p>
                  </div>

                  {/* "Ver Ads" / "Ver Posts" — glass pill, top-RIGHT.
                      Same glass language as the brand-name pill but a
                      touch more opaque (white/25 vs white/15) so it
                      reads as an action without being heavy. Parallax
                      pushes opposite to the brand pill (negative cx)
                      for the same subtle 3D feel.
                      Disabled when the brand has no content yet (Nüa).
                      Tracks ViewContent so we can measure interest. */}
                  <button
                    type="button"
                    disabled={!hasContent}
                    onClick={() => hasContent && setOpenIdx(i)}
                    className={`absolute right-5 top-5 z-10 rounded-xl border border-white/60 bg-white/25 px-4 py-2.5 font-heading text-sm font-medium text-[#0D1522] shadow-[0_8px_32px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition sm:text-base ${
                      hasContent
                        ? "cursor-pointer hover:bg-white/40"
                        : "cursor-not-allowed opacity-60"
                    }`}
                    style={{
                      transform: "translate(calc(var(--cx, 0px) * -1), var(--cy, 0px))",
                      transition: "transform 0.3s ease-out, background-color 0.2s ease",
                    }}
                    aria-label={hasContent ? `${brand.cta.label} de ${brand.name}` : `${brand.cta.label} — próximamente`}
                  >
                    {brand.cta.label}
                  </button>

                  {/* Hero metric — glass pill, anchored bottom-LEFT */}
                  <div
                    className="absolute bottom-3 left-3 z-10 rounded-xl bg-white/15 px-5 py-5 shadow-[0_8px_32px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150 sm:px-6 sm:py-6"
                    style={{
                      transform: "translate(calc(var(--cx, 0px) * -0.8), calc(var(--cy, 0px) * -0.6))",
                      transition: "transform 0.3s ease-out",
                    }}
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <p className="font-heading flex shrink-0 items-end text-6xl font-semibold leading-none tracking-tight text-[#0D1522] sm:text-7xl">
                        {brand.stat.value}
                        {brand.stat.suffix && (
                          <span className="font-heading ml-1.5 text-sm font-medium tracking-normal text-[#0D1522]/60 sm:text-base">
                            {brand.stat.suffix}
                          </span>
                        )}
                      </p>
                      <p className="text-lg font-medium leading-tight text-[#0D1522]/80 sm:text-2xl">
                        {brand.stat.label[0]}
                        <br />
                        {brand.stat.label[1]}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal — mounts/unmounts based on openIdx. AnimatePresence is
          inside the modal component itself (handles its own enter/exit). */}
      {activeBrand && activeItems && activeItems.length > 0 && (
        <BrandContentModal
          items={activeItems}
          brandName={activeBrand.name}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </>
  );
}

function PricingSection() {
  const [hoveredCard, setHoveredCard] = useState<"starter" | "basic" | "pro" | null>("basic");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  // Whether the user already claimed their gift via the GiftOverlay.
  // Cards only show their OFF pill + strikethrough when this is true;
  // otherwise they render the plain list price.
  const giftDiscountApplied = useGiftDiscount();
  // Confetti fires the instant the GiftOverlay closes (X, ESC, Cerrar link).
  // Origin = the Basic "50% OFF" pill, because the gift now grants Basic's
  // discount and that is what the overlay announces. Watching overlayClosed
  // instead of giftDiscountApplied is important: the discount is applied the
  // moment the overlay OPENS (so the pill is already visible "underneath"),
  // but the user can't see the confetti while the overlay covers the page.
  const giftOverlayClosed = useGiftOverlayClosed();
  const giftBadgeRef = useRef<HTMLDivElement>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!giftOverlayClosed || !giftDiscountApplied) return;
    try {
      if (sessionStorage.getItem("postty_gift_confetti_fired") === "1") return;
    } catch { /* ignore */ }
    // Small delay so the overlay's exit animation can finish and the
    // pricing cards are fully visible before the confetti pops.
    const t = window.setTimeout(() => {
      const el = giftBadgeRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setConfettiOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      setConfettiOn(true);
      try { sessionStorage.setItem("postty_gift_confetti_fired", "1"); } catch { /* ignore */ }
      window.setTimeout(() => setConfettiOn(false), 2200);
    }, 200);
    return () => window.clearTimeout(t);
  }, [giftOverlayClosed, giftDiscountApplied]);
  const sectionRef = useRef<HTMLElement>(null);
  const appUrl = useAppUrl();

  // Deep-links for the Basic/Pro cards → app auto-fires the MP checkout for
  // this plan + the selected billing period. The landing toggle says
  // "monthly" | "yearly"; the app expects "monthly" | "annual".
  const checkoutPeriod = billing === "yearly" ? "annual" : "monthly";
  const basicCheckoutUrl = useCheckoutUrl("basic", checkoutPeriod);
  const proCheckoutUrl = useCheckoutUrl("pro", checkoutPeriod);

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

  const starterFeatures = [
    "6 ads o posts de prueba",
    "Generados con tu marca real",
    "Sin tarjeta de crédito",
  ];

  /* The credit allowance is rendered as one bundle: the total, then the two
     things it buys joined by a "+". Deliberately unqualified — no "terminadas",
     no per-video duration — these are the marketing figures Juan set for the
     e-commerce repositioning. Note they run ahead of the credit table in
     Postty-Prod (CREDITS_PER_IMAGE=2, CREDITS_PER_VIDEO_SECOND=3) and ahead of
     the T&C, which still declare 1 and 4 videos (TermsContent §4.2/§4.3), as
     does FAQ "¿Cuántas imágenes y videos puedo hacer por mes?" below. */
  const basicCredits = {
    total: "200 créditos por mes equivalentes a:",
    videos: "15 videos",
    images: "30 imágenes",
  };

  const proCredits = {
    total: "400 créditos por mes equivalentes a:",
    videos: "35 videos",
    images: "70 imágenes",
  };

  const basicFeatures = [
    "Publicación automática en Instagram y Meta",
    "Edición de imágenes y videos",
    "Optimización de campañas de Meta",
    "Soporte técnico",
  ];

  /* Pro reads as a delta on top of Basic (see the "Todo lo de Basic, más:"
     label above the list), so it only carries what Basic does not. */
  const proFeatures = [
    "Modelos Pro de IA para video",
    "Edición de imágenes sin límite",
    "Soporte prioritario",
  ];

  /* Pricing in one place. It used to be eight loose inline ternaries, which
     let the strikethroughs drift: they were hardcoded to the monthly list
     price and ignored the billing toggle entirely, so "Anual" crossed out a
     monthly number.

     What the user PAYS is unchanged. The list prices are the anchor, chosen
     so Basic wins on both axes a buyer actually compares — the percentage
     (50 vs 30) and the pesos saved ($70.000 vs $56.000). Previously Pro's
     60% off $324.900 read as a $195.000 saving against Basic's $18.000, which
     is why every visitor was funnelled to Pro.

     Nothing here is visible until the gift is claimed; before that each card
     shows `list` with no pill and no strikethrough. */
  const PLANS = {
    basic: {
      monthly: { list: "$139.900", pay: "$69.900", listValue: 139900, payValue: 69900 },
      yearly: { list: "$122.900", pay: "$61.500", listValue: 122900, payValue: 61500 },
      off: "50% OFF",
    },
    pro: {
      monthly: { list: "$185.900", pay: "$129.900", listValue: 185900, payValue: 129900 },
      yearly: { list: "$139.900", pay: "$97.900", listValue: 139900, payValue: 97900 },
      off: "30% OFF",
    },
  } as const;

  const basicPrice = PLANS.basic[billing];
  const proPrice = PLANS.pro[billing];

  const activeCard = hoveredCard ?? "basic";

  return (
    <section ref={sectionRef} id="pricing" className="px-3 py-24 sm:px-4 lg:px-6">
      {/* Confetti that bursts from the Basic "50% OFF" pill when the
          gift discount lands. Same animation as the GiftOverlay's
          "Ver regalo" burst — just centered on the pill instead of
          the viewport center. */}
      {confettiOn && (
        <Confetti originX={confettiOrigin.x} originY={confettiOrigin.y} />
      )}
      <div className="mx-auto max-w-[1360px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-semibold sm:text-4xl md:text-5xl"
        >
          Precios simples
        </motion.h2>

        {/* Billing toggle — single pill container holding both options.
            A white-glass thumb slides between them using framer-motion's
            shared layoutId, so toggling looks like an iOS segmented control. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 flex justify-center"
        >
          <div className="inline-flex items-center rounded-full bg-[#0D1522]/[0.05] p-1">
            {(["monthly", "yearly"] as const).map((option) => {
              const selected = billing === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBilling(option)}
                  className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:text-base ${
                    selected ? "text-[#0D1522]" : "text-[#0D1522]/55 hover:text-[#0D1522]/80"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="billing-thumb"
                      // pointer-events-none is load-bearing, not hygiene. The
                      // thumb is `absolute inset-0` INSIDE the selected button,
                      // and layoutId drives it with a transform — so while it
                      // slides (and at rest, if projection measures before
                      // hydration settles) it can sit over the OTHER button.
                      // A click there hits the thumb, which belongs to the
                      // already-selected button, so the toggle looked frozen
                      // on "Mensual" and never switched.
                      className="pointer-events-none absolute inset-0 rounded-full border border-white/60 bg-white/70 shadow-[0_4px_16px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-150"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{option === "monthly" ? "Mensual" : "Anual"}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Three cards since the Agencia plan came out (parked in
            _extras/AgencyPlanCard.tsx), which leaves Basic in the centre with no
            reordering. Grid uses items-start so per-card lg:mt-X offsets stagger
            vertically: Gratis + Pro sit lower, Basic sits above them so it reads
            as the recommended plan without needing a "Recommended" tag. */}
        <div className="relative mx-auto mt-16 grid items-start gap-[1.5rem] lg:max-w-[1200px] lg:grid-cols-3">
          {/* ── Starter (Gratis) Card ─────────────────────────────────────
              Free tier, glass-on-light, neutral palette. */}
          <div
            className="relative self-start lg:mt-14"
            onMouseEnter={() => setHoveredCard("starter")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              animate={{ y: activeCard === "starter" ? 0 : 50, opacity: activeCard === "starter" ? 1 : 0 }}
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
              transition={{ duration: 0.5 }}
              className="relative z-10 rounded-3xl border border-white/70 bg-white/55 p-[1.53rem] shadow-[0_4px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            >
              <h3 className="font-heading text-[2rem] font-medium text-[#0D1522]">Gratis</h3>

              <div className="mt-[2rem] flex items-baseline gap-2">
                <span className="font-heading text-[2.55rem] font-semibold tracking-tight text-[#0D1522]">$0.00</span>
              </div>

              <p className="mt-3 text-[0.78rem] leading-relaxed text-[#0D1522]/65">
                Mirá qué genera con tu marca antes de pagar nada
              </p>

              <a
                href={appUrl}
                onClick={() => trackEvent("Lead", {
                  content_name: "pricing_starter_trial",
                  content_category: "trial_intent",
                })}
                className="mt-6 block w-full rounded-full bg-[#0D1522]/[0.06] py-[0.66rem] text-center text-[0.78rem] font-semibold text-[#0D1522] transition hover:bg-[#0D1522]/[0.10]"
              >
                Probar gratis
              </a>

              <div className="mt-6 rounded-2xl border border-white/60 bg-white/40 p-[0.94rem] backdrop-blur-md">
                {starterFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-[0.6rem] ${
                      i < starterFeatures.length - 1 ? "border-b border-[#0D1522]/[0.06]" : ""
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

          {/* ── Basic Card ─────────────────────────────────────────────────
              The highlighted plan: solid blue gradient, sits higher in the grid,
              and is the default active card — so it reads as the recommended one
              without needing a "Recomendado" tag. Pro used to carry this exact
              treatment; the two were swapped when the page repositioned onto
              e-commerce, where a single store belongs in Basic and Pro becomes
              the multi-brand upsell. */}
          <div
            className="relative self-start lg:mt-2"
            onMouseEnter={() => setHoveredCard("basic")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Mascot — pops up when this card is the active one */}
            <motion.div
              animate={{ y: activeCard === "basic" ? 0 : 50, opacity: activeCard === "basic" ? 1 : 0 }}
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
              transition={{ duration: 0.5 }}
              className="relative z-10 rounded-3xl p-[1.53rem] text-white shadow-[0_12px_40px_rgba(24,129,241,0.35)]"
              style={{ background: "linear-gradient(160deg, #1881F1, #49D3F8)" }}
            >
              {/* Discount pill — tilted, hanging off the top-right corner.
                  The card deliberately has no overflow-hidden, or this would be
                  clipped. Only renders once the gift is claimed, and doubles as
                  the confetti origin (giftBadgeRef). */}
              {/* Discount and deadline in ONE tilted badge hanging off the
                  corner: the offer and its expiry are a single fact, and two
                  separate chips made the corner look cluttered. Absolute, so
                  it never pushes the card's content down. The card has no
                  overflow-hidden on purpose, or this would be clipped. */}
              {giftDiscountApplied && (
                <div
                  ref={giftBadgeRef}
                  className="absolute -right-3.5 -top-5 z-20 flex rotate-12 flex-col items-center gap-[0.3rem] rounded-2xl px-[1.05rem] py-[0.62rem] leading-none shadow-[0_8px_26px_rgba(181,255,0,0.55)]"
                  style={{ background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
                >
                  <span className="font-heading text-[1.15rem] font-bold text-[#0D1522]">{PLANS.basic.off}</span>
                  <span className="h-px w-full bg-[#0D1522]/15" aria-hidden="true" />
                  <span className="text-[#0D1522]">
                    <GiftCountdown bare />
                  </span>
                </div>
              )}

              <h3 className="font-heading text-[2rem] font-medium text-white">Basic</h3>

              {/* Price — strikethrough + discounted only once the gift is
                  claimed. Both figures follow the billing toggle (they did not
                  before: the strikethrough was hardcoded to the monthly list). */}
              <div className="mt-2">
                {giftDiscountApplied && (
                  <div className="text-[1.12rem] font-semibold text-white/65 line-through decoration-2 decoration-white/75">
                    {basicPrice.list}
                  </div>
                )}
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className="font-heading text-[2.55rem] font-semibold tracking-tight"
                    style={{
                      background: "linear-gradient(135deg, #b5ff00, #eeff64)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {giftDiscountApplied ? basicPrice.pay : basicPrice.list}
                  </span>
                  <span className="text-[0.78rem] font-medium text-white/65">/mes</span>
                </div>
              </div>

              <p className="mt-3 text-[0.78rem] leading-relaxed text-white/85">
                Tu e-commerce, sin agencia ni community manager
              </p>

              {/* CTA — chartreuse, the only colored CTA in the grid */}
              <a
                href={basicCheckoutUrl}
                onClick={() => trackEvent("Lead", {
                  content_name: "pricing_basic_checkout",
                  content_category: "checkout_intent",
                  content_ids: ["plan_basic"],
                  content_type: "product",
                  value: giftDiscountApplied ? basicPrice.payValue : basicPrice.listValue,
                  currency: "ARS",
                })}
                className="mt-6 block w-full rounded-full py-[0.66rem] text-center text-[0.78rem] font-semibold text-[#0D1522] transition hover:shadow-lg hover:brightness-105"
                style={{ background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
              >
                Empezar ahora
              </a>

              {/* Credits — its own glass block. No tick here: an allowance
                  is a quantity, not a yes/no feature like the bullets below. */}
              <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-[0.94rem] backdrop-blur-md">
                <p className="text-center text-[0.78rem] font-medium text-white/90">{basicCredits.total}</p>
                {/* Two columns joined by a "+": the allowance is one bundle
                    the user gets in full, not a choice between two options. */}
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-x-2.5">
                  <div className="flex flex-col items-center text-center text-white">
                    <VideoIcon className="size-[18px]" />
                    <p className="mt-1.5 font-heading text-[0.82rem] font-semibold leading-snug">
                      {basicCredits.videos}
                    </p>
                  </div>
                  <span className="font-heading text-[1.1rem] font-semibold text-white/60">+</span>
                  <div className="flex flex-col items-center text-center text-white">
                    <ImageIcon className="size-[18px]" />
                    <p className="mt-1.5 font-heading text-[0.82rem] font-semibold leading-snug">
                      {basicCredits.images}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature list */}
              <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 p-[0.94rem] backdrop-blur-md">
                {basicFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-[0.6rem] ${
                      i < basicFeatures.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <span className="text-[0.78rem] font-medium text-white/90">{feat}</span>
                    <div className="flex h-[1.15rem] w-[1.15rem] items-center justify-center rounded-full bg-[#D6F951]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Pro Card ───────────────────────────────────────────────────
              Glass-on-light. Pro is the multi-brand / high-volume upsell now,
              not the default — Basic carries the vivid treatment. */}
          <div
            className="relative self-start lg:mt-14"
            onMouseEnter={() => setHoveredCard("pro")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              animate={{ y: activeCard === "pro" ? 0 : 50, opacity: activeCard === "pro" ? 1 : 0 }}
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
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 rounded-3xl border border-white/70 bg-white/55 p-[1.53rem] shadow-[0_4px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            >
              {/* Same tilted pill as Basic, in glass instead of chartreuse —
                  Basic must stay the louder discount of the two. */}
              {/* Same badge in white glass — Basic must stay the louder of
                  the two discounts. */}
              {giftDiscountApplied && (
                <div className="absolute -right-3.5 -top-5 z-20 flex rotate-12 flex-col items-center gap-[0.3rem] rounded-2xl border border-white/80 bg-white/90 px-[1.05rem] py-[0.62rem] leading-none shadow-[0_6px_20px_rgba(13,21,34,0.14)] backdrop-blur-md">
                  <span className="font-heading text-[1.15rem] font-bold text-[#0D1522]/70">{PLANS.pro.off}</span>
                  <span className="h-px w-full bg-[#0D1522]/12" aria-hidden="true" />
                  <span className="text-[#0D1522]/70">
                    <GiftCountdown bare />
                  </span>
                </div>
              )}

              <h3 className="font-heading text-[2rem] font-medium text-[#0D1522]">Pro</h3>

              <div className="mt-2">
                {giftDiscountApplied && (
                  <div className="text-[1.12rem] font-semibold text-[#0D1522]/45 line-through decoration-2 decoration-[#0D1522]/45">
                    {proPrice.list}
                  </div>
                )}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-[2.55rem] font-semibold tracking-tight text-[#0D1522]">
                    {giftDiscountApplied ? proPrice.pay : proPrice.list}
                  </span>
                  <span className="text-[0.78rem] font-medium text-[#0D1522]/50">/mes</span>
                </div>
              </div>

              <p className="mt-3 text-[0.78rem] leading-relaxed text-[#0D1522]/65">
                Para cuando necesitás el doble de volumen y los mejores modelos de video
              </p>

              <a
                href={proCheckoutUrl}
                onClick={() => trackEvent("Lead", {
                  content_name: "pricing_pro_checkout",
                  content_category: "checkout_intent",
                  content_ids: ["plan_pro"],
                  content_type: "product",
                  value: giftDiscountApplied ? proPrice.payValue : proPrice.listValue,
                  currency: "ARS",
                })}
                className="mt-6 block w-full rounded-full bg-[#0D1522]/[0.06] py-[0.66rem] text-center text-[0.78rem] font-semibold text-[#0D1522] transition hover:bg-[#0D1522]/[0.10]"
              >
                Convertirme en Pro
              </a>

              {/* Credits — its own glass block. No tick here: an allowance
                  is a quantity, not a yes/no feature like the bullets below. */}
              <div className="mt-6 rounded-2xl border border-white/60 bg-white/40 p-[0.94rem] backdrop-blur-md">
                <p className="text-center text-[0.78rem] font-medium text-[#0D1522]/75">{proCredits.total}</p>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-x-2.5">
                  <div className="flex flex-col items-center text-center text-[#0D1522]">
                    <VideoIcon className="size-[18px]" />
                    <p className="mt-1.5 font-heading text-[0.82rem] font-semibold leading-snug">
                      {proCredits.videos}
                    </p>
                  </div>
                  <span className="font-heading text-[1.1rem] font-semibold text-[#0D1522]/45">+</span>
                  <div className="flex flex-col items-center text-center text-[#0D1522]">
                    <ImageIcon className="size-[18px]" />
                    <p className="mt-1.5 font-heading text-[0.82rem] font-semibold leading-snug">
                      {proCredits.images}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature list — Pro is a delta on Basic, so it is labelled as
                  one instead of repeating the four Basic rows. */}
              <div className="mt-3 rounded-2xl border border-white/60 bg-white/40 p-[0.94rem] backdrop-blur-md">
                <p className="pb-[0.55rem] text-[0.78rem] font-semibold text-[#0D1522]/55">
                  Todo lo de Basic, más:
                </p>
                {proFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-[0.6rem] ${
                      i < proFeatures.length - 1 ? "border-b border-[#0D1522]/[0.06]" : ""
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
        </div>

        {/* Plan-picker escape hatch — glass pill, same language as the
            header circles. Goes to the business WhatsApp. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto mt-9 flex items-center gap-4 sm:gap-6 lg:max-w-[1200px]"
        >
          {/* Hairlines fade to transparent at the outer edges so this reads as
              a divider the pill sits on, not a boxed-in bar. */}
          <span
            aria-hidden="true"
            className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-[#0D1522]/[0.11] sm:block"
          />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("Lead", { content_name: "pricing_whatsapp_help", content_category: "contacto_whatsapp" })}
            className="mx-auto inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/70 bg-white/45 px-5 py-[0.6rem] text-sm font-medium text-[#0D1522] shadow-[0_2px_12px_rgba(13,21,34,0.05),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/65 hover:shadow-[0_6px_20px_rgba(13,21,34,0.09),inset_0_1px_0_rgba(255,255,255,0.8)] sm:mx-0 sm:text-base"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
            </svg>
            <span>
              ¿No sabés qué plan te conviene?{" "}
              <span className="font-semibold">Contactanos</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </a>
          <span
            aria-hidden="true"
            className="hidden h-px flex-1 bg-gradient-to-l from-transparent to-[#0D1522]/[0.11] sm:block"
          />
        </motion.div>
      </div>
    </section>
  );
}

function BusinessTypesSection() {
  return (
    <section className="overflow-hidden px-4 py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl">
        {/* Pill field — staggered rows, alternating offsets. Rows are wider
            than the viewport on purpose so the field bleeds past both edges
            and reads as a crowd rather than a list. */}
        <div
          aria-hidden="true"
          className="flex flex-col items-center gap-2.5 sm:gap-3"
        >
          {businessRows.map((row, r) => (
            <div
              key={r}
              className="flex shrink-0 gap-2.5 sm:gap-3"
              /* Alternating nudge, deterministic per row — no randomness, so
                 SSR and client agree. */
              style={{ transform: `translateX(${(r % 2 === 0 ? -1 : 1) * (18 + (r % 3) * 22)}px)` }}
            >
              {row.map((biz) => (
                <div
                  key={biz.name}
                  className="group flex shrink-0 cursor-default items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-2.5 shadow-[0_6px_24px_rgba(13,21,34,0.07),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-xl backdrop-saturate-150 transition duration-300 ease-out hover:scale-[1.14] hover:bg-white/80 hover:shadow-[0_12px_36px_rgba(13,21,34,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] sm:gap-2.5 sm:px-5 sm:py-3"
                >
                  <span className="text-base leading-none sm:text-lg">{biz.emoji}</span>
                  <span className="whitespace-nowrap text-xs font-medium text-[#0D1522]/70 transition-colors duration-300 group-hover:text-[#0D1522] sm:text-[15px]">
                    {biz.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Headline — floats over the field. The radial wash behind it is
            what keeps it readable: it fades the pills out toward the centre
            instead of dimming the whole field. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 38% at 50% 50%, var(--background) 42%, color-mix(in srgb, var(--background) 88%, transparent) 68%, transparent 100%)",
            }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading relative text-center text-3xl font-semibold leading-tight tracking-tight text-[#0D1522] sm:text-5xl md:text-6xl"
          >
            Hecho para marcas
            <br />
            que ya venden
          </motion.h2>
        </div>
      </div>
    </section>
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
              <h2 className="font-heading text-lg font-semibold text-[#0D1522]">{title}</h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#0D1522]/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D1522" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: "calc(85vh - 65px)" }}>
              <div className="prose prose-sm max-w-none text-[#0D1522]/80 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#0D1522] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-[#0D1522] [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-[#0D1522] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_p]:mb-3 [&_a]:text-[#1881F1] [&_a]:underline">
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
      {/* Full-screen 3-step lead-capture overlay. Triggers once per session
          when the user scrolls into #testimonios. */}
      <GiftOverlay />
      <GiftTeaser />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
        {/* Layer 1: Pill (visible when not scrolled).
            On MOBILE the scroll-based fade/scale/blur is disabled —
            the pill stays mounted at full opacity through the whole
            page (sm+ keeps the original swap behaviour). */}
        <motion.header
          animate={{
            opacity: scrolled && !isMobile ? 0 : 1,
            scale: scrolled && !isMobile ? 0.95 : 1,
            y: scrolled && !isMobile ? -8 : 0,
            filter: scrolled && !isMobile ? "blur(6px)" : "blur(0px)",
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className={`mx-auto flex w-fit items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl backdrop-saturate-150 ${
            scrolled && !isMobile ? "pointer-events-none" : ""
          }`}
        >
          <a href="#" className="font-heading text-lg font-extrabold tracking-[-0.08em] text-[#0D1522]">
            Postty
          </a>
          {/* Nav links — desktop only (mobile pill just shows brand +
              WhatsApp + Iniciar sesión for compactness). */}
          <nav className="hidden items-center gap-5 text-sm text-[#0D1522]/70 md:flex">
            <a href="#como-funciona" className="whitespace-nowrap transition hover:text-[#0D1522]">Cómo funciona</a>
            <a href="#pricing" className="whitespace-nowrap transition hover:text-[#0D1522]">Precios</a>
          </nav>
          {/* WhatsApp glass circle — moved OUT of the desktop-only nav
              so it shows on every viewport, sitting between the brand
              and the Iniciar sesión pill. Icon is dark (matches the
              neutral pill copy); hero CTA keeps the green brand color. */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            onClick={() => trackEvent("Lead", { content_name: "header_whatsapp", content_category: "contacto_whatsapp" })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:bg-white/25"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0D1522" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
            </svg>
          </a>
          <a href={appUrl} className="inline-flex h-9 shrink-0 items-center justify-center rounded-full leading-none bg-white/15 px-5 text-sm font-medium text-[#0D1522] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:bg-white/25">
            Iniciar sesión
          </a>
        </motion.header>

        {/* Layer 2: Split — mascot left, CTA right (visible on scroll).
            Desktop-only: on mobile the pill above stays mounted at all
            times, so this layer would just stack on top of it. */}
        <motion.div
          animate={{
            opacity: scrolled && !isMobile ? 1 : 0,
            filter: scrolled && !isMobile ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute left-4 right-4 top-4 hidden items-center justify-between md:flex sm:left-6 sm:right-6 ${
            scrolled && !isMobile ? "" : "pointer-events-none"
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
          {/* Right side of the scrolled header — WhatsApp circle + Iniciar
              sesión pill, animated together as a group. Same standalone
              glass treatment as before (collapses the layered pill effect
              into one button since there's no parent pill in scroll mode). */}
          <motion.div
            animate={{
              x: scrolled ? 0 : -120,
              scale: scrolled ? 1 : 0.7,
            }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2"
          >
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              onClick={() => trackEvent("Lead", { content_name: "header_whatsapp_scrolled", content_category: "contacto_whatsapp" })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl backdrop-saturate-150 transition hover:bg-white/40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0D1522" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
              </svg>
            </a>
            <a
              href={appUrl}
              className="inline-flex h-9 items-center justify-center rounded-full bg-white/25 px-5 text-sm font-medium text-[#0D1522] shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl backdrop-saturate-150 transition hover:bg-white/40"
            >
              Iniciar sesión
            </a>
          </motion.div>
        </motion.div>
      </div>

      <main className="flex-1 md:flex-initial">
      {/* ── Hero ── */}
      <section className="relative h-screen overflow-hidden bg-black">
        {/* SEO-critical H1: visually represented by the hero video.
            Keywords: agente, marketing, IA, contenido, ads, Meta. */}
        <h1 className="sr-only">
          Postty — Agente de marketing con IA para e-commerce: crea contenido y ads para Meta y Google en 5 minutos
        </h1>
        {isMobile !== null && (
          <video
            key={isMobile ? "mobile" : "desktop"}
            src={isMobile ? "/hero-mobile.mp4" : "/hero.mp4"}
            /* Poster = the video's OWN closing frame, the one carrying "En
               2026, dejale el marketing a Postty." Two reasons it's that
               frame and not a designed image: it's the payoff, so ad traffic
               reads the promise on the first pixel instead of the sepia
               opening shot; and it's the same set and person as the video,
               so there's no visual jump when playback finally starts.
               Matters most inside the Instagram in-app browser, where a
               3 MB video on mobile data takes seconds to buffer. */
            poster={isMobile ? "/hero-poster-mobile.webp" : "/hero-poster.webp"}
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              if (video.currentTime >= 11 && !showHeroCTA) {
                setShowHeroCTA(true);
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

        <AnimatePresence>
          {showHeroCTA && (
            <motion.div
              initial={{ y: 40, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="pointer-events-none absolute inset-x-0 bottom-[16%] flex flex-col-reverse items-center justify-center gap-2 sm:flex-row sm:gap-3 md:bottom-[36%]"
            >
              {/* Secondary CTA — WhatsApp. Same glass language as the
                  primary so they read as a pair, slightly less horizontal
                  padding so "Probar gratis" remains the visual anchor.
                  Icon in WhatsApp brand green (#25D366). target=_blank
                  + noopener since it leaves the site. */}
              <motion.a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Lead", { content_name: "hero_cta_whatsapp", content_category: "contacto_whatsapp" })}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-[18px] text-lg font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[6px] sm:px-7"
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 340, damping: 22 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                </svg>
                WhatsApp
              </motion.a>

              {/* Primary CTA — unchanged */}
              <motion.a
                href={appUrl}
                onClick={() => trackEvent("Lead", { content_name: "hero_cta_probar_gratis", content_category: "trial_intent" })}
                className="group pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-white/15 px-10 py-[18px] text-lg font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[6px]"
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 340, damping: 22 }}
              >
                Probar gratis
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 ease-out group-hover:translate-x-[2px]"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Problem cards removed — archived in src/components/_extras/ProblemCardsStack.tsx */}

      {/* ── Qué hace Postty ── */}
      <WhatPosttyDoesSection />

      {/* Lluvia de creativos — 3D sphere. Replaced BrandTestimonialsSection
          (StarConcept + Nüa), which stays defined above in case we bring
          testimonials back. */}
      <CreativeSphereSection />

      {/* ── How it works ──
          Flow diagram: connected platforms ride into the glass card, the
          generated formats ride back out. The previous three-card version
          is archived at _extras/HowItWorksCardsSection.tsx. */}
      <HowItWorksFlow />


      {/* ── Plataformas soportadas ──
          Multi-canal positioning for the Google Ads review: makes explicit that
          Postty connects to ad accounts via OAuth, and declares which
          integrations are live vs "Próximamente". Sits above Pricing so it's
          visible without excessive scroll (a review gate). The previous
          4-card grid is archived at _extras/PlatformCardsSection.tsx. */}
      <AppsCarousel />

      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── Business types ── */}
      <BusinessTypesSection />

      {/* ── Tu equipo / ¿Por qué Postty? ──
          One white glass card per person: framed photo on top (name + role
          over a bottom gradient, the whole photo links to their LinkedIn)
          and that person's quote underneath, on the same card. Replaced a
          staggered grid that split each person across a photo cell and a
          separate grey quote cell. */}
      <section id="equipo" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          {/* Same rhythm as the other sections: bold heading first, lighter
              line underneath. */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
          >
            ¿Por qué Postty?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-3 text-center text-base font-normal text-[#0D1522]/55 sm:text-lg"
          >
            Tu equipo
          </motion.p>

          <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-6 md:mt-14 md:max-w-none md:grid-cols-3">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={`flex flex-col rounded-3xl border border-white/70 bg-white/75 p-3 shadow-[0_10px_40px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl backdrop-saturate-150 ${
                  member.role === "CEO" ? "order-first md:order-none" : ""
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 33vw"
                    // scale-[2] zooms 2× from the center; translate-x nudges
                    // Juan + Dari to the right so their bodies are better
                    // centered after the 2x crop.
                    className={`scale-[2] object-cover ${
                      member.name === "Dario Soria"
                        ? "translate-x-10"
                        : member.name === "Juan Beines"
                          ? "translate-x-3"
                          : ""
                    }`}
                  />
                  {/* Black bottom gradient — concentrated in the bottom ~30%
                      so the name stays readable and most of the photo does
                      not get muddied. */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0) 32%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-heading text-xl font-medium leading-tight text-white sm:text-2xl">
                      {member.name}
                    </p>
                    <p className="mt-1 font-heading text-base font-normal leading-tight text-white/80">
                      {member.role}
                    </p>
                  </div>
                  {/* Invisible full-photo link to the member's LinkedIn. */}
                  <a
                    href={member.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name}`}
                    className="absolute inset-0 z-10 cursor-pointer"
                  />
                </div>

                <p className="px-3 pb-3 pt-5 text-sm leading-relaxed text-[#0D1522]/85 sm:text-[15px]">
                  &ldquo;{member.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>

          {/* Instagram handle — centred under the grid, which puts it directly
              below Juan's card on desktop (he holds the middle column). Same
              glass pill language as the WhatsApp one under pricing.
              Deliberately untracked: a social follow is not a Lead, and firing
              one here would dilute the Lead signal Meta optimises against. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <a
              href="https://www.instagram.com/posttyai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/45 px-5 py-[0.6rem] text-sm font-medium text-[#0D1522] shadow-[0_2px_12px_rgba(13,21,34,0.05),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/65 hover:shadow-[0_6px_20px_rgba(13,21,34,0.09),inset_0_1px_0_rgba(255,255,255,0.8)] sm:text-base"
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="url(#ig-gradient)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ig-gradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFD521" />
                    <stop offset="30%" stopColor="#F50000" />
                    <stop offset="62%" stopColor="#B900B4" />
                    <stop offset="100%" stopColor="#4C68D7" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5.5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                <path d="M17.5 6.5h.01" />
              </svg>
              <span className="font-semibold">@posttyai</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-3xl font-semibold sm:text-4xl">Preguntas frecuentes</h2>
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
            <h2 className="font-heading text-xl font-semibold text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)] sm:text-2xl md:text-3xl lg:text-4xl">
              ¿Listo para dejar de pagar una agencia?
            </h2>
            <div className="mt-5">
              <motion.a
                href={appUrl}
                onClick={() => trackEvent("Lead", { content_name: "final_cta_empezar_gratis", content_category: "trial_intent" })}
                className="group inline-flex items-center gap-2 rounded-full bg-white/15 px-8 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[6px]"
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
            {/* Contact pills — glass, stacked, same language as the ones
                under pricing and the team grid. Both are brand-coloured icon
                + label; the footer versions are sized down to meta scale.
                items-start so each pill hugs its own label instead of
                stretching to the column width. */}
            <div className="mt-3 flex flex-col items-start gap-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Lead", { content_name: "footer_whatsapp", content_category: "contacto_whatsapp" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-sm font-medium text-[#0D1522] shadow-[0_2px_12px_rgba(13,21,34,0.05),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/65 hover:shadow-[0_6px_20px_rgba(13,21,34,0.09),inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                </svg>
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/posttyai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-sm font-medium text-[#0D1522] shadow-[0_2px_12px_rgba(13,21,34,0.05),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/65 hover:shadow-[0_6px_20px_rgba(13,21,34,0.09),inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="url(#ig-gradient-footer)" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ig-gradient-footer" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFD521" />
                      <stop offset="30%" stopColor="#F50000" />
                      <stop offset="62%" stopColor="#B900B4" />
                      <stop offset="100%" stopColor="#4C68D7" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5.5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                  <path d="M17.5 6.5h.01" />
                </svg>
                @posttyai
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-10 text-sm">
            <div>
              <p className="mb-2 font-medium text-[#0D1522]/40">Legal</p>
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
              <p className="mb-2 font-medium text-[#0D1522]/40">Empresa</p>
              <a href="#como-funciona" className="block text-[#0D1522]/60 transition hover:text-[#0D1522]">Cómo funciona</a>
            </div>
            <div>
              <p className="mb-2 font-medium text-[#0D1522]/40">Recursos</p>
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
