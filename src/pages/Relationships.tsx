import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { useRelationships, saveRelationship } from '@/hooks/useRelationships';
import { PersonForm, EMPTY } from '@/components/relationships/PersonForm';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Relationships() {
  usePageMeta('Your relationships · Zodaci', 'Compare your chart with the people in your life.');
  const { items, loading } = useRelationships();
  const [adding, setAdding] = useState(false);
  const nav = useNavigate();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Relationships</div>
        <h1 className="text-4xl">Your relationships</h1>
        <p className="max-w-3xl text-muted-foreground">Add someone’s birth details to calculate their chart and compare it with yours: planet contacts between the two charts, house overlays, the combined (composite) chart, Chinese zodiac and Day Master match, Feng Shui Kua directions and numerology. Birth time is optional; without it the Moon, Rising sign and houses are marked uncertain or left out.</p>
      </header>
      <AuthGate what="save relationships">
        {() => <div className="space-y-6">
          {loading ? <p>Loading…</p> : items.length === 0 ? <p className="text-muted-foreground">No relationships yet.</p> :
            <ul className="grid sm:grid-cols-2 gap-3">{items.map(r => <li key={r.id}><Link to={`/relationships/${r.id}`} className="parchment p-4 block hover:border-gold"><div className="font-display text-2xl">{r.name}</div><div className="text-sm text-muted-foreground">{r.relation} · born {r.birth_date}{r.birth_time ? ` at ${r.birth_time}` : ' (time unknown)'} · {r.place_label}</div></Link></li>)}</ul>}
          {adding ? <PersonForm initial={EMPTY} submitLabel="Add relationship" onSave={async p => { const r = await saveRelationship(p); nav(`/relationships/${r.id}`); }} />
            : <Button onClick={() => setAdding(true)}>Add a relationship</Button>}
        </div>}
      </AuthGate>
    </div>
  );
}
