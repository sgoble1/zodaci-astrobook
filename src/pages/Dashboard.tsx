import { MemberDashboard } from '@/components/common/MemberDashboard';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import { UpdatesFeed } from '@/components/common/UpdatesFeed';
import { Link } from 'react-router-dom';
import { AuthGate } from '@/components/common/AuthGate';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRelationships } from '@/hooks/useRelationships';
import { Button } from '@/components/ui/button';
import { SharedChatFeed } from '@/components/shared/SharedChatFeed';

function Inner() {
  const { items, remove, setNote } = useBookmarks();
  const { items: rels } = useRelationships();
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Bookmarks ({items.length})</h2>
        {items.length === 0 && <p className="text-sm text-muted-foreground">Use “Bookmark this page” in the side menu on any page to save it here.</p>}
        {items.map(b => (
          <div key={b.id} className="parchment p-4 space-y-2">
            <div className="flex justify-between gap-3">
              <Link to={b.path} className="font-medium hover:underline">{b.title}</Link>
              <button className="text-xs text-muted-foreground underline" onClick={() => remove(b.id)}>Remove</button>
            </div>
            <textarea defaultValue={b.note} placeholder="Add a note…" onBlur={e => e.target.value !== b.note && setNote(b.id, e.target.value)}
              className="w-full text-sm bg-transparent border border-border rounded p-2" rows={2} />
            <div className="text-[11px] text-muted-foreground">Saved {new Date(b.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">My relationships ({rels.length})</h2>
          <Button asChild size="sm"><Link to="/relationships">Add / manage</Link></Button>
        </div>
        {rels.length === 0 && <p className="text-sm text-muted-foreground">Add anyone’s birth details to get their chart, compatibility reading and timeline.</p>}
        {rels.map(r => (
          <div key={r.id} className="parchment p-4">
            <Link to={`/relationships/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
            <span className="text-xs text-muted-foreground"> · {r.relation}</span>
            <div className="flex gap-3 text-xs mt-2">
              <Link className="underline" to={`/relationships/${r.id}`}>Chart & details</Link>
              <Link className="underline" to={`/relationships/${r.id}/reading`}>Reading</Link>
              <Link className="underline" to={`/relationships/${r.id}/timeline`}>Timeline</Link>
            </div>
          </div>
        ))}
        <h2 className="font-display text-2xl pt-4">Quick links</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {[['/shared', 'Our Shared Space'], ['/chat', 'SmartChat'], ['/admin', 'My Workspace · upload & edit'], ['/chart-calculator', 'Chart calculator'], ['/ask', 'Ask the Sources'], ['/podcasts', 'Podcasts']].map(([to, l]) => (
            <Button key={to} asChild variant="outline" size="sm"><Link to={to}>{l}</Link></Button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const april = useAprilSpace();
  if (april === false) return <MemberDashboard />;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">My Dashboard</h1>
      <p className="text-muted-foreground">Your bookmarks, notes and relationships — private to your account.</p>
      <AuthGate what="see your dashboard">{() => <Inner />}</AuthGate>
      <SharedChatFeed />
      <UpdatesFeed limit={4} />
    </div>
  );
}
