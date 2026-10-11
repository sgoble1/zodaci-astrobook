import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BoxArt } from '@/components/common/BoxArt';
import { Input } from '@/components/ui/input';

const ITEMS = [
  { to: '/my-chart', title: 'My birth chart', group: 'Chart', note: 'Wheel, placements and aspects' },
  { to: '/my-readings', title: 'My readings', group: 'Life areas', note: 'Eight personal life-area readings' },
  { to: '/other-systems', title: 'Other systems', group: 'Systems', note: 'Chinese, Vedic, Mayan and more' },
  { to: '/explore', title: 'Explore & Discover', group: 'Systems', note: 'Browse every topic' },
  { to: '/create', title: 'Created pages', group: 'Created', note: 'Topics and pages you made' },
  { to: '/podcasts', title: 'Podcasts', group: 'Media', note: 'Listen and make episodes' },
  { to: '/dashboard', title: 'Bookmarks', group: 'Created', note: 'Everything you saved' },
  { to: '/start', title: 'Birth details', group: 'Chart', note: 'Edit your date, time and place' },
];

/** "My AstroBook" — one organized, searchable home for a member's own content. */
export default function MyLibrary() {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const groups = ['All', ...new Set(ITEMS.map(i => i.group))];
  const shown = useMemo(() => ITEMS.filter(i => (group === 'All' || i.group === group) && (i.title + i.note).toLowerCase().includes(q.toLowerCase())), [q, group]);
  return (
    <article className="space-y-6">
      <header><h1 className="font-display text-4xl">My AstroBook</h1><p className="mt-2 text-muted-foreground">Everything that's yours, in one tidy place.</p></header>
      <div className="flex flex-wrap items-center gap-2">
        <Input aria-label="Search my AstroBook" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} className="max-w-xs" />
        {groups.map(g => <button key={g} aria-pressed={group === g} onClick={() => setGroup(g)} className={`rounded-full border px-3 py-1 text-sm ${group === g ? 'bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>{g}</button>)}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map(i => <li key={i.to}><Link to={i.to} className="block overflow-hidden rounded-lg border border-border bg-card hover:border-primary focus-visible:outline focus-visible:outline-2"><BoxArt seed={i.title} label={i.title} /><div className="p-3"><p className="font-display">{i.title}</p><p className="text-xs text-muted-foreground">{i.group} · {i.note}</p></div></Link></li>)}
      </ul>
      {!shown.length && <p role="status" className="text-sm text-muted-foreground">Nothing matches that search.</p>}
    </article>
  );
}
