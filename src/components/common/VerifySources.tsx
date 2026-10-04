import { Link, useLocation } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { verifyGroupFor, type VerifyGroup } from '@/content/verifySources';

export function VerifySourceList({ group }: { group: VerifyGroup }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {group.sources.map(s => (
        <li key={s.href} className="border border-border bg-card/50 p-4 rounded-sm">
          <div className="font-smallcaps text-[10px] text-gold">{s.kind}</div>
          <a href={s.href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-start gap-1 font-medium underline decoration-gold underline-offset-4">
            {s.label}<ExternalLink className="w-3 h-3 mt-1 shrink-0" aria-hidden /><span className="sr-only"> (opens in a new tab)</span>
          </a>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.checks}</p>
        </li>
      ))}
    </ul>
  );
}

/** Shown at the bottom of every chart & system page, chosen by the current address. */
export function VerifySources() {
  const { pathname } = useLocation();
  const group = verifyGroupFor(pathname);
  if (!group) return null;
  return (
    <section aria-labelledby="verify-sources" className="mt-16 vellum p-6 sm:p-8">
      <div className="flex items-center gap-2 text-gold"><ShieldCheck className="w-4 h-4" aria-hidden /><span className="font-smallcaps text-[11px]">Check it yourself</span></div>
      <h2 id="verify-sources" className="font-display mt-1 text-2xl">Verify the claims · {group.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{group.plain} Astronomy links confirm the sky positions. History and primary-text links show where each meaning comes from. Research links show what scientists have tested — they do not prove or disprove what a placement means for April.</p>
      <VerifySourceList group={group} />
      <Link to="/verify" className="mt-4 inline-block text-xs underline">See every source in one place</Link>
    </section>
  );
}
