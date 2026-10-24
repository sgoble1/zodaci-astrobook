import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Book3D } from '@/components/books/Book3D';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

type Book = { who: string; title: string; detail: string; read: string; rpc: 'is_shared_space_member' | 'can_read_shane_edition' | 'can_read_zac_edition' };
const BOOKS: Book[] = [
  { who: 'April', title: 'April’s Astrological Masterbook', detail: 'Her complete original archive — natal chart, houses, aspects, timing and the companion volumes.', read: '/masterbook', rpc: 'is_shared_space_member' },
  { who: 'Shane', title: 'Shane’s Astrological Masterbook', detail: 'Natal foundations, Vedic, karmic, relationship and timing volumes.', read: '/shane', rpc: 'can_read_shane_edition' },
  { who: 'Zac', title: 'Zac’s Astrological Library', detail: 'Six volumes: natal chart, world systems, family and career, traditions, the 360° life map and the road ahead.', read: '/zac', rpc: 'can_read_zac_edition' },
];

/** The official AstroBooks for April, Shane and Zac. Each book shows only to accounts the backend allows to read it. */
export default function OfficialAstroBook() {
  usePageMeta('Official AstroBooks · Zodaci', 'The official AstroBook editions.');
  const [allowed, setAllowed] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    let on = true;
    void Promise.all(BOOKS.map(b => supabase.rpc(b.rpc).then(({ data }) => [b.who, data === true] as const))).then(r => { if (on) setAllowed(Object.fromEntries(r)); });
    return () => { on = false; };
  }, []);
  const shown = BOOKS.filter(b => allowed?.[b.who]);
  return (
    <article className="space-y-8">
      <header>
        <div className="font-smallcaps text-xs text-gold">Official AstroBook</div>
        <h1 className="text-4xl sm:text-5xl">The Official AstroBooks</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">The founding editions, read in full here and printable as an AstroBook. Each opens with its owner’s own password.</p>
      </header>
      {!allowed && <p role="status" className="text-muted-foreground">Checking your editions…</p>}
      {allowed && !shown.length && <p className="text-muted-foreground">No official editions are shared with this account.</p>}
      <div className="grid gap-6 md:grid-cols-3">
        {shown.map(b => (
          <section key={b.who} className="parchment flex flex-col gap-4 p-5">
            <div className="mx-auto"><Book3D pages={300} label="Official edition · 6″ × 9″" hardcover /></div>
            <div className="font-smallcaps text-xs text-gold">{b.who}</div>
            <h2 className="text-2xl leading-tight">{b.title}</h2>
            <p className="flex-1 text-sm text-muted-foreground">{b.detail}</p>
            <div className="flex flex-wrap gap-2"><Button asChild><Link to={b.read}>Read the book</Link></Button><Button asChild variant="outline"><Link to="/books">Order a print</Link></Button></div>
          </section>
        ))}
      </div>
    </article>
  );
}
