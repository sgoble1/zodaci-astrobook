import { SourceChapters } from '@/components/common/SourceChapters';
import { PILLARS, ELEMENT_BALANCE, LIFE_LESSON, LUCK_PILLARS, CHINESE_SOURCE } from '@/content/chinese';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';

const MAX = Math.max(...ELEMENT_BALANCE.map(e => e.count));

export default function Chinese() {
  return (
    <article className="space-y-14">
      <header>
        <h1 className="font-display mt-2">Four Pillars of Destiny.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          The same person, read in Chinese. Day Master <span className="font-display">丙 Bing</span> — Yang Fire — sitting on midnight Water. Metal Horse year. Fire-strong, Metal-strong, one drop of Water, no Earth.
        </p>
      </header>

      <section>
        <h2 className="font-display mb-6">The Four Pillars</h2>
        <div className="grid md:grid-cols-4 gap-3">
          {PILLARS.map(p => (
            <div key={p.id} className="p-5 border border-border rounded bg-card/70 text-center">
              <div className="font-smallcaps text-[10px] text-gold">{p.label.split('·')[0]?.trim()}</div>
              <div className="mt-3">
                <div className="font-display text-5xl leading-none">{p.stem}</div>
                <div className="font-display text-5xl leading-none mt-1">{p.branch}</div>
              </div>
              <div className="text-xs font-smallcaps mt-3 text-muted-foreground">{p.romanized}</div>
              <div className="text-xs mt-1">{p.animal}</div>
              <div className="gold-rule my-3 mx-auto w-8" />
              <div className="text-[11px] italic text-foreground/70">{p.element}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-4">
          {PILLARS.map(p => (
            <div key={p.id} className="p-4 border-l-2 border-gold/60 bg-muted/30">
              <div className="font-smallcaps text-[10px] text-gold">{p.label}</div>
              <p className="text-sm mt-1 leading-relaxed">{p.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4">Five-element balance</h2>
        <div className="space-y-3">
          {ELEMENT_BALANCE.map(e => (
            <div key={e.element} className="grid grid-cols-[7rem,1fr,auto] items-center gap-3">
              <div className="font-smallcaps text-xs">{e.element}</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gold" style={{ width: `${(e.count / MAX) * 100}%` }} />
              </div>
              <div className="font-display text-sm w-6 text-right">{e.count}</div>
              <div />
              <div className="col-span-2 text-[11px] text-muted-foreground italic leading-snug">{e.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-6 border border-gold/50 bg-gold/5 rounded">
        <div className="font-smallcaps text-[11px] text-gold">The convergence</div>
        <h3 className="font-display text-2xl mt-1">{LIFE_LESSON.headline}</h3>
        <p className="mt-3 leading-relaxed text-foreground/90">{LIFE_LESSON.body}</p>
      </section>

      <section>
        <h2 className="font-display mb-4">Luck Pillars (10-year cycles)</h2>
        <div className="divide-y divide-border/70 border-y border-border/70">
          {LUCK_PILLARS.map(l => (
            <div key={l.window} className="py-3 grid grid-cols-[8rem,7rem,1fr] gap-4 items-baseline">
              <div className="font-smallcaps text-[11px] text-gold">{l.window}</div>
              <div className="font-display">{l.pillar}</div>
              <div className="text-sm text-foreground/80">{l.note}</div>
            </div>
          ))}
        </div>
      </section>

      <SourceRefPanel source={CHINESE_SOURCE} />
      <SourceChapters match={/chinese|ba ?zi|four pillars|metal horse|day master|zodiac animal/i} />
    </article>
  );
}
