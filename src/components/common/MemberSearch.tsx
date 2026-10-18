import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { NAV_GROUPS } from '@/content/navigation';
import { useCustomPages } from '@/hooks/useCustomPages';

/** Search public member destinations without loading private source text. */
export function MemberSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const custom = useCustomPages();
  const destinations = [...new Map([...NAV_GROUPS.flatMap(g => [...g.items, ...g.submenus?.flatMap(s => s.items) ?? [], ...g.footer ?? []]), ...custom.map(page => ({ to: `/p/${page.id}`, label: page.title })), { to: '/dashboard', label: 'Dashboard' }, { to: '/orders', label: 'My orders' }].map(item => [item.to, item])).values()];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(v => !v); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <CommandDialog open={open} onOpenChange={setOpen}><CommandInput placeholder="Find a page or reading…" /><CommandList><CommandEmpty>No matching pages.</CommandEmpty><CommandGroup heading="Pages & readings">{destinations.map(item => <CommandItem key={item.to} value={item.label} onSelect={() => { setOpen(false); navigate(item.to); }}>{item.label}</CommandItem>)}</CommandGroup></CommandList></CommandDialog>;
}