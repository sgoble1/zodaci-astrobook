import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { CREATION_SIZE, CREATION_STYLES, affirmationFor, badgeLines, journalPrompts, placementLine, tarotBirthCard, type CreationKind, type CreationStyle } from '@/lib/creations';
import { transitsTo } from '@/lib/transitOverlay';
import { chapterFrom } from '@/lib/currentChapter';
import { useLibrary, type LibraryItem } from '@/hooks/useLibrary';

const STYLES = CREATION_STYLES;
type Style = CreationStyle;
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const tok = (name: string, a = 1) => `hsl(${getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()} / ${a})`;
const CARD_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

/** Draws chart-based wallpapers, posters, journal pages, cards, star scrolls, tarot birth cards and transit badges; saves them to the member's private library. */
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
  const today = useMemo(() => new Date(), []);
  const chapter = useMemo(() => (chart ? chapterFrom(transitsTo(chart, today)) : null), [chart, today]);

  useEffect(() => {
    const c = canvas.current; if (!c || !chart || !birth) return;
    const { w, h } = CREATION_SIZE[kind]; c.width = w; c.height = h;
    const g = c.getContext('2d')!; const u = w / 1000;
    // One palette per look, read from the global theme tokens so studio art matches the site.
    const atomic = style === 'atomic';
    const ink = atomic ? tok('paper-ink') : tok('foreground');
    const accent = atomic ? tok('oxblood') : tok('gold');
    const quiet = atomic ? tok('paper-ink', 0.7) : tok('muted-foreground');
    const fill = (shape?: () => void) => {
      const bg = g.createLinearGradient(0, 0, w * 0.4, h);
      const [a, b2] = atomic ? [tok('paper'), tok('paper', 0.92)] : style === 'violet' ? [tok('background'), tok('primary', 0.55)] : style === 'dawn' ? [tok('card'), tok('gold', 0.45)] : [tok('background'), tok('card')];
      bg.addColorStop(0, a); bg.addColorStop(1, b2); g.fillStyle = bg;
      if (shape) { shape(); g.fill(); } else g.fillRect(0, 0, w, h);
    };
    g.clearRect(0, 0, w, h);
    if (kind === 'badge') { g.save(); g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4 * u, 0, Math.PI * 2); g.clip(); }
    fill();
    for (let i = 0; i < (kind === 'scroll' ? 420 : 220); i++) { const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * w, y = (Math.cos(i * 47.3) * 0.5 + 0.5) * h; g.fillStyle = atomic ? tok('paper-ink', 0.05 + (i % 5) / 40) : tok('foreground', 0.15 + (i % 5) / 12); g.fillRect(x, y, 2 * u, 2 * u); }
    if (atomic && kind !== 'badge') { g.fillStyle = tok('primary', 0.9); g.fillRect(0, 0, w, 18 * u); g.fillStyle = tok('oxblood', 0.9); g.fillRect(0, h - 18 * u, w, 18 * u); }
    g.strokeStyle = atomic ? tok('paper-ink', 0.75) : tok('gold', 0.7); g.lineWidth = 3 * u;
    if (kind !== 'badge') g.strokeRect(30 * u, 30 * u, w - 60 * u, h - 60 * u);
    const text = (t: string, x: number, y: number, size: number, color = ink, font = 'Alfa Slab One, serif', align: CanvasTextAlign = 'center') => { g.font = `${size * u}px ${font}`; g.fillStyle = color; g.textAlign = align; g.fillText(t, x, y); };
    const wheel = (cx: number, cy: number, r: number) => {
      g.strokeStyle = atomic ? tok('paper-ink', 0.8) : tok('gold', 0.8); g.lineWidth = 2 * u;
      [r, r * 0.8].forEach(rr => { g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke(); });
      const asc = chart.asc ?? 0;
      for (let s = 0; s < 12; s++) { const ang = Math.PI - ((s * 30 - asc) * Math.PI) / 180; g.beginPath(); g.moveTo(cx + Math.cos(ang) * r * 0.8, cy - Math.sin(ang) * r * 0.8); g.lineTo(cx + Math.cos(ang) * r, cy - Math.sin(ang) * r); g.stroke(); }
      chart.bodies.filter(b => CARD_PLANETS.concat(['uranus', 'neptune', 'pluto']).includes(b.key)).forEach(b => {
        const ang = Math.PI - ((b.lon - asc) * Math.PI) / 180;
        text(b.glyph, cx + Math.cos(ang) * r * 0.65, cy - Math.sin(ang) * r * 0.65 + 12 * u, 36, accent, 'serif');
      });
    };
    const get = (k: string) => chart.bodies.find(b => b.key === k)!;
    const big3 = [get('sun'), get('moon')].map(b => `${b.name} ${b.sign}`).concat(timed && chart.asc != null ? [`Rising ${SIGNS[Math.floor(chart.asc / 30)]}`] : []).join('  ·  ');
    if (kind === 'wallpaper') { wheel(w / 2, h * 0.55, 380 * u); text(birth.name, w / 2, h * 0.2, 80); text(big3, w / 2, h * 0.24, 34, accent, 'Libre Franklin, sans-serif'); text('ZODACI', w / 2, h * 0.93, 26, quiet, 'Libre Franklin, sans-serif'); }
    if (kind === 'poster') { text(birth.name, w / 2, 220 * u, 90); text(big3, w / 2, 290 * u, 30, accent, 'Libre Franklin, sans-serif'); wheel(w / 2, 680 * u, 330 * u);
      chart.bodies.filter(b => CARD_PLANETS.concat(['uranus', 'neptune', 'pluto', 'chiron', 'northNode']).includes(b.key)).forEach((b, i) => text(placementLine(timed ? b : { ...b, house: null }), i % 2 ? 540 * u : 90 * u, 1080 * u + Math.floor(i / 2) * 52 * u, 26, ink, 'Libre Franklin, sans-serif', 'left'));
      text(`Born ${birth.date}${timed ? ` · ${birth.time}` : ' · time unknown'}`, w / 2, h - 80 * u, 22, quiet, 'Libre Franklin, sans-serif'); }
    if (kind === 'journal') { text(`${birth.name}’s chart journal`, 90 * u, 150 * u, 54, ink, 'Alfa Slab One, serif', 'left'); text('Date ____________', w - 90 * u, 150 * u, 24, quiet, 'Libre Franklin, sans-serif', 'right');
      journalPrompts(chart, timed).forEach((p, i) => { const y = 260 * u + i * 230 * u; text(p, 90 * u, y, 26, accent, 'Libre Franklin, sans-serif', 'left'); g.strokeStyle = atomic ? tok('paper-ink', 0.25) : tok('foreground', 0.25); g.lineWidth = 1 * u; for (let l = 1; l <= 3; l++) { g.beginPath(); g.moveTo(90 * u, y + l * 55 * u); g.lineTo(w - 90 * u, y + l * 55 * u); g.stroke(); } }); }
    if (kind === 'card') { const b = get(planet); text(b.glyph, w / 2, 420 * u, 260, accent, 'serif'); text(`${b.name} in ${b.sign}`, w / 2, 620 * u, 70);
      const words = affirmationFor(b.name, b.sign).split(' '); let line = '', y = 800 * u; g.font = `${40 * u}px Alfa Slab One, serif`;
      words.forEach(wd => { if (g.measureText(`${line} ${wd}`).width > w - 220 * u) { text(line.trim(), w / 2, y, 40); line = ''; y += 60 * u; } line += ` ${wd}`; }); text(line.trim(), w / 2, y, 40);
      text(`${birth.name} · ${b.deg}° ${b.sign}`, w / 2, h - 110 * u, 24, quiet, 'Libre Franklin, sans-serif'); }
    const wrap = (t: string, x: number, y: number, size: number, max: number, color = ink, font = 'Libre Franklin, sans-serif', lh = 1.4) => {
      g.font = `${size * u}px ${font}`; let line = '', yy = y;
      t.split(' ').forEach(wd => { if (line && g.measureText(`${line} ${wd}`).width > max) { text(line, x, yy, size, color, font); line = ''; yy += size * lh * u; } line = line ? `${line} ${wd}` : wd; });
      if (line) text(line, x, yy, size, color, font); return yy;
    };
    if (kind === 'scroll') {
      text('STAR SCROLL', w / 2, 150 * u, 40, accent, 'Bebas Neue, sans-serif'); text(birth.name, w / 2, 270 * u, 92); text(big3, w / 2, 340 * u, 30, accent, 'Libre Franklin, sans-serif');
      wheel(w / 2, 720 * u, 300 * u);
      const rows = chart.bodies.filter(b => CARD_PLANETS.concat(['uranus', 'neptune', 'pluto', 'chiron', 'northNode']).includes(b.key));
      rows.forEach((b, i) => { const y = 1160 * u + i * 128 * u; text(`${b.glyph}\uFE0E`, 120 * u, y, 54, accent, 'serif', 'left'); text(placementLine(timed ? b : { ...b, house: null }).replace(' (mean)', ''), 220 * u, y, 32, ink, 'Libre Franklin, sans-serif', 'left');
        g.strokeStyle = atomic ? tok('paper-ink', 0.2) : tok('foreground', 0.18); g.lineWidth = 1 * u; g.beginPath(); g.moveTo(120 * u, y + 40 * u); g.lineTo(w - 120 * u, y + 40 * u); g.stroke(); });
      if (timed && chart.asc != null) text(`Ascendant ${SIGNS[Math.floor(chart.asc / 30)]} ${Math.floor(chart.asc % 30)}°`, w / 2, 1160 * u + rows.length * 128 * u + 40 * u, 40, accent, 'Alfa Slab One, serif');
      text(`Born ${birth.date}${timed ? ` · ${birth.time}` : ' · time unknown'} · ${birth.placeLabel}`.slice(0, 80), w / 2, h - 170 * u, 26, quiet, 'Libre Franklin, sans-serif');
      text('A keepsake drawn from calculated positions · not an official record', w / 2, h - 120 * u, 22, quiet, 'Libre Franklin, sans-serif');
      text('ZODACI OBSERVATORY', w / 2, h - 70 * u, 28, accent, 'Bebas Neue, sans-serif');
    }
    if (kind === 'tarot') {
      const card = tarotBirthCard(birth.date);
      g.strokeStyle = accent; g.lineWidth = 6 * u; g.strokeRect(60 * u, 60 * u, w - 120 * u, h - 120 * u);
      text(card ? card.roman : '?', w / 2, 210 * u, 110, accent, 'Alfa Slab One, serif');
      const sun = get('sun'); const r = 230 * u, cy = h * 0.44;
      g.strokeStyle = accent; g.lineWidth = 3 * u; g.beginPath(); g.arc(w / 2, cy, r, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * r * 1.08, cy + Math.sin(a) * r * 1.08); g.lineTo(w / 2 + Math.cos(a) * r * (i % 2 ? 1.2 : 1.32), cy + Math.sin(a) * r * (i % 2 ? 1.2 : 1.32)); g.stroke(); }
      // U+FE0E asks for the plain text glyph, not a coloured emoji.
      text(`${sun.signGlyph ?? sun.glyph}\uFE0E`, w / 2, cy + 90 * u, 260, ink, 'serif');
      text(card ? card.name.toUpperCase() : 'BIRTH CARD', w / 2, h * 0.75, 74, ink, 'Bebas Neue, sans-serif');
      if (card) wrap(`Birth-date digits total ${card.total}${card.total > 22 ? `, reduced to ${card.number || 22}` : ''}. Sun in ${sun.sign} ${sun.deg}°.`, w / 2, h * 0.8, 30, w - 220 * u, quiet);
      text(birth.name, w / 2, h - 130 * u, 40, accent, 'Yellowtail, cursive');
    }
    if (kind === 'badge') {
      const b = badgeLines(chapter ?? { title: '', hit: null, summary: '' }, today);
      g.strokeStyle = accent; g.lineWidth = 14 * u; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 30 * u, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 3 * u; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 110 * u, 0, Math.PI * 2); g.stroke();
      // Lettering around the rim.
      const ring = (t: string, start: number, radius: number) => { g.font = `${44 * u}px Bebas Neue, sans-serif`; g.fillStyle = ink; g.textAlign = 'center'; const step = 0.075; [...t].forEach((ch, i) => { const a = start + (i - (t.length - 1) / 2) * step; g.save(); g.translate(w / 2 + Math.cos(a) * radius, h / 2 + Math.sin(a) * radius); g.rotate(a + Math.PI / 2); g.fillText(ch, 0, 0); g.restore(); }); };
      ring('ZODACI TRANSIT BUREAU', -Math.PI / 2, w / 2 - 75 * u);
      text(b.glyphs, w / 2, h * 0.42, 150, accent, 'serif');
      wrap(b.title.toUpperCase(), w / 2, h * 0.55, 68, w - 340 * u, ink, 'Bebas Neue, sans-serif', 1.05);
      wrap(b.detail, w / 2, h * 0.67, 32, w - 380 * u, quiet);
      text(b.date, w / 2, h * 0.79, 34, ink, 'Libre Franklin, sans-serif');
      text(birth.name, w / 2, h * 0.86, 40, accent, 'Yellowtail, cursive');
      g.restore();
    }
  }, [chart, birth, kind, style, planet, timed, chapter, today]);

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
      <div><h2 id="make-h" className="text-xl">Design & download</h2><p className="text-sm text-muted-foreground">Wallpapers, posters, journal pages, cards, a tall star scroll, your tarot birth card and today’s transit badge, all drawn from your exact placements. Free to make, no credits used.</p></div>
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
        <canvas ref={canvas} className={`w-full ${kind === 'badge' ? 'rounded-full' : 'rounded border border-gold/40'} ${kind === 'scroll' ? 'max-h-[70vh] object-contain' : ''}`} aria-label={`Preview of your ${CREATION_SIZE[kind].label}`} />
      </div>
      <div className="space-y-2"><h3 className="text-base">My creations</h3>
        {lib.loading ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : lib.items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing saved yet.</p> :
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">{lib.items.map(it => <li key={it.id} className="space-y-1 rounded border border-border/60 p-2">{it.url && <img src={it.url} alt={it.title} className="aspect-[3/4] w-full rounded object-cover" loading="lazy" />}<p className="text-xs">{it.title}</p><div className="flex gap-1">{it.url && <Button asChild size="sm" variant="outline"><a href={it.url} download={it.file_name}><Download className="h-3 w-3" aria-hidden />Get</a></Button>}<Button size="sm" variant="ghost" onClick={() => remove(it)} aria-label={`Delete ${it.title}`}><Trash2 className="h-3 w-3" aria-hidden /></Button></div></li>)}</ul>}
      </div>
    </section>
  );
}
