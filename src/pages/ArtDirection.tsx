import heroImg from '@/assets/hero-threshold.jpg';
import wheelImg from '@/assets/chart-wheel-hero.jpg';
import journalImg from '@/assets/journaling-desk.jpg';
import baguaImg from '@/assets/bagua-map.jpg';

const specs = [
  {
    title: 'Line Quality & Technique',
    body: "Extraordinarily dense crosshatching — parallel lines layered at multiple angles to create deep, velvety shadows that give each image the quality of an antique engraving. Confident, never sketchy. Variable line weight: heavier on defining edges, finer for interior texture. Approach each illustration in layers — establish silhouettes with confident contour first, then build shadow density inward from the darkest points outward. The line never wavers.",
  },
  {
    title: 'Atmosphere & Lighting',
    body: "Every illustration is lit from a single specific source — a candle, a window, a doorway, a star. Dramatic direction, high contrast. Faces lit from below or from one side for cinematic quality. Vignette technique darkens the corners and holds the eye at the luminous center. The warm amber of candle and stage footlight belongs to the past; the cool silver of stars and moonlight belongs to the present; the golden-white of the dawn horizon belongs to the future.",
  },
  {
    title: 'Character Design',
    body: "April is rendered as a woman in her mid-thirties: clear-eyed, precise in bearing, dark hair, slightly serious in expression but with warmth present. She never looks defeated or small — even in scenes of weight, her posture carries the quality of someone working with something rather than being crushed by it. Her Sagittarius Rising is visible in her bearing: there is an archer, an explorer, about her even in stillness. Posture is character.",
  },
  {
    title: 'Color · The Two-Color Treatment',
    body: "Base illustrations are executed in black ink on white paper, with rich greyscale from crosshatch density. A single accent color — antique gold — is applied selectively to Galactic Center glows, candle flames, star light and fixed-star labels, decorative borders, and any astrological glyph used as a centerpiece. This creates the visual language of an illuminated manuscript: ink on vellum, touched with gold. When in doubt, use less. The gold marks the places where something holy or significant lives.",
  },
];

const plates = [
  { img: heroImg, title: 'Plate I · The Threshold Between Worlds', role: 'Cover · full-page' },
  { img: wheelImg, title: 'Plate II · The Ancient Sky', role: 'Section III · Fixed Stars' },
  { img: journalImg, title: 'Plate III · The Journaling Desk', role: 'Personal ritual practice' },
  { img: baguaImg, title: 'Plate IV · The Bagua Overlay', role: 'Section XVIII · Feng Shui' },
];

export default function ArtDirection() {
  return (
    <div className="space-y-14">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Companion Document · Illustration Reference Guide</div>
        <h1 className="font-display mt-2">The art direction, in full.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          The visual philosophy governing every illustration in this compendium — hand-inked pen-and-crosshatch in the tradition of Victorian illuminated engraving.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        {specs.map(s => (
          <div key={s.title} className="p-6 border border-border rounded bg-card/60">
            <div className="font-smallcaps text-[11px] text-gold">Specification</div>
            <h2 className="font-display mt-2">{s.title}</h2>
            <div className="gold-rule my-3 w-16" />
            <p className="text-foreground/85 leading-relaxed text-sm">{s.body}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-display mb-6">The commissioned plates</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plates.map(p => (
            <figure key={p.title} className="deckle p-2 bg-vellum">
              <img src={p.img} alt={p.title} className="w-full h-auto" loading="lazy" />
              <figcaption className="mt-3 px-2 pb-1">
                <div className="font-display text-lg">{p.title}</div>
                <div className="font-smallcaps text-[10px] text-muted-foreground mt-0.5">{p.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="p-6 border border-gold/40 rounded bg-card">
        <div className="font-smallcaps text-[11px] text-gold">The palette</div>
        <h3 className="font-display mt-2">Ink · Vellum · Gold</h3>
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <Swatch label="Ink" color="hsl(var(--ink))" note="Black ink · deep contour lines" />
          <Swatch label="Vellum" color="hsl(var(--vellum))" note="Warm cream page" />
          <Swatch label="Antique Gold" color="hsl(var(--gold))" note="Selective accent · never used broadly" />
        </div>
      </section>
    </div>
  );
}

function Swatch({ label, color, note }: { label: string; color: string; note: string }) {
  return (
    <div>
      <div className="h-16 rounded border border-border" style={{ background: color }} />
      <div className="font-smallcaps text-[10px] text-gold mt-2">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{note}</div>
    </div>
  );
}
