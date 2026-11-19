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
   narrow). Picking a time opens Google's booking form as a dialog centred
   in the iframe's viewport (`dialog` px tall). The iframe is made
   2*crop + dialog tall, so the dialog lands exactly on the visible band
   (it starts right where the crop ends); the part of the iframe below the
   box is clipped. `closed` is the visible height until the visitor clicks
   into the calendar; after that it grows to `dialog`, the least that shows
   the whole form. */
const LAYOUTS = {
  wide: { width: 900, crop: { es: 258, en: 239 }, dialog: 640, closed: 470 },
  narrow: { width: 380, crop: { es: 353, en: 353 }, dialog: 720, closed: 640 },
} as const;

const COPY = {
  es: {
    title: "Agendá 30 minutos con Juan",
    ticks: ["Demostración en vivo de Postty con tu marca", "Adaptamos el plan a tu presupuesto"],
    frameTitle: "Agenda de Juan Beines",
  },
  en: {
    title: "Book 30 minutes with Juan",
    ticks: ["Live demo of Postty with your brand", "We fit the plan to your budget"],
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
  const height = open ? L.dialog : L.closed;

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
            height: 2 * crop + L.dialog,
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

/* Untitled UI: video-recorder (the demo) and currency-dollar-circle (the
   budget). The text order in COPY.ticks matches this order. */
const TICK_ICONS = [
  "M22 8.93137C22 8.32555 22 8.02265 21.8802 7.88238C21.7763 7.76068 21.6203 7.69609 21.4608 7.70865C21.2769 7.72312 21.0627 7.93731 20.6343 8.36569L17 12L20.6343 15.6343C21.0627 16.0627 21.2769 16.2769 21.4608 16.2914C21.6203 16.3039 21.7763 16.2393 21.8802 16.1176C22 15.9774 22 15.6744 22 15.0686V8.93137Z M2 9.8C2 8.11984 2 7.27976 2.32698 6.63803C2.6146 6.07354 3.07354 5.6146 3.63803 5.32698C4.27976 5 5.11984 5 6.8 5H12.2C13.8802 5 14.7202 5 15.362 5.32698C15.9265 5.6146 16.3854 6.07354 16.673 6.63803C17 7.27976 17 8.11984 17 9.8V14.2C17 15.8802 17 16.7202 16.673 17.362C16.3854 17.9265 15.9265 18.3854 15.362 18.673C14.7202 19 13.8802 19 12.2 19H6.8C5.11984 19 4.27976 19 3.63803 18.673C3.07354 18.3854 2.6146 17.9265 2.32698 17.362C2 16.7202 2 15.8802 2 14.2V9.8Z",
  "M8.5 14.6667C8.5 15.9553 9.54467 17 10.8333 17H13C14.3807 17 15.5 15.8807 15.5 14.5C15.5 13.1193 14.3807 12 13 12H11C9.61929 12 8.5 10.8807 8.5 9.5C8.5 8.11929 9.61929 7 11 7H13.1667C14.4553 7 15.5 8.04467 15.5 9.33333M12 5.5V7M12 17V18.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",
];

function Ticks({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((c, i) => (
        <li key={c} className="flex items-center gap-2 text-sm font-medium text-[#0D1522]/75">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-[#0D1522]">
            <path d={TICK_ICONS[i]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {c}
        </li>
      ))}
    </ul>
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
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#0D1522] sm:text-3xl">{t.title}</h2>
          </div>
          <Ticks items={t.ticks} />
        </div>
        <div className="border-t border-[#0D1522]/[0.06] bg-white px-2 pt-2 sm:px-4 sm:pt-4">
          <BookingFrame />
        </div>
      </motion.div>
    </section>
  );
}

