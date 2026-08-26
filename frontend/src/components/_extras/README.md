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

### `AgencyPlanCard.tsx`
The fourth pricing card ("Agencia — Personalizado / Agendar reunión"). Pulled
when the landing repositioned onto e-commerce (2026-08); removing it also left
Basic sitting in the centre of the grid with no reordering.

**Do not restore it as-is.** The plan it advertises does not exist yet: in
`Postty-Prod/backend/entitlements.py` the "agency" plan is scaffolding that
inherits Pro entitlements literally, with multi-cliente, team seats and
white-label behind feature flags defaulting to false. So "Hasta 5 marcas" and
"Hasta 10 usuarios en tu equipo" are not deliverable.

Restoring also needs, in `PricingSection`: the grid back to `lg:grid-cols-4`,
and `"agency"` back in the `hoveredCard` union.

### Other files here
`ContentCalendarSection.tsx`, `FuncionalidadesSection.tsx`,
`HowItWorksCardsSection.tsx`, `HowItWorksOldSection.tsx`,
`PlatformCardsSection.tsx`, `ProblemCardsStack.tsx` — same deal, parked
sections.

### `REMOVED-COPY.md`
Every string cut in the 2026-08 e-commerce repositioning, verbatim: plan
features, card subtitles, the FAQs that were rewritten or dropped, and the
section headings that were tried and discarded.

## Restoring a section

1. `import { StatsSection } from "@/components/_extras/StatsSection";`
2. Render it in `page.tsx` where you want it.

Each component is self-contained (owns its own data, imports its own deps)
so restoring is just an import + a JSX tag — no copy-paste of arrays or CSS.
