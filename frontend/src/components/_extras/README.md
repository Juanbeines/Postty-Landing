# _extras

Landing page sections that used to live in `src/app/page.tsx` but were removed
from the live page for product reasons. Kept here in case we want to restore
any of them later.

None of these components are imported anywhere. They are here purely as a
backup / reference.

## Contents

### `StatsSection.tsx`
"IA entrenada para generar contenido que vende" — a simple 3-stat grid
(+300 negocios · 5 min · 0 experiencia). Lived between the "How it works"
step mockups and the "Privacy" section.

### `PrivacySection.tsx`
"Grandes poderes vienen con gran privacidad" — centered copy plus the mascot
with an animated lock badge. Lived between the "Stats" section and the "FAQ"
section.

## Restoring a section

1. `import { StatsSection } from "@/components/_extras/StatsSection";`
2. Render it in `page.tsx` where you want it.

Each component is self-contained (owns its own data, imports its own deps)
so restoring is just an import + a JSX tag — no copy-paste of arrays or CSS.
