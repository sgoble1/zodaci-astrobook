import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpenBook } from '@/components/books/OpenBook';
import { ComicPageView } from '@/components/comic/ComicPageView';
import { computeChart, type ChartInput } from '@/lib/astro';
import { birthLineOf } from '@/lib/bookLeaves';
import { buildComicIssue, monthLabel } from '@/lib/comic';
import { PREVIEW_PAGES } from '@/lib/personalPreview';
import { useCoverImage } from '@/hooks/useCoverImage';
import { COVER_DESIGNS, coverSrc } from '@/content/coverDesigns';
import { DEFAULT_CROP } from '@/lib/coverLayout';
import { personalBookLeaves } from '@/content/sampleBookLeaves';
import { comicPreviewArt } from '@/content/castArt';

const ISSUES_AHEAD = 3;
const firstOfMonth = (offset: number) => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + offset, 1)); };

/**
 * "Read the first ten pages" for one authorized chart: the opening of their AstroBook and the first ten pages of their
 * next AstroComic issues, all calculated in the browser from the birth details passed in. Nothing is saved or sent.
 */
export function PersonalPreviewDrawer({ name, input, possessive = 'your', firstIssue = 1, trigger, defaultTab = 'book' }: {
  name: string; input: ChartInput; possessive?: string; firstIssue?: number; trigger?: React.ReactNode; defaultTab?: 'book' | 'comic';
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger ?? <Button variant="outline"><BookOpen className="h-4 w-4" aria-hidden="true" />Read the first ten pages</Button>}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>The first ten pages</SheetTitle>
          <SheetDescription>The opening of {possessive} AstroBook and AstroComic, calculated from {possessive} saved birth details{input.time ? '' : ' (no birth time, so houses and angles are left out)'}. Nothing here is saved.</SheetDescription>
        </SheetHeader>
        {open && <PreviewBody name={name} input={input} firstIssue={firstIssue} defaultTab={defaultTab} />}
      </SheetContent>
    </Sheet>
  );
}

function PreviewBody({ name, input, firstIssue, defaultTab }: { name: string; input: ChartInput; firstIssue: number; defaultTab: 'book' | 'comic' }) {
  const chart = useMemo(() => computeChart(input), [input.date, input.time, input.lat, input.lon, input.tz, input.houseSystem]); // eslint-disable-line react-hooks/exhaustive-deps
  const design = COVER_DESIGNS[0];
  const birthLine = birthLineOf(input.date, input.time, input.placeLabel);
  const designed = useCoverImage({ source: { kind: 'design', key: design.key }, crop: DEFAULT_CROP, name: name || 'Your AstroBook', trimPt: [432, 648], detail: birthLine.replace(/^Born /, '') }, 40);
  const leaves = useMemo(() => personalBookLeaves({ name: name || 'Reader', birthLine, chart, coverSrc: designed || coverSrc(design) }), [chart, name, birthLine, designed, design]);
  const [issueAt, setIssueAt] = useState(0);
  const month = firstOfMonth(1 + issueAt);
  const issue = useMemo(() => buildComicIssue(chart, { reader: name || 'Reader', month, issueNumber: firstIssue + issueAt }), [chart, name, month.getTime(), firstIssue, issueAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const art = useMemo(() => comicPreviewArt(issue), [issue]);
  const pages = issue.pages.filter(p => p.n <= PREVIEW_PAGES);
  return (
    <Tabs defaultValue={defaultTab} className="mt-6">
      <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="book">AstroBook</TabsTrigger><TabsTrigger value="comic">AstroComic</TabsTrigger></TabsList>
      <TabsContent value="book" className="mt-6">
        <OpenBook key={name} leaves={leaves} layout="stacked" label={`${name || 'Your'} AstroBook, first ten pages`} spine={{ title: 'Zodaci AstroBook', name: name || undefined }}
          footer={<p className="mt-2 text-center text-xs text-muted-foreground">The full book continues through all six volumes from the same placements.</p>} />
      </TabsContent>
      <TabsContent value="comic" className="mt-6 space-y-4">
        <div role="radiogroup" aria-label="Which issue" className="flex flex-wrap gap-2">
          {Array.from({ length: ISSUES_AHEAD }, (_, i) => (
            <button key={i} type="button" role="radio" aria-checked={issueAt === i} onClick={() => setIssueAt(i)} className={`min-h-10 rounded-full border px-3 text-sm transition-colors duration-500 ${issueAt === i ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>
              Issue #{firstIssue + i} · {monthLabel(firstOfMonth(1 + i))}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">This month’s story: {issue.mainEvent}. Characters shown are the planets the script names.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{pages.map(p => <ComicPageView key={`${issue.month}-${p.n}`} page={p} compact art={art} />)}</div>
        <p className="text-xs text-muted-foreground">Pages 1–{PREVIEW_PAGES} of 24. Printed issues are drawn panel by panel before they ship.</p>
      </TabsContent>
    </Tabs>
  );
}
