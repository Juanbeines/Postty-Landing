"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import PrivacyContent from "@/components/legal/PrivacyContent";
import TermsContent from "@/components/legal/TermsContent";
import GiftOverlay from "@/components/GiftOverlay";
import BrandContentModal from "@/components/BrandContentModal";
import Confetti from "@/components/Confetti";
import { trackEvent, useAppUrl, useCheckoutUrl } from "@/lib/pixel";
import { useGiftDiscount, useGiftOverlayClosed } from "@/lib/giftDiscount";
import { WHATSAPP_URL } from "@/lib/whatsapp";

// Agencia "Agendar reunión" opens this Calendly booking page in a new tab,
// mirroring the in-app /trial pricing modal (TrialPricingModal.tsx).
const AGENCY_CALENDLY = "https://calendly.com/soporte-posttyai/30min";

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
    text: "Postty genera +100 imágenes de contenido y Ads profesionales",
  },
  {
    num: "3",
    icon: "/step-3.webp",
    text: "Postty publica y optimiza tus campañas en Meta Ads y Google Ads",
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
  {
    q: "¿En qué plataformas puedo publicar mis campañas?",
    a: "Hoy Postty publica en Meta Ads (Facebook e Instagram). Estamos integrando Google Ads para publicar campañas con las imágenes y videos generados por inteligencia artificial. TikTok llegará próximamente. En todos los casos, Postty conecta con tu cuenta publicitaria a través del proceso oficial de autorización (OAuth 2.0) — nunca almacenamos ni compartimos tus credenciales, y podés revocar el acceso cuando quieras desde tu cuenta.",
  },
];

/**
 * Supported ad platforms — multi-canal positioning required for the Google Ads
 * developer-token review. `live` drives the badge style: Meta is available
 * today; Google + TikTok are "Próximamente" (honest declarative state Google
 * asks for on pre-launch integrations).
 */
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

/**
 * Brand logos for the platform cards. Official full-color SVGs live in
 * /public/logos and render with object-contain so each keeps its native
 * aspect ratio inside the square tile.
 */
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
            Los dueños suben contenido <span className="font-black">10x más rápido</span>
            <br className="hidden sm:block" />
            {" "}y su dinero invertido en Ads <span className="font-black">rinde 3x más</span> con <span className="font-black">Postty</span>
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
                    <p className="font-heading text-sm font-bold leading-tight text-[#0D1522] sm:text-base">
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
                    className={`absolute right-5 top-5 z-10 rounded-xl border border-white/60 bg-white/25 px-4 py-2.5 font-heading text-sm font-bold text-[#0D1522] shadow-[0_8px_32px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition sm:text-base ${
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
                      <p className="font-heading flex shrink-0 items-end text-6xl font-black leading-none tracking-tight text-[#0D1522] sm:text-7xl">
                        {brand.stat.value}
                        {brand.stat.suffix && (
                          <span className="font-heading ml-1.5 text-sm font-bold tracking-normal text-[#0D1522]/60 sm:text-base">
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
  const [hoveredCard, setHoveredCard] = useState<"starter" | "basic" | "pro" | "agency" | null>("pro");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  // Whether the user already claimed their gift via the GiftOverlay.
  // The Pro card only shows the 60% OFF badge + strikethrough when this
  // is true; otherwise it renders the plain undiscounted price.
  const giftDiscountApplied = useGiftDiscount();
  // Confetti fires the instant the GiftOverlay closes (X, ESC, Cerrar
  // link, backdrop click). Origin = Pro 60% OFF badge center. Watching
  // overlayClosed instead of giftDiscountApplied is important: the
  // discount is applied the moment the overlay OPENS (so the badge is
  // already visible "underneath"), but the user can't see the confetti
  // while the overlay covers the page.
  const giftOverlayClosed = useGiftOverlayClosed();
  const proBadgeRef = useRef<HTMLDivElement>(null);
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
      const el = proBadgeRef.current;
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
    "Hasta 1 marca",
    "Sin personalización",
    "Hasta 4 Ads de prueba",
    "Sin tarjeta de crédito",
  ];

  const basicFeatures = [
    "Hasta 1 marca",
    "100 Ads e imágenes de Contenido",
    "Personalización absoluta",
    "1 edit por imagen",
  ];

  const proFeatures = [
    "Hasta 1 marca",
    "Hasta 400 imágenes por mes",
    "Personalización absoluta",
    "Edits infinitos por imagen",
    "Modelos Pro de IA",
    "Optimización de Campañas",
  ];

  const agencyFeatures = [
    "Hasta 5 marcas",
    "Hasta 10 usuarios en tu equipo",
    "Ads e imágenes de Contenido ilimitadas",
    "Personalización absoluta",
    "Edits infinitos por imagen",
    "Modelos Pro de IA",
  ];

  const activeCard = hoveredCard ?? "pro";

  return (
    <section ref={sectionRef} id="pricing" className="px-3 py-24 sm:px-4 lg:px-6">
      {/* Confetti that bursts from the Pro "60% OFF" badge when the
          gift discount lands. Same animation as the GiftOverlay's
          "Ver regalo" burst — just centered on the badge instead of
          the viewport center. */}
      {confettiOn && (
        <Confetti originX={confettiOrigin.x} originY={confettiOrigin.y} />
      )}
      <div className="mx-auto max-w-[1360px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-black sm:text-4xl md:text-5xl"
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
                  className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:text-base ${
                    selected ? "text-[#0D1522]" : "text-[#0D1522]/55 hover:text-[#0D1522]/80"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="billing-thumb"
                      className="absolute inset-0 rounded-full border border-white/60 bg-white/70 shadow-[0_4px_16px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-150"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{option === "monthly" ? "Mensual" : "Anual"}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Grid uses items-start so per-card lg:mt-X offsets stagger vertically.
            Basic + Agencia sit lower; Pro sits slightly above so it reads as the
            recommended plan without needing a "Recommended" tag. */}
        <div className="relative mt-16 grid items-start gap-[1.5rem] lg:grid-cols-4">
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
              <h3 className="font-heading text-[2rem] font-bold text-[#0D1522]">Gratis</h3>

              <div className="mt-[2rem] flex items-baseline gap-2">
                <span className="font-heading text-[2.55rem] font-black tracking-tight text-[#0D1522]">$0.00</span>
              </div>

              <p className="mt-3 text-[0.78rem] leading-relaxed text-[#0D1522]/65">
                Probá Postty sin compromiso y generá tus primeros Ads
              </p>

              <a
                href={appUrl}
                onClick={() => trackEvent("Lead", {
                  content_category: "pricing_starter",
                  content_ids: ["plan_starter"],
                  content_type: "product",
                  value: 0,
                  currency: "ARS",
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
              Glass-on-light. Neutral palette so Pro can stand out. */}
          <div
            className="relative self-start lg:mt-14"
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
              className="relative z-10 rounded-3xl border border-white/70 bg-white/55 p-[1.53rem] shadow-[0_4px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            >
              {/* Title row — name top-left, subtle 20% OFF badge top-right
                  (only when the gift discount has been claimed). Without
                  the gift the Basic card shows the plain, undiscounted
                  price and no badge / strikethrough at all. */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-[2rem] font-bold text-[#0D1522]">Basic</h3>
                {giftDiscountApplied && (
                  <div className="inline-flex shrink-0 items-center justify-center rounded-full leading-none border border-white/80 bg-white/70 px-[0.72rem] py-[0.4rem] shadow-[0_2px_8px_rgba(13,21,34,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md">
                    <span className="font-heading text-[0.82rem] font-black text-[#0D1522]/70">{billing === "monthly" ? "20% OFF" : "30% OFF"}</span>
                  </div>
                )}
              </div>

              {/* Price — strikethrough + discounted only when the gift
                  was claimed. Otherwise: plain $87.900 / $73.000 with no
                  badge or strikethrough. */}
              <div className="mt-2">
                {giftDiscountApplied && (
                  <div className="text-[0.85rem] font-semibold text-[#0D1522]/40 line-through decoration-2 decoration-[#0D1522]/40">
                    $87.900
                  </div>
                )}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-[2.55rem] font-black tracking-tight text-[#0D1522]">
                    {giftDiscountApplied
                      ? (billing === "monthly" ? "$69.900" : "$61.500")
                      : (billing === "monthly" ? "$87.900" : "$79.100")}
                  </span>
                  <span className="text-[0.78rem] font-medium text-[#0D1522]/50">/mes</span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="mt-3 text-[0.78rem] leading-relaxed text-[#0D1522]/65">
                Tenés una empresa y manejás todo el marketing vos
              </p>

              {/* CTA — moved up, neutral so Pro pops */}
              <a
                href={basicCheckoutUrl}
                onClick={() => trackEvent("Lead", {
                  content_category: "pricing_basic",
                  content_ids: ["plan_basic"],
                  content_type: "product",
                  value: giftDiscountApplied
                    ? (billing === "monthly" ? 69900 : 61500)
                    : (billing === "monthly" ? 87900 : 79100),
                  currency: "ARS",
                })}
                className="mt-6 block w-full rounded-full bg-[#0D1522]/[0.06] py-[0.66rem] text-center text-[0.78rem] font-semibold text-[#0D1522] transition hover:bg-[#0D1522]/[0.10]"
              >
                Empezar ahora
              </a>

              {/* Features — inner glass block */}
              <div className="mt-6 rounded-2xl border border-white/60 bg-white/40 p-[0.94rem] backdrop-blur-md">
                {basicFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-[0.6rem] ${
                      i < basicFeatures.length - 1 ? "border-b border-[#0D1522]/[0.06]" : ""
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
              className="relative z-10 overflow-hidden rounded-3xl p-[1.53rem] text-white shadow-[0_12px_40px_rgba(24,129,241,0.35)]"
              style={{ background: "linear-gradient(160deg, #1881F1, #49D3F8)" }}
            >
              {/* Title row — name top-left, discount badge top-right.
                  Badge + strikethrough only render when the gift has been
                  claimed (the gift IS the 60% off — without it Pro shows
                  the full price). */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-[2rem] font-bold text-white">Pro</h3>
                {giftDiscountApplied && (
                  <div
                    ref={proBadgeRef}
                    className="inline-flex shrink-0 items-center justify-center rounded-full leading-none px-[0.72rem] py-[0.4rem] shadow-[0_4px_16px_rgba(181,255,0,0.45)]"
                    style={{ background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
                  >
                    <span className="font-heading text-[0.82rem] font-black text-[#0D1522]">{billing === "monthly" ? "60% OFF" : "70% OFF"}</span>
                  </div>
                )}
              </div>

              {/* Price — strikethrough + discounted price only when gift
                  claimed. Otherwise: plain $249.900 / $199.900 full
                  price, no strikethrough. */}
              <div className="mt-2">
                {giftDiscountApplied && (
                  <div className="text-[0.85rem] font-semibold text-white/60 line-through decoration-2 decoration-white/70">
                    $249.900
                  </div>
                )}
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className="font-heading text-[2.55rem] font-black tracking-tight"
                    style={{
                      background: "linear-gradient(135deg, #b5ff00, #eeff64)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {giftDiscountApplied
                      ? (billing === "monthly" ? "$99.900" : "$74.900")
                      : (billing === "monthly" ? "$249.900" : "$224.900")}
                  </span>
                  <span className="text-[0.78rem] font-medium text-white/65">/mes</span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="mt-3 text-[0.78rem] leading-relaxed text-white/85">
                Optimiza tus campañas
              </p>

              {/* CTA — chartreuse, only colored CTA on the page */}
              <a
                href={proCheckoutUrl}
                onClick={() => trackEvent("Lead", {
                  content_category: "pricing_pro",
                  content_ids: ["plan_pro"],
                  content_type: "product",
                  value: giftDiscountApplied
                    ? (billing === "monthly" ? 99900 : 74900)
                    : (billing === "monthly" ? 249900 : 224900),
                  currency: "ARS",
                })}
                className="mt-6 block w-full rounded-full py-[0.66rem] text-center text-[0.78rem] font-bold text-[#0D1522] transition hover:shadow-lg hover:brightness-105"
                style={{ background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
              >
                Convertirme en Pro
              </a>

              {/* Features — inner glass block on the blue */}
              <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-[0.94rem] backdrop-blur-md">
                {proFeatures.map((feat, i) => (
                  <div
                    key={feat}
                    className={`flex items-center justify-between py-[0.6rem] ${
                      i < proFeatures.length - 1 ? "border-b border-white/10" : ""
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

          {/* ── Agencia Card ───────────────────────────────────────────────
              Mirror of Basic (glass-on-light, neutral). */}
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
              <h3 className="font-heading text-[2rem] font-bold text-[#0D1522]">Agencia</h3>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-[1.75rem] font-black tracking-tight text-[#0D1522]">Personalizado</span>
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
      {/* Full-screen 3-step lead-capture overlay. Triggers once per session
          when the user scrolls into #testimonios. */}
      <GiftOverlay />
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
            <a href="#testimonios" className="whitespace-nowrap transition hover:text-[#0D1522]">Clientes</a>
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
            onClick={() => trackEvent("Lead", { content_name: "header_whatsapp" })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:bg-white/25"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0D1522" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
            </svg>
          </a>
          <a href={appUrl} className="inline-flex h-9 shrink-0 items-center justify-center rounded-full leading-none bg-white/15 px-5 text-sm font-bold text-[#0D1522] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition hover:bg-white/25">
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
              onClick={() => trackEvent("Lead", { content_name: "header_whatsapp_scrolled" })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl backdrop-saturate-150 transition hover:bg-white/40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0D1522" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
              </svg>
            </a>
            <a
              href={appUrl}
              className="inline-flex h-9 items-center justify-center rounded-full bg-white/25 px-5 text-sm font-bold text-[#0D1522] shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl backdrop-saturate-150 transition hover:bg-white/40"
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
          Postty — Agente de marketing con IA que crea contenido y ads para Meta y Google en 5 minutos
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
        {/* Floating testimonial pills — stacked vertically, low in the
            hero (almost touching the bottom edge). Order top → bottom:
            Juan (biggest) → Pilar (medium) → Sofía (smallest). Each
            slides up + fades in with sequential delays
            (0s / 0.5s / 1.0s). */}
        <AnimatePresence>
          {showHeroPopups && !isMobile && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[1%] z-20 hidden flex-col items-center gap-2 md:flex md:bottom-[3%]">
              {/* TOP — Juan, BIGGEST. z-10 so it sits IN FRONT of Sofía
                  who overlaps slightly from below. */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10 flex items-center gap-3.5 rounded-full bg-white/10 px-7 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl backdrop-saturate-150"
              >
                <Image
                  src="https://i.pravatar.cc/80?img=12"
                  alt="Juan"
                  width={52}
                  height={52}
                  className="h-13 w-13 inline-flex shrink-0 items-center justify-center rounded-full leading-none object-cover"
                  style={{ width: 52, height: 52 }}
                />
                <div>
                  <p className="text-base font-bold text-white">Juan, 32 años, Dueño de una marca de ropa</p>
                  <p className="text-sm text-white/80">&ldquo;Cansado de pagar agencias de marketing que no rinden&rdquo;</p>
                </div>
              </motion.div>

              {/* MIDDLE — Sofía (formerly Pilar — kept the original
                  Pilar age/role/quote, only swapped the NAME and PHOTO).
                  -mt-4 makes this pill sit slightly behind Juan, z-0
                  pushes it behind in the stacking order. */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-0 -mt-4 flex items-center gap-3 rounded-full bg-white/10 px-6 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl backdrop-saturate-150"
              >
                <Image
                  src="https://i.pravatar.cc/80?img=47"
                  alt="Sofía"
                  width={44}
                  height={44}
                  className="h-11 w-11 inline-flex shrink-0 items-center justify-center rounded-full leading-none object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-white">Sofía, 37 años, Community Manager</p>
                  <p className="text-xs text-white/80">&ldquo;Siempre me quedo atrás con las tendencias de Meta&rdquo;</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                  padding so "Empezar gratis" remains the visual anchor.
                  Icon in WhatsApp brand green (#25D366). target=_blank
                  + noopener since it leaves the site. */}
              <motion.a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Lead", { content_name: "hero_cta_whatsapp" })}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-[18px] text-lg font-black text-white shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[6px] sm:px-7"
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
                onClick={() => trackEvent("Lead", { content_name: "hero_cta_empezar_gratis" })}
                className="group pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-white/15 px-10 py-[18px] text-lg font-black text-white shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[6px]"
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

      <BrandTestimonialsSection />

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


      {/* ── Plataformas soportadas ──
          Multi-canal positioning for the Google Ads review: makes explicit that
          Postty connects to ad accounts via OAuth. Meta = live today; Google +
          TikTok = "Próximamente". Sits above Pricing so it's visible without
          excessive scroll (a review gate). */}
      <section id="plataformas" className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1100px]">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-center text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
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
                <h3 className="mt-3 font-heading text-lg font-black tracking-tight text-[#0D1522] sm:text-xl">
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

      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── Business types ── */}
      <BusinessTypesSection />

      {/* ── Tu equipo / Por qué Postty ──
          3-col grid (1-col on mobile) with alternating quote cards and
          team photo cards. Quote cards have a neutral gray bg with the
          quote in Jakarta + author in Outfit bold; photo cards have a
          dark bottom-gradient overlay so the name (Outfit) and role
          (Outfit lighter) stay readable on top of the photo.
          Padding is uniform — gap-4/6, p-5/6 inside cards, px-4/6
          around the section — so the visual rhythm stays consistent. */}
      <section id="equipo" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="text-center text-sm font-normal text-[#0D1522]/40 sm:text-base"
          >
            Tu equipo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mt-3 font-heading text-center text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
          >
            Por qué Postty?
          </motion.h2>

          {/* Asymmetric staggered grid (md+):
              - Quote cells aspect-[8/5] (landscape, h = 0.625W)
              - Photo cells aspect-[4/5] (portrait, h = 1.25W) + row-span-2
              - Photo h = 2 × quote h → photos span exactly 2 grid rows
              - Each grid row = quote height, so cells line up at row
                boundaries (no empty space, no stretching). Gap-6 between
                rows AND columns means the spacing between every pair of
                cards is identical — Dari↔Juan photo = Juan photo↔Agus =
                Dari↔Dario = etc.
              JSX order matters for auto-placement; Agustina photo is
              before Juan quote so the quote lands at (row 3, col 2). */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:mt-14 md:grid-cols-3 md:grid-rows-3">
            {([
              { kind: "quote", text: "Queremos que la IA esté al servicio de quien vende, no que sume una complejidad más.", author: "Dari" },
              { kind: "photo", name: "Juan Beines", role: "CEO", image: "/team/juan.webp", link: "https://www.linkedin.com/in/juanbeines/" },
              { kind: "quote", text: "Para que cada marca pueda enfocarse en su estrategia mientras la ejecución del contenido se resuelve sola.", author: "Agus" },
              { kind: "photo", name: "Dario Soria", role: "CTO", image: "/team/dari.webp", link: "https://www.linkedin.com/in/dario-soria-11198324/" },
              { kind: "photo", name: "Agustina Tobias", role: "CMO", image: "/team/agustina.webp", link: "https://www.linkedin.com/in/agustobias/" },
              { kind: "quote", text: "Nacimos para que vender de forma digital deje de ser un problema y vuelva a ser una oportunidad.", author: "Juan" },
            ] as const).map((cell, i) => {
              // Mobile-only reorder: pair each person's photo with their
              // quote right below it (Juan photo → Juan quote → Dario photo
              // → Dari quote → Agustina photo → Agus quote). `md:order-none`
              // resets so the desktop grid uses DOM order for the
              // staggered layout.
              const mobileOrderClasses = ["order-4", "order-1", "order-6", "order-3", "order-5", "order-2"];
              const orderClass = `${mobileOrderClasses[i]} md:order-none`;
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className={
                  cell.kind === "quote"
                    // Mobile: smaller quote box — width 80% centered, aspect
                    // [5/2] (much shorter), reduced padding. sm+ reverts to
                    // the full-width staggered-grid sizing.
                    ? `${orderClass} mx-auto flex aspect-[5/2] w-4/5 flex-col justify-between rounded-2xl bg-[#F1F2F4] p-4 sm:mx-0 sm:aspect-[8/5] sm:w-full sm:p-6${
                        // Juan quote sits at the bottom of col 2 (under
                        // his photo). Shift it up ~12px on md+ so it
                        // visually "kisses" the photo instead of sitting
                        // in the middle of an oversized gap.
                        cell.author === "Juan" ? " md:-mt-3" : ""
                      }`
                    : `${orderClass} relative aspect-[4/5] overflow-hidden rounded-2xl md:row-span-2`
                }
              >
                {cell.kind === "quote" ? (
                  <>
                    <p className="text-sm leading-relaxed text-[#0D1522]/85 sm:text-base">
                      &ldquo;{cell.text}&rdquo;
                    </p>
                    <p className="mt-4 font-heading text-sm font-bold text-[#0D1522] sm:text-base">
                      {cell.author}
                    </p>
                  </>
                ) : (
                  <>
                    <Image
                      src={cell.image}
                      alt={cell.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      // scale-[2] zooms 2× from the center; translate-x
                      // nudges Juan + Dari to the right so their bodies are
                      // better-centered after the 2x crop. Dari needs a
                      // larger shift than Juan because the new "dari 2"
                      // source has him further off-center.
                      className={`scale-[2] object-cover ${
                        cell.name === "Dario Soria"
                          ? "translate-x-10"
                          : cell.name === "Juan Beines"
                            ? "translate-x-3"
                            : ""
                      }`}
                    />
                    {/* Black bottom gradient — concentrated in the BOTTOM
                        ~30% of the photo (was 55%). Heavier black at the
                        very bottom for legibility, fades to transparent
                        quickly so most of the photo stays unobscured. */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0) 32%)",
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <p className="font-heading text-xl font-bold leading-tight text-white sm:text-2xl">
                        {cell.name}
                      </p>
                      <p className="mt-1 font-heading text-base font-normal leading-tight text-white/80 sm:text-lg">
                        {cell.role}
                      </p>
                    </div>
                    {/* Invisible full-card link to the member's LinkedIn.
                        Sits on top (z-10) so the whole photo + name is
                        clickable; no visible affordance beyond the cursor. */}
                    <a
                      href={cell.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn de ${cell.name}`}
                      className="absolute inset-0 z-10 cursor-pointer"
                    />
                  </>
                )}
              </motion.div>
              );
            })}
          </div>
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
            {/* WhatsApp CTA — same brand-green icon + text pill as the
                hero, sized down to footer-meta scale. */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Lead", { content_name: "footer_whatsapp" })}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#0D1522] transition hover:border-gray-300 hover:bg-gray-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
              </svg>
              WhatsApp
            </a>
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
