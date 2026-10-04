import { supabase } from '@/integrations/supabase/client';
import { aprilOnly, loadCorpus, rank } from '@/lib/corpus';

export type WorkbookEntry = {
  id: string; owner_id: string; kind: 'prompt' | 'checkin' | 'reframe'; module: string; prompt_key: string;
  question: string; answer: string; data: Record<string, unknown>; feedback: string; created_at: string; updated_at: string;
};
export type FeedbackPassage = { n: number; source: string; loc: string; text: string; href: string };

export const WORKBOOK_CHANGED = 'workbook-changed';

export async function listEntries() {
  const { data, error } = await supabase.from('workbook_entries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as WorkbookEntry[];
}

/** Top source passages for a piece of reflective writing (empty if sources are locked). */
export async function passagesFor(query: string, k = 6): Promise<FeedbackPassage[]> {
  try {
    const corpus = await loadCorpus();
    return rank(aprilOnly(corpus), query, k).map((p, i) => ({ n: i + 1, source: p.source, loc: p.loc, text: p.text.slice(0, 1400), href: p.href }));
  } catch { return []; }
}

export async function requestFeedback(input: { tool: WorkbookEntry['kind']; module?: string; question?: string; answer: string; chartNote?: string; query: string }) {
  const passages = await passagesFor(input.query);
  const { data, error } = await supabase.functions.invoke('workbook-feedback', {
    body: { tool: input.tool, module: input.module ?? '', question: input.question ?? '', answer: input.answer, chartNote: input.chartNote ?? '', passages: passages.map(({ href: _h, ...p }) => p) },
  });
  if (error || !data?.feedback) {
    let msg = data?.error as string | undefined;
    try { msg ??= (await (error as { context?: Response })?.context?.json?.())?.error; } catch { /* keep */ }
    throw new Error(msg ?? 'Feedback could not be written right now.');
  }
  return { feedback: data.feedback as string, passages };
}
