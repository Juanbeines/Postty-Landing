/**
 * IgStats — likes / comments / views row overlaid on a creative card.
 */

import { useCopy } from "@/i18n/locale";

export type Stats = { likes: string; comments: string; views: string };

/* Screen-reader labels; the visible row is icons and numbers only. */
const LABELS = {
  es: { likes: "me gusta", comments: "comentarios", views: "vistas" },
  en: { likes: "likes", comments: "comments", views: "views" },
};

/* Instagram-style engagement row laid over the bottom of each card, white on
   a short dark gradient so it reads on any photo.

   Every length goes through `unit`, which the caller maps to its card size
   (the hero passes its viewport-based `u`, where a card is 64u tall; the
   creative wheel passes px scaled the same way), so the row keeps the same
   proportions on any card. */
export default function IgStats({ stats, unit: u }: { stats: Stats; unit: (n: number) => string }) {
  const l = useCopy(LABELS);
  const icon = { width: u(2.1), height: u(2.1) };
  const items = [
    {
      n: stats.likes,
      label: l.likes,
      path: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
    },
    {
      n: stats.comments,
      label: l.comments,
      path: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
    },
    {
      n: stats.views,
      label: l.views,
      path: (
        <>
          <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
          <circle cx="12" cy="12" r="3" />
        </>
      ),
    },
  ];
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center bg-gradient-to-t from-black/55 via-black/25 to-transparent font-semibold text-white"
      style={{ gap: u(1.8), padding: `${u(5)} ${u(1.8)} ${u(1.5)}`, fontSize: u(1.45) }}
    >
      {items.map((it) => (
        <span key={it.label} className="flex items-center" style={{ gap: u(0.55) }} aria-label={`${it.n} ${it.label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={icon} aria-hidden="true">
            {it.path}
          </svg>
          <span aria-hidden="true" className="tabular-nums leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{it.n}</span>
        </span>
      ))}
    </div>
  );
}
