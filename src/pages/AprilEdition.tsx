import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SitePasswordGate } from '@/components/common/SitePasswordGate';
import { getContentToken } from '@/lib/protectedContent';
import { hydratePrivateEdition } from '@/lib/privateEditionStore';
import { Button } from '@/components/ui/button';
import { ThemeArt } from '@/components/common/ThemeArt';
import { ZodaciLogo } from '@/components/brand/ZodaciLogo';
import {
  BIRTH, PLACEMENTS, ANGLES, HOUSES, ASPECTS, PHASES, RETROGRADES_AT_BIRTH,
  KUA_INFO, BAGUA, NUMEROLOGY, PALETTE_NOTE,
} from '@/content/april';

type Edition = {
  birth: typeof BIRTH; placements: typeof PLACEMENTS; angles: typeof ANGLES; houses: typeof HOUSES;
  aspects: typeof ASPECTS; phases: typeof PHASES; retrogrades: typeof RETROGRADES_AT_BIRTH;
  kua: typeof KUA_INFO; bagua: typeof BAGUA; numerology: typeof NUMEROLOGY; palette: string;
};

const snapshot = (): Edition => ({
  birth: BIRTH, placements: PLACEMENTS, angles: ANGLES, houses: HOUSES,
  aspects: ASPECTS, phases: PHASES, retrogrades: RETROGRADES_AT_BIRTH,
  kua: KUA_INFO, bagua: BAGUA, numerology: NUMEROLOGY, palette: PALETTE_NOTE,
});

function Section({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <div className="font-smallcaps text-xs text-gold">{kicker}</div>
        <h2 className="text-3xl mt-1">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AprilEditionInner() {
  const [ed, setEd] = useState<Edition | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "April's Edition · Zodaci";
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow, noarchive, nosnippet';
  }, []);

  const load = async () => {
    setError('');
    try {
      const token = getContentToken();
      const { data, error: err } = await supabase.functions.invoke('private-edition', {
        body: { share: true },
        headers: { 'X-Content-Token': token },
      });
      if (err || typeof data?.url !== 'string') throw new Error(data?.error || 'The shared edition could not load.');
      const download = await fetch(data.url, { signal: AbortSignal.timeout(20000) });
      if (!download.ok) throw new Error('The shared edition download failed.');
      const stream = download.body!.pipeThrough(new DecompressionStream('gzip'));
      const payload = JSON.parse(await new Response(stream).text());
      hydratePrivateEdition(payload);
      setEd(snapshot());
    } catch (e) {
      setError((e as Error).message || 'The shared edition could not load. Please try again.');
    }
  };
  useEffect(() => { void load(); }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-8 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => void load()}>Try again</Button>
      </div>
    );
  }
  if (!ed) return <p role="status" className="p-8 text-center text-muted-foreground">Opening April's edition…</p>;

  const { birth } = ed;
  return (
    <article className="mx-auto max-w-4xl space-y-14 p-5 sm:p-10">
      <header className="space-y-4 text-center">
        <ZodaciLogo compact />
        <div className="font-smallcaps text-xs text-gold">A shared private edition</div>
        <h1 className="text-4xl sm:text-6xl">{birth.name || "April's"} Edition</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          The complete original readings, prepared from April's verified birth chart. Shared with clients by invitation — please keep this page private.
        </p>
      </header>

      <Section kicker="Birth facts" title="Who you are">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Born', `${birth.date}${birth.time ? ` at ${birth.time}` : ''}`],
            ['Place', birth.place],
            ['Chart shape', birth.chartShape],
            ['Life path', String(birth.lifePath)],
            ['Kua number', `${birth.kuaNumber} · ${birth.kuaElement}`],
            ['Chinese zodiac', birth.chineseZodiac],
            ['Personal year 2026', String(birth.personalYear2026)],
            ['Age', String(birth.currentAge)],
          ].map(([k, v]) => (
            <div key={k} className="parchment rounded-lg p-4">
              <div className="font-smallcaps text-[10px] text-gold">{k}</div>
              <div className="mt-1 text-sm">{v}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Ascendant {ANGLES.ascendant?.sign} {ANGLES.ascendant?.degree}°{String(ANGLES.ascendant?.minute ?? 0).padStart(2, '0')}′ · Midheaven {ANGLES.midheaven?.sign} {ANGLES.midheaven?.degree}°{String(ANGLES.midheaven?.minute ?? 0).padStart(2, '0')}′
        </p>
      </Section>

      <Section kicker="The chart" title="Placements & readings">
        <div className="space-y-5">
          {ed.placements.map(p => (
            <section key={p.key} className="parchment rounded-lg p-5">
              <div className="flex items-start gap-4">
                <ThemeArt kind="planet" className="h-16 w-16" />
                <div className="min-w-0">
                  <h3 className="text-2xl">{p.glyph} {p.name} in {p.sign}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.degree}°{String(p.minute).padStart(2, '0')}′ · house {p.house} · {p.motion} · {p.dignity}
                  </p>
                </div>
              </div>
              <p className="mt-3 font-display text-lg text-gold">{p.headline}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{p.interpretation}</p>
            </section>
          ))}
        </div>
      </Section>

      <Section kicker="The twelve houses" title="Houses & their rulers">
        <div className="space-y-5">
          {ed.houses.map(h => (
            <section key={h.number} className="parchment rounded-lg p-5">
              <div className="flex items-start gap-4">
                <ThemeArt kind="house" label={`house ${h.number}`} badge={h.number} className="h-16 w-16" />
                <div className="min-w-0">
                  <h3 className="text-2xl">House {h.number} · {h.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Cusp {h.cusp} · ruler {h.ruler}{h.planets.length ? ` · ${h.planets.join(', ')}` : ''}</p>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-foreground/80">{h.summary}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{h.interpretation}</p>
            </section>
          ))}
        </div>
      </Section>

      <Section kicker="The aspects" title="How the planets speak to each other">
        <div className="space-y-4">
          {ed.aspects.map((a, i) => (
            <section key={`${a.a}-${a.b}-${i}`} className="parchment rounded-lg p-5">
              <div className="flex items-start gap-4">
                <ThemeArt kind="aspect" className="h-14 w-14" />
                <div className="min-w-0">
                  <h3 className="text-xl capitalize">{a.a} {a.type} {a.b}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">orb {a.orb}</p>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{a.interpretation}</p>
            </section>
          ))}
        </div>
      </Section>

      <Section kicker="Life phases" title="The chapters of the story">
        <div className="space-y-5">
          {ed.phases.map(p => (
            <section key={p.id} className={`parchment rounded-lg p-5 ${p.current ? 'border border-gold/50' : ''}`}>
              <div className="flex items-start gap-4">
                <ThemeArt kind="year" className="h-16 w-16" />
                <div className="min-w-0">
                  <h3 className="text-2xl">Phase {p.number} · {p.title}{p.current ? ' · current' : ''}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{p.years} · ages {p.ages}</p>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-foreground/80">{p.summary}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{p.interpretation}</p>
            </section>
          ))}
        </div>
      </Section>

      <Section kicker="Retrogrades at birth" title="Planets walking backward">
        <div className="space-y-4">
          {ed.retrogrades.map(r => (
            <div key={r.planet} className="parchment rounded-lg p-5">
              <h3 className="text-xl capitalize">{r.planet}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{r.meaning}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="Feng shui" title={`Kua ${ed.kua.number} · ${ed.kua.element}`}>
        <div className="parchment rounded-lg p-5 space-y-3">
          <p className="text-sm">{ed.kua.note}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><div className="font-smallcaps text-[10px] text-gold">Best directions</div><p className="text-sm">{ed.kua.bestDirections.join(' · ')}</p></div>
            <div><div className="font-smallcaps text-[10px] text-gold">Directions to approach with care</div><p className="text-sm">{ed.kua.worstDirections.join(' · ')}</p></div>
          </div>
          <div className="space-y-3 pt-2">
            {ed.bagua.map(b => (
              <div key={b.gua} className="border-t border-border/60 pt-3">
                <h3 className="text-lg">{b.gua} · {b.lifeArea}</h3>
                <p className="text-xs text-muted-foreground">{b.direction} · {b.element} · {b.color}{b.isBestForKua1 ? ' · best for this Kua' : ''}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">{b.guidance}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section kicker="Numbers & cycles" title="Numerology">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Life path', `${ed.numerology.lifePath.number}`, ed.numerology.lifePath.meaning],
            ['Personal year 2026', `${ed.numerology.personalYear2026.number}`, ed.numerology.personalYear2026.meaning],
            ['Chinese zodiac', ed.numerology.chineseZodiac.animal, ed.numerology.chineseZodiac.meaning],
          ].map(([k, n, m]) => (
            <div key={k} className="parchment rounded-lg p-5">
              <ThemeArt kind="year" className="h-14 w-14" badge={String(n)} />
              <div className="mt-2 font-smallcaps text-[10px] text-gold">{k}</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">{m}</p>
            </div>
          ))}
        </div>
      </Section>

      {ed.palette && (
        <Section kicker="Illustration palette" title="The colours of this edition">
          <p className="parchment rounded-lg p-5 text-sm leading-relaxed text-foreground/90">{ed.palette}</p>
        </Section>
      )}

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>Prepared by Zodaci · April's private edition · please do not share beyond invited clients.</p>
        <p className="mt-1">Astrology is a tool for reflection, not prediction.</p>
      </footer>
    </article>
  );
}

/** Password-gated shareable page: April can send the link and site password to clients. */
export default function AprilEdition() {
  return <SitePasswordGate><AprilEditionInner /></SitePasswordGate>;
}
