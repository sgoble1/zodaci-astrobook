import { SourceChapters } from '@/components/common/SourceChapters';
import { NUMEROLOGY, BIRTH } from '@/content/april';

export default function Purpose() {
  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">06 · 17</div>
        <h1 className="font-display mt-2">The numerical harmonics of the chart.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="text-lg text-foreground/85 leading-relaxed">
          Astrology maps the sky; numerology maps the vibration. For April in 2026 they resonate at the same frequency.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <BigNumber label="Life Path" value={String(NUMEROLOGY.lifePath.number)} />
        <BigNumber label="Personal Year 2026" value={String(NUMEROLOGY.personalYear2026.number)} accent />
        <BigNumber label={`Kua · ${BIRTH.kuaElement}`} value={String(BIRTH.kuaNumber)} />
      </div>

      <section>
        <h2 className="font-display mb-3">Life Path {NUMEROLOGY.lifePath.number}</h2>
        <p className="text-foreground/90 leading-loose">{NUMEROLOGY.lifePath.meaning}</p>
      </section>

      <section>
        <h2 className="font-display mb-3">Personal Year {NUMEROLOGY.personalYear2026.number} (2026)</h2>
        <p className="text-foreground/90 leading-loose">{NUMEROLOGY.personalYear2026.meaning}</p>
      </section>

      <section>
        <h2 className="font-display mb-3">Chinese Zodiac · {NUMEROLOGY.chineseZodiac.animal}</h2>
        <p className="text-foreground/90 leading-loose">{NUMEROLOGY.chineseZodiac.meaning}</p>
      </section>

      <section className="p-6 border border-gold/40 rounded bg-card">
        <div className="font-smallcaps text-[11px] text-gold">The Double-Seven</div>
        <h3 className="font-display mt-2">Life Path 7 · Personal Year 7 · 2026</h3>
        <p className="mt-4 text-foreground/85 leading-relaxed">
          A Personal Year that matches the Life Path is rare; when it does the year's frequency amplifies to its maximum possible expression. For a seven this means an interior year of research, spiritual deepening, solitude as strength, and the accumulation of wisdom that no outward search could ever produce. Layered atop the four simultaneous astrological activations of 2026, the timing is not coincidental. It is the schedule she was born to keep.
        </p>
      </section>
      <SourceChapters match={/purpose|mission|north node|south node|past li|karm|gene keys|human design|vocation|calling/i} ids={['v2-01', 'v2-10', 'v2-19']} title="Purpose and mission — complete source chapters" />
    </div>
  );
}

function BigNumber({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-6 border rounded text-center ${accent ? 'border-gold/60 bg-gold/5' : 'border-border bg-card/60'}`}>
      <div className="font-smallcaps text-[10px] text-muted-foreground">{label}</div>
      <div className="font-display text-7xl text-gold leading-none mt-2">{value}</div>
    </div>
  );
}
