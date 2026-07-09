import { ZODIAC, PLACEMENTS, HOUSES } from '@/content/april';
import {
  SABIAN_SYMBOLS, FIXED_STARS, ASTEROIDS, SPECIAL_ASPECTS,
  ARABIC_PARTS, PROFECTION_35, PRENATAL_ECLIPSE,
} from '@/content/compendium';
import { useState } from 'react';
export default function Compendium() {
  return (
    <div className="space-y-12">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Companion Volumes · Reference</div>
        <h1 className="font-display mt-2">The Master Compendium.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Reference tables from the compendium and supplementary volumes: the zodiac fundamentals, every placement with its dignity, and the rulership map of the houses. Sortable, scannable, all cross-linked to the interpretive pages.
        </p>
      </header>

      <section>
        <h2 className="font-display mb-4">Zodiac fundamentals</h2>
        <div className="overflow-x-auto border border-border rounded bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left font-smallcaps text-[10px]">
                <th className="px-3 py-2">Sign</th><th className="px-3 py-2">Glyph</th>
                <th className="px-3 py-2">Element</th><th className="px-3 py-2">Modality</th><th className="px-3 py-2">Ruler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {ZODIAC.map(z => (
                <tr key={z.name} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-display">{z.name}</td>
                  <td className="px-3 py-2 text-gold text-lg">{z.glyph}</td>
                  <td className="px-3 py-2">{z.element}</td>
                  <td className="px-3 py-2">{z.modality}</td>
                  <td className="px-3 py-2">{z.ruler}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4">Complete planetary positions & dignities</h2>
        <div className="overflow-x-auto border border-border rounded bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left font-smallcaps text-[10px]">
                <th className="px-3 py-2">Body</th><th className="px-3 py-2">Sign</th>
                <th className="px-3 py-2">Degree</th><th className="px-3 py-2">House</th>
                <th className="px-3 py-2">Motion</th><th className="px-3 py-2">Dignity & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {PLACEMENTS.map(p => (
                <tr key={p.key} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-display"><span className="text-gold mr-2">{p.glyph}</span>{p.name}</td>
                  <td className="px-3 py-2">{p.sign} {p.signGlyph}</td>
                  <td className="px-3 py-2">{p.degree}°{String(p.minute).padStart(2,'0')}′</td>
                  <td className="px-3 py-2">H{p.house}</td>
                  <td className="px-3 py-2">{p.motion}</td>
                  <td className="px-3 py-2">{p.dignity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4">House rulership quick reference</h2>
        <div className="overflow-x-auto border border-border rounded bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left font-smallcaps text-[10px]">
                <th className="px-3 py-2">House</th><th className="px-3 py-2">Cusp Sign</th>
                <th className="px-3 py-2">Ruler</th><th className="px-3 py-2">Tenants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {HOUSES.map(h => (
                <tr key={h.number} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-display text-gold">{h.number}</td>
                  <td className="px-3 py-2">{h.cusp}</td>
                  <td className="px-3 py-2">{h.ruler}</td>
                  <td className="px-3 py-2">{h.planets.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SabianSection />
      <FixedStarsSection />
      <AsteroidsSection />
      <SpecialAspectsSection />
      <ArabicPartsSection />
      <ProfectionSection />
    </div>
  );
}

function SabianSection() {
  const [open, setOpen] = useState<string | null>(SABIAN_SYMBOLS[0].point);
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">II · Sabian Symbols</div>
      <h2 className="font-display mt-1 mb-4">An illuminated wheel · one image per degree.</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {SABIAN_SYMBOLS.map(s => {
          const active = open === s.point;
          return (
            <button key={s.point} onClick={() => setOpen(active ? null : s.point)}
              className={`text-left p-4 border rounded bg-card/70 transition-colors ${active ? 'border-gold shadow-[var(--shadow-gold)]' : 'border-border hover:border-gold/60'}`}>
              <div className="flex justify-between items-baseline gap-2">
                <div className="font-display text-lg">{s.point}</div>
                <div className="font-smallcaps text-[10px] text-muted-foreground">{s.degree}</div>
              </div>
              <div className="italic text-foreground/85 mt-1">"{s.symbol}"</div>
              {active && (
                <>
                  <div className="gold-rule my-3" />
                  <p className="text-sm text-foreground/85 leading-relaxed">{s.interpretation}</p>
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FixedStarsSection() {
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">III · Fixed Stars</div>
      <h2 className="font-display mt-1 mb-4">Ancient beacons touching the natal chart.</h2>
      <div className="space-y-4">
        {FIXED_STARS.map(s => (
          <div key={s.name} className="p-5 border border-border rounded bg-card/60">
            <div className="flex flex-wrap justify-between gap-2 items-baseline">
              <div className="font-display text-xl text-gold">{s.name}</div>
              <div className="font-smallcaps text-[10px] text-muted-foreground">
                {s.degree} · conj. {s.conjunct} · orb {s.orb}
              </div>
            </div>
            <div className="gold-rule my-3 w-16" />
            <div className="text-sm text-foreground/75 italic mb-2">{s.meaning}</div>
            <p className="text-sm text-foreground/90 leading-relaxed">{s.activation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AsteroidsSection() {
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">IV · Asteroid Goddesses</div>
      <h2 className="font-display mt-1 mb-4">Juno · Vesta · Ceres · Pallas Athena.</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {ASTEROIDS.map(a => (
          <div key={a.name} className="p-5 border border-border rounded bg-card/60">
            <div className="flex items-baseline gap-3">
              <div className="text-gold text-2xl font-display">{a.glyph}</div>
              <div>
                <div className="font-display text-lg">{a.name}</div>
                <div className="font-smallcaps text-[10px] text-muted-foreground">{a.placement}</div>
              </div>
            </div>
            <div className="gold-rule my-3" />
            <div className="text-xs italic text-foreground/70 mb-2">{a.archetype}</div>
            <p className="text-sm text-foreground/90 leading-relaxed">{a.expression}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpecialAspectsSection() {
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">V · Special & Minor Aspects</div>
      <h2 className="font-display mt-1 mb-4">The rarest angles in April's chart.</h2>
      <div className="space-y-3">
        {SPECIAL_ASPECTS.map(a => (
          <div key={a.name} className="p-4 border border-border rounded bg-card/60">
            <div className="flex flex-wrap justify-between gap-2 items-baseline">
              <div className="font-display text-base">{a.name}</div>
              <div className="font-smallcaps text-[10px] text-muted-foreground">{a.planets} · orb {a.orb}</div>
            </div>
            <p className="mt-2 text-sm text-foreground/85 leading-relaxed">{a.significance}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArabicPartsSection() {
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">VI · Arabic Parts (Lots)</div>
      <h2 className="font-display mt-1 mb-4">Fortune, Spirit, Marriage.</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {ARABIC_PARTS.map(p => (
          <div key={p.name} className="p-5 border border-border rounded bg-card/60">
            <div className="font-display text-lg text-gold">{p.name}</div>
            <div className="font-smallcaps text-[10px] text-muted-foreground mt-1">{p.position}</div>
            <div className="gold-rule my-3" />
            <p className="text-sm text-foreground/85 leading-relaxed">{p.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfectionSection() {
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">VII · Annual Profection · Age {PROFECTION_35.age}</div>
      <h2 className="font-display mt-1 mb-4">The Twelfth-House year · {PROFECTION_35.window}.</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 border border-gold/40 rounded bg-card">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/70">
              <tr><td className="py-2 font-smallcaps text-[10px] text-muted-foreground">House activated</td><td className="py-2">H{PROFECTION_35.house} · {PROFECTION_35.houseSign}</td></tr>
              <tr><td className="py-2 font-smallcaps text-[10px] text-muted-foreground">Traditional Time Lord</td><td className="py-2">{PROFECTION_35.traditionalLord}</td></tr>
              <tr><td className="py-2 font-smallcaps text-[10px] text-muted-foreground">Modern Time Lord</td><td className="py-2">{PROFECTION_35.modernLord}</td></tr>
              <tr><td className="py-2 font-smallcaps text-[10px] text-muted-foreground">Time Lord in natal chart</td><td className="py-2">{PROFECTION_35.lordPosition}</td></tr>
            </tbody>
          </table>
          <div className="gold-rule my-4" />
          <div className="font-smallcaps text-[10px] text-gold mb-1">Alchemical theme</div>
          <p className="italic text-foreground/85 text-sm">{PROFECTION_35.alchemicalTheme}</p>
        </div>
        <div className="p-5 border border-border rounded bg-card/60">
          <p className="text-sm text-foreground/90 leading-relaxed">{PROFECTION_35.interpretation}</p>
        </div>
      </div>

      <div className="mt-6 p-5 border border-oxblood/50 rounded bg-card/60">
        <div className="font-smallcaps text-[10px] text-oxblood">Prenatal Solar Eclipse · {PRENATAL_ECLIPSE.date}</div>
        <div className="font-display text-lg mt-1">{PRENATAL_ECLIPSE.position}</div>
        <div className="gold-rule my-3 w-16" />
        <p className="text-sm text-foreground/85 leading-relaxed">{PRENATAL_ECLIPSE.interpretation}</p>
      </div>
    </section>
  );
}
