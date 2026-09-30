import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRelationships, saveRelationship, deleteRelationship } from '@/hooks/useRelationships';
import { PersonForm, EMPTY } from './PersonForm';
import { RelDocs } from './RelDocs';

/** Admin tab: add, edit, delete relationships and manage their uploaded documents. */
export function RelationshipsAdmin({ userId }: { userId: string }) {
  const { items, loading } = useRelationships();
  const [edit, setEdit] = useState<string | 'new' | null>(null);
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Relationships saved to your account. Documents you upload here become Masterbook uploads; edit their sections in the “Edit sections” tab.</p>
      {edit === 'new' ? <PersonForm initial={EMPTY} submitLabel="Add relationship" onSave={async p => { await saveRelationship(p); setEdit(null); }} /> : <Button onClick={() => setEdit('new')}>Add relationship</Button>}
      {items.map(r => (
        <div key={r.id} className="parchment p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1"><div className="font-display text-xl">{r.name}</div><div className="text-xs text-muted-foreground">{r.relation} · {r.birth_date} {r.birth_time ?? '(no time)'} · {r.place_label} · {r.sex}</div></div>
            <Link to={`/relationships/${r.id}`} className="text-xs underline">Open</Link>
            <Button size="sm" variant="outline" onClick={() => setEdit(edit === r.id ? null : r.id)}>{edit === r.id ? 'Close' : 'Edit'}</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm(`Delete ${r.name}?`) && deleteRelationship(r.id)}>Delete</Button>
          </div>
          {edit === r.id && <PersonForm initial={r} submitLabel="Save" onSave={async p => { await saveRelationship({ ...p, id: r.id }); setEdit(null); }} />}
          <RelDocs rel={r} userId={userId} admin />
        </div>
      ))}
    </div>
  );
}
