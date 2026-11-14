import { byArea, nextImplementations, statusCounts, FEATURES, type FeatureStatus } from '@/lib/featureRegister';

const TONE: Record<FeatureStatus, string> = {
  Live: 'border-primary/50 text-primary', Partial: 'border-gold/60 text-gold', Planned: 'border-border text-muted-foreground', Blocked: 'border-destructive/60 text-destructive',
};
const Badge = ({ s }: { s: FeatureStatus }) => <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-label text-xs tracking-[0.12em] ${TONE[s]}`}>{s}</span>;

/** Full register grouped by area (investor view) or the ranked next-up list (developer view). */
export function FeatureRegisterBoard({ mode }: { mode: 'all' | 'next' }) {
  const c = statusCounts();
  if (mode === 'next') return (
    <ol className="space-y-2">{nextImplementations().map(f => (
      <li key={f.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
        <Badge s={f.status} /><div className="min-w-0"><p className="font-medium">{f.name} <span className="text-xs text-muted-foreground">· {f.impact} impact</span></p><p className="text-muted-foreground">{f.detail}</p>{f.blocker && <p className="text-xs text-destructive">Waiting on: {f.blocker}</p>}</div>
      </li>))}</ol>
  );
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{FEATURES.length} features tracked: {c.Live} live, {c.Partial} partly built, {c.Planned} planned, {c.Blocked} waiting on an outside step.</p>
      <div className="grid gap-4 lg:grid-cols-2">{byArea().map(([area, list]) => (
        <section key={area} className="vellum p-5"><h3 className="text-xl">{area}</h3>
          <ul className="mt-3 space-y-2">{list.map(f => <li key={f.id} className="flex items-start justify-between gap-3 text-sm"><div className="min-w-0"><p>{f.name}</p><p className="text-xs text-muted-foreground">{f.detail}{f.blocker ? ` Waiting on: ${f.blocker}.` : ''}</p></div><Badge s={f.status} /></li>)}</ul>
        </section>))}</div>
    </div>
  );
}
