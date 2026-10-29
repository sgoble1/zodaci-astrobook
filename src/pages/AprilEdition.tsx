import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PrivateEditionGate } from '@/components/common/PrivateEditionGate';
import { readPrivateModule } from '@/lib/privateEditionStore';
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

/** Builds the report from the downloaded payload only; the app-wide private store is never filled from this page. */
const fromPayload = (payload: Record<string, Record<string, unknown>>): Edition => {
  const a = readPrivateModule(payload, 'april');
  const pick = <T,>(key: string, empty: T) => (a[key] ?? empty) as T;
  return {
    birth: pick('BIRTH', BIRTH), placements: pick('PLACEMENTS', PLACEMENTS), angles: pick('ANGLES', ANGLES), houses: pick('HOUSES', HOUSES),
    aspects: pick('ASPECTS', ASPECTS), phases: pick('PHASES', PHASES), retrogrades: pick('RETROGRADES_AT_BIRTH', RETROGRADES_AT_BIRTH),
    kua: pick('KUA_INFO', KUA_INFO), bagua: pick('BAGUA', BAGUA), numerology: pick('NUMEROLOGY', NUMEROLOGY), palette: pick('PALETTE_NOTE', PALETTE_NOTE),
  };
};

const CONTENTS: [string, string][] = [
  ['birth', 'Who you are'], ['placements', 'Placements'], ['houses', 'Houses'], ['aspects', 'Aspects'],
  ['phases', 'Life phases'], ['retrogrades', 'Retrogrades'], ['feng-shui', 'Feng shui'], ['numerology', 'Numerology'],
];

function Section({ id, title, kicker, children }: { id: string; title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 space-y-4">
      <div>
        <div className="font-smallcaps text-xs text-gold">{kicker}</div>
        <h2 id={`${id}-title`} className="text-3xl mt-1">{title}</h2>
      </div>
      {children}
      <p className="text-right text-xs print:hidden"><a href="#contents" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Back to contents ↑</a></p>
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

  const active = useRef(true);
  useEffect(() => () => { active.current = false; }, []);
  const load = useCallback(async () => {
    setError('');
    try {
      const { data, error: err } = await supabase.functions.invoke('private-edition', { body: {} });
      const status = (err as { context?: Response } | null)?.context?.status;
      if (status === 403) throw new Error("April's edition is private. It opens only for April and the people she shares it with — ask her to share it with the email you signed in with.");
      if (err || typeof data?.url !== 'string') throw new Error(data?.error || 'The shared edition could not load.');
      const download = await fetch(data.url, { signal: AbortSignal.timeout(20000) });
      if (!download.ok) throw new Error('The shared edition download failed.');
      const stream = download.body!.pipeThrough(new DecompressionStream('gzip'));
      const payload = JSON.parse(await new Response(stream).text());
      if (active.current) setEd(fromPayload(payload));
    } catch (e) {
      if (active.current) setError((e as Error).message || 'The shared edition could not load. Please try again.');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

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
        <div className="font-smallcaps text-xs text-gold">A shared chart report</div>
        <h1 className="text-4xl sm:text-6xl">{birth.name || "April's"} Edition</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          The original chart readings, prepared from April's verified birth chart. Shared by April with the accounts she chose — please keep this page private.
        </p>
        <nav id="contents" aria-label="Report contents" className="mx-auto max-w-2xl pt-2 print:hidden">
          <ul className="flex flex-wrap justify-center gap-2">
            {CONTENTS.map(([id, label]) => <li key={id}><a href={`#${id}`} className="inline-flex min-h-10 items-center rounded-full border border-border px-3 text-sm text-muted-foreground hover:border-gold hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{label}</a></li>)}
          </ul>
        </nav>
      </header>

      <Section id="birth" kicker="Birth facts" title="Who you are">
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
          Ascendant {ed.angles.ascendant?.sign} {ed.angles.ascendant?.degree}°{String(ed.angles.ascendant?.minute ?? 0).padStart(2, '0')}′ · Midheaven {ed.angles.midheaven?.sign} {ed.angles.midheaven?.degree}°{String(ed.angles.midheaven?.minute ?? 0).padStart(2, '0')}′
        </p>
      </Section>

      <Section id="placements" kicker="The chart" title="Placements & readings">
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

      <Section id="houses" kicker="The twelve houses" title="Houses & their rulers">
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

      <Section id="aspects" kicker="The aspects" title="How the planets speak to each other">
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

      <Section id="phases" kicker="Life phases" title="The chapters of the story">
        <div className="space-y-5">
          {ed.phases.map(p => (
            <section key={p.id} className={`parchment rounded-lg p-5 ${p.current ? 'border border-gold/50' : ''}`}>
              <div className="flex items-start gap-4">
                <ThemeArt kind="year" className="h-16 w-16" />
                <div className="min-w-0">
                  <h3 className="text-2xl">{p.title}{p.current ? ' · current' : ''}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{p.years} · ages {p.ages}</p>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-foreground/80">{p.summary}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{p.interpretation}</p>
            </section>
          ))}
        </div>
      </Section>

      <Section id="retrogrades" kicker="Retrogrades at birth" title="Planets walking backward">
        <div className="space-y-4">
          {ed.retrogrades.map(r => (
            <div key={r.planet} className="parchment rounded-lg p-5">
              <h3 className="text-xl capitalize">{r.planet}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{r.meaning}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="feng-shui" kicker="Feng shui" title={`Kua ${ed.kua.number} · ${ed.kua.element}`}>
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

      <Section id="numerology" kicker="Numbers & cycles" title="Numerology">
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
        <Section id="palette" kicker="Illustration palette" title="The colours of this edition">
          <p className="parchment rounded-lg p-5 text-sm leading-relaxed text-foreground/90">{ed.palette}</p>
        </Section>
      )}

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>Prepared by Zodaci · April's private edition · opens only for April and the people she shares it with.</p>
        <p className="mt-1">Astrology is a tool for reflection, not prediction.</p>
      </footer>
    </article>
  );
}

/** April's shared report: opens for April's own account and the accounts she shared her edition with (no password). */
export default function AprilEdition() {
  return <PrivateEditionGate standalone><AprilEditionInner /></PrivateEditionGate>;
}
