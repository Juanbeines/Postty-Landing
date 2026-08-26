/**
 * "Plataformas" — app carousel.
 *
 * A deck of tiles on a deep celeste→blue panel: the active app sits in
 * front, its neighbours peek out from behind (decorative only — they are
 * inert and hidden from assistive tech). Under it, the app's name, then
 * the two lines that carry the section — what Postty does inside that app
 * and the pain that disappears — and a CTA phrased for that platform. The
 * deck advances on its own every AUTOPLAY_MS while the section is on
 * screen, and only pauses while the CTA itself is hovered; there are no
 * manual controls by design. A second, empty card rests behind the whole
 * thing for depth.
 *
 * `live` no longer renders a "Disponible hoy"/"Próximamente" chip (the
 * chips were dropped from the design). The Google Ads developer-token
 * review still needs the pre-launch integrations declared honestly, and
 * that declaration now lives ONLY in the FAQ entry "¿En qué plataformas
 * puedo publicar mis campañas?" in src/app/page.tsx — do not remove it.
 *
 * Replaces the 4-card grid archived at _extras/PlatformCardsSection.tsx.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent, useAppUrl } from "@/lib/pixel";

type App = {
  logo: string;
  name: string;
  live: boolean;
  /** What you do in that app, with Postty. */
  does: string;
  /** What you never have to put up with again. */
  never: string;
  /** Label of the CTA into the app, phrased for this platform. */
  cta: string;
};

/* Order matters: Instagram → Meta → Google Ads → TikTok leads, the rest
   follow. */
const APPS: ReadonlyArray<App> = [
  {
    logo: "instagram",
    name: "Instagram",
    live: true,
    does: "Publicá posts, historias y reels",
    never: "Nunca más pierdas el finde pensando qué subir.",
    cta: "Publicar contenido",
  },
  {
    logo: "meta",
    name: "Meta",
    live: true,
    does: "Creá los Ads que sí venden y optimizalos mientras dormís",
    never: "Nunca más agencias que cobran fortunas por lo mismo.",
    cta: "Lanzar campaña",
  },
  {
    logo: "google-ads",
    name: "Google Ads",
    live: false,
    does: "Campañas con imágenes y videos hechos por IA",
    never: "Nunca más pagar clicks con creativos genéricos.",
    cta: "Crear mis anuncios",
  },
  {
    logo: "tiktok",
    name: "TikTok",
    live: false,
    does: "Videos UGC pensados para el feed más rápido de todos",
    never: "Nunca más quedarte afuera por no saber grabar.",
    cta: "Generar videos UGC",
  },
  {
    logo: "facebook",
    name: "Facebook",
    live: true,
    does: "Publicá en tu página y lanzá campañas desde Postty",
    never: "Nunca más pelearte con el Administrador de anuncios.",
    cta: "Publicar en mi página",
  },
  {
    logo: "tiendanube",
    name: "Tiendanube",
    live: true,
    does: "Pegás el link de tu tienda y Postty aprende tu marca sola",
    never: "Nunca más explicarle tu identidad a cada diseñador.",
    cta: "Conectar mi tienda",
  },
  {
    logo: "mercadolibre",
    name: "Mercado Libre",
    live: true,
    does: "Tus publicaciones se vuelven creativos listos para pautar",
    never: "Nunca más fotos de producto que no venden.",
    cta: "Traer mis publicaciones",
  },
];

/** How long each app holds before the deck advances on its own. */
const AUTOPLAY_MS = 3000;

/** Tiles further than this from the active one are not rendered. */
const VISIBLE = 2;
const TILE = 104;
/** Below the touching threshold (half of ring 1 + half of ring 2 ≈ 59),
    so every tile overlaps its neighbour instead of merely meeting it. */
const STEP = 52;
/** Scale per ring, so the active tile reads as the one in front. */
const RING_SCALE = [1, 0.68, 0.46];
const RING_OPACITY = [1, 1, 0.9];

export default function AppsCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  /* Autoplay only runs while the section is actually on screen. It used to
     start at page load, so the deck was already mid-cycle by the time anyone
     scrolled down — whichever app happened to be showing then appeared to
     hold far longer than the rest (usually Instagram, the one it starts on).
     Gating on visibility makes every app get the same, visible hold. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One timer per slide (not a re-created interval), so a hover that ends
  // mid-slide resumes the remaining time instead of granting a fresh full
  // hold. Users who asked the OS for less motion get a static deck.
  useEffect(() => {
    if (paused || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setActive((prev) => (prev + 1) % APPS.length),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [paused, inView, active]);

  // Shortest signed distance from the active tile, so the deck wraps in
  // both directions instead of scrolling back through the whole list.
  const offsetOf = useCallback(
    (i: number) => {
      const n = APPS.length;
      const d = (i - active + n) % n;
      return d > n / 2 ? d - n : d;
    },
    [active],
  );

  const current = APPS[active];
  const appUrl = useAppUrl();

  return (
    <section ref={rootRef} id="plataformas" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-[900px]">
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
          <span className="block">
            Postty se conecta con tus cuentas publicitarias de forma 100% segura.
          </span>
          <span className="block">Vos mantenés el control total.</span>
        </motion.p>

        {/* A card, with a second one resting behind it (inert — it only
            exists to give the stack depth). Inside, the deck gets its own
            bordered panel, then the copy, then the arrows. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto mt-12 max-w-[500px]"
        >
          {/* Card behind — wider but vertically inset, so it only shows at
              the two sides and never pokes out under the bottom edge. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-5 -right-5 bottom-6 top-6 rounded-[36px] border border-white/60 bg-white/45 shadow-[0_18px_46px_rgba(13,21,34,0.07)]"
          />

          <div className="relative rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-[0_16px_50px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150">
            {/* ── The deck, in its own bordered panel ──
                Same blue as the Pro pricing card — gradient and glow copied
                verbatim so the two "hero" surfaces of the page read as one
                material. Not blurred: blur washed out the contrast with the
                tiles. */}
            <div
              className="rounded-[24px] border border-white/40 px-4 pb-6 pt-8 shadow-[0_12px_40px_rgba(24,129,241,0.35)]"
              style={{ background: "linear-gradient(160deg, #1881F1, #49D3F8)" }}
            >
              <div className="relative flex h-[132px] items-center justify-center">
                {APPS.map((app, i) => {
                  const d = offsetOf(i);
                  const far = Math.abs(d);
                  const shown = far <= VISIBLE;
                  return (
                    <motion.div
                      key={app.logo}
                      aria-hidden={d !== 0}
                      /* Light-grey face with a white rim — the rim is what
                         keeps overlapping tiles readable as separate
                         stickers instead of one blob. */
                      className="pointer-events-none absolute flex items-center justify-center rounded-[22px] border-[3px] border-white bg-[#F2F4F7] shadow-[0_8px_22px_rgba(2,43,176,0.18)]"
                      style={{ width: TILE, height: TILE, zIndex: 20 - far }}
                      animate={{
                        x: d * STEP,
                        y: d === 0 ? -4 : 0,
                        scale: shown ? RING_SCALE[far] : 0.6,
                        opacity: shown ? RING_OPACITY[far] : 0,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/logos/${app.logo}.svg`}
                        alt={app.name}
                        className="h-14 w-14 object-contain"
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Just the app name, like the reference tooltip. */}
              <div className="relative mt-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={current.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#0D1522] shadow-[0_2px_8px_rgba(2,43,176,0.25)]"
                  >
                    {current.name}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* ── What you do there / what you never suffer again / the CTA ──
                Fixed height, not min-height: the copy varies from one to
                three lines and the card must not resize as the deck turns.
                Sized for the longest entry at the narrowest width. */}
            <div className="flex h-[232px] items-start px-5 pt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="font-heading text-xl font-semibold leading-tight tracking-tight text-[#0D1522] sm:text-[22px]">
                    {current.does}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#0D1522]/55 sm:text-[15px]">
                    {current.never}
                  </p>
                  <a
                    href={appUrl}
                    /* The ONLY hover pause. It used to sit on the whole card,
                       which froze the deck whenever the cursor merely rested
                       there — scrolling down with the pointer mid-screen was
                       enough, and the deck sat on Instagram until the mouse
                       moved. Here it just stops the label changing out from
                       under a click. */
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onClick={() =>
                      trackEvent("Lead", {
                        content_name: `apps_carousel_${current.logo}`,
                        content_category: "trial_intent",
                      })
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-5 py-2.5 text-sm font-semibold text-[#0D1522] shadow-[0_8px_24px_rgba(13,21,34,0.13),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:shadow-[0_10px_30px_rgba(13,21,34,0.18)]"
                  >
                    {current.cta}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
