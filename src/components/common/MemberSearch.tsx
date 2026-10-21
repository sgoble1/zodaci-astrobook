import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { memberDestinations } from '@/content/memberNav';
import { useCustomPages } from '@/hooks/useCustomPages';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { useSharedSpaceMember } from '@/hooks/useSharedSpaceMember';

/** Search member destinations from the navigation registry, without loading private source text. */
export function MemberSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const custom = useCustomPages();
  const shane = useShaneAccount();
  const shared = useSharedSpaceMember() === true;
  const groups = useMemo(() => {
    const all = [...memberDestinations({ shane, shared }), ...custom.map(page => ({ to: `/p/${page.id}`, label: page.title, description: 'A page you created', group: 'Your created pages' }))];
    const byGroup = new Map<string, typeof all>();
    for (const item of all) { const key = item.group.split(' · ')[0]; byGroup.set(key, [...(byGroup.get(key) ?? []), item]); }
    return [...byGroup.entries()];
  }, [custom, shane, shared]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(v => !v); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a page or reading…" />
      <CommandList className="max-h-[70vh]">
        <CommandEmpty>No matching pages.</CommandEmpty>
        {groups.map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map(item => (
              <CommandItem key={item.to} value={`${item.label} ${item.description} ${item.group}`} onSelect={() => { setOpen(false); navigate(item.to); }}>
                <div className="flex w-full flex-col gap-0.5"><span>{item.label}</span><span className="text-[11px] text-muted-foreground">{item.group} · {item.description}</span></div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
