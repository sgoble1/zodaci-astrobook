import { Link } from 'react-router-dom';
import { BookOpen, NotebookPen, UserRound } from 'lucide-react';
import { PageHead } from '@/components/observatory/PageHead';
import { Button } from '@/components/ui/button';
import { ProgressCard } from '@/components/readings/ContinueReading';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecentReading } from '@/hooks/useReadingProgress';

export default function ContentCenter() {
  const { rows, error } = useRecentReading(6);
  return <article className="mx-auto max-w-5xl space-y-8">
    <PageHead eyebrow="Research Library" title="Content Center" script="Your notes. Your reading shelf." art="written">
      Keep personal examples separate from your calculated chart. You decide which examples may be used in future writing.
    </PageHead>
    <ul className="grid gap-4 sm:grid-cols-3">
      {[{ to: '/personal-context', title: 'Personal context', icon: UserRound, text: 'Review your saved examples and consent.' }, { to: '/my-readings', title: 'My readings', icon: BookOpen, text: 'Open readings written for your chart.' }, { to: '/observation-log', title: 'Observation Log', icon: NotebookPen, text: 'Keep a private record of the sky.' }].map(({ to, title, icon: Icon, text }) => <li key={to} className="obs-paper flex flex-col gap-3 p-5"><Icon aria-hidden className="h-6 w-6" /><h2 className="font-display text-xl">{title}</h2><p className="flex-1 text-sm text-muted-foreground">{text}</p><Button asChild variant="outline"><Link to={to}>Open {title}</Link></Button></li>)}
    </ul>
    <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl">Recently read</h2><Button asChild variant="ghost"><Link to="/reading-history">All reading history</Link></Button></div>
      {rows === null ? <Skeleton className="h-36 w-full" /> : error ? <p role="alert">Your reading history could not load. Refresh to try again.</p> : rows.length ? <ul className="grid gap-4 sm:grid-cols-2">{rows.map(row => <li key={row.path}><ProgressCard row={row} className="h-full" /></li>)}</ul> : <p className="text-muted-foreground">Your opened readings will appear here. <Link to="/my-readings" className="underline">Open your readings</Link>.</p>}
    </section>
  </article>;
}