import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { SEARCH_INDEX, type SearchDoc } from '@/content/compendium';
import { TOPICS } from '@/content/topics';
import { KUA_DIRECTIONS, ROOMS, CRYSTALS, TWELVE_WEEKS, STAR_INFO, DIR_NAME } from '@/content/fengshui';
import { loadProtectedJson } from '@/lib/protectedContent';

const FS_DOCS = [
  { id: 'guide-fsp', kind: 'guide', title: 'Feng Shui Guide · Page by Page', subtitle: 'Pages 114–180 + Flying Stars wheel', body: 'feng shui page flying stars wheel year', route: '/guides/feng-shui-pages' },
  { id: 'guide-tl', kind: 'guide', title: 'Timeline Overview', subtitle: 'All timing and retrograde sections', body: 'life phases mercury venus jupiter saturn retrograde eclipse strategies', route: '/guides/timeline-retrogrades' },
  { id: 'guide-fs', kind: 'guide', title: 'Birth Chart & Feng Shui Guide', subtitle: 'All 20 sections', body: 'feng shui big three planets houses patterns lessons shadow affirmations', route: '/guides/birth-chart-feng-shui' },
  ...TOPICS.map(t => ({ id: 'topic-' + t.slug, kind: 'topic', title: t.label, subtitle: 'Theme · all sources', body: t.intro + ' ' + t.query, route: `/topics/${t.slug}` })),
  { id: 'fs-bagua', kind: 'fengshui', title: 'Bagua & Home Guide', subtitle: 'Kua 1 directions, rooms, crystals, 12 weeks', body: 'bagua kua feng shui home', route: '/feng-shui/bagua' },
  { id: 'fs-stars', kind: 'fengshui', title: 'Flying Stars', subtitle: 'Annual & Period 9 star charts 2024–2043', body: 'xuan kong flying star annual period nine', route: '/feng-shui/flying-stars' },
  ...KUA_DIRECTIONS.map(k => ({ id: 'fs-dir-' + k.dir, kind: 'fengshui', title: `${k.name} · ${DIR_NAME[k.dir]}`, subtitle: k.meaning, body: k.activation, route: `/feng-shui/bagua?sector=${k.dir}` })),
  ...ROOMS.map(r => ({ id: 'fs-' + r.id, kind: 'fengshui', title: r.name, subtitle: 'Room-by-room · 18C', body: r.text, route: '/feng-shui/bagua', drawer: '#' + r.id })),
  ...CRYSTALS.map(c => ({ id: 'fs-' + c.id, kind: 'fengshui', title: c.name, subtitle: 'Crystal · ' + c.basis, body: c.purpose + ' ' + c.placement, route: '/feng-shui/bagua', drawer: '#' + c.id })),
  ...TWELVE_WEEKS.map((w, i) => ({ id: 'fs-week-' + i, kind: 'fengshui', title: `${w.weeks}: ${w.focus}`, subtitle: '12-week implementation', body: w.actions, route: '/feng-shui/bagua', drawer: `#week-${i + 1}` })),
  ...Object.values(STAR_INFO).map(s => ({ id: 'fs-star-' + s.n, kind: 'fengshui', title: `Star ${s.n} · ${s.name}`, subtitle: `Flying star · ${s.element} · ${s.nature}`, body: s.theme, route: '/feng-shui/flying-stars' })),
  { id: 'tool-calc', kind: 'tool', title: 'Birth Chart Calculator', subtitle: 'Compute positions, aspects & Ba Zi from date, time, place', body: 'calculate natal chart ephemeris bazi', route: '/chart-calculator' },
  { id: 'tool-elements', kind: 'tool', title: 'Chart Elements & Meanings', subtitle: 'Every position with sources', body: 'planets meanings citations', route: '/chart-elements' },
  { id: 'tool-bagua-wheel', kind: 'tool', title: 'Masterbook · Bagua Wheel', subtitle: 'Eight directions, Kua 1', body: 'feng shui bagua directions', route: '/masterbook/bagua-wheel' },
  { id: 'tool-bagua-reading', kind: 'tool', title: 'The Bagua Reading', subtitle: 'Chart + Ba Zi + Kua directions', body: 'feng shui kua reading', route: '/bagua-reading' },
  { id: 'tool-relationships', kind: 'tool', title: 'Relationships', subtitle: 'Synastry, composite, Chinese match', body: 'relationship compatibility synastry partner', route: '/relationships' },
  { id: 'tool-reading', kind: 'tool', title: 'The Complete Reading', subtitle: 'Natal + aspects + Ba Zi + Compendium', body: 'reading synthesis', route: '/reading' },
  { id: 'tool-pdf', kind: 'tool', title: 'Feng Shui Guide PDF (in-app viewer)', subtitle: 'Section 18, page 114', body: 'pdf viewer', route: '/masterbook/pdf/d-ff306540?page=114' },
] as unknown as Doc[];

type Doc = Omit<SearchDoc, 'kind'> & { kind: SearchDoc['kind'] | 'masterbook' | 'companion' | 'upload' | 'fengshui' | 'tool' };

const KIND_LABEL: Record<Doc['kind'], string> = {
  masterbook: 'Masterbook',
  companion: 'Timeline · Retrogrades · Feng Shui',
  upload: 'Your Uploads',
  fengshui: 'Feng Shui',
  tool: 'Tools',
  sabian: 'Sabian Symbol',
  star: 'Fixed Star',
  asteroid: 'Asteroid Goddess',
  aspect: 'Special Aspect',
  part: 'Arabic Part',
  profection: 'Profection',
  eclipse: 'Prenatal Eclipse',
  number: 'Numerology',
  transit: 'Transit',
  pillar: 'Ba Zi Pillar',
  vol2: 'Volume II',

};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // ⌘K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [extra, setExtra] = useState<Doc[]>([]);
  useEffect(() => {
    if (!open || extra.length) return;
    (async () => {
      const mb = await loadProtectedJson<{ id: string; label: string; title: string; part: string; sections: string[]; excerpt: string }[]>('masterbook', 'index.json');
      const docs: Doc[] = mb.map(e => ({
        id: 'mb-' + e.id, kind: /^(c|v2|cmp)-/.test(e.id) ? 'companion' : 'masterbook', title: e.title,
        subtitle: `${e.part} · ${e.label}`, body: e.sections.join(' · ') + ' ' + e.excerpt, route: `/masterbook/${e.id}`,
      } as Doc));
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('library_items').select('id,title,category,sections').eq('kind', 'masterbook');
      (data ?? []).forEach(u => {
        docs.push({ id: 'up-' + u.id, kind: 'upload', title: u.title, subtitle: u.category ?? 'Uploaded document', body: '', route: `/masterbook/u/${u.id}` } as Doc);
        ((u.sections as { title: string }[] | null) ?? []).forEach((sec, i) => docs.push({ id: `up-${u.id}-${i}`, kind: 'upload', title: sec.title, subtitle: u.title, body: '', route: `/masterbook/u/${u.id}#s${i}` } as Doc));
      });
      setExtra(docs);
    })().catch(() => {});
  }, [open, extra.length]);
  const all = useMemo(() => [...(SEARCH_INDEX as Doc[]), ...FS_DOCS, ...extra], [extra]);

  const fuse = useMemo(() => new Fuse(all, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'subtitle', weight: 0.2 },
      { name: 'body', weight: 0.3 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), [all]);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX.slice(0, 12);
    return fuse.search(query).slice(0, 24).map(r => r.item);
  }, [query, fuse]);

  const grouped = useMemo(() => {
    const g: Record<string, Doc[]> = {};
    results.forEach(r => { (g[KIND_LABEL[r.kind]] ||= []).push(r); });
    return g;
  }, [results]);

  const select = (doc: Doc) => {
    setOpen(false);
    setQuery('');
    navigate(doc.route + (doc.drawer ?? ''));
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search the Masterbook, companion guides, uploads, symbols, stars…"
      />
      <CommandList className="max-h-[70vh]">
        <CommandEmpty>No entries match.</CommandEmpty>
        {Object.entries(grouped).map(([label, items]) => (
          <CommandGroup key={label} heading={label}>
            {items.map(item => (
              <CommandItem key={item.id} value={item.id + ' ' + item.title + ' ' + item.subtitle}
                onSelect={() => select(item)}>
                <div className="flex flex-col gap-0.5 w-full">
                  <div className="font-display text-sm">{item.title}</div>
                  <div className="text-[11px] text-muted-foreground">{item.subtitle}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/** Small trigger button that mimics the ⌘K shortcut. */
export function CommandPaletteTrigger() {
  const trigger = () => {
    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    window.dispatchEvent(e);
  };
  return (
    <button
      onClick={trigger}
      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded border border-border/60 bg-muted/40 hover:border-gold/60 hover:bg-muted/60 transition-colors text-left"
      aria-label="Open search (Cmd+K)"
    >
      <span className="text-xs text-muted-foreground font-smallcaps">Search the compendium</span>
      <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-background">⌘K</kbd>
    </button>
  );
}
