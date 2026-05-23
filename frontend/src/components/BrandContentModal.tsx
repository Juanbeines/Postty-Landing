"use client";

/**
 * BrandContentModal — full-screen carousel that shows a brand's Postty-
 * generated content (ads, posts, etc.) when the user clicks "Ver Ads" /
 * "Ver Posts" on a brand-testimonial card.
 *
 * Layout:
 *   - Full-screen overlay with a blurred page-content background.
 *   - One image centered, sized to roughly match the brand card it
 *     spawned from on desktop, and full-bleed on mobile.
 *   - Source ads are 4:5 (Meta portrait), so the image container uses
 *     `aspect-[4/5]` and `object-cover` to keep them undistorted.
 *   - Prev/Next glass-circle buttons + counter at the bottom.
 *   - X close at the top-right (always visible).
 *
 * Controls:
 *   - ESC closes
 *   - ← / → arrows navigate
 *   - Buttons hide at the boundaries (no wrap-around)
 *   - Body scroll locks while open.
 */

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/pixel";

type Props = {
  items: readonly string[];
  brandName: string;
  onClose: () => void;
};

export default function BrandContentModal({ items, brandName, onClose }: Props) {
  const [idx, setIdx] = useState(0);

  const goPrev = () => setIdx((i) => (i > 0 ? i - 1 : i));
  const goNext = () => setIdx((i) => (i < items.length - 1 ? i + 1 : i));

  /* Lock body scroll while open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Keyboard: ESC = close, ← → = nav */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, onClose]);

  /* Fire a ViewContent event for analytics — separate from the brand
     listing so you can see how often users actually open the gallery. */
  useEffect(() => {
    trackEvent("ViewContent", {
      content_category: "brand_content_modal",
      content_name: brandName,
      content_ids: [`brand_${brandName.toLowerCase().replace(/\s+/g, "_")}`],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atStart = idx === 0;
  const atEnd = idx === items.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-white/40 px-4 py-6 backdrop-blur-2xl backdrop-saturate-150 sm:p-6"
      onClick={(e) => {
        // Click on the backdrop (not on the inner content) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* X close — top-right of the viewport, always visible */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/35 text-[#0D1522] shadow-[0_4px_16px_rgba(13,21,34,0.10),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/55 sm:right-6 sm:top-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Inner container — sized to brand-card proportions on desktop,
          full-bleed on mobile. */}
      <div className="relative flex h-full w-full max-w-[460px] items-center justify-center">
        <div className="relative w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={items[idx]}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(13,21,34,0.20)]"
            >
              <Image
                src={items[idx]}
                alt={`${brandName} — ${idx + 1} / ${items.length}`}
                fill
                sizes="(max-width: 640px) 100vw, 460px"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Prev — hidden at start */}
          {!atStart && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/45 text-[#0D1522] shadow-[0_4px_16px_rgba(13,21,34,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/65 sm:-left-5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Next — hidden at end */}
          {!atEnd && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/45 text-[#0D1522] shadow-[0_4px_16px_rgba(13,21,34,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/65 sm:-right-5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Counter — glass pill at the bottom */}
          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/60 bg-white/35 px-3 py-1 text-xs font-semibold text-[#0D1522] shadow-[0_4px_16px_rgba(13,21,34,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150">
            {idx + 1} / {items.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
