import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { loadProtectedJson, ContentLockedError } from '@/lib/protectedContent';
import { chaptersForTheme, type ArchiveEntry } from '@/lib/founderEdition';
import { Button } from '@/components/ui/button';

export function FounderSourcePanel({ theme }: { theme: string }) {
  const own = useShaneAccount();
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true; setEntries([]); setError('');
    if (own) void loadProtectedJson<ArchiveEntry[]>('shane', 'index.json').then(e => { if (active) setEntries(chaptersForTheme(e, theme)); }).catch(e => { if (active) setError(e instanceof ContentLockedError ? 'Enter the private edition password to read the original chapters.' : 'The original chapters could not load.'); });
    return () => { active = false; };
  }, [own, theme]);
  if (!own) return null;
  return <section className="space-y-4 border-t border-border pt-8" data-keep-wording>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Shane’s extended source chapters</h2><Button asChild variant="outline" size="sm"><Link to="/shane"><BookOpen />Full Masterbook</Link></Button></div>
    <p className="text-sm text-muted-foreground">Original uploaded interpretations, not verified chart facts. The source contains placement discrepancies; use your calculated chart above. Astrology cannot establish diagnoses, ancestry or past lives.</p>
    {error ? <p role="status" className="text-sm text-muted-foreground">{error}</p> : entries.length ? <ul className="grid gap-3 sm:grid-cols-2">{entries.map(e => <li key={e.id}><Link to={`/shane/${e.id}`} className="flex h-full items-center justify-between gap-3 rounded border border-border bg-card p-4 hover:border-primary"><span><span className="block font-display text-lg">{e.title}</span><span className="text-xs text-muted-foreground">{e.words.toLocaleString()} words · {Math.ceil(e.words / 230)} min read</span></span><ChevronRight className="h-4 w-4 shrink-0" /></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No dedicated source chapter has been identified for this theme yet; calculated details remain separate.</p>}
  </section>;
}