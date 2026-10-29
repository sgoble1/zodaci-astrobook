import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRelationshipSelf, type RelationshipSelf } from '@/hooks/useRelationshipSelf';

/** Relationship pages compare against the signed-in person's own chart; without saved birth details they ask for them first. */
export function SelfGate({ children }: { children: (self: RelationshipSelf) => ReactNode }) {
  const self = useRelationshipSelf();
  if (self === undefined) return <p role="status" className="text-muted-foreground">Loading your birth details…</p>;
  if (!self) return (
    <section className="mx-auto max-w-lg space-y-3 py-8 text-center">
      <h1 className="font-display text-3xl">Add your birth details first</h1>
      <p className="text-muted-foreground">Relationship comparisons use your own chart on one side. Save your birth date, time and place, then come back.</p>
      <Button asChild><Link to="/start">Enter my birth details</Link></Button>
    </section>
  );
  return <>{children(self)}</>;
}
