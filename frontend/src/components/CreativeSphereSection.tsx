"use client";

/**
 * CreativeSphereSection — 9:16 creatives standing on the rim of a big
 * invisible circle, turning slowly clockwise, with a Ads / Posts / Videos selector.
 *
 * Replaced the 3D sphere (archived at _extras/CreativeSphereSection.tsx).
 *
 * Geometry: every card hangs off ONE container with
 * `rotate(θ) translateY(-Rc)`, so it stands radially on the circle like a
 * spoke. The container is what turns: one transform per frame for the whole
 * ring, driven by a small rAF loop so the wheel can also be grabbed — drag it
 * with the mouse or a finger to speed it up or run it backwards; let go and
 * it coasts, then eases back to its own slow pace.
 *
 * Each tab fills the circle with a whole number of copies of its creatives
 * (slotsFor), so the sequence closes cleanly and no two neighbours repeat.
 * The order runs the way cards ARRIVE at the top: the lead creative is centred
 * and the next in the list is the one turning in after it. Rc is derived from
 * the card width so neighbours keep an even gap and about five fit across a
 * full-width screen.
 *
 * All creatives are AI-generated for fictional brands — no real brand marks.
 */

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import IgStats, { type Stats } from "@/components/IgStats";

type Tab = "ads" | "posts" | "videos";

const TABS: { id: Tab; label: string }[] = [
  { id: "ads", label: "Ads" },
  { id: "posts", label: "Posts" },
  { id: "videos", label: "Videos" },
];

const CREATIVES: Record<Tab, string[]> = {
  ads: ["01b", "02b", "03b", "04b", "05", "06b", "07b", "08c", "09b", "10"].map((n) => `/creatives-v3/ads/ad-${n}.webp`),
  posts: ["06", "07", "08-b", "09", "10-b", "02", "03", "04", "05"].map((n) => `/creatives-v3/posts/post-${n}.webp`),
  // Sweaters lead, then the bags, then the perfume, around and around.
  videos: ["02", "01", "03"].map((n) => `/creatives-v3/videos/video-${n}.mp4`),
};

/* Small-account numbers on purpose (30–500 likes): the point is "this is
   what a normal brand posts", not viral proof. Deterministic per slot so
   server and client render the same thing. */
function statsFor(i: number): Stats {
  const r = (seed: number) => {
    const x = Math.sin(i * 97.13 + seed * 13.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const likes = Math.round(30 + r(1) * 470);
  const comments = Math.max(2, Math.round(likes * (0.03 + r(2) * 0.09)));
  const views = Math.round(likes * (6 + r(3) * 8));
  const fmt = (n: number) => n.toLocaleString("es-AR");
  return { likes: fmt(likes), comments: fmt(comments), views: fmt(views) };
}

const TARGET_SLOTS = 26;    // roughly how many cards go around the full circle
/* The real count is the multiple of the tab's creative count closest to
   TARGET_SLOTS, so the list repeats a whole number of times and the seam where
   it wraps never puts the same creative twice in a row. */
const slotsFor = (n: number) => n * Math.max(2, Math.round(TARGET_SLOTS / n));
const BASE_SPEED = 360 / 140; // deg/s — one slow turn every 140 s
const GAP = 1.02;           // centre-to-centre distance vs card width — nearly touching
const PAD = 28;             // room above the top card for its shadow
const FADE = 190;           // px over which the ring dissolves at the section's bottom edge
const BELOW = 0.6;          // room under the top card for the ring's sides, in card heights

const isVideo = (src: string) => src.endsWith(".mp4");

/* Flag and heart as small glossy "glass" badges: a top sheen, a darker
   foot, a bright rim and a soft drop shadow give them depth. Drawn rather
   than emoji: Windows renders 🇦🇷 as the letters "AR". */
function GlassFlag({ className }: { className?: string }) {
  const id = "g" + useId().replace(/[^a-zA-Z0-9]/g, ""); // safe inside url(#…)
  return (
    <svg viewBox="0 0 30 21" role="img" aria-label="bandera argentina" className={className}>
      <defs>
        <clipPath id={`${id}c`}><rect x="0.5" y="0.5" width="29" height="20" rx="4.5" /></clipPath>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#0D1522" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id={`${id}u`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#FFE27A" />
          <stop offset="1" stopColor="#E9A400" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="30" height="21" fill="#74ACDF" />
        <rect y="7" width="30" height="7" fill="#fff" />
        <circle cx="15" cy="10.5" r="2.4" fill={`url(#${id}u)`} />
        <rect width="30" height="21" fill={`url(#${id}s)`} />
      </g>
      <rect x="0.9" y="0.9" width="28.2" height="19.2" rx="4.1" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
    </svg>
  );
}

function GlassHeart({ className }: { className?: string }) {
  const id = "g" + useId().replace(/[^a-zA-Z0-9]/g, ""); // safe inside url(#…)
  const shape = "M12 21.2 3.9 13.4C1.6 11.1 1.5 7.3 3.8 5.1 6 3 9.5 3.2 11.5 5.5l.5.6.5-.6c2-2.3 5.5-2.5 7.7-.4 2.3 2.2 2.2 6-.1 8.3Z";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={`${id}b`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FF6B7A" />
          <stop offset="0.55" stopColor="#E11D2E" />
          <stop offset="1" stopColor="#A50E1F" />
        </radialGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={shape} fill={`url(#${id}b)`} />
      {/* Specular sheen on the left lobe — the "glass" catch-light. */}
      <ellipse cx="8" cy="7.6" rx="3.3" ry="1.9" transform="rotate(-28 8 7.6)" fill={`url(#${id}h)`} />
      <path d={shape} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.7" />
    </svg>
  );
}

/* One video card. Always starts muted — that is what lets browsers autoplay
   it — and only the card the visitor tapped gets sound. `muted` is set on
   the element rather than trusted to the JSX attribute, because React does
   not reflect `muted` reliably and iOS refuses to autoplay without it. */
function CreativeVideo({ src, sound, active, onToggle, size }: {
  src: string;
  sound: boolean;
  active: boolean;
  onToggle: () => void;
  size: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = !sound;
    if (sound) v.currentTime = 0; // tapped for sound → hear it from the start
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [sound, active]);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={sound ? "Silenciar video" : "Activar audio del video"}
      aria-pressed={sound}
      className="absolute inset-0 block h-full w-full cursor-pointer"
    >
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full select-none object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
        style={{ top: size * 0.05, right: size * 0.05, width: size * 0.17, height: size * 0.17 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "55%", height: "55%" }}>
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          {sound ? (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </>
          ) : (
            <>
              <path d="m22 9-6 6" />
              <path d="m16 9 6 6" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}

export default function CreativeSphereSection() {
  const ref = useRef<HTMLElement>(null);
  const [w, setW] = useState(1280);
  const [tab, setTab] = useState<Tab>("posts");
  const [soundSlot, setSoundSlot] = useState<number | null>(null); // the one card with audio on
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false); // the wheel waits for its first sight, so it opens on the lead creative

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Videos only play while the section is on screen, and scrolling away
     silences them — sound from something you can no longer see is jarring. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      // Several crossings can arrive in one batch; only the newest is current.
      const e = entries[entries.length - 1];
      setInView(e.isIntersecting);
      // Start turning only once the wheel is really in view, not when the
      // heading first peeks in — or it has already moved off the lead card.
      if (e.intersectionRatio >= 0.5) setSeen(true);
      if (!e.isIntersecting) setSoundSlot(null);
    }, { threshold: [0.15, 0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = CREATIVES[tab];
  const slots = slotsFor(Math.max(items.length, 1));
  const step = (2 * Math.PI) / slots;

  const cardW = Math.min(Math.max(w * 0.15, 150), 290);
  const cardH = (cardW * 16) / 9;
  const Rc = (cardW * GAP) / (2 * Math.sin(step / 2)); // orbit of card centres
  const cy = PAD + cardH / 2 + Rc;                     // circle centre, from stage top
  const stageH = PAD + cardH + cardH * BELOW;

  /* Slot i, counting clockwise from the top. The wheel turns clockwise, so
     the card that reaches the top next is the one to its LEFT (slot -1):
     walking the list backwards around the circle makes it arrive in order. */
  const creativeAt = (i: number) => items[(items.length - (i % items.length)) % items.length];

  /* ── Wheel motion ──────────────────────────────────────────────────────
     angle/velocity live in refs and the loop writes the transform directly:
     no React render per frame. When nothing holds it, velocity eases toward
     the cruise speed (zero while paused), which is also what turns a fling
     into a coast that settles back to normal. */
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const motionRef = useRef({ angle: 0, vel: 0, dragging: false, lastX: 0, lastT: 0, moved: 0, hover: false });
  const pausedRef = useRef(true);
  const rcRef = useRef(Rc);
  // The loop and the drag handlers read these; synced after each render.
  useEffect(() => {
    pausedRef.current = !seen || soundSlot !== null;
    rcRef.current = Rc;
  }, [seen, soundSlot, Rc]);

  // Every tab opens on its lead creative at the top.
  useEffect(() => {
    motionRef.current.angle = 0;
    motionRef.current.vel = 0;
  }, [tab]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const m = motionRef.current;
      if (!m.dragging) {
        // Hovering with a mouse slows it to a stop so a card can be read.
        const cruise = pausedRef.current || m.hover || reduce ? 0 : BASE_SPEED;
        m.vel += (cruise - m.vel) * Math.min(1, dt * 1.4);
        m.angle += m.vel * dt;
      }
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${m.angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Drag: horizontal movement at the top of the ring maps to arc length, so
     the card under the pointer follows it. Listeners go on window for the
     rest of the gesture, so a fast drag that leaves the stage keeps working. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const m = motionRef.current;
    m.dragging = true;
    m.lastX = e.clientX;
    m.lastT = performance.now();
    m.moved = 0;
    m.vel = 0;
    const move = (ev: PointerEvent) => {
      const now = performance.now();
      const dx = ev.clientX - m.lastX;
      const d = (dx / rcRef.current) * (180 / Math.PI);
      m.angle += d;
      m.moved += Math.abs(dx);
      const dtm = Math.max((now - m.lastT) / 1000, 1 / 240);
      m.vel = m.vel * 0.6 + (d / dtm) * 0.4; // smoothed, so the fling is the hand's speed, not one jittery event
      m.lastX = ev.clientX;
      m.lastT = now;
    };
    const up = () => {
      m.dragging = false;
      // A pause before letting go means "stop here", not "fling".
      if (performance.now() - m.lastT > 80) m.vel = 0;
      m.vel = Math.max(-240, Math.min(240, m.vel));
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  /* A drag must not also count as a tap (which would toggle a video's sound). */
  const onClickCapture = (e: React.MouseEvent) => {
    if (motionRef.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
      motionRef.current.moved = 0;
    }
  };

  return (
    /* `isolate` keeps the cards' stacking inside this section, so the gift
       overlay (z-[100]) always paints over it. */
    <section
      ref={ref}
      id="creativos"
      className="relative isolate overflow-hidden pt-20 md:pt-24"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-5xl px-4 text-center font-heading text-3xl font-semibold tracking-tight text-[#0D1522] sm:text-4xl md:text-5xl"
      >
        Contenido, Ads, Videos UGC y mucho más
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="mt-4 px-4 text-center text-base leading-relaxed text-[#0D1522]/65 sm:text-lg md:text-xl"
      >
        Hecho por Postty, para el mercado{" "}
        {/* Kept on one line with the word so the badges never wrap off on
            their own. */}
        <span className="whitespace-nowrap">
          argentino
          <GlassFlag className="ml-[0.4em] inline-block h-[0.95em] w-auto align-[-0.12em] drop-shadow-[0_2px_3px_rgba(13,21,34,0.28)]" />
          <GlassHeart className="ml-[0.3em] inline-block h-[1.05em] w-auto align-[-0.18em] drop-shadow-[0_2px_3px_rgba(165,14,31,0.35)]" />
        </span>
      </motion.p>

      {/* Format selector — underline tabs on one shared track. */}
      <div role="tablist" aria-label="Formato" className="relative mx-auto mt-10 flex w-fit gap-10 md:mt-14 md:gap-16">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#0D1522]/[0.07]" />
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setSoundSlot(null);
            }}
            className={`relative pb-2 font-heading text-lg transition-colors md:text-2xl ${
              tab === t.id ? "text-[#0D1522]" : "text-[#0D1522]/55 hover:text-[#0D1522]"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span
                layoutId="creative-tab-bar"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#A6E35A]"
              />
            )}
          </button>
        ))}
      </div>

      {/* The ring's sides run off the bottom of the section. A mask fades
          the cards out over the last FADE px so there is no hard crop line,
          and a blur band over the same strip (below) softens them as they
          go — a progressive blur rather than a cut. */}
      <div
        className="relative mt-6 cursor-grab select-none active:cursor-grabbing md:mt-10"
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") motionRef.current.hover = true; }}
        onPointerLeave={() => { motionRef.current.hover = false; }}
        style={{
          height: stageH,
          // Vertical swipes still scroll the page; horizontal ones turn the wheel.
          touchAction: "pan-y",
          maskImage: `linear-gradient(to bottom, #000 calc(100% - ${FADE}px), transparent)`,
          WebkitMaskImage: `linear-gradient(to bottom, #000 calc(100% - ${FADE}px), transparent)`,
        }}
      >
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              {/* The wheel. Its box is the orbit circle; cards hang off its centre. */}
              <div
                ref={wheelRef}
                className="absolute will-change-transform"
                style={{ width: Rc * 2, height: Rc * 2, left: `calc(50% - ${Rc}px)`, top: cy - Rc }}
              >
                {Array.from({ length: slots }, (_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 overflow-hidden rounded-[18px] bg-white shadow-[0_18px_40px_-14px_rgba(13,21,34,0.35),0_2px_6px_rgba(13,21,34,0.08)]"
                    style={{
                      width: cardW,
                      height: cardH,
                      marginLeft: -cardW / 2,
                      marginTop: -cardH / 2,
                      transform: `rotate(${(360 / slots) * i}deg) translateY(${-Rc}px)`,
                    }}
                  >
                    {isVideo(creativeAt(i)) ? (
                      <CreativeVideo
                        src={creativeAt(i)}
                        sound={soundSlot === i}
                        active={inView}
                        onToggle={() => setSoundSlot((s) => (s === i ? null : i))}
                        size={cardW}
                      />
                    ) : (
                      <img
                        src={creativeAt(i)}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full select-none object-cover"
                      />
                    )}
                    <IgStats stats={statsFor(i)} unit={(n) => `${(n * cardH) / 64}px`} />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="soon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 text-center font-heading text-xl text-[#0D1522]/45 md:text-2xl"
              style={{ top: PAD + cardH * 0.55 }}
            >
              Próximamente
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 backdrop-blur-[10px]"
        style={{
          height: FADE,
          // Faded out at BOTH ends. A backdrop blur that is still on at the
          // section's bottom edge leaves a visible seam where blurred studio
          // meets sharp studio; tapering it to zero there removes the line.
          maskImage: "linear-gradient(to top, transparent, #000 40%, #000 60%, transparent)",
          WebkitMaskImage: "linear-gradient(to top, transparent, #000 40%, #000 60%, transparent)",
        }}
      />
    </section>
  );
}
