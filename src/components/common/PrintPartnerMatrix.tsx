import { PRINT_PARTNERS, unverifiedCount } from '@/content/printPartners';

/** Print partners and what each makes. Anything not confirmed by a quote or proof carries an UNVERIFIED tag. */
export function PrintPartnerMatrix({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  const S = headingLevel === 'h2' ? 'h3' : 'h4';
  return (
    <section aria-labelledby="print-partners" className="space-y-4">
      <div className="space-y-1">
        <H id="print-partners" className="text-2xl">Print partners</H>
        <p className="max-w-2xl text-sm text-muted-foreground">Who makes each physical product. {unverifiedCount()} details are tagged <span className="font-semibold text-foreground">UNVERIFIED</span> until a written quote or printed proof confirms them.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {PRINT_PARTNERS.map(p => (
          <article key={p.id} className="parchment flex flex-col gap-3 p-5" aria-labelledby={`pp-${p.id}`}>
            <div><S id={`pp-${p.id}`} className="font-display text-xl">{p.name}</S><p className="font-smallcaps !text-xs text-gold">{p.makes}</p></div>
            <p className="text-sm text-muted-foreground">{p.status}</p>
            <dl className="space-y-2 border-t border-border pt-3 text-sm">
              {p.facts.map(f => (
                <div key={f.label}>
                  <dt className="flex flex-wrap items-center gap-2 font-medium">{f.label}{!f.verified && <span className="rounded border border-destructive/50 px-1.5 py-px text-[10px] font-semibold tracking-wide text-destructive">UNVERIFIED</span>}</dt>
                  <dd className="text-muted-foreground">{f.value}{f.source && <span className="block text-xs">Source: {f.source}</span>}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
