import { SourceChapters } from '@/components/common/SourceChapters';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PROFECTION_35, PRENATAL_ECLIPSE, PROFECTION_BEATS, type ProfectionBeat } from '@/content/compendium';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';

type Focus = { kind: 'beat'; data: ProfectionBeat } | { kind: 'eclipse' };

export default function Profection() {
  const [focus, setFocus] = useState<Focus>({ kind: 'beat', data: PROFECTION_BEATS[0] });
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#prenatal-eclipse') setFocus({ kind: 'eclipse' });
    else {
      const b = PROFECTION_BEATS.find(x => `#${x.id}` === hash);
      if (b) setFocus({ kind: 'beat', data: b });
    }
  }, [hash]);

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Section 16 · Time Lord · Age {PROFECTION_35.age}</div>
        <h1 className="font-display mt-2">The Twelfth-House year.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          An interactive walk through the {PROFECTION_35.window} profection year and the prenatal solar eclipse that seeded it. Click any beat on the timeline to reveal its detail.
        </p>
      </header>

      {/* Time-lord data card */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 border border-gold/40 rounded bg-card">
          <div className="font-smallcaps text-[10px] text-gold">Time Lord data</div>
          <table className="w-full text-sm mt-2">
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
          <div className="font-smallcaps text-[10px] text-gold">Full interpretation</div>
          <p className="text-sm text-foreground/90 leading-relaxed mt-2">{PROFECTION_35.interpretation}</p>
        </div>
      </div>

      {/* Interactive quarterly timeline */}
      <section>
        <h2 className="font-display mb-4">The year, quarter by quarter</h2>
        <div className="vellum deckle p-6">
          <div className="relative h-16">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gold/60" />
            {PROFECTION_BEATS.map((b, i) => {
              const left = (i / (PROFECTION_BEATS.length - 1)) * 100;
              const active = focus.kind === 'beat' && focus.data.id === b.id;
              return (
                <button key={b.id}
                  onClick={() => setFocus({ kind: 'beat', data: b })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 flex flex-col items-center gap-1"
                  style={{ left: `${left}%` }}>
                  <div className={`w-4 h-4 rounded-full border transition-all ${
                    active ? 'bg-gold border-gold scale-125 shadow-[var(--shadow-gold)]'
                           : 'bg-card border-gold/60 hover:border-gold'
                  }`} />
                  <div className={`font-smallcaps text-[10px] whitespace-nowrap ${
                    active ? 'text-foreground' : 'text-muted-foreground'
                  }`}>{b.label}</div>
                </button>
              );
            })}
            {/* Eclipse marker rendered before the timeline as historical seed */}
            <button
              onClick={() => setFocus({ kind: 'eclipse' })}
              className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              title="Prenatal Eclipse — the seed">
              <div className={`w-3 h-3 rounded-full border ${
                focus.kind === 'eclipse'
                  ? 'bg-oxblood border-oxblood scale-125'
                  : 'bg-card border-oxblood/70 hover:border-oxblood'
              }`} />
              <div className="font-smallcaps text-[9px] text-oxblood">Eclipse</div>
            </button>
          </div>
        </div>

        {/* Focus card */}
        <div className="mt-6 p-6 border border-gold/40 rounded bg-card gentle-fade"
             key={focus.kind === 'beat' ? focus.data.id : 'eclipse'}>
          {focus.kind === 'beat' ? (
            <>
              <div className="font-smallcaps text-[10px] text-gold">{focus.data.window}</div>
              <h3 className="font-display text-2xl mt-1">{focus.data.label}</h3>
              <div className="text-sm italic text-foreground/70 mt-1">{focus.data.focus}</div>
              <div className="gold-rule my-3 w-16" />
              <p className="text-sm text-foreground/90 leading-relaxed">{focus.data.detail}</p>
              <SourceRefPanel source={PROFECTION_35.source} />
            </>
          ) : (
            <>
              <div className="font-smallcaps text-[10px] text-oxblood">Prenatal Solar Eclipse · {PRENATAL_ECLIPSE.date}</div>
              <h3 className="font-display text-2xl mt-1">{PRENATAL_ECLIPSE.position}</h3>
              <div className="gold-rule my-3 w-16" />
              <p className="text-sm text-foreground/90 leading-relaxed">{PRENATAL_ECLIPSE.interpretation}</p>
              <SourceRefPanel source={PRENATAL_ECLIPSE.source} />
            </>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-3 mt-6">
          {PROFECTION_BEATS.map(b => (
            <button key={b.id} onClick={() => setFocus({ kind: 'beat', data: b })}
              className={`text-left p-4 border rounded bg-card/60 hover:border-gold transition-colors ${
                focus.kind === 'beat' && focus.data.id === b.id ? 'border-gold' : 'border-border'
              }`}>
              <div className="font-smallcaps text-[10px] text-gold">{b.window}</div>
              <div className="font-display text-base mt-1">{b.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{b.focus}</div>
            </button>
          ))}
        </div>
      </section>
      <SourceChapters match={/profection|solar return|progress|solar arc/i} ids={['v2-04', 'v2-05', 'v2-06', 'v2-18']} title="Profections, progressions, returns and the year ahead" />
    </div>
  );
}
