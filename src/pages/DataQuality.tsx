import { BIRTH } from '@/content/april';
import { DataAudit } from '@/components/common/DataAudit';
import { BIRTH_CONFIDENCE, CONFIDENCE_STYLE } from '@/content/confidence';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { SourceRefPanel } from '@/components/common/SourceRefPanel';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';

export default function DataQuality() {
  return (
    <article className="space-y-12">
      <header>
        <div className="font-smallcaps text-[11px] text-gold">Meta · Data Quality</div>
        <h1 className="font-display mt-2">What is confirmed, and what is not.</h1>
        <div className="gold-rule my-5 max-w-xs" />
        <p className="max-w-2xl text-lg text-foreground/85 leading-relaxed">
          Every insight on this site inherits the confidence of its inputs. This page names each input, grades it, and lists which downstream readings soften if it turns out to be wrong.
        </p>
      </header>

      <DataAudit />

      <section className="space-y-4">
        {BIRTH_CONFIDENCE.map(r => (
          <div id={r.id} key={r.id} className="p-6 border border-border rounded bg-card/70">
            <div className="flex items-baseline justify-between flex-wrap gap-3">
              <div>
                <div className="font-smallcaps text-[10px] text-gold">{r.field}</div>
                <div className="font-display text-xl mt-1">{r.value}</div>
              </div>
              <div className="flex items-center gap-3">
                <ConfidenceBadge level={r.status} note={r.note} />
                <CopyLinkButton hash={r.id} />
              </div>
            </div>
            <div className="gold-rule my-3 w-12" />
            <p className="text-sm text-foreground/85 leading-relaxed">{r.note}</p>
            {r.detail && <p className="text-sm mt-2 text-foreground/75 leading-relaxed">{r.detail}</p>}

            {r.alternatives && (
              <div className="mt-4 space-y-2">
                <div className="font-smallcaps text-[10px] text-oxblood">Candidate values on file</div>
                {r.alternatives.map((a, i) => (
                  <div key={i} className="text-xs p-3 border-l-2 border-oxblood/50 bg-muted/30">
                    <div className="font-mono text-foreground/90">{a.value}</div>
                    <div className="text-muted-foreground mt-0.5">{a.note}</div>
                    <div className="text-[10px] italic mt-0.5 text-muted-foreground">{a.source.doc} · {a.source.section}</div>
                  </div>
                ))}
              </div>
            )}

            {r.affects.length > 0 && (
              <div className="mt-4">
                <div className="font-smallcaps text-[10px] text-muted-foreground mb-1">Downstream insights affected</div>
                <div className="flex flex-wrap gap-1.5">
                  {r.affects.map(a => (
                    <span key={a} className={`text-[10px] font-smallcaps px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLE[r.status].className}`}>{a}</span>
                  ))}
                </div>
              </div>
            )}
            {r.source && <SourceRefPanel source={r.source} compact />}
          </div>
        ))}
      </section>

      <section className="p-6 border border-gold/40 bg-gold/5 rounded">
        <div className="font-smallcaps text-[11px] text-gold">Reconciling the birth time</div>
        <h3 className="font-display text-xl mt-1">Two candidates on file</h3>
        <p className="mt-3 leading-relaxed text-sm">
          The three finished companion PDFs (Volume I, Volume II, Timeline Guide) all list <span className="font-mono">{BIRTH.time}</span>. An earlier working note cited a different morning time. The site uses <span className="font-mono">{BIRTH.time}</span> everywhere — this yields the Sagittarius 29°28′ Ascendant, the Cap H1 stellium, and the Ba Zi Bing Shen hour pillar that every finished report is built around. If a birth certificate is uploaded, any angle-based reading (Ascendant, Midheaven, house cusps, hour pillar, profection lord) will be re-derived from that instead.
        </p>
      </section>
    </article>
  );
}
