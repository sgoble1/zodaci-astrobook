import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { memberDestinations } from '@/content/memberNav';
import { useCustomPages } from '@/hooks/useCustomPages';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { useSharedSpaceMember } from '@/hooks/useSharedSpaceMember';
import { useSharedEditions } from '@/lib/editionSharing';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { CORE_THEMES, TOPIC_READINGS } from '@/lib/topicReadings';

const EDITION_TITLES: Record<string, [string, string]> = { april: ['/april', 'April’s Masterbook'], shane: ['/shane', 'Shane’s Masterbook'], zac: ['/zac', 'Zac’s Astrological Library'] };

/** Search member destinations from the navigation registry, without loading private source text. */
export function MemberSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const custom = useCustomPages();
  const shane = useShaneAccount();
  const shared = useSharedSpaceMember() === true;
  const editions = useSharedEditions();
  const birth = useMyBirth();
  const placements = useMemo(() => {
    if (!open || !birth) return [];
    try {
      const timed = !!birth.time;
      return computeChart(toChartInput(birth)).bodies.slice(0, 12).map(b => ({ to: `/planets/${b.key}`, label: `${b.name} in ${b.sign}${timed && b.house ? ` · house ${b.house}` : ''}`, description: 'Your calculated placement', group: 'Your placements' }));
    } catch { return []; }
  }, [open, birth]);
  const groups = useMemo(() => {
    const chapters = [...TOPIC_READINGS, ...CORE_THEMES].map(t => ({ to: `/my-readings/topic/${t.slug}`, label: t.title, description: 'Reading chapter', group: 'Chapters' }));
    const volumes = [...new Set([...editions, ...(shane ? ['shane'] : [])])].filter(e => EDITION_TITLES[e]).map(e => ({ to: EDITION_TITLES[e][0], label: EDITION_TITLES[e][1], description: 'Founder volume you can open', group: 'Founder volumes' }));
    const all = [...placements, ...volumes, ...memberDestinations({ shane, shared }), ...chapters, ...custom.map(page => ({ to: `/p/${page.id}`, label: page.title, description: 'A page you created', group: 'Your created pages' }))];
    const byGroup = new Map<string, typeof all>(); const seen = new Set<string>();
    for (const item of all) { if (seen.has(item.to)) continue; seen.add(item.to); const key = item.group.split(' · ')[0]; byGroup.set(key, [...(byGroup.get(key) ?? []), item]); }
    return [...byGroup.entries()];
  }, [custom, shane, shared, editions, placements]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(v => !v); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a placement, chapter, tool or volume…" />
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
