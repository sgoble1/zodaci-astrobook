import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Brush, Download, FileCheck2, Loader2, Square } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ComicPageView } from '@/components/comic/ComicPageView';
import { confirmAction } from '@/components/common/ConfirmHost';
import { streamImage } from '@/lib/streamImage';
import type { ComicIssue } from '@/lib/comic';
import { MIN_DPI, describeReport, effectiveDpi, panelPlan, preflight, type Measure, type PanelSlot, type PrintReport } from '@/lib/comicPrint';
import { composeComicPdf, composePreflightPdf, fontMeasure, type ComicArt } from '@/lib/comicPdf';
import type { Tables } from '@/integrations/supabase/types';
import fontUrl from '@/assets/fonts/manuscript.ttf?url';

type Issue = Tables<'comic_issues'>;
type Art = Tables<'comic_issue_art'>;
type SlotState = 'ready' | 'missing' | 'stale' | 'lowres';
const STATE_LABEL: Record<SlotState, string> = { ready: 'Ready', missing: 'Needs artwork', stale: 'Script changed — redraw', lowres: `Below ${MIN_DPI} DPI — redraw` };

let fontCache: Promise<{ bytes: Uint8Array; measure: Measure }> | null = null;
const loadFont = () => (fontCache ??= fetch(fontUrl).then(r => { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); }).then(async b => { const bytes = new Uint8Array(b); return { bytes, measure: await fontMeasure(bytes) }; }).catch(e => { fontCache = null; throw e; }));

/** Gateway and function errors arrive as "Image generation failed: 402 {json}"; show only the readable message. */
function readableError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  const j = m.match(/\{.*\}$/s);
  if (j) { try { const o = JSON.parse(j[0]); return o.error?.message ?? o.error ?? o.message ?? m; } catch { /* fall through */ } }
  return m.replace(/^Image generation failed: /, '') || 'The artwork could not be drawn.';
}

async function toJpeg(dataUrl: string) {
  const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
  const canvas = document.createElement('canvas'); canvas.width = bmp.width; canvas.height = bmp.height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0);
  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.92));
  if (!blob) throw new Error('The artwork could not be converted for print.');
  return { blob, width: bmp.width, height: bmp.height };
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Per-issue AstroComic production: illustrate panels (admin-triggered AI), proof PDF any time, print PDF once preflight passes. */
export function ComicProduction({ issue, onChanged }: { issue: Issue; onChanged: () => void }) {
  const script = issue.script as unknown as ComicIssue;
  const [font, setFont] = useState<{ bytes: Uint8Array; measure: Measure } | null>(null);
  const [art, setArt] = useState<Art[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<'' | 'draw' | 'proof' | 'print'>('');
  const [progress, setProgress] = useState<{ done: number; total: number; key: string } | null>(null);
  const [live, setLive] = useState<{ url: string; final: boolean } | null>(null);
  // The last preflight is saved on the issue, so reopening production shows it again.
  const saved = (issue.print_report && typeof issue.print_report === 'object' && 'checkedAt' in (issue.print_report as object)) ? issue.print_report as unknown as PrintReport : null;
  const [report, setReport] = useState<PrintReport | null>(saved);
  const lines = useMemo(() => (report ? describeReport(report, k => `page ${k.split('-')[0]}`) : []), [report]);
  useEffect(() => { setReport(saved); }, [issue.id, issue.print_report]); // eslint-disable-line react-hooks/exhaustive-deps
  const stop = useRef(false);

  const load = useCallback(async () => {
    setErr('');
    const [f, a] = await Promise.allSettled([loadFont(), supabase.from('comic_issue_art').select('*').eq('issue_id', issue.id)]);
    if (f.status === 'fulfilled') setFont(f.value); else setErr('The lettering font could not be loaded. Refresh to try again.');
    if (a.status === 'rejected' || a.value.error) { setErr('Artwork for this issue could not be loaded.'); setArt([]); return; }
    const rows = a.value.data ?? [];
    setArt(rows);
    if (rows.length) {
      const { data } = await supabase.storage.from('comic-art').createSignedUrls(rows.map(r => r.path), 3600);
      const map: Record<string, string> = {};
      rows.forEach((r, i) => { const u = data?.[i]?.signedUrl; if (u) map[`${r.page_n}-${r.panel_i}`] = u; });
      setUrls(map);
    }
  }, [issue.id]);
  useEffect(() => { void load(); }, [load]);

  const plan = useMemo(() => (font && script?.pages ? panelPlan(script, font.measure) : []), [font, script]);
  const byKey = useMemo(() => new Map((art ?? []).map(a => [`${a.page_n}-${a.panel_i}`, a])), [art]);
  const stateOf = useCallback((s: PanelSlot): SlotState => {
    const a = byKey.get(s.key);
    if (!a) return 'missing';
    if (a.scene && a.scene !== s.scene) return 'stale';
    return effectiveDpi(a.width, a.height, s.rect) < MIN_DPI ? 'lowres' : 'ready';
  }, [byKey]);
  const todo = plan.filter(s => stateOf(s) !== 'ready');
  const ready = plan.length - todo.length;
  const pdfOutdated = !!issue.print_pdf_at && (art ?? []).some(a => a.updated_at > issue.print_pdf_at!);

  const drawOne = async (s: PanelSlot) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Please sign in again.');
    let final = '';
    setLive(null);
    await streamImage(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/comic-art`, { action: 'generate', issueId: issue.id, page: s.page, panel: s.panel, prompt: s.prompt, width: s.width, height: s.height }, (url, isFinal) => { setLive({ url, final: isFinal }); if (isFinal) final = url; }, undefined, { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY });
    if (!final) throw new Error('The artwork did not finish.');
    const jpg = await toJpeg(final);
    const path = `${issue.user_id}/${issue.id}/art/p${s.page}-${s.panel}.jpg`;
    const up = await supabase.storage.from('comic-art').upload(path, jpg.blob, { upsert: true, contentType: 'image/jpeg' });
    if (up.error) throw new Error('The artwork was drawn but could not be saved. Try again.');
    const row = { issue_id: issue.id, page_n: s.page, panel_i: s.panel, path, width: jpg.width, height: jpg.height, scene: s.scene, created_by: session.user.id, updated_at: new Date().toISOString() };
    const saved = await supabase.from('comic_issue_art').upsert(row, { onConflict: 'issue_id,page_n,panel_i' }).select('*').single();
    if (saved.error || !saved.data) throw new Error('The artwork was drawn but could not be recorded. Try again.');
    setArt(list => [...(list ?? []).filter(a => !(a.page_n === s.page && a.panel_i === s.panel)), saved.data]);
    setUrls(u => ({ ...u, [s.key]: URL.createObjectURL(jpg.blob) }));
  };

  const draw = async (slots: PanelSlot[]) => {
    if (!slots.length || busy) return;
    const n = slots.length;
    if (!(await confirmAction(`Illustrate ${n} panel${n === 1 ? '' : 's'}? Each panel is one AI image generation billed to your workspace credits. Panels are drawn one at a time; you can stop after the current one.`, `Illustrate ${n}`))) return;
    stop.current = false; setBusy('draw'); setErr('');
    let done = 0;
    try {
      for (const s of slots) {
        if (stop.current) break;
        setProgress({ done, total: n, key: s.key });
        await drawOne(s);
        done++;
      }
      toast.success(stop.current ? `Stopped after ${done} panel${done === 1 ? '' : 's'}` : `${done} panel${done === 1 ? '' : 's'} illustrated`);
    } catch (e) {
      // Stop on the first failure so a credit or policy problem never repeats across the queue.
      setErr(`${readableError(e)} (${done} of ${n} finished before this.)`);
    } finally { setBusy(''); setProgress(null); setLive(null); }
  };

  const collectArt = async () => {
    const out = new Map<string, ComicArt>();
    for (const a of art ?? []) {
      const { data, error } = await supabase.storage.from('comic-art').download(a.path);
      if (error || !data) throw new Error(`Artwork for page ${a.page_n} could not be downloaded.`);
      out.set(`${a.page_n}-${a.panel_i}`, { bytes: new Uint8Array(await data.arrayBuffer()), width: a.width, height: a.height });
    }
    return out;
  };
  const fileBase = `AstroComic-${issue.issue_number}-${(script?.reader || 'reader').replace(/[^\w-]+/g, '')}-${issue.issue_month.slice(0, 7)}`;

  const proof = async () => {
    if (!font || busy) return;
    setBusy('proof'); setErr('');
    try {
      const { bytes } = await composeComicPdf({ issue: script, fontBytes: font.bytes, art: await collectArt(), mode: 'proof' });
      saveBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${fileBase}-PROOF.pdf`);
    } catch (e) { setErr(readableError(e)); } finally { setBusy(''); }
  };

  const print = async () => {
    if (!font || busy || !art) return;
    const report = preflight(script, art, font.measure);
    setReport(report);
    if (!report.ok) {
      // Keep the failed check too, without touching the last good print file.
      await supabase.from('comic_issues').update({ print_report: report as never }).eq('id', issue.id);
      return;
    }
    setBusy('print'); setErr('');
    try {
      const { bytes } = await composeComicPdf({ issue: script, fontBytes: font.bytes, art: await collectArt(), mode: 'print' });
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      const path = `${issue.user_id}/${issue.id}/${fileBase}-print.pdf`;
      const up = await supabase.storage.from('comic-art').upload(path, blob, { upsert: true, contentType: 'application/pdf' });
      if (up.error) throw new Error('The print file was built but could not be saved. Try again.');
      const now = new Date().toISOString();
      const saved = await supabase.from('comic_issues').update({ print_pdf_path: path, print_pdf_at: now, print_report: report as never, updated_at: now }).eq('id', issue.id).select('id');
      if (saved.error || !saved.data?.length) throw new Error('The print file was saved but the issue could not be updated. Refresh and try again.');
      saveBlob(blob, `${fileBase}-print.pdf`);
      toast.success('Print file ready');
      onChanged();
    } catch (e) { setErr(readableError(e)); } finally { setBusy(''); }
  };

  const downloadReport = async () => {
    if (!report || !font) return;
    try {
      const bytes = await composePreflightPdf({ title: script.title, issueNumber: issue.issue_number, reader: script.reader || 'reader', month: issue.issue_month.slice(0, 7), report, lines, fontBytes: font.bytes, printFileBuilt: report.ok ? issue.print_pdf_at : null });
      saveBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${fileBase}-preflight.pdf`);
    } catch { toast.error('The report could not be built. Try again.'); }
  };

  const downloadPrint = async () => {
    if (!issue.print_pdf_path) return;
    const { data, error } = await supabase.storage.from('comic-art').createSignedUrl(issue.print_pdf_path, 600, { download: `${fileBase}-print.pdf` });
    if (error || !data) { toast.error('The print file could not be opened.'); return; }
    window.location.assign(data.signedUrl);
  };

  if (!script?.pages?.length) return <p className="text-sm text-muted-foreground">This issue has no script yet.</p>;
  if (!art || (!font && !err)) return <div role="status" aria-label="Loading production" className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <section aria-label={`Production for ${script.title}`} className="vellum space-y-5 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-lg">{script.title} · production</h3>
          <p className="text-sm text-muted-foreground">{ready} of {plan.length} panels illustrated{todo.length ? ` · ${todo.length} to go` : ' · all artwork ready'}. Lettering is set in the print file, never drawn by the AI.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {busy === 'draw'
            ? <Button variant="outline" onClick={() => { stop.current = true; }}><Square className="h-4 w-4" />Stop after this panel</Button>
            : <Button onClick={() => void draw(todo)} disabled={!todo.length || !!busy || !font}><Brush className="h-4 w-4" />{todo.length ? `Illustrate ${todo.length} panel${todo.length === 1 ? '' : 's'}` : 'All panels illustrated'}</Button>}
          <Button variant="outline" onClick={() => void proof()} disabled={!!busy || !font}>{busy === 'proof' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Proof PDF</Button>
          <Button variant="outline" onClick={() => void print()} disabled={!!busy || !font}>{busy === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}{issue.print_pdf_path ? 'Rebuild print file' : 'Build print file'}</Button>
          {issue.print_pdf_path && <Button variant="ghost" onClick={() => void downloadPrint()}><Download className="h-4 w-4" />Print file</Button>}
        </div>
      </div>
      {issue.print_pdf_at && <p className={`text-xs ${pdfOutdated ? 'text-destructive' : 'text-muted-foreground'}`}>{pdfOutdated ? 'Artwork changed after the print file was built — rebuild it before printing.' : `Print file built ${new Date(issue.print_pdf_at).toLocaleString()}.`}</p>}
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {report && (
        <div role="status" className={`space-y-2 rounded-lg border p-3 text-sm ${report.ok ? 'border-gold/50' : 'border-destructive/50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{report.ok ? 'Preflight passed' : 'Preflight found problems'} <span className="font-normal text-muted-foreground">· checked {new Date(report.checkedAt).toLocaleString()}</span></p>
            <Button size="sm" variant="ghost" onClick={() => void downloadReport()} disabled={!font}><Download className="h-4 w-4" />Report PDF</Button>
          </div>
          <ul className="space-y-1">{lines.map(l => <li key={l}>{l}</li>)}</ul>
        </div>
      )}
      {progress && (
        <div role="status" className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-3">
          <div className="h-24 w-24 overflow-hidden rounded bg-muted">{live && <img loading="lazy" decoding="async" src={live.url} alt="Artwork in progress" className={`h-full w-full object-cover transition-[filter] ${live.final ? '' : 'blur-md'}`} />}</div>
          <div className="text-sm"><p className="font-medium">Drawing page {progress.key.split('-')[0]}, panel {Number(progress.key.split('-')[1]) + 1}</p><p className="text-muted-foreground">{progress.done} of {progress.total} done · large panels can take a minute or two.</p></div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Print file: 5.5 × 8.5 in with 0.125 in bleed, trim and bleed boxes set, font embedded, every panel checked for {MIN_DPI} DPI. Colour is RGB — the printer converts to CMYK in their preflight.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{script.pages.map(p => <ComicPageView key={p.n} page={p} compact art={urls} />)}</div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">Panels ({plan.length})</summary>
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[720px]">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="p-2">Art</th><th className="p-2">Page</th><th className="p-2">Scene</th><th className="p-2">Status</th><th className="p-2" /></tr></thead>
          <tbody>{plan.map(s => { const st = stateOf(s); const a = byKey.get(s.key); return (
            <tr key={s.key} className="border-b border-border align-top last:border-0">
              <td className="p-2"><div className="h-12 w-12 overflow-hidden rounded bg-muted">{urls[s.key] && <img loading="lazy" decoding="async" src={urls[s.key]} alt="" className="h-full w-full object-cover" />}</div></td>
              <td className="p-2 whitespace-nowrap">p.{s.page} · {s.panel + 1}<p className="text-xs text-muted-foreground">{s.section}</p></td>
              <td className="p-2"><p className="line-clamp-2 max-w-md">{s.scene}</p><p className="text-xs text-muted-foreground">{s.width}×{s.height}px</p></td>
              <td className="p-2 whitespace-nowrap"><span className={st === 'ready' ? 'text-gold' : st === 'missing' ? 'text-muted-foreground' : 'text-destructive'}>{STATE_LABEL[st]}</span>{a && <p className="text-xs text-muted-foreground">{effectiveDpi(a.width, a.height, s.rect)} DPI</p>}</td>
              <td className="p-2"><Button size="sm" variant="ghost" disabled={!!busy} onClick={() => void draw([s])}>{a ? 'Redraw' : 'Draw'}</Button></td>
            </tr>
          ); })}</tbody>
        </table></div>
      </details>
    </section>
  );
}
