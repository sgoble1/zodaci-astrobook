import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RetroPlanet, RgTier } from '@/lib/retrogood';
import { TIER_GLYPH } from '@/lib/retrogood';
import { Button } from '@/components/ui/button';
import type { Tone } from '@/lib/perception';

const TIERS: RgTier[] = ['Amplified', 'Internalized', 'Refined', 'Karmic'];
export const TIER_STYLE: Record<RgTier, string> = { Amplified: 'border-gold/60 text-gold', Internalized: 'border-primary/60 text-primary', Refined: 'border-accent/60 text-accent', Karmic: 'border-oxblood/60 text-oxblood' };
const BAR: Record<RgTier, string> = { Amplified: 'bg-gold', Internalized: 'bg-primary', Refined: 'bg-accent', Karmic: 'bg-oxblood' };

export function RetroBadge({ p }: { p: RetroPlanet }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${TIER_STYLE[p.tier]}`}>{p.glyph} {TIER_GLYPH[p.tier]} {p.tier} · {p.score}</span>;
}

/** MOD-002: retrograde planets as cards sorted by score, with tier filters, score meters, accordion and share. */
export function RetroExplorer({ planets, tone }: { planets: RetroPlanet[]; tone: Tone }) {
  const [filter, setFilter] = useState<RgTier | 'All'>('All');
  const [open, setOpen] = useState<string | null>(planets[0]?.key ?? null);
  const [grown, setGrown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrown(true), 120); return () => clearTimeout(t); }, []);
  const counts = useMemo(() => Object.fromEntries(TIERS.map(t => [t, planets.filter(p => p.tier === t).length])) as Record<RgTier, number>, [planets]);
  const shown = planets.filter(p => filter === 'All' || p.tier === filter);
  const share = async (p: RetroPlanet) => {
    const text = `${p.name} retrograde in ${p.sign} — ${p.tier} (${p.score}/100). “${p.narrative.affirmation}” — my RetroGOOD reading on Zodaci`;
    try {
      if (navigator.share) await navigator.share({ title: 'My RetroGOOD', text, url: 'https://zodaci.com' });
      else { await navigator.clipboard.writeText(text); toast.success('Copied to share'); }
    } catch { /* closed share sheet */ }
  };
  if (!planets.length) return <p className="rounded-lg border border-border bg-card p-5">No planets were retrograde when you were born, so every planet in your chart expresses itself outwardly and directly.</p>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tier">
        {(['All', ...TIERS] as const).map(t => <button key={t} type="button" aria-pressed={filter === t} onClick={() => setFilter(t)} disabled={t !== 'All' && !counts[t]}
          className={`rounded-full border px-3 py-1 text-sm transition-colors duration-500 disabled:opacity-40 ${filter === t ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{t === 'All' ? `All ${planets.length}` : `${TIER_GLYPH[t]} ${t} ${counts[t]}`}</button>)}
      </div>
      <ul className="space-y-3">{shown.map(p => (
        <li key={p.key} className="rounded-lg border border-border bg-card">
          <button type="button" aria-expanded={open === p.key} onClick={() => setOpen(open === p.key ? null : p.key)} className="w-full p-4 text-left transition-colors duration-500 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-display text-xl">{p.glyph} {p.name} Rx in {p.sign}{p.house ? ` · house ${p.house}` : ''}</span><span className="flex items-center gap-2"><RetroBadge p={p} /><ChevronDown className={`h-4 w-4 transition-transform duration-500 ${open === p.key ? 'rotate-180' : ''}`} aria-hidden /></span></div>
            <div className="mt-3 h-2 overflow-hidden rounded bg-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.score} aria-label={`${p.name} score`}><div className={`h-full rounded ${BAR[p.tier]} transition-[width] duration-[2500ms] ease-out`} style={{ width: grown ? `${p.score}%` : '0%' }} /></div>
            <p className="mt-2 text-sm">{p.narrative.gift}</p>
          </button>
          {open === p.key && <div className="space-y-3 border-t border-border p-4 text-sm leading-relaxed">
            <p>{p.narrative.context}</p>
            <p className="font-medium">{p.narrative.label}</p>
            <p className="italic">{tone === 'professional' ? `${p.tier} classification (${p.dignity}).` : p.narrative.opening}</p>
            <p><strong>Shadow.</strong> {p.narrative.shadow}</p>
            <p><strong>Integration.</strong> {p.narrative.integration}</p>
            {tone === 'educational' && <p className="text-muted-foreground">[Tier comes from essential dignity: domicile or exaltation = Amplified, neutral = Internalized, fall = Refined, detriment = Karmic. Angular houses and chart rulership add points.]</p>}
            <p className="font-display text-lg text-gold">“{p.narrative.affirmation}”</p>
            <Button size="sm" variant="outline" onClick={() => share(p)}><Share2 className="h-4 w-4" aria-hidden />Share</Button>
          </div>}
        </li>))}</ul>
    </div>
  );
}
