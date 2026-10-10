import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, HelpCircle, Lock, MessageCircle, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NAV_GROUPS, RELATIONSHIPS_GROUP, SHARED_GROUP, type NavItem } from '@/content/navigation';

const GROUP_HELP: Record<string, string> = {
  Begin: 'Start here to search the sources, ask questions, explore connected topics, save pages, or create a new researched page.',
  "April's Workbook": 'Private reflection and counseling tools for April. Workbook answers and counselor histories belong only to the signed-in account that created them.',
  'Our Shared Space': 'The private area where April and Shane can intentionally share messages, documents, media, recommendations, notes, and reminders.',
  Relationships: 'Keep each person’s birth details separate, compare charts, and read relationship patterns without mixing them into April-only pages.',
  'Sources & Documents': 'Read, search, upload, and organize the protected documents used throughout the site. Full source text requires the site password.',
  'Themes & Topics': 'Plain-language collections of related interpretations from April’s source material.',
  'The Natal Chart': 'April’s sourced birth chart, calculated sky positions, visual wheels, and detailed explanations of planets, houses, aspects, and stars.',
  'Timing & Cycles': 'Date-based chapters explaining longer life phases and shorter astrological cycles. Timing depends on the recorded birth time.',
  'Other Systems': 'Independent cultural and symbolic systems shown separately, with a dashboard for comparing repeated themes without pretending the systems are identical.',
  Library: 'Listen to generated or uploaded audio, read focused source-linked topics on thinking and creativity, and inspect which chart inputs are confirmed, calculated, approximate, or unresolved.',
};

function helpFor(item: NavItem) {
  const exact: Record<string, string> = {
    '/': 'A personal starting page with shortcuts into the main reading and current areas of the site.',
    '/instructions': 'This guide. Search by a feature name, browse a menu section, then follow any link to open the real page.',
    '/explore': 'Curated learning trails. Pick a subject, open a real interpretation page, then follow its related source links.',
    '/dashboard': 'Your saved pages, recent work, bookmarks, and private overview in one place.',
    '/ask': 'Ask a focused question. It searches protected source passages first and answers with citations you can open.',
    '/chat': 'A broad chart-aware assistant for connecting ideas across the site and continuing saved conversations.',
    '/reading': 'A long-form reading that brings April’s major chart themes together without removing the detailed pages.',
    '/chart-elements': 'A visual glossary for learning what signs, planets, houses, and aspects mean.',
    '/create': 'Enter a title, research question, material to analyze, and menu location. The writer gathers relevant source passages, creates a cited page, saves it, and highlights its new menu link.',
    '/workbook': 'The home for guided reflection exercises and private personal tools.',
    '/workbook/social-integration': 'A private Social Counselor that views a situation like an outside observer, then helps April prepare clear words, boundaries, and practical next steps using her chart context.',
    '/workbook/companion': 'A private therapeutic reflection chat tuned to April’s chart and preferred tone. Its sessions are not shared with Shane.',
    '/workbook/check-in': 'A short guided check-in for naming what is happening now and choosing a manageable next step.',
    '/workbook/reframe': 'Break a difficult thought into facts, interpretations, alternatives, and a more useful response.',
    '/workbook/journal': 'Save private reflections and notice repeated themes over time.',
    '/shared': 'A summary of recent activity across the private space shared by the approved April and Shane accounts.',
    '/shared/conversations': 'Private person-to-person chat for April and Shane, including replies, reactions, attachments, and topics.',
    '/shared/posts': 'Longer shared updates with optional files.',
    '/shared/wonderings': 'Questions or ideas to revisit together, with discussion state, comments, and reactions.',
    '/shared/reading': 'Upload documents, read them together, quote a page, and add notes that can also be found by Ask the Sources.',
    '/shared/media': 'A shared gallery for images, video, and screenshots with native viewing, reactions, bookmarks, and a discussion thread per item.',
    '/shared/recommendations': 'Recommend movies, music, books, or other finds and discuss them together.',
    '/shared/notes': 'Keep short shared notes in one easy-to-scan place.',
    '/shared/later': 'Bookmark shared subjects that deserve a future conversation.',
    '/shared/accounts': 'Shows which approved accounts belong to April or Shane and can enter the shared space.',
    '/relationships': 'Create or open a person, keep their details separate, and choose relationship readings or timelines.',
    '/guides/relationships': 'Find the source chapters that explain relationship techniques used by the site.',
    '/masterbook': 'Read the complete protected Masterbook after entering the site password.',
    '/masterbook/index': 'Browse the documents and extracted source structure.',
    '/contents': 'Search every Masterbook chapter title without exposing the private chapter text.',
    '/read': 'Browse protected source documents and open a document reader.',
    '/sources': 'See the source files supporting the site and open their readers.',
    '/masterbook/upload': 'Add a source file to the protected library for later reading and analysis.',
    '/admin': 'Manage uploaded documents and editable workspace material. Administrative actions require an approved admin account.',
    '/topics': 'Browse every theme and jump to its related interpretation pages.',
    '/birth-chart': 'April’s full report: sourced placements, calculated positions, house assignments, aspects, explanations, and printable layout.',
    '/chart-guide': 'A beginner-friendly companion explaining each chart term and what each placement means for April.',
    '/chart-calculator': 'Calculate a chart from date, local time, place, coordinates, and time zone. It opens with April’s recorded details for comparison.',
    '/planets': 'Browse every planet or chart point and open its complete interpretation.',
    '/houses': 'Browse the twelve life areas and see which sourced placements belong to each one.',
    '/aspects': 'See the important relationships between chart points, including their measured angle and plain-language meaning.',
    '/star-map': 'Explore fixed stars near April’s chart points and open their cited Compendium entries.',
    '/compendium': 'A detailed reference for symbols, fixed stars, asteroids, special aspects, and related source material.',
    '/guides/timeline-retrogrades': 'A plain-language overview connecting the detailed timeline, transit, profection, and retrograde pages.',
    '/timeline': 'Browse major life phases from 1990 to 2060.',
    '/transits': 'Review forecast windows from 2026 to 2040, including confidence notes where timing depends on April’s birth time.',
    '/profection': 'Explains the traditional annual house emphasis for April’s current age.',
    '/retrogrades': 'Explains natal and future retrograde periods and how to interpret them carefully.',
    '/other-systems': 'Compare themes repeated across the alternative systems and open each system’s unique calculated page.',
    '/numerology': 'Shows date-based numerology cycles and pinnacles.',
    '/purpose': 'Connects purpose-oriented numerology with April’s broader source interpretations.',
    '/chinese': 'Shows April’s Chinese zodiac and Four Pillars analysis, including unresolved calculation differences.',
    '/volume-2': 'Browse the supplementary material without replacing the main reading.',
    '/feng-shui': 'An overview of the home and direction system used in April’s guide.',
    '/guides/birth-chart-feng-shui': 'Explains how natal-chart ideas and Feng Shui are related without treating them as the same system.',
    '/guides/feng-shui-pages': 'A page-by-page guide to the Feng Shui and Flying Stars material.',
    '/feng-shui/bagua': 'Explore the nine areas of the home and April-specific suggestions.',
    '/feng-shui/flying-stars': 'View time-based Flying Star positions and their practical meanings.',
    '/bagua-reading': 'Read the combined plain-language Bagua interpretation.',
    '/masterbook/bagua-wheel': 'Open the protected Masterbook’s Bagua wheel page.',
    '/podcasts': 'Create, upload, browse, sort, queue, play, download, share, or privatize podcast episodes. Generated episodes cite the protected passages used.',
    '/data-quality': 'See the source, confidence, alternatives, and downstream effects for important chart inputs.',
    '/topics/thinking-decisions': 'April’s Mercury, Moon, and Mercury–Saturn aspect: recorded placements, clearly labeled everyday interpretations, reflection questions, and original chapter links.',
    '/topics/creativity-play': 'April’s Mars in Gemini in the 5th house and Mars–Jupiter sextile: creative possibilities, reflection questions, and original source chapters.',
  };
  if (exact[item.to]) return exact[item.to];
  if (item.to.startsWith('/workbook/module/')) return 'A guided workbook lesson with questions, reflection prompts, and private feedback written in everyday language.';
  if (item.to.startsWith('/topics/')) return 'A focused theme page that keeps the full source interpretation and adds an understandable summary.';
  if (item.to.startsWith('/other-systems/')) return 'A system-specific chart with its own calculated placements, relationships, limitations, and April-focused plain-language meanings.';
  return 'Open this page for its complete content, controls, and source links.';
}

const groups = [NAV_GROUPS[0], NAV_GROUPS[1], SHARED_GROUP, RELATIONSHIPS_GROUP, ...NAV_GROUPS.slice(2)];
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function Instructions() {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.map(group => ({ ...group, items: group.items.filter(item => `${group.title} ${item.label} ${helpFor(item)}`.toLowerCase().includes(q)), submenus: group.submenus?.map(sub => ({ ...sub, items: sub.items.filter(item => `${group.title} ${sub.label} ${item.label} ${helpFor(item)}`.toLowerCase().includes(q)) })).filter(sub => sub.items.length) })).filter(group => group.items.length || group.submenus?.length);
  }, [query]);
  return <article className="space-y-10">
    <header className="max-w-3xl"><div className="font-smallcaps text-xs text-gold">Clickable guide · Every main feature</div><h1 className="mt-2">Instructions &amp; Help</h1><p className="mt-4 text-lg text-muted-foreground">Choose a menu section to understand what is inside, or search for the thing you want to do. Every feature name below opens the real page.</p></header>
    <section aria-labelledby="quick-help"><h2 id="quick-help" className="text-2xl">Common tasks</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Button asChild variant="outline" className="h-auto justify-start py-4"><a href="#make-podcast"><Headphones />Create a podcast</a></Button>
      <Button asChild variant="outline" className="h-auto justify-start py-4"><a href="#choose-chat"><MessageCircle />Choose the right chat</a></Button>
      <Button asChild variant="outline" className="h-auto justify-start py-4"><a href="#privacy"><Lock />Understand privacy</a></Button>
      <Button asChild variant="outline" className="h-auto justify-start py-4"><a href="#all-features"><BookOpen />Browse all features</a></Button>
    </div></section>
    <section aria-label="Search instructions"><label htmlFor="help-search" className="font-medium">Search the guide</label><div className="relative mt-2 max-w-xl"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden /><Input id="help-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try podcast, chart, counselor, upload…" className="pl-9" /></div></section>
    <nav aria-label="Help guide sections" className="flex flex-wrap gap-2">{groups.map(group => <Button asChild size="sm" variant="outline" key={group.title}><a href={`#${slug(group.title)}`}>{group.title}</a></Button>)}</nav>
    <section id="make-podcast" className="parchment p-5 scroll-mt-24" aria-labelledby="make-podcast-title"><div className="flex items-center gap-2"><Headphones className="text-gold" aria-hidden /><h2 id="make-podcast-title" className="text-2xl">How to create a podcast</h2></div><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm"><li>Open <Link className="underline" to="/podcasts">Podcasts</Link> from the Library menu.</li><li>Under <strong>Create an episode</strong>, name the subject and optionally tell the writer what to emphasize.</li><li>Choose a voice, then choose <strong>Only me</strong> for your private library or <strong>April &amp; Shane</strong> for the shared library.</li><li>Select <strong>Create episode</strong>. The tool finds April-relevant source passages, writes a cited script, records it, and saves the playable audio.</li><li>Use Shared Library or My Private Library to find it. You can queue, play, change speed, download, delete, or change sharing later.</li><li>Open <strong>Transcript &amp; sources</strong> beneath an episode to read the script and follow its protected citations.</li></ol></section>
    <section id="choose-chat" className="parchment p-5 scroll-mt-24" aria-labelledby="chat-help-title"><div className="flex items-center gap-2"><MessageCircle className="text-gold" aria-hidden /><h2 id="chat-help-title" className="text-2xl">Which conversation should I use?</h2></div><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="font-medium">April &amp; Shane</dt><dd className="text-sm text-muted-foreground">Share the page into the private human conversation so the other approved person can reply.</dd></div><div><dt className="font-medium">The Therapy Oracle</dt><dd className="text-sm text-muted-foreground">Use private, account-only therapeutic reflection informed by April’s chart.</dd></div><div><dt className="font-medium">Social Counselor</dt><dd className="text-sm text-muted-foreground">Prepare for a social situation, understand another person’s likely viewpoint, or practice words and boundaries.</dd></div><div><dt className="font-medium">SmartChat</dt><dd className="text-sm text-muted-foreground">Connect ideas broadly across the chart and site in a saved AI conversation.</dd></div><div><dt className="font-medium">Ask the Sources</dt><dd className="text-sm text-muted-foreground">Use when the answer must be grounded directly in searchable Masterbook and uploaded-source passages.</dd></div></dl><p className="mt-4 text-sm">On any page, choose <strong>Chat about this page</strong>; the page title and link travel with you to the selected conversation.</p></section>
    <section id="privacy" className="parchment p-5 scroll-mt-24" aria-labelledby="privacy-title"><div className="flex items-center gap-2"><Users className="text-gold" aria-hidden /><h2 id="privacy-title" className="text-2xl">Private, shared, and protected</h2></div><ul className="mt-4 list-disc space-y-2 pl-5 text-sm"><li><strong>Private workbook and counselor records:</strong> only the account that created them can read them.</li><li><strong>Shared Space:</strong> only the approved April and Shane accounts can access shared records.</li><li><strong>Private podcast library:</strong> only its owner can listen until the owner chooses Share.</li><li><strong>Protected source text:</strong> requires the site password and is loaded through a short-lived unlock.</li><li><strong>Search privacy:</strong> the site asks search engines not to index it, but that request is not a substitute for the account and source protections above.</li></ul></section>
    <div id="all-features" className="space-y-10 scroll-mt-24">{shown.map(group => <section key={group.title} id={slug(group.title)} className="scroll-mt-24" aria-labelledby={`${slug(group.title)}-title`}><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="font-smallcaps text-xs text-gold">Menu section</div><h2 id={`${slug(group.title)}-title`} className="mt-1">{group.title}</h2></div>{group.items[0] && <Button asChild size="sm"><Link to={group.items[0].to}>Open {group.title}</Link></Button>}</div><p className="mt-2 max-w-3xl text-muted-foreground">{GROUP_HELP[group.title]}</p><div className="mt-5 grid gap-3 md:grid-cols-2">{group.items.map(item => <Link key={item.to} to={item.to} className="rounded border border-border bg-card/60 p-4 transition-colors hover:border-gold"><h3 className="text-lg">{item.label}</h3><p className="mt-1 text-sm text-muted-foreground">{helpFor(item)}</p><span className="mt-3 inline-block text-xs text-gold">Open feature →</span></Link>)}{group.submenus?.flatMap(sub => sub.items.map(item => <Link key={item.to} to={item.to} className="rounded border border-border bg-card/60 p-4 transition-colors hover:border-gold"><div className="font-smallcaps text-[10px] text-gold">{sub.label}</div><h3 className="mt-1 text-lg">{item.label}</h3><p className="mt-1 text-sm text-muted-foreground">{helpFor(item)}</p><span className="mt-3 inline-block text-xs text-gold">Open feature →</span></Link>))}</div></section>)}</div>
    {shown.length === 0 && <p role="status" className="parchment p-5 text-muted-foreground">No feature matched that search. Try a shorter word such as “chart,” “chat,” “source,” or “podcast.”</p>}
    <footer className="border-t border-border pt-6 text-sm text-muted-foreground"><HelpCircle className="mr-2 inline h-4 w-4" aria-hidden />Return here anytime from <strong className="text-foreground">Instructions</strong>, directly beneath <strong className="text-foreground">Chat about this page</strong> in the side menu.</footer>
  </article>;
}