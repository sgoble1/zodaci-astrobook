import { useState } from 'react';
import { ChevronDown, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RetroPlanet, RgTier } from '@/lib/retrogood';
import { Button } from '@/components/ui/button';
import type { Tone } from '@/lib/perception';

export const TIER_STYLE: Record<RgTier, string> = { Amplified: 'border-gold/60 text-gold', Internalized: 'border-primary/60 text-primary', Refined: 'border-accent/60 text-accent', Karmic: 'border-oxblood/60 text-oxblood' };

export function RetroBadge({ p }: { p: RetroPlanet }) {
  return <span className="text-xs text-muted-foreground">{p.glyph} {p.dignity.replace(/\+/g, ' + ')}</span>;
}

/** MOD-002: retrograde planets as cards sorted by score, with tier filters, score meters, accordion and share. */
export function RetroExplorer({ planets, tone }: { planets: RetroPlanet[]; tone: Tone }) {
  const [open, setOpen] = useState<string | null>(planets[0]?.key ?? null);
  const share = async (p: RetroPlanet) => {
    const text = `${p.name} retrograde in ${p.sign}. “${p.narrative.affirmation}” — my Retrograde Guide on Zodaci`;
    try {
      if (navigator.share) await navigator.share({ title: 'My Retrograde Guide', text, url: 'https://zodaci.com' });
      else { await navigator.clipboard.writeText(text); toast.success('Copied to share'); }
    } catch { /* closed share sheet */ }
  };
  if (!planets.length) return <p>No natal retrograde planets were found. Direct motion does not rule out a reflective temperament.</p>;
  return (
    <div className="space-y-4">
      <ul className="space-y-3">{planets.map(p => (
        <li key={p.key} className="rounded-lg border border-border bg-card">
          <Button variant="ghost" aria-expanded={open === p.key} onClick={() => setOpen(open === p.key ? null : p.key)} className="block h-auto w-full whitespace-normal p-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-display text-xl">{p.glyph} {p.name} Rx in {p.sign}{p.house ? ` · house ${p.house}` : ''}</span><span className="flex items-center gap-2"><RetroBadge p={p} /><ChevronDown className={`h-4 w-4 transition-transform duration-500 ${open === p.key ? 'rotate-180' : ''}`} aria-hidden /></span></div>
            <p className="mt-2 text-sm">{p.narrative.gift}</p>
          </Button>
          {open === p.key && <div className="space-y-3 border-t border-border p-4 text-sm leading-relaxed">
            <p>{p.narrative.context}</p>
            <p className="italic">{tone === 'professional' ? `Natal retrograde delineation: ${p.dignity}. Interpret alongside the planet’s sign, contacts and verified house.` : tone === 'educational' ? 'Dignity describes how a planet relates to its sign. Retrograde motion adds a traditional emphasis on revisiting its themes.' : 'You can take time to reconsider without treating that time as a personal failure.'}</p>
            <p><strong>Shadow.</strong> {p.narrative.shadow}</p>
            <p><strong>Integration.</strong> {p.narrative.integration}</p>
            <p className="font-display text-lg text-gold">“{p.narrative.affirmation}”</p>
            <Button size="sm" variant="outline" onClick={() => share(p)}><Share2 className="h-4 w-4" aria-hidden />Share</Button>
          </div>}
        </li>))}</ul>
    </div>
  );
}
