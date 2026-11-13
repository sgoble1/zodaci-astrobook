import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { domainById, visibleColumns } from '@/content/memberNav';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Consultation Desk: one door to every way of asking a question. Each tool keeps its own history and privacy. */
export default function ConsultDesk() {
  usePageMeta('Consultation Desk', 'Every way to ask about your chart, in one place.');
  const desk = visibleColumns(domainById('readings'), {}).find(c => c.title === 'Consultation Desk');
  const modes = (desk?.items ?? []).filter(i => i.to !== '/consult');
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="max-w-3xl space-y-3">
        <p className="font-label text-xs tracking-[0.16em] text-primary">Consultation Desk</p>
        <h1 className="font-display">Ask in the way that suits the question.</h1>
        <p className="text-lg text-muted-foreground">Quick answers, a counselor, or a quiet private talk. Each one keeps its own conversations, and none of them share what you say with each other.</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map(m => (
          <li key={m.to}>
            <Link to={m.to} className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <m.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="font-display text-lg leading-tight">{m.label}</span>
              <span className="text-sm text-muted-foreground">{m.description}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs text-primary">Open<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
