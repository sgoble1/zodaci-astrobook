import { Link } from 'react-router-dom';
import { latestUpdates } from '@/content/siteUpdates';

/** Latest public-safe site updates for member dashboards. */
export function WhatsNew({ count = 3 }: { count?: number }) {
  const items = latestUpdates(count);
  if (!items.length) return null;
  return (
    <section aria-labelledby="whats-new-h" className="obs-paper space-y-3 p-5 sm:p-6">
      <h2 id="whats-new-h" className="plate-title !text-2xl">What’s new at the observatory</h2>
      <ol className="space-y-3">
        {items.map(u => (
          <li key={u.title} className="border-b border-dashed border-[hsl(var(--comic-navy)/0.2)] pb-3 last:border-0 last:pb-0">
            <p className="text-xs text-muted-foreground">{new Date(u.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className="font-semibold">{u.title}</p>
            <p className="text-sm text-muted-foreground">{u.text}</p>
            {u.to && <Link to={u.to} className="mt-1 inline-block text-sm font-semibold underline underline-offset-4">{u.cta ?? 'Take a look'}</Link>}
          </li>
        ))}
      </ol>
    </section>
  );
}
