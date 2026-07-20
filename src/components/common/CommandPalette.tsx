import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { SEARCH_INDEX, type SearchDoc } from '@/content/compendium';

const KIND_LABEL: Record<SearchDoc['kind'], string> = {
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

  const fuse = useMemo(() => new Fuse(SEARCH_INDEX, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'subtitle', weight: 0.2 },
      { name: 'body', weight: 0.3 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), []);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX.slice(0, 12);
    return fuse.search(query).slice(0, 24).map(r => r.item);
  }, [query, fuse]);

  const grouped = useMemo(() => {
    const g: Record<string, SearchDoc[]> = {};
    results.forEach(r => { (g[KIND_LABEL[r.kind]] ||= []).push(r); });
    return g;
  }, [results]);

  const select = (doc: SearchDoc) => {
    setOpen(false);
    setQuery('');
    navigate(doc.route + (doc.drawer ?? ''));
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search Sabian symbols, fixed stars, asteroids, aspects, lots…"
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
