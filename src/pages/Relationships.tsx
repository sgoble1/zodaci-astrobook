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
  ['House overlays', 'Which part of each other’s life you light up.'],
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
    <div className="space-y-8">
      <PageHead eyebrow="Relationship Bureau" title="Your relationships" script="Two charts, one story." art="love">
        <p>Astrology compares two charts by looking at how the planets in one contact the planets in the other. It shows where two people support each other easily, where they rub, and what the relationship itself is building toward. The composite chart, made from the midpoints of both, describes the relationship as its own thing.</p>
      </PageHead>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {WHAT_YOU_GET.map(([t, d]) => <li key={t} className="obs-paper p-4"><p className="font-label text-xs tracking-[0.14em] text-primary">{t}</p><p className="mt-1 text-sm text-foreground/80">{d}</p></li>)}
      </ul>
      <p className="max-w-3xl text-sm text-muted-foreground">Add someone’s birth details to calculate their chart. Birth time is optional; without it their Moon, Rising sign and houses are marked uncertain or left out. People you add are private to your account.</p>
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
                  <div className="font-display text-2xl">{r.name}</div>
                  <div className="text-sm text-muted-foreground">Born {r.birth_date}{r.birth_time ? ` at ${r.birth_time}` : ' (time unknown)'} · {r.place_label}</div>
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
