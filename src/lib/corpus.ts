import { BUILT_IN_SOURCES } from '@/content/sources';
import { loadProtectedJson, loadProtectedText } from '@/lib/protectedContent';

export type Passage = { key: string; doc: string; source: string; loc: string; text: string; href: string };
type LibIdx = { id: string; fileName: string; units: number; words: number }[];

let corpus: Promise<Passage[]> | null = null;
export const loadLibraryIndex = () => loadProtectedJson<LibIdx>('library', 'index.json');

const titleFor = (fileName: string) => BUILT_IN_SOURCES.find(s => s.fileName === fileName)?.title ?? fileName;

/** Split text into ~180-word passages on paragraph boundaries. */
function chunk(text: string, max = 180): string[] {
  const paras = text.split(/\n{2,}|\n(?=[A-Z•\-])/).map(p => p.trim()).filter(Boolean);
  const out: string[] = []; let cur = '';
  for (const p of paras) {
    if ((cur + ' ' + p).split(/\s+/).length > max && cur) { out.push(cur); cur = p; } else cur = cur ? cur + '\n' + p : p;
  }
  if (cur) out.push(cur);
  return out;
}

export function loadCorpus(): Promise<Passage[]> {
  return (corpus ??= (async () => {
    const passages: Passage[] = [];
    const mb = await loadProtectedJson<{ id: string; label: string; title: string }[]>('masterbook', 'index.json');
    await Promise.all(mb.filter(e => !/^(c|v2|cmp)-/.test(e.id)).map(async (e) => {
      const md = await loadProtectedText('masterbook', `${e.id}.md`);
      let section = e.title;
      md.split(/\n(?=### )/).forEach((blk) => {
        const m = blk.match(/^### (.+)/); if (m) section = m[1];
        chunk(blk.replace(/[*>#\\]/g, '')).forEach((t, i) => passages.push({
          key: `mb:${e.id}:${section}:${i}`, doc: 'masterbook', source: 'Masterbook', loc: `${e.label} · ${e.title}${section !== e.title ? ' › ' + section : ''}`,
          text: t, href: `/masterbook/${e.id}`,
        }));
      });
    }));
    const lib = await loadLibraryIndex();
    await Promise.all(lib.map(async (d) => {
      const units = await loadProtectedJson<{ loc: string; text: string }[]>('library', `${d.id}.json`);
      units.forEach((u, ui) => chunk(u.text).forEach((t, i) => passages.push({
        key: `lib:${d.id}:${ui}:${i}`, doc: d.id, source: titleFor(d.fileName), loc: u.loc, text: t, href: `/sources/read/${d.id}#u${ui}`,
      })));
    }));
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('library_items').select('id,title,sections').eq('kind', 'masterbook');
      (data ?? []).forEach(u => ((u.sections as { title: string; text: string }[] | null) ?? []).forEach((sec, si) => chunk(sec.text).forEach((t, i) => passages.push({
        key: `up:${u.id}:${si}:${i}`, doc: 'up:' + u.id, source: u.title, loc: sec.title, text: t, href: `/masterbook/u/${u.id}#s${si}`,
      }))));
    } catch { /* uploads optional */ }
    return passages;
  })());
}

const STOP = new Set('the a an and or of to in is are was were be for on with as by at from that this it its what how why who does do i my me about her she april you your which when where'.split(' '));
const terms = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9° ]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP.has(w));

/** Simple BM25 ranking over all passages. */
export function rank(passages: Passage[], query: string, k = 12): Passage[] {
  const q = [...new Set(terms(query))]; if (!q.length) return [];
  const N = passages.length; const df = new Map<string, number>();
  const toks = passages.map(p => terms(p.text + ' ' + p.loc));
  toks.forEach(t => { const s = new Set(t); q.forEach(w => { if ([...s].some(x => x.startsWith(w))) df.set(w, (df.get(w) ?? 0) + 1); }); });
  const avg = toks.reduce((a, t) => a + t.length, 0) / N;
  const scored = toks.map((t, i) => {
    let s = 0;
    for (const w of q) {
      const f = t.filter(x => x.startsWith(w)).length; if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(w) ?? 0) + 0.5) / ((df.get(w) ?? 0) + 0.5));
      s += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * t.length / avg));
    }
    return [s, i] as const;
  }).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]);
  const out: Passage[] = []; const seen = new Set<string>();
  for (const [, i] of scored) { const p = passages[i]; const sig = p.text.slice(0, 80); if (seen.has(sig)) continue; seen.add(sig); out.push(p); if (out.length >= k) break; }
  return out;
}

/** Passages about Shane (his chart, family or home) belong only on Relationship pages — April's own pages use this filter. */
export const SHANE_RE = /\bShane\b|\bGobles?\b|LeComptes?|synastry|composite chart/i;
export const aprilOnly = (ps: Passage[]) => ps.filter(p => !SHANE_RE.test(p.text + ' ' + p.source + ' ' + p.loc) && !/relationship/i.test(p.source));
