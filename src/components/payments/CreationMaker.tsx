import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { CREATION_SIZE, affirmationFor, journalPrompts, placementLine, type CreationKind } from '@/lib/creations';
import { useLibrary, type LibraryItem } from '@/hooks/useLibrary';

const STYLES = { night: 'Midnight & gold', violet: 'Violet nebula', dawn: 'Gold dawn' } as const;
type Style = keyof typeof STYLES;
const tok = (name: string, a = 1) => `hsl(${getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()} / ${a})`;
const CARD_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

/** Draws chart-based wallpapers, posters, journal pages and affirmation cards; saves them to the member's private library. */
export function CreationMaker() {
  const birth = useMyBirth();
  const lib = useLibrary('creation');
  const canvas = useRef<HTMLCanvasElement>(null);
  const [kind, setKind] = useState<CreationKind>('wallpaper');
  const [style, setStyle] = useState<Style>('night');
  const [planet, setPlanet] = useState('sun');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const chart = useMemo(() => (birth ? computeChart(toChartInput(birth)) : null), [birth]);
  const timed = !!birth?.time;

  useEffect(() => {
    const c = canvas.current; if (!c || !chart || !birth) return;
    const { w, h } = CREATION_SIZE[kind]; c.width = w; c.height = h;
    const g = c.getContext('2d')!; const u = w / 1000;
    const bg = g.createLinearGradient(0, 0, w * 0.4, h);
    const [a, b2] = style === 'violet' ? [tok('background'), tok('primary', 0.55)] : style === 'dawn' ? [tok('card'), tok('gold', 0.45)] : [tok('background'), tok('card')];
    bg.addColorStop(0, a); bg.addColorStop(1, b2); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) { const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * w, y = (Math.cos(i * 47.3) * 0.5 + 0.5) * h; g.fillStyle = tok('foreground', 0.15 + (i % 5) / 12); g.fillRect(x, y, 2 * u, 2 * u); }
    g.strokeStyle = tok('gold', 0.7); g.lineWidth = 3 * u; g.strokeRect(30 * u, 30 * u, w - 60 * u, h - 60 * u);
    const text = (t: string, x: number, y: number, size: number, color = tok('foreground'), font = 'DM Serif Display, serif', align: CanvasTextAlign = 'center') => { g.font = `${size * u}px ${font}`; g.fillStyle = color; g.textAlign = align; g.fillText(t, x, y); };
    const wheel = (cx: number, cy: number, r: number) => {
      g.strokeStyle = tok('gold', 0.8); g.lineWidth = 2 * u;
      [r, r * 0.8].forEach(rr => { g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke(); });
      const asc = chart.asc ?? 0;
      for (let s = 0; s < 12; s++) { const ang = Math.PI - ((s * 30 - asc) * Math.PI) / 180; g.beginPath(); g.moveTo(cx + Math.cos(ang) * r * 0.8, cy - Math.sin(ang) * r * 0.8); g.lineTo(cx + Math.cos(ang) * r, cy - Math.sin(ang) * r); g.stroke(); }
      chart.bodies.filter(b => CARD_PLANETS.concat(['uranus', 'neptune', 'pluto']).includes(b.key)).forEach(b => {
        const ang = Math.PI - ((b.lon - asc) * Math.PI) / 180;
        text(b.glyph, cx + Math.cos(ang) * r * 0.65, cy - Math.sin(ang) * r * 0.65 + 12 * u, 36, tok('gold'), 'serif');
      });
    };
    const get = (k: string) => chart.bodies.find(b => b.key === k)!;
    const big3 = [get('sun'), get('moon')].map(b => `${b.name} ${b.sign}`).concat(timed && chart.asc != null ? [`Rising ${['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(chart.asc / 30)]}`] : []).join('  ·  ');
    if (kind === 'wallpaper') { wheel(w / 2, h * 0.55, 380 * u); text(birth.name, w / 2, h * 0.2, 80); text(big3, w / 2, h * 0.24, 34, tok('gold'), 'Fira Sans, sans-serif'); text('ZODACI', w / 2, h * 0.93, 26, tok('muted-foreground'), 'Fira Sans, sans-serif'); }
    if (kind === 'poster') { text(birth.name, w / 2, 220 * u, 90); text(big3, w / 2, 290 * u, 30, tok('gold'), 'Fira Sans, sans-serif'); wheel(w / 2, 720 * u, 360 * u);
      chart.bodies.filter(b => CARD_PLANETS.concat(['uranus', 'neptune', 'pluto', 'chiron', 'northNode']).includes(b.key)).forEach((b, i) => text(placementLine(timed ? b : { ...b, house: null }), i % 2 ? 540 * u : 90 * u, 1200 * u + Math.floor(i / 2) * 50 * u, 26, tok('foreground'), 'Fira Sans, sans-serif', 'left'));
      text(`Born ${birth.date}${timed ? ` · ${birth.time}` : ' · time unknown'}`, w / 2, h - 80 * u, 22, tok('muted-foreground'), 'Fira Sans, sans-serif'); }
    if (kind === 'journal') { text(`${birth.name}’s chart journal`, 90 * u, 150 * u, 54, tok('foreground'), 'DM Serif Display, serif', 'left'); text('Date ____________', w - 90 * u, 150 * u, 24, tok('muted-foreground'), 'Fira Sans, sans-serif', 'right');
      journalPrompts(chart, timed).forEach((p, i) => { const y = 260 * u + i * 230 * u; text(p, 90 * u, y, 26, tok('gold'), 'Fira Sans, sans-serif', 'left'); g.strokeStyle = tok('foreground', 0.25); g.lineWidth = 1 * u; for (let l = 1; l <= 3; l++) { g.beginPath(); g.moveTo(90 * u, y + l * 55 * u); g.lineTo(w - 90 * u, y + l * 55 * u); g.stroke(); } }); }
    if (kind === 'card') { const b = get(planet); text(b.glyph, w / 2, 420 * u, 260, tok('gold'), 'serif'); text(`${b.name} in ${b.sign}`, w / 2, 620 * u, 70);
      const words = affirmationFor(b.name, b.sign).split(' '); let line = '', y = 800 * u; g.font = `${40 * u}px DM Serif Display, serif`;
      words.forEach(wd => { if (g.measureText(`${line} ${wd}`).width > w - 220 * u) { text(line.trim(), w / 2, y, 40); line = ''; y += 60 * u; } line += ` ${wd}`; }); text(line.trim(), w / 2, y, 40);
      text(`${birth.name} · ${b.deg}° ${b.sign}`, w / 2, h - 110 * u, 24, tok('muted-foreground'), 'Fira Sans, sans-serif'); }
  }, [chart, birth, kind, style, planet, timed]);

  const blob = () => new Promise<Blob>((res, rej) => canvas.current!.toBlob(b => (b ? res(b) : rej(new Error('Could not draw'))), 'image/png'));
  const fileName = () => `${birth?.name.replace(/\W+/g, '-') ?? 'zodaci'}-${kind}${kind === 'card' ? `-${planet}` : ''}.png`;
  const download = async () => { const url = URL.createObjectURL(await blob()); const a = document.createElement('a'); a.href = url; a.download = fileName(); a.click(); URL.revokeObjectURL(url); };
  const save = async () => {
    setBusy(true); setMsg('');
    try {
      const { data: u } = await supabase.auth.getUser(); if (!u.user) throw new Error('Please sign in.');
      const file = new File([await blob()], fileName(), { type: 'image/png' });
      await lib.upload(file, { title: `${CREATION_SIZE[kind].label}${kind === 'card' ? ` · ${planet}` : ''} · ${STYLES[style]}`, category: kind }, u.user.id);
      setMsg('Saved to My creations below.');
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save.'); } finally { setBusy(false); }
  };
  const remove = async (it: LibraryItem) => { try { await lib.remove(it); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not delete.'); } };

  if (birth === undefined) return <div role="status" className="h-40 animate-pulse rounded bg-muted" />;
  if (!birth || !chart) return <p className="text-sm text-muted-foreground">Save your birth details first to design from your chart.</p>;
  const sel = 'h-10 rounded-md border border-input bg-background px-2 text-sm';
  return (
    <section className="vellum space-y-4 p-5" aria-labelledby="make-h">
      <div><h2 id="make-h" className="text-xl">Design & download</h2><p className="text-sm text-muted-foreground">Wallpapers, posters, journal pages and cards drawn from your exact placements. Free to make — no credits used.</p></div>
      <div className="grid gap-5 md:grid-cols-[1fr_16rem]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="What to make">{(Object.keys(CREATION_SIZE) as CreationKind[]).map(k => <Button key={k} size="sm" variant={k === kind ? 'default' : 'outline'} role="radio" aria-checked={k === kind} onClick={() => setKind(k)}>{CREATION_SIZE[k].label}</Button>)}</div>
          <p className="text-xs text-muted-foreground">{CREATION_SIZE[kind].note}</p>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">Style <select className={sel} value={style} onChange={e => setStyle(e.target.value as Style)}>{Object.entries(STYLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
            {kind === 'card' && <label className="text-sm">Planet <select className={sel} value={planet} onChange={e => setPlanet(e.target.value)}>{CARD_PLANETS.map(p => <option key={p} value={p}>{chart.bodies.find(b => b.key === p)?.name}</option>)}</select></label>}
          </div>
          <div className="flex flex-wrap gap-2"><Button onClick={download}><Download className="h-4 w-4" aria-hidden />Download PNG</Button><Button variant="outline" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}Save to my library</Button></div>
          {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
        </div>
        <canvas ref={canvas} className="w-full rounded border border-gold/40" aria-label={`Preview of your ${CREATION_SIZE[kind].label}`} />
      </div>
      <div className="space-y-2"><h3 className="text-base">My creations</h3>
        {lib.loading ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : lib.items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing saved yet.</p> :
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">{lib.items.map(it => <li key={it.id} className="space-y-1 rounded border border-border/60 p-2">{it.url && <img src={it.url} alt={it.title} className="aspect-[3/4] w-full rounded object-cover" loading="lazy" />}<p className="text-xs">{it.title}</p><div className="flex gap-1">{it.url && <Button asChild size="sm" variant="outline"><a href={it.url} download={it.file_name}><Download className="h-3 w-3" aria-hidden />Get</a></Button>}<Button size="sm" variant="ghost" onClick={() => remove(it)} aria-label={`Delete ${it.title}`}><Trash2 className="h-3 w-3" aria-hidden /></Button></div></li>)}</ul>}
      </div>
    </section>
  );
}
