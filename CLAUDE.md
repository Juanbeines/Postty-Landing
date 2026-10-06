# Postty Landing

## Regla: no tocar los píxeles

Los cambios nunca tocan la medición como efecto secundario. Solo se modifica si Juan lo pide explícitamente.

Esto incluye:
- `frontend/src/lib/pixel.ts` (Meta Pixel, CAPI, `trackEvent`, `useAppUrl`/`useCheckoutUrl` y el manejo de `fbclid`).
- `frontend/src/components/MetaPixel.tsx`.
- Los scripts de Google Analytics en `frontend/src/components/RootDocument.tsx`.
- El payload de cada `trackEvent(...)`: nombre del evento, `content_name`, `content_category`, `content_ids`, `content_type`, `value` y `currency`.

Al traducir, mover o reestructurar código, los eventos tienen que salir idénticos. Por ejemplo, la versión en inglés muestra precios en USD, pero los eventos `Lead` del checkout siguen reportando los montos en pesos con `currency: "ARS"`, igual que antes.

## Idiomas

El sitio se publica en español en `/` y en inglés en `/en/`. Son dos layouts raíz (`src/app/(es)` y `src/app/(en)/en`) que renderizan el mismo `src/components/Landing.tsx`. Cada componente tiene sus textos en un objeto `{ es, en }` y los elige con `useCopy` (`src/i18n/locale.tsx`). Si cambiás un texto en español, actualizá también el inglés.
