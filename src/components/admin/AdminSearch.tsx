import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Package, FileText, Library } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import type { AdminTab } from '@/lib/adminTabs';

type Hit = { kind: string; id: string; label: string; detail: string };
const ICON: Record<string, typeof User> = { member: User, order: Package, page: FileText, library: Library };
const KIND: Record<string, string> = { member: 'Member', order: 'Book order', page: 'Marketing page', library: 'Library item' };

/** Admin-only search across members, orders, marketing pages and library items. Ctrl/⌘ K focuses it on this page. */
export function AdminSearch({ onOpen }: { onOpen: (tab: AdminTab, extra?: Record<string, string>) => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    // Capture first so the member search shortcut doesn't also open on the admin page.
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); e.stopPropagation(); input.current?.focus(); input.current?.select(); setOpen(true); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); setErr(''); return; }
    let alive = true; setBusy(true);
    const t = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('admin_search', { _q: term });
      if (!alive) return;
      setBusy(false); setActive(0);
      if (error) { setErr('Search is unavailable right now.'); setHits([]); } else { setErr(''); setHits((data ?? []) as Hit[]); }
    }, 250);
    return () => { alive = false; window.clearTimeout(t); };
  }, [q]);
  const choose = (h: Hit) => {
    setOpen(false); setQ('');
    if (h.kind === 'member') onOpen('credits', { member: h.id });
    else if (h.kind === 'order') navigate(`/orders?all=1#order-${h.id}`);
    else if (h.kind === 'page') onOpen('marketing');
    else navigate(`/masterbook/u/${h.id}`);
  };
  return (
    <div className="relative w-full sm:w-80">
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input ref={input} value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, hits.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); } else if (e.key === 'Enter' && hits[active]) { e.preventDefault(); choose(hits[active]); } else if (e.key === 'Escape') setOpen(false); }}
        placeholder="Search members, orders, pages…  Ctrl K" aria-label="Admin search" role="combobox" aria-expanded={open && hits.length > 0} aria-controls="admin-search-list" className="pl-9" />
      {open && q.trim().length >= 2 && (
        <div className="absolute right-0 z-30 mt-1 w-full min-w-72 rounded-md border border-border bg-popover p-1 shadow-lg">
          {busy && <p className="px-3 py-2 text-sm text-muted-foreground" role="status">Searching…</p>}
          {!busy && err && <p className="px-3 py-2 text-sm text-destructive">{err}</p>}
          {!busy && !err && !hits.length && <p className="px-3 py-2 text-sm text-muted-foreground">No matches.</p>}
          <ul id="admin-search-list" role="listbox">{hits.map((h, i) => { const I = ICON[h.kind] ?? Search; return (
            <li key={h.kind + h.id} role="option" aria-selected={i === active}><button type="button" onMouseDown={e => e.preventDefault()} onClick={() => choose(h)} className={`flex w-full items-start gap-2 rounded px-3 py-2 text-left text-sm ${i === active ? 'bg-muted' : 'hover:bg-muted'}`}><I aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span className="min-w-0"><span className="block truncate">{h.label}</span><span className="block truncate text-xs text-muted-foreground">{KIND[h.kind] ?? h.kind}{h.detail ? ` · ${h.detail}` : ''}</span></span></button></li>
          ); })}</ul>
        </div>
      )}
    </div>
  );
}
