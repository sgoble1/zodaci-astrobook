import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

// AstroComic production: admins illustrate script panels one at a time; subscribers get short-lived links to released issues.
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const RELEASED = ['approved', 'printing', 'shipped'];
const DAILY_LIMIT = 200;

const Generate = z.object({
  action: z.literal('generate'),
  issueId: z.string().uuid(),
  page: z.number().int().min(1).max(40),
  panel: z.number().int().min(0).max(8),
  prompt: z.string().trim().min(20).max(4000),
  width: z.number().int(),
  height: z.number().int(),
  stream: z.boolean().default(true),
  partial_images: z.number().int().min(0).max(3).optional(),
}).strict();
const Reader = z.object({ action: z.literal('reader'), issueId: z.string().uuid() }).strict();

/** Mirrors validArtSize in src/lib/comicPrint.ts: the image model's custom-size rules. */
function validSize(w: number, h: number) {
  return w % 16 === 0 && h % 16 === 0 && w <= 3840 && h <= 3840 && w * h >= 655360 && w * h <= 8294400 && w / h <= 3 && h / w <= 3;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'); const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !secret) return json({ error: 'Comic production is not configured.' }, 500);
    const db = createClient(url, secret);
    const token = req.headers.get('Authorization')?.replace(/^Bearer /, '');
    if (!token) return json({ error: 'Please sign in.' }, 401);
    const { data: { user } } = await db.auth.getUser(token);
    if (!user) return json({ error: 'Please sign in.' }, 401);
    const raw = await req.json().catch(() => null);
    const { data: isAdmin } = await db.rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (raw?.action === 'reader') {
      const body = Reader.safeParse(raw);
      if (!body.success) return json({ error: 'Invalid issue.' }, 400);
      const { data: issue } = await db.from('comic_issues').select('id,user_id,status,print_pdf_path,issue_number').eq('id', body.data.issueId).maybeSingle();
      if (!issue || (!isAdmin && (issue.user_id !== user.id || !RELEASED.includes(issue.status)))) return json({ error: 'Issue unavailable.' }, 404);
      const { data: art, error } = await db.from('comic_issue_art').select('page_n,panel_i,path,updated_at').eq('issue_id', issue.id);
      if (error) throw error;
      const rows = (art ?? []).filter(a => a.path.startsWith(`${issue.user_id}/${issue.id}/`));
      const signed = rows.length ? await db.storage.from('comic-art').createSignedUrls(rows.map(a => a.path), 3600) : { data: [], error: null };
      if (signed.error) throw signed.error;
      const panels: Record<string, string> = {};
      rows.forEach((a, i) => { const s = signed.data?.[i]?.signedUrl; if (s) panels[`${a.page_n}-${a.panel_i}`] = s; });
      let pdf: string | null = null;
      if (issue.print_pdf_path?.startsWith(`${issue.user_id}/${issue.id}/`)) {
        const p = await db.storage.from('comic-art').createSignedUrl(issue.print_pdf_path, 3600, { download: `AstroComic-${issue.issue_number}.pdf` });
        pdf = p.data?.signedUrl ?? null;
      }
      return json({ panels, pdf, expiresIn: 3600 });
    }

    // Artwork generation spends AI credits, so only admins can start it.
    if (!isAdmin) return json({ error: 'Only admins can illustrate issues.' }, 403);
    const body = Generate.safeParse(raw);
    if (!body.success) return json({ error: 'Invalid artwork request.' }, 400);
    const { issueId, page, panel, prompt, width, height, stream } = body.data;
    if (!validSize(width, height)) return json({ error: 'Unsupported artwork size.' }, 400);
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) return json({ error: 'Artwork generation is not configured.' }, 500);
    const { data: issue } = await db.from('comic_issues').select('id,script').eq('id', issueId).maybeSingle();
    const pages = (issue?.script as { pages?: { n: number; panels?: unknown[] }[] } | null)?.pages ?? [];
    const target = pages.find(p => p.n === page);
    if (!issue || !target || !Array.isArray(target.panels) || panel >= target.panels.length) return json({ error: 'That panel is not in this issue.' }, 404);
    const { data: pause } = await db.from('ai_access_pauses').select('message').eq('scope', 'workspace').maybeSingle();
    if (pause) return json({ error: pause.message }, 402);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await db.from('ai_usage').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('feature', 'comic-art').gte('created_at', since);
    if ((count ?? 0) >= DAILY_LIMIT) return json({ error: `Daily artwork limit (${DAILY_LIMIT} panels) reached. Continue tomorrow.` }, 429);

    const upstream = await fetch('https://ai.gateway.lovable.dev/v1/images/generations', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-image-2.5-sunburst', prompt, size: `${width}x${height}`, quality: 'high', ...(stream ? { stream: true, partial_images: 1 } : {}) }),
    });
    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      const message = err.error?.message || err.message || `Artwork generation unavailable (${upstream.status}).`;
      if ([402, 403].includes(upstream.status)) await db.from('ai_access_pauses').upsert({ scope: 'workspace', message });
      return json({ error: message }, upstream.status);
    }
    await db.from('ai_usage').insert({ user_id: user.id, feature: 'comic-art' });
    return new Response(upstream.body, { status: upstream.status, headers: { ...corsHeaders, 'Content-Type': upstream.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('comic-art failed', e);
    return json({ error: 'The artwork request could not finish.' }, 500);
  }
});
