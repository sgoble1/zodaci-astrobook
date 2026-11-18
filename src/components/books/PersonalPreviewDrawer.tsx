import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpenBook } from '@/components/books/OpenBook';
import { ComicPageView } from '@/components/comic/ComicPageView';
import { computeChart, type ChartInput } from '@/lib/astro';
import { birthLineOf } from '@/lib/bookLeaves';
import { monthLabel } from '@/lib/comic';
import { buildComicPreview, previewName } from '@/lib/comicNarrative';
import { PREVIEW_PAGES } from '@/lib/personalPreview';
import { personalBookLeaves, comicIssueLeaves } from '@/content/sampleBookLeaves';
import type { BookPreviewOptions } from '@/content/sampleBookLeaves';
import { versionOf } from '@/lib/books';
import { comicPreviewArt } from '@/content/castArt';

const ISSUES_AHEAD = 1;
const firstOfMonth = (offset: number) => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + offset, 1)); };

/**
 * The 25 numbered AstroBook interior pages and a separate complete AstroComic digest for one authorized chart,
 * calculated in the browser from the supplied birth details. Nothing is saved or sent.
 */
export function PersonalPreviewDrawer({ name, input, possessive = 'your', firstIssue = 1, trigger, defaultTab = 'book', bookOptions }: {
  name: string; input: ChartInput; possessive?: string; firstIssue?: number; trigger?: React.ReactNode; defaultTab?: 'book' | 'comic';
  bookOptions?: BookPreviewOptions;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger ?? <Button variant="outline"><BookOpen className="h-4 w-4" aria-hidden="true" />{defaultTab === 'comic' ? 'Read the AstroComic preview' : 'Read the 25-page book preview'}</Button>}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>25-page AstroBook preview and AstroComic</SheetTitle>
          <SheetDescription>25 numbered pages of {possessive} AstroBook, plus its cover and end matter, and a separate AstroComic story. Calculated from {possessive} saved birth details{input.time ? '' : ' (no birth time, so houses and angles are left out)'}. Nothing here is saved.</SheetDescription>
        </SheetHeader>
        {open && <PreviewBody name={name} input={input} firstIssue={firstIssue} defaultTab={defaultTab} bookOptions={bookOptions} />}
      </SheetContent>
    </Sheet>
  );
}

function PreviewBody({ name, input, firstIssue, defaultTab, bookOptions }: { name: string; input: ChartInput; firstIssue: number; defaultTab: 'book' | 'comic'; bookOptions?: BookPreviewOptions }) {
  const chart = useMemo(() => computeChart(input), [input.date, input.time, input.lat, input.lon, input.tz, input.houseSystem]); // eslint-disable-line react-hooks/exhaustive-deps
  const birthLine = birthLineOf(input.date, input.time, input.placeLabel);
  const leaves = useMemo(() => personalBookLeaves({ name: name || 'Reader', birthLine, chart, ...bookOptions }), [chart, name, birthLine, bookOptions]);
  const [issueAt, setIssueAt] = useState(0);
  const month = firstOfMonth(1 + issueAt);
  const issue = useMemo(() => buildComicPreview(chart, { reader: name || 'Reader', month, issueNumber: firstIssue + issueAt }), [chart, name, month.getTime(), firstIssue, issueAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const art = useMemo(() => comicPreviewArt(issue), [issue]);
  const pages = issue.pages.filter(p => p.n <= PREVIEW_PAGES);
  return (
    <Tabs defaultValue={defaultTab} className="mt-6">
      <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="book">AstroBook</TabsTrigger><TabsTrigger value="comic">AstroComic</TabsTrigger></TabsList>
      <TabsContent value="book" className="mt-6">
        <OpenBook key={name} leaves={leaves} layout="stacked" trimPt={versionOf(bookOptions?.edition ?? 'classic')?.trimPt} label={`${bookOptions?.coverName?.trim() || previewName(name) || 'Your'} AstroBook, 25-page preview`} spine={{ title: 'Zodaci AstroBook', name: bookOptions?.coverName ?? (previewName(name) || undefined) }}
          footer={<p className="mt-2 text-center text-xs text-muted-foreground">The full book continues through all six volumes from the same placements.</p>} />
      </TabsContent>
      <TabsContent value="comic" className="mt-6 space-y-4">
        <div role="radiogroup" aria-label="Which issue" className="flex flex-wrap gap-2">
          {Array.from({ length: ISSUES_AHEAD }, (_, i) => (
            <Button key={i} type="button" variant="outline" role="radio" aria-checked={issueAt === i} onClick={() => setIssueAt(i)} className={`min-h-10 px-3 text-sm ${issueAt === i ? 'border-primary bg-primary/15' : 'border-border'}`}>
              Issue #{firstIssue + i} · {monthLabel(firstOfMonth(1 + i))}
            </Button>
          ))}
        </div>
        <OpenBook kind="comic" leaves={comicIssueLeaves(issue, art)} layout="stacked" label={`${issue.reader} · 24-page AstroComic`} spine={{ title: 'AstroComic', name: issue.reader }} />
        <p className="text-xs text-muted-foreground">24 pages including covers. Fictional scenes from your calculated chart, not a biography. The calculation ledger follows the story; preview art is not a print-ready buyer issue.</p>
      </TabsContent>
    </Tabs>
  );
}
