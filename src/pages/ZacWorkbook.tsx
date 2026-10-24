import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { computeChart, fmtLon } from '@/lib/astro';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Zac's verified birth facts (Volume I: Mount Carmel Medical Center, Columbus, Ohio). */
export const ZAC_BIRTH = { date: '1987-07-10', time: '12:08', lat: 39.9567, lon: -83.0144, tz: 'America/New_York', placeLabel: 'Columbus, Ohio', placeSource: 'geocoded' as const, houseSystem: 'placidus' as const };

type Station = { key: string; title: string; body: string; prompt: string; practice: string };
/** Workbook stations keyed to placements the calculator confirms; wording reflects the volumes' themes, not new claims. */
const STATIONS: Station[] = [
  { key: 'asc', title: 'The Virgo Threshold', body: 'Your Ascendant sits at the last degrees of Virgo — the way you meet the world is careful, observant and quietly exacting.', prompt: 'Where did your eye for detail help someone this week — and where did it turn into self-criticism?', practice: 'Write one sentence of praise for something you did imperfectly.' },
  { key: 'sun', title: 'The Cancer Sun at the Summit', body: 'The Sun in Cancer in the 10th house: care, protection and family meaning are tied to your public work.', prompt: 'Who are you providing for right now, and does that work feel like yours?', practice: 'Name one way your work could look after you, too.' },
  { key: 'moon', title: 'The Capricorn Moon at the Root', body: 'Moon in Capricorn in the 4th: feelings run deep and are held privately, steadied by structure.', prompt: 'What feeling did you carry alone lately that could be shared with one trusted person?', practice: 'Choose a weekly ritual at home that feels like solid ground.' },
  { key: 'mercury', title: 'Mercury Retrograde, Chart Ruler', body: 'Mercury rules your Virgo Ascendant and was retrograde at birth — reflection comes before speech.', prompt: 'What have you been rehearsing in your head that is ready to be said aloud?', practice: 'Draft it in writing first; send or speak it within three days.' },
  { key: 'mars', title: 'Mars in Leo, the Creative Drive', body: 'Mars in Leo in the 11th: courage shows up through creative projects and the people you build with.', prompt: 'Which group or friendship gives your energy somewhere to go?', practice: 'Spend one hour this week on a project purely because it lights you up.' },
  { key: 'northNode', title: 'North Node in Aries, the Assignment', body: 'The North Node in Aries in the 7th points toward initiative within partnership rather than only keeping the peace.', prompt: 'Where are you waiting for permission you could give yourself?', practice: 'Make one first move — an ask, an offer or an invitation.' },
];

const storeKey = (uid: string) => `zac-workbook-v1:${uid}`;

export default function ZacWorkbook() {
  usePageMeta('Zac’s Workbook · Zodaci', 'A private, chart-keyed workbook for Zac.');
  const session = useSession();
  const uid = session?.user.id ?? '';
  const chart = useMemo(() => computeChart(ZAC_BIRTH), []);
  const [active, setActive] = useState(STATIONS[0].key);
  const [notes, setNotes] = useState<Record<string, { answer: string; done: boolean }>>({});
  useEffect(() => { if (!uid) return; try { setNotes(JSON.parse(localStorage.getItem(storeKey(uid)) ?? '{}')); } catch { setNotes({}); } }, [uid]);
  const save = (key: string, patch: Partial<{ answer: string; done: boolean }>) => setNotes(n => {
    const next = { ...n, [key]: { answer: '', done: false, ...n[key], ...patch } };
    if (uid) localStorage.setItem(storeKey(uid), JSON.stringify(next));
    return next;
  });
  const place = (key: string) => {
    if (key === 'asc') return chart.asc == null ? '' : `${fmtLon(chart.asc).text} · 1st house`;
    const b = chart.bodies.find(x => x.key === key);
    return b ? `${fmtLon(b.lon).text}${b.retro ? ' ℞' : ''}${b.house ? ` · house ${b.house}` : ''}` : '';
  };
  const done = STATIONS.filter(s => notes[s.key]?.done).length;
  const s = STATIONS.find(x => x.key === active)!;
  const pct = Math.round((done / STATIONS.length) * 100);

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Zac’s edition · Workbook</div>
        <h1 className="text-4xl sm:text-5xl">The Diamond Workbook</h1>
        <p className="max-w-2xl text-muted-foreground">Six stations, each keyed to a placement calculated from your birth (July 10, 1987, 12:08 PM, Columbus, Ohio). Answers save privately on this device.</p>
        <div className="flex items-center gap-3 pt-2" aria-label={`${done} of ${STATIONS.length} stations complete`}>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gold transition-all duration-1000" style={{ width: `${pct}%` }} /></div>
          <span className="text-sm text-muted-foreground">{done} of {STATIONS.length} complete</span>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <ol className="space-y-2" aria-label="Workbook stations">
          {STATIONS.map(st => (
            <li key={st.key}>
              <button onClick={() => setActive(st.key)} aria-current={active === st.key ? 'step' : undefined} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active === st.key ? 'border-gold bg-gold/10' : 'border-border bg-card/50 hover:border-gold/60'}`}>
                {st.key !== 'asc' ? <PlanetOrb planet={st.key} size={36} /> : <span className="grid h-9 w-9 place-items-center rounded-full border border-gold text-gold">AC</span>}
                <span className="min-w-0"><span className="block text-sm font-medium">{st.title}</span><span className="block truncate text-xs text-muted-foreground">{place(st.key)}</span></span>
                {notes[st.key]?.done && <span className="ml-auto text-gold" aria-label="complete">✓</span>}
              </button>
            </li>
          ))}
        </ol>
        <section className="parchment space-y-4 p-6" aria-labelledby="station-h">
          <div className="font-smallcaps text-xs text-gold">{place(s.key)}</div>
          <h2 id="station-h" className="text-3xl">{s.title}</h2>
          <p className="text-muted-foreground">{s.body}</p>
          <label className="block space-y-2"><span className="font-medium">{s.prompt}</span>
            <textarea value={notes[s.key]?.answer ?? ''} onChange={e => save(s.key, { answer: e.target.value })} rows={6} className="w-full rounded-md border border-input bg-background p-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Write freely…" />
          </label>
          <p className="text-sm"><span className="font-smallcaps text-gold">Practice</span> · {s.practice}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => save(s.key, { done: !notes[s.key]?.done })} variant={notes[s.key]?.done ? 'outline' : 'default'}>{notes[s.key]?.done ? 'Mark as not done' : 'Mark station complete'}</Button>
            <Button asChild variant="ghost"><Link to="/counselors">Talk it through with a counselor</Link></Button>
          </div>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">Read the full background in <Link to="/zac" className="underline">your Astrological Library</Link>.</p>
    </article>
  );
}
