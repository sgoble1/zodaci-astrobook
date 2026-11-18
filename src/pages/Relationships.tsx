import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { internalDestination } from '@/lib/internalDestination';
import { useState } from 'react';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { SpotArt } from '@/components/art/SpotArt';
import { PageHead } from '@/components/observatory/PageHead';
import { useRelationships, saveRelationship } from '@/hooks/useRelationships';
import { PersonForm, EMPTY } from '@/components/relationships/PersonForm';
import { usePageMeta } from '@/hooks/usePageMeta';

const WHAT_YOU_GET = [
  ['Planet contacts', 'Where your planets meet theirs, strongest first.'],
  ['Timed house overlays', 'Where planets fall in the other chart, when reliable birth times are available.'],
  ['Composite chart', 'The relationship drawn as a chart of its own.'],
  ['Other systems', 'Chinese zodiac, Day Master, Kua directions and Life Path.'],
] as const;

export default function Relationships() {
  usePageMeta('Your relationships · Zodaci', 'Compare your chart with the people in your life.');
  const { items, loading } = useRelationships();
  const [params] = useSearchParams();
  // ?add=sibling opens the form pre-set (from the Sibling Bureau); ?next= returns there after saving.
  const preset = params.get('add') === 'sibling' ? 'Sibling' : null;
  const back = params.get('next') ? internalDestination(params.get('next'), '') : '';
  const [adding, setAdding] = useState(!!preset);
  const nav = useNavigate();
  return (
    <div className="space-y-10 sm:space-y-12">
      <PageHead eyebrow="Relationship Bureau" title="Your relationships" script="Two charts, one story." art="love">
        <p>Astrology compares two charts by looking at how the planets in one contact the planets in the other. Measured aspects give you specific connections to explore, with their degrees and orbs. A composite chart uses planetary midpoints as a separate symbolic perspective. Neither chart proves how someone feels or decides whether a relationship will work.</p>
      </PageHead>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {WHAT_YOU_GET.map(([t, d]) => <li key={t} className="obs-paper p-4"><p className="font-label text-xs tracking-[0.14em] text-primary">{t}</p><p className="mt-1 text-sm text-foreground/80">{d}</p></li>)}
      </ul>
      <p className="max-w-3xl text-sm text-muted-foreground">Add someone’s birth details to calculate their chart. Birth time is optional; without it their Moon, Rising sign and houses are marked uncertain or left out. People you add are private to your account.</p>
      <section aria-labelledby="relationship-study-h" className="grid gap-6 border-y border-border py-6 md:grid-cols-2"><div><h2 id="relationship-study-h" className="font-label text-2xl text-primary">Start with a real question.</h2><p className="mt-2 text-muted-foreground leading-relaxed">Look at communication, affection or the ways you handle pressure. Follow the strongest measured contacts before drawing conclusions from a single sign.</p></div><div><h3 className="font-label text-2xl text-primary">Keep the comparison private.</h3><p className="mt-2 text-muted-foreground leading-relaxed">Only your account can see the people you save here. Adding someone does not invite them, publish their chart or give them access to your notes.</p><Link to="/demo" className="mt-2 inline-flex min-h-11 items-center text-accent underline">Try the fictional synastry sample</Link></div></section>
      <AuthGate what="save relationships">
        {() => <div className="space-y-6">
          {loading ? <p role="status">Loading…</p> : items.length === 0 ? (
            <div className="obs-paper flex items-center gap-4 p-5"><SpotArt kind="love" className="h-16 w-16 shrink-0" /><p className="text-foreground/80">No one added yet. Start with a partner, a parent, a sibling or a close friend.</p></div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">{items.map(r => (
              <li key={r.id}>
                <Link to={`/relationships/${r.id}`} className="obs-paper relative block p-4 pr-20 transition-colors duration-500 hover:border-[hsl(var(--brass)/0.7)]">
                  <SpotArt kind="planet" className="absolute right-3 top-3 h-12 w-12" />
                  <p className="font-label text-[11px] tracking-[0.14em] text-primary">{r.relation}</p>
                  <div className="font-display text-xl sm:text-2xl break-words">{r.name}</div>
                  <div className="mt-2 text-sm leading-relaxed text-muted-foreground break-words">Born {r.birth_date}{r.birth_time ? ` at ${r.birth_time}` : ' (time unknown)'} · {r.place_label}</div>
                  <span className="mt-2 inline-block font-label text-xs tracking-[0.14em] text-accent">Compare charts →</span>
                </Link>
              </li>
            ))}</ul>
          )}
          {adding ? <PersonForm initial={preset ? { ...EMPTY, relation: preset } : EMPTY} submitLabel={preset ? 'Add sibling' : 'Add relationship'} onSave={async p => { const r = await saveRelationship(p); nav(back ? `${back}${back.includes('?') ? '&' : '?'}with=${r.id}` : `/relationships/${r.id}`); }} />
            : <Button onClick={() => setAdding(true)}>Add a relationship</Button>}
        </div>}
      </AuthGate>
    </div>
  );
}
