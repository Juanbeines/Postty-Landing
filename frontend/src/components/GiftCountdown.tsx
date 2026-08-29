"use client";

/**
 * GiftCountdown — the live timer under a plan's discount pill.
 *
 * Its own component on purpose: it ticks once a second, and if that state
 * lived in PricingSection the whole section — three cards, three animated
 * mascots, the confetti host — would re-render sixty times a minute. Here
 * only these few characters do.
 *
 * Renders nothing when no gift has been claimed or the window has closed,
 * so the caller does not need to guard it.
 */

import { useEffect, useState } from "react";

import { giftMsRemaining } from "@/lib/giftDiscount";

const pad = (n: number) => String(n).padStart(2, "0");

/** `6d 23:59:07`, dropping the day group once under 24h. */
function format(ms: number): string {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
}

/**
 * `bare` drops the chip's own background, border and shadow so the timer can
 * sit INSIDE the discount badge and inherit its colour — one object on the
 * card instead of two stacked ones.
 */
export default function GiftCountdown({ bare = false }: { bare?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(giftMsRemaining());
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  if (left === null || left <= 0) return null;

  return (
    <div
      className={
        bare
          ? "inline-flex shrink-0 items-center gap-1.5"
          : "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-[0.3rem] text-[#0D1522] shadow-[0_3px_12px_rgba(181,255,0,0.45)]"
      }
      style={bare ? undefined : { background: "linear-gradient(135deg, #b5ff00, #eeff64)" }}
      // Announced once rather than on every tick — a timer read aloud every
      // second is unusable with a screen reader.
      aria-label="La oferta vence pronto"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span className="text-[0.62rem] font-semibold opacity-65">Vence en</span>
      <span
        aria-hidden="true"
        className="text-[0.68rem] font-semibold tabular-nums tracking-tight"
      >
        {format(left)}
      </span>
    </div>
  );
}
