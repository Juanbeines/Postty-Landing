"use client";

/**
 * Burst of N particles flying outward from a given (x, y) viewport
 * coordinate with gravity drift + random spin + fade. Used by
 * GiftOverlay (burst from viewport center on "Ver regalo" click) and
 * PricingSection (burst from the Basic "20% OFF" badge once the
 * discount lands).
 */

import { motion } from "framer-motion";

const PARTICLES = 60;
const COLORS = ["#1881F1", "#49D3F8", "#D6F951", "#022BB0", "#b5ff00", "#FFFFFF"];

export default function Confetti({
  originX,
  originY,
}: {
  originX: number;
  originY: number;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      <div className="absolute h-0 w-0" style={{ left: originX, top: originY }}>
        {Array.from({ length: PARTICLES }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / PARTICLES + (Math.random() - 0.5) * 0.4;
          const distance = 260 + Math.random() * 380;
          const x = Math.cos(angle) * distance;
          const yLateral = Math.sin(angle) * distance;
          const color = COLORS[i % COLORS.length];
          const size = 6 + Math.random() * 8;
          const duration = 1.4 + Math.random() * 0.9;
          const rotate = (Math.random() - 0.5) * 1080;
          const round = Math.random() > 0.55 ? "50%" : "2px";
          return (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                x,
                y: yLateral + 520, // gravity drift
                opacity: 0,
                rotate,
                scale: 0.6,
              }}
              transition={{ duration, ease: [0.2, 0.55, 0.4, 1] }}
              className="absolute block"
              style={{
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: round,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
