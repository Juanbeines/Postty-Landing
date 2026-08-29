"use client";

/**
 * GiftTeaser — the mascot peeking up from the bottom-right corner.
 *
 * A standing, self-serve way into the gift. The overlay's own timers still
 * run (35s after load, 1s after pricing scrolls in); this is a third door,
 * and it goes through the same `open` so it can never double-fire.
 *
 * At rest only the top of the octopus clears the viewport edge, with the
 * pill sitting just above its head. Hovering lifts the pair together, the
 * way a peeking banner does. Clicking opens the gift immediately; closing
 * the gift scrolls to pricing, which GiftOverlay's own `close` handles.
 *
 * It stays put for the whole session and every click reopens the gift — it
 * is a permanent way back to the offer, not a one-shot nudge.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

import { requestGiftOpen } from "@/lib/giftDiscount";
import { trackEvent } from "@/lib/pixel";

/* How much of the mascot hides below the viewport edge, at rest and on
   hover. Peeking is the whole effect, so it stays mostly hidden: showing
   the entire character turns a tease into a sticker. */
const REST_HIDDEN = 82;
const HOVER_HIDDEN = 56;
const SIZE = 132;

export default function GiftTeaser() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-40 sm:right-8">
      {/* Pill and mascot translate as ONE group. Anchoring the pill to the
          container instead left it floating REST_HIDDEN px above the head,
          because it never saw the mascot's own transform. */}
      <motion.div
        initial={false}
        animate={{ y: hovered ? HOVER_HIDDEN : REST_HIDDEN }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="flex flex-col items-center"
      >
        <motion.div
          initial={false}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
          /* Same recipe as the hero CTAs: no border at all, a light blur, and
             a hairline inset highlight doing the edge instead. One departure —
             the hero can afford bg-white/15 with white text because the video
             behind it is dark; this pill is fixed and also travels over the
             page's light grey, so it keeps dark text and a little more fill. */
          className="pointer-events-none -mb-1 whitespace-nowrap rounded-full bg-white/30 px-4 py-2 text-sm font-semibold text-[#0D1522] shadow-[0_6px_20px_rgba(13,21,34,0.07),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-[6px]"
        >
          Pss, ¡sorpresa!
        </motion.div>

        <button
        type="button"
        aria-label="Abrir tu regalo"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => {
          trackEvent("Lead", {
            content_name: "gift_teaser_mascot",
            content_category: "trial_intent",
          });
          requestGiftOpen();
        }}
        className="pointer-events-auto block cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1881F1] focus-visible:ring-offset-2"
        style={{ width: SIZE, height: SIZE }}
      >
        <Image
          src="/mascot.png"
          alt=""
          width={SIZE}
          height={SIZE}
          className="drop-shadow-[0_-6px_24px_rgba(13,21,34,0.18)]"
        />
        </button>
      </motion.div>
    </div>
  );
}
