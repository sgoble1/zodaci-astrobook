import { useCallback, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComicDigest } from '@/components/comic/ComicDigest';
import { usePageMeta } from '@/hooks/usePageMeta';
import { computeChart } from '@/lib/astro';
import { monthLabel } from '@/lib/comic';
import { buildFounderComic } from '@/lib/comicNarrative';
import { usePreparedPreview } from '@/hooks/usePreparedPreview';
import { PreviewFeedback } from '@/components/books/PreviewFeedback';
import { isOfficialEdition, officialChartInput, ownerLabel, useOfficialEditions } from '@/lib/officialEditions';
import { StartLink } from '@/components/common/StartLink';

/** Official issues are numbered from the first official month (October 2026). */
const FIRST_OFFICIAL = Date.UTC(2026, 9, 1);
const monthStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
export const officialIssueNumber = (month: Date) => Math.max(1, (month.getUTCFullYear() - 2026) * 12 + month.getUTCMonth() - 9 + 1);

/** The founder's own AstroComic: a full 24-page issue built from their chart and the chosen month's sky. */
export default function OfficialComic() {
  const { edition = '' } = useParams();
  const { rows, error, retry } = useOfficialEditions();
  const row = rows?.find(r => r.edition === edition);
  usePageMeta(row ? `${row.is_own ? 'Your' : `${row.display_name}’s`} Official AstroComic · Zodaci` : 'Official AstroComic · Zodaci', 'An AstroComic issue drawn from one chart.');
  const [month, setMonth] = useState(() => { const now = monthStart(new Date()); return now.getTime() < FIRST_OFFICIAL ? new Date(FIRST_OFFICIAL) : now; });
  const build = useCallback(() => {
    if (!row?.birth || !isOfficialEdition(edition)) return null;
    const chart = computeChart(officialChartInput(row.birth));
    return buildFounderComic(chart, edition, { reader: row.display_name, month, issueNumber: officialIssueNumber(month) });
  }, [row, month, edition]);
  const prepared = usePreparedPreview(build);
  if (!isOfficialEdition(edition)) return <Missing text="That AstroComic doesn’t exist." />;
  if (error) return <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{error}<Button size="sm" variant="outline" onClick={retry}>Try again</Button></div>;
  if (!rows) return <p role="status" className="text-muted-foreground">Opening the AstroComic…</p>;
  if (!row) return <Missing text="This AstroComic belongs to a private edition." />;
  if (!row.birth) return (
    <Missing text={row.is_own ? 'Save your birth details first, then your AstroComic is drawn from your chart.' : `${row.display_name} hasn’t saved birth details yet.`}>
      {row.is_own && <Button asChild><StartLink>Add birth details</StartLink></Button>}
    </Missing>
  );
  if (prepared.status === 'loading') return <PreviewFeedback kind="comic" loadingMessage="Drawing the authorized edition’s story…" />;
  if (prepared.status === 'error') return <PreviewFeedback kind="comic" error onRetry={prepared.retry} />;
  const issue = prepared.value;
  if (!issue) return null;

  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-label text-xs tracking-[0.16em] text-primary">Official AstroComic · {ownerLabel(row)}</div>
          <h1 className="text-4xl sm:text-5xl">{issue.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Issue {issue.issueNumber} · {issue.monthLabel}. A fictional stand-in responds to the signal operators; chart measurements appear only in the calculation ledger on pages 22–23.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-md border border-border" role="group" aria-label="Issue month">
            <Button size="icon" variant="ghost" aria-label="Previous month" disabled={month.getTime() <= FIRST_OFFICIAL} onClick={() => setMonth(m => addMonths(m, -1))}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-32 px-2 text-center text-sm" aria-live="polite">{monthLabel(month)}</span>
            <Button size="icon" variant="ghost" aria-label="Next month" disabled={month.getTime() >= addMonths(monthStart(new Date()), 1).getTime()} onClick={() => setMonth(m => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <ComicDigest key={`${edition}:${issue.month}`} issue={issue} layout="side" />

      <p className="text-xs text-muted-foreground">A fictional story informed by the authorized edition’s chart, not biography. The calculation ledger follows the story; illustrations are preview artwork, not a print-ready buyer issue. <Link to="/official-astrobook" className="underline underline-offset-2">Back to the Official AstroBook</Link></p>
    </article>
  );
}

function Missing({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <h1 className="font-display text-3xl">Official AstroComic</h1>
      <p className="text-muted-foreground">{text}</p>
      <div className="flex flex-wrap justify-center gap-2">{children}<Button asChild variant="outline"><Link to="/official-astrobook">Back to the Official AstroBook</Link></Button></div>
    </div>
  );
}
