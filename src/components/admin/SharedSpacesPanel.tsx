import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSharedSpaces, SHARED_SPACE_LABEL } from '@/hooks/useSharedSpaces';

export function SharedSpacesPanel() {
  const { spaces, loading } = useSharedSpaces();
  return <section className="space-y-6"><h2>Reading Together</h2>{loading ? <p role="status">Opening shared spaces…</p> : spaces.length === 0 ? <p className="text-muted-foreground">No shared spaces are available to this account.</p> : <ul className="divide-y divide-border">{spaces.map(space => <li key={space} className="flex flex-wrap items-center justify-between gap-4 py-5"><h3 className="text-2xl">{SHARED_SPACE_LABEL[space]}</h3><Button asChild variant="outline"><Link to={`/shared/${space}`}>Open space<ArrowUpRight className="h-4 w-4" /></Link></Button></li>)}</ul>}</section>;
}