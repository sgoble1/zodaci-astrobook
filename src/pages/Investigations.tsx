import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpenText, CalendarClock, FileSearch, NotebookPen, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead } from '@/components/observatory/PageHead';
import { SpotArt } from '@/components/art/SpotArt';
import { ChartRequired } from '@/components/common/ChartRequired';
import { usePageMeta } from '@/hooks/usePageMeta';
import { CASES, buildCase, caseById, caseSummaries, type CaseId, type Evidence, type EvidenceKind } from '@/lib/investigations';
import type { ChartResult } from '@/lib/astro';

const KIND_LABEL: Record<EvidenceKind, string> = { placement: 'Placement', house: 'House', ruler: 'Ruler', aspect: 'Aspect', signature: 'Signature' };
const day = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** The Investigations Bureau index: seven case folders, each opened from the member's own chart. */
export default function Investigations() {
  usePageMeta('Investigations Bureau · Zodaci', 'Seven case files on relationships, purpose, career, money, health, spirituality and patterns, built from your own calculated chart.');
  return <ChartRequired what="open your case files">{({ chart, birth }) => <Bureau chart={chart} name={birth.name} />}</ChartRequired>;
}

function Bureau({ chart, name }: { chart: ChartResult; name: string }) {
  const cards = useMemo(() => caseSummaries(chart), [chart]);
  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <PageHead eyebrow="Investigations Bureau" title={name ? `${name}’s case files` : 'Your case files'} script="Seven open questions, read from your own sky." art="magnifier"
        actions={<Button asChild variant="outline"><Link to="/museum">Visit the Museum</Link></Button>}>
        Each file gathers the evidence your chart holds on one question: the placements involved, the houses and their rulers, the closest aspects, and what today’s sky is touching. Every line names the calculation it comes from.
      </PageHead>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ spec, evidence, active, next }) => (
          <li key={spec.id}>
            <Link to={`/investigations/${spec.id}`} className="case-folder group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="case-folder-tab font-label text-[11px] tracking-[0.18em]">File {spec.number}</span>
              <div className="obs-paper flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display !text-xl leading-snug">{spec.title}</h2>
                  <SpotArt kind={spec.art} className="h-14 w-14 shrink-0" />
                </div>
                <p className="text-sm leading-relaxed">{spec.question}</p>
                <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                  <div><dt className="text-muted-foreground">Evidence</dt><dd className="font-label text-sm tracking-wide">{evidence} entries</dd></div>
                  <div><dt className="text-muted-foreground">In today’s sky</dt><dd className="font-label text-sm tracking-wide">{active ? `${active} active` : 'Quiet'}</dd></div>
                  {next && <div className="col-span-2"><dt className="text-muted-foreground">Next exact contact</dt><dd>{day(next.date)} · {next.title}</dd></div>}
                </dl>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform duration-700 group-hover:translate-x-1">Open the file <ArrowRight className="h-4 w-4" aria-hidden /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">Case files describe chart symbolism and real sky timing. They do not describe events in your life, diagnose anything or predict what will happen.</p>
    </article>
  );
}

/** One case file: evidence on the left, live sky and next steps on the right. */
export function CaseFilePage() {
  const { caseId } = useParams();
  const spec = caseById(caseId);
  usePageMeta(spec ? `${spec.title} · Investigations Bureau · Zodaci` : 'Investigations Bureau · Zodaci', spec ? spec.question : 'Case files built from your own chart.');
  if (!spec) return <Navigate to="/investigations" replace />;
  return <ChartRequired what={`open ${spec.title.toLowerCase()}`}>{({ chart }) => <CaseFileView chart={chart} id={spec.id} />}</ChartRequired>;
}

function CaseFileView({ chart, id }: { chart: ChartResult; id: CaseId }) {
  const file = useMemo(() => buildCase(chart, id), [chart, id]);
  const { spec } = file;
  const i = CASES.findIndex(c => c.id === id);
  const prev = CASES[(i + CASES.length - 1) % CASES.length], next = CASES[(i + 1) % CASES.length];
  const groups = (Object.keys(KIND_LABEL) as EvidenceKind[]).map(k => [k, file.evidence.filter(e => e.kind === k)] as [EvidenceKind, Evidence[]]).filter(([, list]) => list.length);
  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/investigations" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden /> All case files</Link></nav>
      <PageHead eyebrow={`Investigations Bureau · File ${spec.number}`} title={spec.title} script={spec.question} art={spec.art}>
        {spec.brief}
      </PageHead>
      {file.limits.map(l => <p key={l} role="note" className="rounded-sm border border-[hsl(var(--brass)/0.5)] bg-[hsl(var(--brass)/0.08)] p-4 text-sm">{l}</p>)}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="evidence" className="space-y-6">
          <h2 id="evidence" className="flex items-center gap-2 font-display text-2xl"><FileSearch className="h-5 w-5 text-primary" aria-hidden /> Evidence on file</h2>
          {groups.map(([kind, list]) => (
            <div key={kind} className="space-y-3">
              <h3 className="font-label text-xs tracking-[0.18em] text-primary">{KIND_LABEL[kind]}{list.length > 1 ? 's' : ''}</h3>
              <ol className="space-y-3">
                {list.map(e => (
                  <li key={e.title} className="obs-paper p-4">
                    <p className="font-medium">{e.title}</p>
                    <p className="mt-1 text-sm leading-relaxed">{e.detail}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Source: {e.basis}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
        <aside className="space-y-6">
          <section aria-labelledby="active" className="obs-panel space-y-3 p-5">
            <h2 id="active" className="flex items-center gap-2 font-label !text-sm tracking-[0.14em]"><Radio className="h-4 w-4 text-primary" aria-hidden /> In today’s sky</h2>
            {file.activeNow.length ? <ul className="space-y-3 text-sm">{file.activeNow.map(h => <li key={`${h.transit.key}-${h.natalKey}-${h.type}`}><p className="font-medium">{h.transit.name} {h.symbol} your {h.natalName}</p><p className="text-muted-foreground">{h.type}, {h.orb.toFixed(1)}° {h.applying ? 'and closing' : 'and separating'}. {h.text}</p></li>)}</ul>
              : <p className="text-sm text-muted-foreground">No planet is closely touching the points in this file today.</p>}
          </section>
          <section aria-labelledby="coming" className="obs-panel space-y-3 p-5">
            <h2 id="coming" className="flex items-center gap-2 font-label !text-sm tracking-[0.14em]"><CalendarClock className="h-4 w-4 text-primary" aria-hidden /> Coming up</h2>
            {file.upcoming.length ? <ul className="space-y-2 text-sm">{file.upcoming.map(e => <li key={`${e.title}-${e.date.toISOString()}`}><span className="font-label tracking-wide">{day(e.date)}</span> · {e.title}</li>)}</ul>
              : <p className="text-sm text-muted-foreground">No exact contacts to these points in the next four months.</p>}
          </section>
          <section aria-labelledby="questions" className="obs-paper space-y-3 p-5">
            <h2 id="questions" className="font-display !text-lg">Questions for your notebook</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm">{file.questions.map(q => <li key={q}>{q}</li>)}</ul>
          </section>
          <div className="flex flex-col gap-2">
            <Button asChild><Link to={`/my-readings/topic/${spec.reading}`}><BookOpenText className="mr-2 h-4 w-4" aria-hidden />Read {spec.readingLabel}</Link></Button>
            <Button asChild variant="outline"><Link to={`/observation-log?tag=${encodeURIComponent(spec.tag)}`}><NotebookPen className="mr-2 h-4 w-4" aria-hidden />File an observation</Link></Button>
          </div>
        </aside>
      </div>
      <nav aria-label="Other case files" className="flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-sm">
        <Link to={`/investigations/${prev.id}`} className="inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="h-4 w-4" aria-hidden /> {prev.title}</Link>
        <Link to={`/investigations/${next.id}`} className="inline-flex items-center gap-1 hover:text-primary">{next.title} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </nav>
    </article>
  );
}
