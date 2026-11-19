"use client";

/**
 * "Agendá 30 minutos con Juan" — the founder booking block above the FAQ.
 *
 * The calendar is a Google Calendar appointment schedule embedded in an
 * iframe. Google's page can't be styled, so BookingFrame renders it at a
 * fixed width (where its layout is known) and crops off Google's header
 * (the host's photo and name, the title and the description), then scales
 * the result to the container. Only the date and time picker shows.
 *
 * The crop offsets were measured on the live page (2026-11-19). If the
 * appointment's title or description changes, re-measure them: the header
 * grows with its text. `hl` pins the language so the wrapping is the one
 * measured.
 *
 * Tracking (Juan, 2026-11-18): the first click into the calendar fires the
 * standard `Contact` event, once per page view — never `Lead`, so it does
 * not dilute the signal the campaigns optimise against.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCopy, useLocale } from "@/i18n/locale";
import { trackEvent } from "@/lib/pixel";

const BOOKING_BASE =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1TD24k5sv2ZCEuXh4IYNozbXo--HFzpW-pPRebY9bJt_RNy7B1BNOCUOjafKBZ1OONFAkFknz_?gv=true";

/* Google's layout at two fixed widths. `crop` = px of Google's header to
   hide (measured: the picker box starts at 262 es / 243 en wide, 357
   narrow). `height` = what stays visible: `closed` until the visitor clicks
   into the calendar, `open` after. Picking a time opens Google's booking
   form as a dialog centred in the iframe (631px tall wide, 715 narrow); it
   only clears the cropped band when height >= crop + dialog, so the frame
   grows to `open` on the first click (which comes before the dialog). */
const LAYOUTS = {
  wide: { width: 900, crop: { es: 258, en: 239 }, height: { closed: 470, open: 900 } },
  narrow: { width: 380, crop: { es: 353, en: 353 }, height: { closed: 700, open: 1090 } },
} as const;

const COPY = {
  es: {
    title: "Agendá 30 minutos con Juan",
    sub: "Te muestro Postty funcionando con tu marca, en vivo.",
    chips: ["30 min", "Google Meet", "Sin costo"],
    frameTitle: "Agenda de Juan Beines",
  },
  en: {
    title: "Book 30 minutes with Juan",
    sub: "I'll show you Postty working with your brand, live.",
    chips: ["30 min", "Google Meet", "Free"],
    frameTitle: "Juan Beines' calendar",
  },
};

/* ── The cropped calendar ─────────────────────────────────────────────── */

export function BookingFrame({ layout = "auto" }: { layout?: "auto" | "wide" | "narrow" }) {
  const locale = useLocale();
  const t = useCopy(COPY);
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const [open, setOpen] = useState(false);

  // First click into the calendar: grow the frame so Google's booking
  // dialog fits, and fire `Contact` once. A click inside a cross-origin
  // iframe can't be read; the window losing focus to it is the signal.
  useEffect(() => {
    let fired = false;
    const onBlur = () => {
      // The blur happens before activeElement moves to the iframe.
      setTimeout(() => {
        if (fired || document.activeElement !== frameRef.current) return;
        fired = true;
        setOpen(true);
        trackEvent("Contact", { content_name: "founder_call", content_category: "agenda_juan" });
      }, 0);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const kind = layout === "auto" ? (boxWidth >= 620 ? "wide" : "narrow") : layout;
  const L = LAYOUTS[kind];
  const crop = L.crop[locale];
  const scale = boxWidth ? boxWidth / L.width : 1;
  const height = open ? L.height.open : L.height.closed;

  return (
    <div
      ref={boxRef}
      className="relative w-full overflow-hidden transition-[height] duration-300 ease-out"
      style={{ height: boxWidth ? height * scale : height }}
    >
      {boxWidth > 0 && (
        <iframe
          key={kind}
          ref={frameRef}
          src={`${BOOKING_BASE}&hl=${locale}`}
          title={t.frameTitle}
          loading="lazy"
          className="absolute left-0 top-0 border-0 bg-white"
          style={{
            width: L.width,
            height: height + crop,
            transform: `translateY(${-crop * scale}px) scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      )}
    </div>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────────── */

function Avatar({ size = 56 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-white shadow-[0_4px_16px_rgba(13,21,34,0.12)]"
      style={{ width: size, height: size }}
    >
      <Image src="/team/juan.webp" alt="Juan Beines" fill sizes={`${size}px`} className="scale-[2] translate-x-1 object-cover" />
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <span
          key={c}
          className="rounded-full border border-[#0D1522]/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#0D1522]/70"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5 },
};

/* ── The section ──────────────────────────────────────────────────────── */

export default function FounderBooking() {
  const t = useCopy(COPY);
  return (
    <section id="agenda" className="px-4 pt-20 sm:px-6">
      <motion.div
        {...reveal}
        className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-[0_4px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
      >
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar size={56} />
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#0D1522] sm:text-3xl">{t.title}</h2>
              <p className="mt-1 text-sm text-[#0D1522]/60">{t.sub}</p>
            </div>
          </div>
          <Chips items={t.chips} />
        </div>
        <div className="border-t border-[#0D1522]/[0.06] bg-white px-2 pt-2 sm:px-4 sm:pt-4">
          <BookingFrame />
        </div>
      </motion.div>
    </section>
  );
}

