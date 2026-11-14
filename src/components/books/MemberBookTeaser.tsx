import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { computeChart } from '@/lib/astro';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { buildBookTeaser } from '@/lib/bookTeaser';

/** Three calculated AstroBook pages (Sun, Moon, Rising) from the signed-in member's saved chart. No AI. */
export function MemberBookTeaser({ fallback }: { fallback: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)); }, []);
  const birth = useMyBirth();
  const pages = useMemo(() => {
    if (!birth) return null;
    try { return buildBookTeaser(computeChart(toChartInput(birth)), !!birth.time); } catch { return null; }
  }, [birth]);
  if (signedIn === null || (signedIn && birth === undefined)) return <Skeleton className="h-64 w-full" />;
  if (!signedIn) return <>{fallback}</>;
  if (!birth || !pages) return <div className="space-y-3"><p className="text-muted-foreground">Add your birth details and your first three AstroBook pages appear here.</p><Button asChild><Link to="/start?next=/astrobook%23teaser">Add my birth details<ArrowRight /></Link></Button></div>;
  return <div className="space-y-5"><h2 className="font-display text-3xl">Your first three pages.</h2>
    <ol className="grid gap-4 lg:grid-cols-3">{pages.map((p, i) => <li key={p.key} className="obs-paper flex flex-col p-5">
      <p className="font-label text-xs tracking-[0.16em] text-muted-foreground">Page {i + 1} of 3</p>
      <h3 className="mt-1 font-display text-2xl">{p.title}</h3>
      {p.position && <p className="text-sm text-muted-foreground">{p.position}</p>}
      <div className="mt-3 space-y-2 text-sm leading-relaxed">{p.body.map(t => <p key={t}>{t}</p>)}</div>
      {p.note && <p className="mt-3 text-xs text-muted-foreground">{p.note}</p>}
    </li>)}</ol>
    <p className="text-sm text-muted-foreground">These pages are calculated from your saved chart. The full book continues with every planet, aspect and house across six volumes.</p>
    <Button asChild><Link to="/books">Continue in the book<ArrowRight /></Link></Button>
  </div>;
}
