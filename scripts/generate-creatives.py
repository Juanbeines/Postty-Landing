"""Regenerates the 20 demo ad creatives shown in the landing's creative sphere.

These are the exact prompts behind `frontend/public/creatives/*.webp`, kept in
the repo so the set can be extended or re-rendered later — the originals lived
in a scratch dir and were lost when it got wiped.

HARD RULE — no brand names. Not a wordmark, not a logo, not a name on
packaging or a shopfront. These are demo pieces for fictional businesses and a
real third-party trademark would imply a client relationship that doesn't
exist. The prompt repeats the rule because the model drifts toward inventing
logos otherwise; the four earlier drafts that DID carry invented brand names
were discarded for this reason.

What makes these read as ads and not stock photos: every prompt asks for a
real person in a believable setting PLUS a full graphic layer — pill CTA,
badges, arrows, translucent containers, tiny icons — and a distinct
typographic identity per piece. Ten industries x 2, every layout different.

Usage (needs GEMINI_API_KEY, read from the Postty-Prod .env):

    python3 scripts/generate-creatives.py

Then convert to the web assets the sphere loads:

    for f in out/*.png; do
      cwebp -quiet -q 82 -resize 800 0 "$f" \
        -o "frontend/public/creatives/$(basename "$f" .png).webp"
    done

The sphere reads these by filename — see the BANDS array in
frontend/src/components/CreativeSphereSection.tsx. `moda-2` and `skincare-1`
are pinned to the two opening slots there, so keep those names if you re-render.
"""
import base64
import os
import sys

ENV_PATH = "/Users/juanmartinbeinesfurcada/Desktop/Postty-Prod/.env"
if "GEMINI_API_KEY" not in os.environ and os.path.exists(ENV_PATH):
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line.startswith("GEMINI_API_KEY=") and not line.startswith("GEMINI_API_KEY_"):
                os.environ["GEMINI_API_KEY"] = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

from google import genai
from google.genai import types as genai_types

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT_DIR, exist_ok=True)
MODEL = "gemini-3-pro-image-preview"
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

BASE = (
    "Professional social media AD DESIGN, 4:5 vertical, premium "
    "direct-to-consumer aesthetic. Fully DESIGNED advertising layout: "
    "photorealistic photography of real people in believable real settings, "
    "plus a rich graphic layer — rounded pill CTA, badges/stickers, thin "
    "elegant arrows or scribbles, semi-transparent rounded containers/cards, "
    "tiny icons. Distinctive stylish typography with strong art direction. "
    "All text in ARGENTINE SPANISH (voseo), short, perfectly legible, zero "
    "typos. CRITICAL RULE: absolutely NO brand name, NO wordmark, NO logo, "
    "NO company name anywhere in the image — not on packaging, not in "
    "corners, not on clothing. Headlines, prices, offers and CTA pills only. "
    "Premium Buenos Aires creative-studio quality. No watermarks."
)

ADS = [
    ("moda-1", "SCENE: woman laughing walking out of an old Buenos Aires doorway in a terracotta linen midi dress, golden hour. TYPE: elegant high-contrast serif, cream on terracotta frame layout. DESIGN: headline 'El verano se viste de lino' top-left; thin hand-drawn arrow to the dress; rounded cream card '$89.900' with sublabel 'Vestido de lino'; chocolate pill CTA 'Comprar ahora'; circular badge 'Nueva cápsula'."),
    ("moda-2", "SCENE: young woman in oversized beige blazer checking her phone against a pastel-pink studio wall, editorial fashion pose, hard flash. TYPE: ultra-condensed uppercase sans, black. DESIGN: giant headline 'BÁSICOS QUE NO SON BÁSICOS' wrapping around her; sticker '3 CUOTAS SIN INTERÉS' rotated; small circled numbers 01/02/03 pointing at blazer, jean and tote with thin lines; black pill CTA 'Ver colección'."),
    ("fitness-1", "SCENE: athletic man mid battle-rope swing in an industrial gym, dramatic side light, sweat and chalk dust. TYPE: ultra-bold condensed grotesk, electric lime on black. DESIGN: stacked headline 'ENTRENÁ EN SERIO'; translucent dark card with lime check icons 'Coach dedicado / Plan nutricional / Acceso 24-7'; rotated sticker '-30% primer mes'; lime pill CTA 'Primera clase gratis'; energetic scribble arrows."),
    ("fitness-2", "SCENE: woman doing a pilates reformer stretch in a sunlit minimal studio, calm focus, morning light. TYPE: refined light grotesk with wide tracking, sage green + cream. DESIGN: airy headline 'Movete distinto'; three small rounded steps down the side '01 Respirá / 02 Estirá / 03 Fortalecé' with line icons; frosted card 'Clase de prueba — $0'; sage pill CTA 'Reservá tu lugar'; delicate thin arrow."),
    ("gastro-1", "SCENE: overhead shot of two friends sharing fresh tagliatelle at a rustic wooden table, hands mid-serving, wine glasses, warm evening restaurant light. TYPE: Italian editorial serif + handwritten script accents, cream/tomato red. DESIGN: script headline 'Pasta como en Italia'; red circular badge 'Menú x2 — $38.000'; cream card listing 'Tagliatelle al fungi / Ravioli de osobuco' with tiny fork icons; red pill CTA 'Reservá tu mesa'; hand-drawn arrow to the plate."),
    ("gastro-2", "SCENE: close crop of a man taking a huge first bite of a dripping smash burger at a neon-lit counter at night, real joy. TYPE: chunky rounded bold sans, yellow on deep red. DESIGN: headline 'LA MEJOR DEL BARRIO' with one word circled in marker style; price flag badge '$12.900 con papas'; three tiny icons row 'smash / cheddar / bacon'; yellow pill CTA 'Pedila por delivery'; motion-line accents around the bite."),
    ("cafe-1", "SCENE: barista woman with tattoos pouring latte art toward camera over a marble bar, plants behind, morning light. TYPE: modern sans + serif mix, deep forest green and cream. DESIGN: headline 'Tu ritual de cada mañana'; small rounded card 'Suscripción mensual $18.500' with tiny coffee-bean icons; badge 'Envío gratis'; green pill CTA 'Suscribite'; thin arrow from headline into the cup."),
    ("cafe-2", "SCENE: two friends laughing at a window table of a specialty coffee shop, flat whites and a croissant between them, street reflected in the glass. TYPE: warm retro serif, burnt orange + cream. DESIGN: headline 'El plan perfecto no exis—' with strikethrough on the last word; polaroid-style framed inset of the croissant with tape corners; sticker '2x1 hasta las 11am'; orange pill CTA 'Vení a probarlo'."),
    ("skincare-1", "SCENE: close-up of a young woman applying a serum drop to her cheek in bright bathroom daylight, dewy real skin. TYPE: refined light grotesk with wide letter-spacing, sky blue/white/sand. DESIGN: wide-tracked headline 'PIEL EN CALMA'; numbered steps on left '01 Limpiá / 02 Hidratá / 03 Protegé' in small blue containers with line icons; frosted card 'Sérum Niacinamida 10% — $24.500'; sky-blue pill CTA 'Probala 30 días'; delicate arrow to her cheek."),
    ("skincare-2", "SCENE: man mid-30s doing his skincare routine in a mirror, towel on shoulders, honest morning vibe. TYPE: strong modern grotesk, charcoal + amber accents. DESIGN: headline 'El cuidado también es de hombres'; split comparison chips 'Antes / Después' subtly at the sides; amber card 'Rutina completa — $32.000'; amber pill CTA 'Armá tu rutina'; small circle badges with droplet and sun icons."),
    ("deco-1", "SCENE: woman arranging a ceramic vase set on a wooden shelf in a sunlit Scandinavian-style living room, linen apron. TYPE: minimal editorial serif, sand/terracotta/off-white. DESIGN: headline 'Tu casa, tu calma'; dotted line connecting three products on the shelf each with a tiny price tag '$14.900 / $9.500 / $21.000'; badge 'Hecho a mano'; terracotta pill CTA 'Ver la colección'."),
    ("deco-2", "SCENE: overhead flat-lay of hands setting a dinner table with artisanal plates, linen napkins and dried flowers, warm daylight. TYPE: modern wide sans, olive + cream. DESIGN: headline 'Mesas que enamoran'; circular badge '-25% en sets'; rounded card 'Set x6 platos — $54.900' with tiny plate icon; olive pill CTA 'Comprar el set'; thin scribble underline under one word."),
    ("joyas-1", "SCENE: macro shot of a woman's hands with delicate gold rings holding a coffee cup, soft window light, editorial elegance. TYPE: luxury thin serif with big tracking, black/gold/ivory. DESIGN: headline 'Detalles que hablan'; fine gold arrow to one ring; small ivory card 'Anillo Luna — $47.000'; badge 'Plata 925 + baño de oro'; black pill CTA with gold text 'Descubrila'."),
    ("joyas-2", "SCENE: young woman fastening a pendant necklace in front of a vintage mirror, golden-hour bedroom light, intimate mood. TYPE: romantic serif italic + clean sans mix, deep burgundy + champagne. DESIGN: italic headline 'Para vos. O para regalar.'; gift-box icon badge 'Envuelto para regalo'; champagne card '3 cuotas de $15.600'; burgundy pill CTA 'Elegí la tuya'; soft sparkle accents."),
    ("saas-1", "SCENE: freelancer woman at a coworking desk smiling at her laptop, hand on a phone showing a clean dashboard UI mockup (generic charts, no logos), plants and coffee around. TYPE: crisp geometric sans, indigo + white. DESIGN: headline 'Facturá en 30 segundos'; floating UI chips around the phone 'Factura enviada ✓' and '+$248.000 este mes'; small card with three check items 'AFIP integrado / Cobros online / Reportes'; indigo pill CTA 'Empezá gratis'."),
    ("saas-2", "SCENE: restaurant owner man in apron checking a tablet at his counter, staff blurred working behind, honest small-business energy. TYPE: bold friendly rounded sans, teal + white. DESIGN: headline 'Tu negocio, bajo control'; floating notification cards 'Pedido nuevo — Mesa 4' and 'Caja del día: $612.300'; badge '14 días gratis'; teal pill CTA 'Probalo hoy'; thin arrow from a card into the tablet."),
    ("running-1", "SCENE: runner woman mid-stride crossing an empty avenue at sunrise, motion blur in background, determined expression. TYPE: italic speed-slanted bold sans, coral + navy. DESIGN: slanted headline 'CORRÉ TU MEJOR VERSIÓN'; speed-line accents behind her; card with stats icons 'Amortiguación pro / 210 g / Drop 8mm'; coral pill CTA 'Conocé el modelo'; small badge 'Edición limitada'."),
    ("running-2", "SCENE: group of friends stretching together in a park before a run, real laughter, morning fog. TYPE: clean varsity-inspired sans, forest green + white. DESIGN: headline 'Los domingos se corre'; rounded translucent card 'Club de running — Gratis' with calendar icon 'Dom 8:00 · Palermo'; badge 'Todos los niveles'; green pill CTA 'Sumate al club'; hand-drawn circle around the word 'Gratis'."),
    ("helado-1", "SCENE: kid and dad laughing with dripping ice cream cones outside a bright gelato shop on a hot summer day, vibrant colors. TYPE: playful chunky rounded sans, pistachio + strawberry pink + cream. DESIGN: headline 'El verano se lame'; scoop-shaped badge '2x1 en cuartos'; small card with three flavor dots 'Pistacho / Frutilla / DDL'; pink pill CTA 'Pedilo ya'; wavy drip accents under the headline."),
    ("pan-1", "SCENE: baker's flour-dusted hands holding a tray of golden croissants toward camera in a warm bakery at dawn, oven glow behind. TYPE: artisanal serif + stamp-style details, wheat/brown/cream. DESIGN: headline 'Recién horneadas, todos los días'; stamp-style circular badge 'Masa madre'; kraft-paper card 'Docena — $16.800' with tiny croissant icon; brown pill CTA 'Encargá la tuya'; dotted arrow from badge to tray."),
]


def generate(name: str, scene: str) -> bool:
    out = os.path.join(OUT_DIR, f"{name}.png")
    if os.path.exists(out):
        print(f"→ {name}: ya existe, salto")
        return True
    print(f"→ {name} ...", flush=True)
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=[genai_types.Part(text=f"{BASE} {scene}")],
            config=genai_types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=genai_types.ImageConfig(aspect_ratio="4:5"),
            ),
        )
        for cand in resp.candidates or []:
            for part in cand.content.parts or []:
                if getattr(part, "inline_data", None) and part.inline_data.data:
                    with open(out, "wb") as f:
                        data = part.inline_data.data
                        f.write(data if isinstance(data, bytes) else base64.b64decode(data))
                    print(f"  ✓ {os.path.getsize(out)//1024} KB")
                    return True
        print("  ✗ no image in response")
        return False
    except Exception as e:  # noqa: BLE001
        print(f"  ✗ {type(e).__name__}: {e}")
        return False


if __name__ == "__main__":
    ok = sum(generate(n, s) for n, s in ADS)
    print(f"\n{ok}/{len(ADS)} listos en {OUT_DIR}")
    sys.exit(0 if ok == len(ADS) else 1)
