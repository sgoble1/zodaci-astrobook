import { ZODIAC, PLACEMENTS, HOUSES } from '@/content/april';
import {
  SABIAN_SYMBOLS, FIXED_STARS, ASTEROIDS, SPECIAL_ASPECTS,
  ARABIC_PARTS, PROFECTION_35, PRENATAL_ECLIPSE,
  type SearchDoc,
} from '@/content/compendium';
import { useDetailDrawer, type DrawerPayload } from '@/components/common/DetailDrawer';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';
import { Link } from 'react-router-dom';
import { SourceChapters } from '@/components/common/SourceChapters';

export default function Compendium() {
  return (
    <div className="space-y-12">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Companion Volumes · Reference</div>
        <h1 className="font-display mt-2">The Master Compendium.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Every reference table, symbol, star, goddess, aspect and lot from the compendium. Click any card to open its full entry with the exact PDF page it was transcribed from. Press <kbd className="text-[10px] border border-border rounded px-1.5 py-0.5">⌘K</kbd> to search everything at once.
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
      <SourceChapters ids={['v2-02', 'v2-03', 'v2-07', 'v2-08', 'v2-09']} title="Volume II reference expansions — complete text" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

function SabianSection() {
  const drawer = useDetailDrawer();
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">II · Sabian Symbols</div>
      <h2 className="font-display mt-1 mb-4">An illuminated wheel · one image per degree.</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {SABIAN_SYMBOLS.map(s => (
          <button key={s.id}
            onClick={() => drawer.open({
              id: s.id,
              eyebrow: `Sabian Symbol · ${s.degree}`,
              title: `"${s.symbol}"`,
              subtitle: s.point,
              body: (
                <>
                  <p>{s.interpretation}</p>
                  {s.notes && (
                    <>
                      <div className="font-smallcaps text-[10px] text-gold mt-4 mb-1">Interpretation notes</div>
                      <p className="italic text-foreground/75">{s.notes}</p>
                    </>
                  )}
                </>
              ),
              source: s.source,
            })}
            className="text-left p-4 border rounded bg-card/70 border-border hover:border-gold/60 transition-colors">
            <div className="flex justify-between items-baseline gap-2">
              <div className="font-display text-lg">{s.point}</div>
              <div className="font-smallcaps text-[10px] text-muted-foreground">{s.degree}</div>
            </div>
            <div className="italic text-foreground/85 mt-1">"{s.symbol}"</div>
            <div className="font-smallcaps text-[10px] text-gold mt-2">Read →</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function FixedStarsSection() {
  const drawer = useDetailDrawer();
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="font-smallcaps text-[11px] text-gold">III · Fixed Stars</div>
          <h2 className="font-display mt-1">Ancient beacons touching the natal chart.</h2>
        </div>
        <Link to="/star-map" className="font-smallcaps text-[10px] text-gold border-b border-gold/50 hover:border-gold">
          Open the interactive sky map →
        </Link>
      </div>
      <div className="space-y-4 mt-4">
        {FIXED_STARS.map(s => (
          <button key={s.id}
            onClick={() => drawer.open({
              id: s.id,
              eyebrow: `Fixed Star · orb ${s.orb}`,
              title: s.name,
              subtitle: `${s.degree} · conj. ${s.conjunct}`,
              body: (
                <>
                  <div className="font-smallcaps text-[10px] text-gold mb-1">Meaning</div>
                  <p className="italic">{s.meaning}</p>
                  <div className="font-smallcaps text-[10px] text-gold mt-4 mb-1">Natal activation</div>
                  <p>{s.activation}</p>
                  <div className="mt-4">
                    <Link to={`/star-map#${s.id}`} className="font-smallcaps text-[10px] text-gold border-b border-gold/50">
                      See on the sky map →
                    </Link>
                  </div>
                </>
              ),
              source: s.source,
            })}
            className="w-full text-left p-5 border border-border rounded bg-card/60 hover:border-gold/60 transition-colors">
            <div className="flex flex-wrap justify-between gap-2 items-baseline">
              <div className="font-display text-xl text-gold">{s.name}</div>
              <div className="font-smallcaps text-[10px] text-muted-foreground">
                {s.degree} · conj. {s.conjunct} · orb {s.orb}
              </div>
            </div>
            <div className="gold-rule my-3 w-16" />
            <div className="text-sm text-foreground/75 italic">{s.meaning}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function AsteroidsSection() {
  const drawer = useDetailDrawer();
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">IV · Asteroid Goddesses</div>
      <h2 className="font-display mt-1 mb-4">Juno · Vesta · Ceres · Pallas Athena.</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {ASTEROIDS.map(a => (
          <button key={a.id}
            onClick={() => drawer.open({
              id: a.id,
              eyebrow: `Asteroid Goddess · ${a.placement}`,
              title: `${a.glyph}  ${a.name}`,
              subtitle: a.archetype,
              body: <p>{a.expression}</p>,
              source: a.source,
            })}
            className="text-left p-5 border border-border rounded bg-card/60 hover:border-gold/60 transition-colors">
            <div className="flex items-baseline gap-3">
              <div className="text-gold text-2xl font-display">{a.glyph}</div>
              <div>
                <div className="font-display text-lg">{a.name}</div>
                <div className="font-smallcaps text-[10px] text-muted-foreground">{a.placement}</div>
              </div>
            </div>
            <div className="gold-rule my-3" />
            <div className="text-xs italic text-foreground/70">{a.archetype}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SpecialAspectsSection() {
  const drawer = useDetailDrawer();
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">V · Special & Minor Aspects</div>
      <h2 className="font-display mt-1 mb-4">The rarest angles in April's chart.</h2>
      <div className="space-y-3">
        {SPECIAL_ASPECTS.map(a => (
          <button key={a.id}
            onClick={() => drawer.open({
              id: a.id,
              eyebrow: `Special Aspect · orb ${a.orb}`,
              title: a.name,
              subtitle: a.planets,
              body: <p>{a.significance}</p>,
              source: a.source,
            })}
            className="w-full text-left p-4 border border-border rounded bg-card/60 hover:border-gold/60 transition-colors">
            <div className="flex flex-wrap justify-between gap-2 items-baseline">
              <div className="font-display text-base">{a.name}</div>
              <div className="font-smallcaps text-[10px] text-muted-foreground">{a.planets} · orb {a.orb}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ArabicPartsSection() {
  const drawer = useDetailDrawer();
  return (
    <section>
      <div className="font-smallcaps text-[11px] text-gold">VI · Arabic Parts (Lots)</div>
      <h2 className="font-display mt-1 mb-4">Fortune, Spirit, Marriage.</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {ARABIC_PARTS.map(p => (
          <button key={p.id}
            onClick={() => drawer.open({
              id: p.id,
              eyebrow: `Arabic Part · ${p.position}`,
              title: p.name,
              body: <p>{p.meaning}</p>,
              source: p.source,
            })}
            className="text-left p-5 border border-border rounded bg-card/60 hover:border-gold/60 transition-colors">
            <div className="font-display text-lg text-gold">{p.name}</div>
            <div className="font-smallcaps text-[10px] text-muted-foreground mt-1">{p.position}</div>
            <div className="gold-rule my-3" />
            <div className="font-smallcaps text-[10px] text-gold">Read →</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProfectionSection() {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="font-smallcaps text-[11px] text-gold">VII · Annual Profection · Age {PROFECTION_35.age}</div>
          <h2 className="font-display mt-1">The Twelfth-House year · {PROFECTION_35.window}.</h2>
        </div>
        <Link to="/profection" className="font-smallcaps text-[10px] text-gold border-b border-gold/50 hover:border-gold">
          Open the interactive profection module →
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
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
          <SourceRefPanel source={PROFECTION_35.source} />
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
        <SourceRefPanel source={PRENATAL_ECLIPSE.source} />
      </div>
    </section>
  );
}

// Type re-export to keep tree-shaking friendly imports elsewhere.
export type { SearchDoc };
