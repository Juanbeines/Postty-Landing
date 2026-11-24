/**
 * "Publicá en todas tus apps, de forma segura" — bento por app.
 *
 * Un marco de tamaño FIJO con seis bloques y, arriba en el medio, los
 * cuadraditos de las apps. Cada AUTOPLAY_MS pasa a la app siguiente (o a la
 * que el usuario toque, y el reloj vuelve a arrancar): los bloques se
 * reacomodan — cambian de lugar y de tamaño con un resorte tipo esponja,
 * más un "blob" rápido que los achica y agranda — y todo lo de adentro
 * entra con su propia animación (palabras, chips, burbujas, íconos).
 *
 * Bloques: producto (P), marca de la app (H), seguridad (A), historia con
 * el CTA (S), frase (W) y teléfono (F). El marco y los cuadraditos (T)
 * nunca se mueven: sólo se redistribuye lo de adentro.
 *
 * El CTA conserva EXACTO el evento del carrusel anterior
 * (`apps_carousel_<logo>`, "Lead", "trial_intent"): no tocar el payload.
 *
 * Honestidad: sólo "API oficial" / "OAuth" — nunca "aprobado por" una
 * plataforma que no lo aprobó. Google Ads sigue en revisión: su bloque de
 * seguridad habla de OAuth de Google. La declaración de qué está en vivo
 * vive en el FAQ (src/app/page.tsx).
 */

"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BarChart07, LinkBroken01, Lock01, CheckCircle, CreditCard01, Eye, EyeOff, Key01, ShieldTick, ShoppingBag01, X } from "@untitledui/icons";
import { useCopy } from "@/i18n/locale";
import { trackEvent, useAppUrl } from "@/lib/pixel";

/* ── Datos ─────────────────────────────────────────────────────────── */

type PermIcon = "key" | "chart" | "eye" | "never" | "card" | "store";
type Perm = { i: PermIcon; t: string };
const PERM_ICONS = { key: Key01, chart: BarChart07, eye: Eye, never: EyeOff, card: CreditCard01, store: ShoppingBag01 };

type Media = { kind: "img" | "video"; src: string };

type App = {
  logo: string;
  name: string;
  /** Gradiente fuerte (bloque de marca). */
  bg: string;
  /** Gradiente suave (producto, frase). */
  soft: string;
  /** Color de acento (barras, anillos). */
  accent: string;
  media: Media;
  product: string;
  chips: [string, string, string];
  does: string;
  never: string;
  authTitle: string;
  authSub: string;
  /** Qué hace Postty con esa conexión y qué no hace nunca. */
  perms: Perm[];
  toast: string;
  cta: string;
  desk: string;
  mob: string;
};

/* Disposiciones: 12 columnas x 6 filas en escritorio (T = las apps, fijas
   arriba al medio) y 4 x 6 en celular (sin T: ahí las apps van arriba).
   Cada letra es un bloque y tiene que quedar rectangular. */
/* Los bloques grandes son siempre las piezas reales (S = historia/video,
   P = la otra pieza) y la seguridad (A); los chicos, los detalles. Cada fila de 12 letras. */
const DESK = {
  ig: "SSSTTTTTTHHH SSSAAAPPPHHH SSSAAAPPPWWW SSSAAAPPPWWW SSSAAAPPPFFF SSSAAAPPPFFF",
  meta: "HHHTTTTTTSSS HHHPPPAAASSS WWWPPPAAASSS WWWPPPAAASSS FFFPPPAAASSS FFFPPPAAASSS",
  tt: "AAATTTTTTHHH AAASSSPPPHHH AAASSSPPPWWW AAASSSPPPWWW AAASSSPPPFFF AAASSSPPPFFF",
  gads: "SSSTTTTTTHHH SSSPPPAAAHHH SSSPPPAAAWWW SSSPPPAAAWWW SSSPPPAAAFFF SSSPPPAAAFFF",
  tn: "PPPTTTTTTFFF PPPAAASSSFFF PPPAAASSSHHH PPPAAASSSHHH PPPAAASSSWWW PPPAAASSSWWW",
  ml: "HHHTTTTTTAAA HHHPPPSSSAAA WWWPPPSSSAAA WWWPPPSSSAAA FFFPPPSSSAAA FFFPPPSSSAAA",
};
const MOB = {
  a: "SSPP SSPP SSPP AAAA AAAA HHWW HHFF",
  b: "AAAA AAAA PPSS PPSS PPSS WWHH FFHH",
  c: "SSPP SSPP SSPP HHAA WWAA WWAA FFAA",
};

const AREA: Record<string, string> = {
  P: "prod",
  H: "hero",
  A: "auth",
  S: "story",
  W: "wide",
  F: "phone",
  T: "tabs",
};
const areasOf = (rows: string) =>
  rows
    .split(" ")
    .map((r) => `"${r.split("").map((c) => AREA[c]).join(" ")}"`)
    .join(" ");

/* Los colores de cada app van como un tinte suave sobre blanco: se
   reconoce la app sin romper el estilo de Postty. */
const heroBg = (a: string, b: string) =>
  `radial-gradient(110% 90% at 0% 0%, rgba(${a},0.30), transparent 62%), radial-gradient(100% 90% at 100% 100%, rgba(${b},0.24), transparent 60%), #FFFFFF`;
const softBg = (a: string, b: string) =>
  `radial-gradient(120% 100% at 0% 0%, rgba(${a},0.16), transparent 60%), radial-gradient(120% 100% at 100% 100%, rgba(${b},0.13), transparent 60%), #F8FBFF`;

const APPS_ES: App[] = [
  {
    logo: "instagram",
    name: "Instagram",
    bg: heroBg("214,41,118", "250,126,30"),
    soft: softBg("214,41,118", "250,126,30"),
    accent: "#D62976",
    media: { kind: "img", src: "/creatives-v3/posts/post-06.webp" },
    product: "/creatives-v3/posts/post-09.webp",
    chips: ["Posts", "Historias", "Reels"],
    does: "Publicá posts, historias y reels",
    never: "Nunca más pierdas el finde pensando qué subir.",
    authTitle: "API oficial de Meta",
    authSub: "Instagram · OAuth",
    perms: [{ i: "key", t: "Publicamos solo, con tu permiso" }, { i: "chart", t: "Leemos tus métricas para mejorar" }, { i: "never", t: "Nunca vemos tus chats" }],
    toast: "Publicado en tu feed",
    cta: "Publicar contenido",
    desk: DESK.ig,
    mob: MOB.a,
  },
  {
    logo: "meta",
    name: "Meta",
    bg: heroBg("8,102,255", "73,211,248"),
    soft: softBg("8,102,255", "73,211,248"),
    accent: "#0866FF",
    media: { kind: "img", src: "/creatives-v3/ads/ad-05.webp" },
    product: "/creatives-v3/ads/ad-03b.webp",
    chips: ["Pausa lo caro", "Escala lo que vende", "IA 24/7"],
    does: "Creá los Ads que sí venden y optimizalos mientras dormís",
    never: "Nunca más agencias que cobran fortunas por lo mismo.",
    authTitle: "API oficial de Meta",
    authSub: "Marketing API · OAuth",
    perms: [{ i: "key", t: "Creamos campañas con tu permiso" }, { i: "chart", t: "Leemos tus métricas para mejorar" }, { i: "card", t: "Nunca tocamos tus medios de pago" }],
    toast: "Campaña activa",
    cta: "Lanzar campaña",
    desk: DESK.meta,
    mob: MOB.c,
  },
  {
    logo: "tiktok",
    name: "TikTok",
    bg: heroBg("37,244,238", "254,44,85"),
    soft: softBg("37,244,238", "254,44,85"),
    accent: "#FE2C55",
    media: { kind: "video", src: "/creatives-v3/videos/video-01.mp4" },
    product: "/creatives-v3/posts/post-10-b.webp",
    chips: ["UGC", "Avatares", "Subtítulos"],
    does: "Videos UGC pensados para el feed más rápido de todos",
    never: "Nunca más quedarte afuera por no saber grabar.",
    authTitle: "API oficial de TikTok",
    authSub: "Content Posting API · OAuth",
    perms: [{ i: "key", t: "Subimos videos con tu permiso" }, { i: "eye", t: "Vos elegís quién los ve" }, { i: "never", t: "Nunca vemos tus mensajes" }],
    toast: "Subido a TikTok",
    cta: "Generar videos UGC",
    desk: DESK.tt,
    mob: MOB.b,
  },
  {
    logo: "google-ads",
    name: "Google Ads",
    bg: heroBg("66,133,244", "52,168,83"),
    soft: softBg("66,133,244", "52,168,83"),
    accent: "#4285F4",
    media: { kind: "img", src: "/creatives-v3/ads/ad-07b.webp" },
    product: "/creatives-v3/ads/ad-04b.webp",
    chips: ["Display", "YouTube", "Discover"],
    does: "Campañas con imágenes y videos hechos por IA",
    never: "Nunca más pagar clicks con creativos genéricos.",
    authTitle: "Conexión con Google",
    authSub: "Google Ads · OAuth de Google",
    perms: [{ i: "key", t: "Creamos campañas con tu permiso" }, { i: "chart", t: "Leemos tus métricas para mejorar" }, { i: "card", t: "Nunca tocamos tus medios de pago" }],
    toast: "Campaña lista",
    cta: "Crear mis anuncios",
    desk: DESK.gads,
    mob: MOB.a,
  },
  {
    logo: "tiendanube",
    name: "Tiendanube",
    bg: heroBg("38,73,160", "73,211,248"),
    soft: softBg("38,73,160", "73,211,248"),
    accent: "#2649A0",
    media: { kind: "img", src: "/creatives-v3/ads/ad-01b.webp" },
    product: "/ads/star/star-1.webp",
    chips: ["Productos", "Precios", "Promos"],
    does: "Pegás el link de tu tienda y Postty aprende tu marca sola",
    never: "Nunca más explicarle tu identidad a cada diseñador.",
    authTitle: "App de Tiendanube",
    authSub: "API de Tiendanube · OAuth",
    perms: [{ i: "store", t: "Leemos tus productos y precios" }, { i: "chart", t: "Medimos qué ventas trae cada ad" }, { i: "card", t: "Nunca tocamos tus cobros" }],
    toast: "Marca aprendida",
    cta: "Conectar mi tienda",
    desk: DESK.tn,
    mob: MOB.a,
  },
  {
    logo: "mercadolibre",
    name: "Mercado Libre",
    bg: heroBg("255,214,0", "45,50,119"),
    soft: softBg("255,214,0", "45,50,119"),
    accent: "#2D3277",
    media: { kind: "img", src: "/creatives-v3/ads/ad-10.webp" },
    product: "/hero-posts/perfume-lumina.webp",
    chips: ["Fotos", "Títulos", "Precios"],
    does: "Tus publicaciones se vuelven creativos listos para pautar",
    never: "Nunca más fotos de producto que no venden.",
    authTitle: "API oficial de Mercado Libre",
    authSub: "Mercado Libre · OAuth",
    perms: [{ i: "store", t: "Leemos tus publicaciones" }, { i: "key", t: "Nunca las modificamos" }, { i: "never", t: "Nunca vemos tus mensajes" }],
    toast: "Creativo listo",
    cta: "Traer mis publicaciones",
    desk: DESK.ml,
    mob: MOB.c,
  },
];

/* EN (US): Tiendanube y Mercado Libre no significan nada para un visitante
   de EE. UU., quedan afuera. */
const APPS_EN: App[] = [
  {
    ...APPS_ES[0],
    chips: ["Posts", "Stories", "Reels"],
    does: "Publish posts, stories and reels",
    never: "Never lose another weekend figuring out what to post.",
    authTitle: "Official Meta API",
    perms: [{ i: "key", t: "We post for you, with your OK" }, { i: "chart", t: "We read your metrics to improve" }, { i: "never", t: "We never see your chats" }],
    toast: "Posted to your feed",
    cta: "Publish content",
  },
  {
    ...APPS_ES[1],
    chips: ["Pauses waste", "Scales winners", "AI 24/7"],
    does: "Create the ads that actually sell, and optimize them while you sleep",
    never: "No more agencies charging a fortune for the same thing.",
    authTitle: "Official Meta API",
    perms: [{ i: "key", t: "We run campaigns with your OK" }, { i: "chart", t: "We read your metrics to improve" }, { i: "card", t: "We never touch your payments" }],
    toast: "Campaign live",
    cta: "Launch a campaign",
  },
  {
    ...APPS_ES[2],
    chips: ["UGC", "Avatars", "Captions"],
    does: "UGC videos built for the fastest feed of all",
    never: "Never get left out again because you can't film.",
    authTitle: "Official TikTok API",
    perms: [{ i: "key", t: "We upload videos with your OK" }, { i: "eye", t: "You choose who sees them" }, { i: "never", t: "We never see your messages" }],
    toast: "Posted to TikTok",
    cta: "Generate UGC videos",
  },
  {
    ...APPS_ES[3],
    does: "Campaigns with AI-made images and videos",
    never: "No more paying for clicks with generic creatives.",
    authTitle: "Google connection",
    authSub: "Google Ads · Google OAuth",
    perms: [{ i: "key", t: "We run campaigns with your OK" }, { i: "chart", t: "We read your metrics to improve" }, { i: "card", t: "We never touch your payments" }],
    toast: "Campaign ready",
    cta: "Create my ads",
  },
];

const COPY = {
  es: {
    apps: APPS_ES,
    title: "Publicá en todas tus apps,",
    titleEnd: "de forma segura",
    sub: "Conexiones oficiales, con permisos que aprobás vos.",
    pick: "Elegí una app",
    connection: "Conexión segura",
    badges: ["OAuth oficial", "Sin contraseñas", "Vos tenés el control"],
    revoke: "Lo desconectás cuando quieras, en un clic.",
    product: "Hecho con Postty",
    secure: "Seguro",
  },
  en: {
    apps: APPS_EN,
    title: "Publish to all your apps,",
    titleEnd: "securely",
    sub: "Official connections, with permissions you approve.",
    pick: "Pick an app",
    connection: "Secure connection",
    badges: ["Official OAuth", "No passwords", "You stay in control"],
    revoke: "Disconnect anytime, in one click.",
    product: "Made with Postty",
    secure: "Secure",
  },
};
type Copy = (typeof COPY)["es"];

/* ── Movimiento ────────────────────────────────────────────────────── */

/** Cuánto dura cada app antes de pasar a la siguiente. */
const AUTOPLAY_MS = 4500;
/** La esponja: poco amortiguado, se pasa un poquito y vuelve. */
const SPONGE = { type: "spring" as const, stiffness: 210, damping: 19, mass: 0.85 };
const ORDER = ["prod", "hero", "auth", "story", "wide", "phone"] as const;

/** Radios distintos por bloque y app: el contorno también respira. */
function radii(seed: number) {
  const r = (k: number) => 22 + ((seed * 7 + k * 13) % 3) * 4;
  return {
    borderTopLeftRadius: r(0),
    borderTopRightRadius: r(1),
    borderBottomRightRadius: r(2),
    borderBottomLeftRadius: r(3),
  };
}

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const on = () => setM(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return m;
}

/** Palabra por palabra, subiendo y desenfocándose. */
function Words({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, k) => (
        <motion.span
          key={`${w}-${k}`}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.45em", filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + k * 0.045, duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </span>
  );
}

/** Burbujas de fondo que derivan despacio. */
function Bubbles({ color, n = 3, still }: { color: string; n?: number; still: boolean }) {
  return (
    <>
      {Array.from({ length: n }).map((_, k) => (
        <motion.span
          key={k}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full blur-2xl"
          style={{
            background: color,
            width: `${42 + k * 18}%`,
            height: `${42 + k * 18}%`,
            left: `${[-10, 55, 20][k % 3]}%`,
            top: `${[-15, 40, 65][k % 3]}%`,
            opacity: 0.55,
          }}
          animate={still ? undefined : { x: [0, 18 - k * 12, -10, 0], y: [0, -14, 10 + k * 4, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ duration: 7 + k * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/** Algo que flota suave, para íconos y chips. */
function Float({ children, k = 0, still, className }: { children: ReactNode; k?: number; still: boolean; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.6, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.25 + k * 0.08 }}
    >
      <motion.div
        animate={still ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 2.6 + k * 0.5, repeat: Infinity, ease: "easeInOut", delay: k * 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ── Sección ───────────────────────────────────────────────────────── */

export default function AppsBento() {
  const t = useCopy(COPY);
  const apps = t.apps;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const mobile = useIsMobile();
  const reduce = !!useReducedMotion();
  const appUrl = useAppUrl();
  const app = apps[active % apps.length];
  const blob = useAnimationControls();

  /* El puntero, normalizado de -0.5 a 0.5, para el paralaje del bento. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 18 });
  const sy = useSpring(py, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Rota sola cada 3 s mientras se ve. Tocar una app la elige y el reloj
     arranca de cero (el efecto depende de `active`). Sólo frena con el
     puntero sobre el CTA, para que no cambie bajo el click. */
  useEffect(() => {
    if (paused || !inView || reduce) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % apps.length), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [paused, inView, reduce, active, apps.length]);

  /* El blob: cada bloque se achica y se agranda, uno detrás del otro. */
  useEffect(() => {
    if (reduce) return;
    blob.start((i: number) => ({
      scale: [1, 0.93, 1.035, 0.99, 1],
      transition: { duration: 0.7, delay: i * 0.04, ease: "easeInOut" },
    }));
  }, [active, blob, reduce]);

  const choose = (i: number) => {
    setActive(i);
  };

  const tabs = (
    <div role="tablist" aria-label={t.pick} className="flex h-full w-full items-center justify-start gap-2 md:justify-between">
      {apps.map((a, i) => {
        const on = i === active;
        return (
          <motion.button
            key={a.logo}
            role="tab"
            aria-selected={on}
            aria-label={a.name}
            onClick={() => choose(i)}
            whileHover={reduce ? undefined : { y: -3, scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            className="relative grid aspect-square h-14 shrink-0 place-items-center rounded-[18px] border border-white/90 bg-white/90 shadow-[0_10px_24px_rgba(24,129,241,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl md:h-auto md:max-h-full md:min-w-0 md:max-w-[80px] md:flex-1"
          >
            {on && (
              <motion.span
                layoutId="bento-tab"
                className="absolute inset-0 rounded-[18px] bg-white shadow-[0_12px_28px_rgba(24,129,241,0.20)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <motion.img
              src={`/logos/${a.logo}.svg`}
              alt=""
              className="relative h-7 w-7 object-contain md:h-8 md:w-8"
              animate={on && !reduce ? { scale: [1, 1.22, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
            />
            {on && (
              <span className="absolute inset-x-3 bottom-1.5 h-[3px] overflow-hidden rounded-full bg-[#0D1522]/8">
                <motion.span
                  key={`${active}-${paused}`}
                  className="block h-full rounded-full"
                  style={{ background: a.accent }}
                  initial={{ width: paused || reduce ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: paused || reduce ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }}
                />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const blocks: Record<(typeof ORDER)[number], ReactNode> = {
    prod: <ProductBlock app={app} t={t} still={reduce} />,
    hero: <HeroBlock app={app} still={reduce} sx={sx} sy={sy} />,
    auth: <AuthBlock app={app} t={t} still={reduce} />,
    story: (
      <StoryBlock
        app={app}
        count={apps.length}
        active={active}
        paused={paused || reduce}
        still={reduce}
        cta={
          <a
            href={appUrl}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() =>
              trackEvent("Lead", {
                content_name: `apps_carousel_${app.logo}`,
                content_category: "trial_intent",
              })
            }
            className="group flex items-center justify-between gap-2 rounded-full bg-[#0D1522] py-2 pl-3.5 pr-2 text-[12px] @[220px]:pl-4 @[220px]:text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(13,21,34,0.22)] transition hover:scale-[1.02]"
          >
            <span className="truncate">{app.cta}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[#0D1522] transition group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </a>
        }
      />
    ),
    wide: <WideBlock app={app} still={reduce} />,
    phone: <PhoneBlock app={app} apps={apps} still={reduce} />,
  };

  return (
    <section ref={rootRef} id="plataformas" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-[1080px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
        >
          {t.title}
          <br />
          {t.titleEnd}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-[#0D1522]/65 sm:text-lg md:text-xl"
        >
          {t.sub}
        </motion.p>

        {/* El panel lavanda donde vive el bento. */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            px.set((e.clientX - r.left) / r.width - 0.5);
            py.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => {
            px.set(0);
            py.set(0);
          }}
          className="relative mt-10"
        >

          {mobile && <div className="relative -mx-4 mb-3 overflow-x-auto px-4 py-1 [scrollbar-width:none]">{tabs}</div>}

          <div
            className="relative grid h-[1000px] gap-3 md:h-[600px] md:gap-3.5"
            style={{
              gridTemplateAreas: areasOf(mobile ? app.mob : app.desk),
              gridTemplateColumns: mobile ? "repeat(4,minmax(0,1fr))" : "repeat(12,minmax(0,1fr))",
              gridTemplateRows: mobile ? "repeat(7,minmax(0,1fr))" : "minmax(0,0.78fr) repeat(5,minmax(0,1fr))",
            }}
          >
            {!mobile && <div style={{ gridArea: "tabs" }}>{tabs}</div>}

            {ORDER.map((cell, i) => (
              <motion.div
                key={cell}
                layout
                custom={i}
                initial={false}
                animate={blob}
                transition={reduce ? { duration: 0 } : { layout: { ...SPONGE, delay: i * 0.03 } }}
                className="relative overflow-hidden border border-white/80 shadow-[0_16px_40px_rgba(24,129,241,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] @container"
                style={{ gridArea: cell, ...radii(active * 5 + i), background: "rgba(255,255,255,0.94)" }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={app.logo}
                    layout
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                    transition={reduce ? { duration: 0 } : { duration: 0.3, delay: 0.06 + i * 0.03 }}
                    className="absolute inset-0"
                  >
                    {blocks[cell]}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <p className="sr-only" aria-live="polite">
          {app.name}
        </p>
      </div>
    </section>
  );
}

/* ── Bloques ───────────────────────────────────────────────────────── */

/** Producto flotando con chips alrededor, y la frase de qué hace Postty. */
function ProductBlock({ app, t, still }: { app: App; t: Copy; still: boolean }) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative m-2 mb-0 min-h-0 flex-1 overflow-hidden rounded-[18px] bg-[#F2F4F7]">
        <motion.img
          src={app.product}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.18, opacity: 0 }}
          animate={{ scale: still ? 1.02 : 1.03, opacity: 1 }}
          transition={{ duration: 3.4, ease: "easeOut", opacity: { duration: 0.4 } }}
        />
        {app.chips.map((c, k) => (
          <Float
            key={c}
            k={k}
            still={still}
            className={`absolute ${["left-3 top-3", "right-3 top-[42%]", "left-3 bottom-3"][k]} ${k > 0 ? "hidden @[230px]:block" : ""}`}
          >
            <span className="flex items-center gap-1.5 rounded-full border border-white bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#0D1522]/80 shadow-[0_6px_16px_rgba(13,21,34,0.18)] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: app.accent }} />
              {c}
            </span>
          </Float>
        ))}
      </div>
      <div className="shrink-0 px-4 pb-4 pt-3">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[10px] font-semibold text-[#0D1522]/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/logos/${app.logo}.svg`} alt="" className="h-3 w-3 object-contain" />
          {t.product}
        </span>
        <p className="font-heading mt-2 text-[15px] font-semibold leading-[1.15] tracking-tight text-[#0D1522] @[230px]:text-[17px] @[300px]:text-xl">
          <Words text={app.does} delay={0.15} />
        </p>
      </div>
    </div>
  );
}

/** Postty × la app, sobre el gradiente de la app, con paralaje. */
function HeroBlock({ app, still, sx, sy }: { app: App; still: boolean; sx: MotionValue<number>; sy: MotionValue<number> }) {
  const x = useTransform(sx, (v) => v * 26);
  const y = useTransform(sy, (v) => v * 20);
  const bx = useTransform(sx, (v) => v * -40);
  const by = useTransform(sy, (v) => v * -30);
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-5" style={{ background: app.bg }}>
      <motion.div className="absolute inset-0" style={{ x: bx, y: by }}>
        <Bubbles color="rgba(255,255,255,0.7)" n={3} still={still} />
      </motion.div>
      {/* Anillos que se expanden desde el centro: la conexión. */}
      {!still &&
        [0, 1].map((k) => (
          <motion.span
            key={k}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 aspect-square w-[min(60%,220px)] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: `${app.accent}40` }}
            animate={{ scale: [0.6, 2.4], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: k * 1.2, ease: "easeOut" }}
          />
        ))}
      <motion.div className="relative flex flex-col items-center" style={{ x, y }}>
        <div className="flex items-center gap-2 @[220px]:gap-3 @[300px]:gap-4">
          <motion.span
            initial={{ x: -40, opacity: 0, rotate: -12 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
            className="grid h-12 w-12 place-items-center rounded-[16px] border border-white bg-white @[220px]:h-14 @[220px]:w-14 @[220px]:rounded-[18px] shadow-[0_12px_30px_rgba(13,21,34,0.12)] @[300px]:h-20 @[300px]:w-20 @[300px]:rounded-[24px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="Postty" className="h-9 w-9 rounded-xl @[300px]:h-12 @[300px]:w-12" />
          </motion.span>
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 14 }}
            className="grid h-7 w-7 place-items-center rounded-full bg-[#1881F1] text-white shadow-[0_6px_14px_rgba(24,129,241,0.35)]"
          >
            <ShieldTick className="h-4 w-4" />
          </motion.span>
          <motion.span
            initial={{ x: 40, opacity: 0, rotate: 12 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.18 }}
            className="grid h-12 w-12 place-items-center rounded-[16px] border border-white bg-white @[220px]:h-14 @[220px]:w-14 @[220px]:rounded-[18px] shadow-[0_12px_30px_rgba(13,21,34,0.12)] @[300px]:h-20 @[300px]:w-20 @[300px]:rounded-[24px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/logos/${app.logo}.svg`} alt={app.name} className="h-8 w-8 object-contain @[300px]:h-11 @[300px]:w-11" />
          </motion.span>
        </div>
        <p
          className="font-heading mt-4 text-center text-xl font-semibold leading-tight tracking-tight text-[#0D1522] @[300px]:text-2xl @[440px]:text-4xl"
        >
          <Words text={`Postty × ${app.name}`} delay={0.3} />
        </p>
      </motion.div>
    </div>
  );
}

/** La ficha de seguridad (el "tipografías" de la referencia). */
function AuthBlock({ app, t, still }: { app: App; t: Copy; still: boolean }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden p-5 @[260px]:p-6" style={{ background: "linear-gradient(170deg,#F2F8FF 0%,#FFFFFF 55%)" }}>
      <Bubbles color="rgba(73,211,248,0.20)" n={2} still={still} />

      <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1881F1] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_6px_16px_rgba(24,129,241,0.30)]">
        <Lock01 className="h-3.5 w-3.5" />
        {t.connection}
      </span>

      {/* El escudo: late, y a su alrededor gira la órbita de la conexión. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
        <div className="relative aspect-square h-full max-h-[150px]">
          {!still &&
            [0, 1].map((k) => (
              <motion.span
                key={k}
                className="absolute inset-0 rounded-full border border-[#1881F1]/30"
                animate={{ scale: [0.7, 1.35], opacity: [0.8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: k * 1.2, ease: "easeOut" }}
              />
            ))}
          <motion.span
            className="absolute inset-[6%] rounded-full border border-dashed border-[#1881F1]/25"
            animate={still ? undefined : { rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute -top-1.5 left-1/2 grid h-3 w-3 -translate-x-1/2 place-items-center rounded-full bg-[#49D3F8] shadow-[0_0_10px_rgba(73,211,248,0.8)]" />
          </motion.span>
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
            className="absolute inset-[24%] grid place-items-center rounded-[30%] bg-gradient-to-br from-[#1881F1] to-[#49D3F8] text-white shadow-[0_16px_36px_rgba(24,129,241,0.40)]"
          >
            <ShieldTick className="h-1/2 w-1/2" />
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 15, delay: 0.45 }}
            className="absolute bottom-[16%] right-[16%] grid h-[24%] w-[24%] place-items-center rounded-full border-2 border-white bg-white shadow-[0_6px_14px_rgba(13,21,34,0.15)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/logos/${app.logo}.svg`} alt="" className="h-[62%] w-[62%] object-contain" />
          </motion.span>
        </div>
      </div>

      <p className="font-heading relative text-xl font-semibold leading-tight tracking-tight text-[#0D1522] @[300px]:text-2xl">
        <Words text={app.authTitle} delay={0.1} />
      </p>
      <p className="relative mt-0.5 text-[12px] text-[#0D1522]/50">{app.authSub}</p>

      <div className="relative mt-3 flex flex-wrap gap-1.5">
        {t.badges.map((b, k) => (
          <motion.span
            key={b}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + k * 0.07, type: "spring", stiffness: 400, damping: 18 }}
            className="rounded-full border border-[#1881F1]/15 bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#1881F1]"
          >
            {b}
          </motion.span>
        ))}
      </div>

      <ul className="relative mt-3 space-y-2">
        {app.perms.map((p, k) => {
          const Icon = PERM_ICONS[p.i];
          return (
            <motion.li
              key={p.t}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + k * 0.09 }}
              className="flex items-start gap-2 text-[13px] leading-snug text-[#0D1522]/75"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55 + k * 0.09, type: "spring", stiffness: 500, damping: 15 }}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#EAF4FF]"
              >
                <Icon className="h-3 w-3 text-[#1881F1]" />
              </motion.span>
              <span className="min-w-0">{p.t}</span>
            </motion.li>
          );
        })}
      </ul>

      <p className="relative mt-3 flex items-center gap-1.5 border-t border-[#0D1522]/8 pt-3 text-[11px] font-medium text-[#0D1522]/50">
        <LinkBroken01 className="h-3.5 w-3.5 shrink-0" />
        {t.revoke}
      </p>
    </div>
  );
}

/** Una historia: la pieza publicada, barras de progreso y el CTA. */
function StoryBlock({
  app,
  count,
  active,
  paused,
  still,
  cta,
}: {
  app: App;
  count: number;
  active: number;
  paused: boolean;
  still: boolean;
  cta: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative m-2 mb-0 min-h-0 flex-1 overflow-hidden rounded-[18px] bg-[#0D1522]">
      {app.media.kind === "video" ? (
        <video src={app.media.src} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <motion.img
          src={app.media.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.15 }}
          animate={{ scale: still ? 1.15 : 1.04 }}
          transition={{ duration: 3.2, ease: "easeOut" }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

      {/* Barras de historia: la activa se llena en lo que dura la app. */}
      <div className="absolute inset-x-3 top-3 flex gap-1">
        {Array.from({ length: count }).map((_, k) => (
          <span key={k} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            <motion.span
              key={`${active}-${paused}`}
              className="block h-full bg-white"
              initial={{ width: k < active || (k === active && paused) ? "100%" : "0%" }}
              animate={{ width: k <= active ? "100%" : "0%" }}
              transition={{ duration: k === active && !paused ? AUTOPLAY_MS / 1000 : 0, ease: "linear" }}
            />
          </span>
        ))}
      </div>
      <div className="absolute inset-x-3 top-6 flex items-center gap-2 text-white">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/logos/${app.logo}.svg`} alt="" className="h-3.5 w-3.5 object-contain" />
        </span>
        <span className="text-[11px] font-semibold">{app.name}</span>
        <X className="ml-auto h-4 w-4 opacity-80" />
      </div>

      </div>
      <div className="flex shrink-0 flex-col gap-2 p-3 pt-2.5">
        <motion.span
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 18 }}
          className="flex items-center gap-1.5 px-1 text-[12px] font-semibold text-[#0D1522]/70"
        >
          <CheckCircle className="h-4 w-4 text-[#1881F1]" />
          {app.toast}
        </motion.span>
        {cta}
      </div>
    </div>
  );
}

/** La frase de "nunca más", sobre un gradiente suave que respira. */
function WideBlock({ app, still }: { app: App; still: boolean }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5 @[260px]:p-6" style={{ background: app.soft }}>
      <Bubbles color={`${app.accent}33`} n={2} still={still} />
      {/* Arcos que cruzan la tarjeta, como en la referencia. */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <motion.path
          d="M-20 180 C 120 40, 280 40, 420 150"
          fill="none"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d="M-20 210 C 140 80, 300 90, 420 190"
          fill="none"
          stroke="white"
          strokeOpacity="0.5"
          strokeWidth="1.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.15, ease: "easeInOut" }}
        />
      </motion.svg>
      <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-[#0D1522]/70 backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/logos/${app.logo}.svg`} alt="" className="h-3 w-3 object-contain" />
        Postty + {app.name}
      </span>
      <p className="font-heading relative text-lg font-semibold leading-[1.15] tracking-tight text-[#0D1522] @[360px]:text-xl @[480px]:text-[28px]">
        <Words text={app.never} delay={0.2} />
      </p>
      <div className="relative flex items-center justify-between text-[11px] font-semibold text-[#0D1522]/55">
        <span>posttyai.com</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="h-5 w-5 rounded-md" />
      </div>
    </div>
  );
}

/** Un teléfono con las apps: la elegida rebota y le llega una notificación. */
function PhoneBlock({ app, apps, still }: { app: App; apps: App[]; still: boolean }) {
  const others = apps.filter((a) => a.logo !== app.logo).slice(0, 2);
  const grid: { src: string; label: string; main?: boolean }[] = [
    { src: "/icon-192.png", label: "Postty" },
    { src: `/logos/${app.logo}.svg`, label: app.name, main: true },
    ...others.map((o) => ({ src: `/logos/${o.logo}.svg`, label: o.name })),
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <motion.div
        initial={{ x: 30, y: 30, rotate: -6, opacity: 0 }}
        animate={{ x: 0, y: 0, rotate: -6, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
        className="absolute left-[14%] top-[14%] h-[150%] w-[118%] min-w-[220px] rounded-[36px] border-[7px] border-[#1C1C22] bg-gradient-to-b from-[#F5F3FF] to-[#E0F2FE] shadow-[0_20px_40px_rgba(13,21,34,0.25)]"
      >
        <div className="flex items-center justify-between px-5 pt-3 text-[11px] font-semibold text-[#0D1522]">
          <span>9:41</span>
          <span className="h-4 w-16 rounded-full bg-[#1C1C22]" />
        </div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 px-5 pt-5">
          {grid.map((g, k) => (
            <motion.div
              key={g.label}
              className="flex flex-col items-center gap-1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 360, damping: 16, delay: 0.25 + k * 0.07 }}
            >
              <motion.span
                className="relative grid h-11 w-11 place-items-center rounded-[13px] bg-white shadow-[0_6px_14px_rgba(13,21,34,0.12)]"
                animate={g.main && !still ? { y: [0, -6, 0, -3, 0] } : undefined}
                transition={{ duration: 1.1, delay: 0.7, repeat: Infinity, repeatDelay: 1.2 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt="" className={g.src.endsWith(".png") ? "h-11 w-11 rounded-[13px]" : "h-6 w-6 object-contain"} />
                {g.main && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 500, damping: 14 }}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#F04438] text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    1
                  </motion.span>
                )}
              </motion.span>
              <span className="max-w-[56px] truncate text-[9px] font-medium text-[#0D1522]/70">{g.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
