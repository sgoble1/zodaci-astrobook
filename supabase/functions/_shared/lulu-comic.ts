import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { LuluError, lulu, luluShippingLevel, applyComicJobUpdate } from './lulu.ts';
import { luluAddress, PRODUCTION_DELAY_MINUTES } from './lulu-rules.ts';
import { COMIC_POD, comicPrintError, comicPageError } from './lulu-comic-rules.ts';
import { comicFiles } from './lulu-comic-files.ts';
import { createStripeClient } from './stripe.ts';
import { COMIC_CENTS } from './purchase-confirm.ts';

export async function handleComic(db: SupabaseClient, action: string, issueId: string, env: 'sandbox' | 'production', user: { id: string; email?: string }) {
  const { data: issue, error } = await db.from('comic_issues').select('*').eq('id', issueId).single();
  if (error || !issue) throw new LuluError(404, 'Comic issue not found.');
  const { data: sub } = await db.from('comic_subscriptions').select('*').eq('id', issue.subscription_id).eq('user_id', issue.user_id).single();
  if (!sub) throw new LuluError(409, 'Comic purchase missing.');
  const readiness = comicPrintError(issue, sub, env);
  if (readiness) throw new LuluError(409, readiness);
  const address = luluAddress(sub.shipping_address);
  if (address.error || !address.address) throw new LuluError(409, address.error || 'Shipping address missing.');
  const art = await db.from('comic_issue_art').select('updated_at').eq('issue_id', issue.id).gt('updated_at', issue.print_pdf_at).limit(1);
  if (art.error) throw art.error;
  if (art.data?.length) throw new LuluError(409, 'Artwork changed after the print file was built. Rebuild it before printing.');
  const path = issue.print_pdf_path;
  if (!path.startsWith(`${issue.user_id}/${issue.id}/`)) throw new LuluError(409, 'The print file does not belong to this issue.');
  const file = await db.storage.from('comic-art').download(path);
  if (file.error || !file.data) throw new LuluError(409, 'Comic print PDF unavailable.');
  const bytes = new Uint8Array(await file.data.arrayBuffer());
  const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
  const pages = (await PDFDocument.load(bytes)).getPageCount() - 4;
  const limit = comicPageError(pages); if (limit) throw new LuluError(409, limit);
  if (action === 'quote') return { quote: await lulu('/print-job-cost-calculations/', { method: 'POST', body: { line_items: [{ page_count: pages, pod_package_id: COMIC_POD, quantity: 1 }], shipping_address: { ...address.address, phone_number: address.address.phone_number || '000-000-0000' }, shipping_option: luluShippingLevel() } }), pages, pod: COMIC_POD };
  // Re-read provider payment before any production job; never rely on an admin-edited active flag.
  if (action === 'submit') {
    const stripe = createStripeClient(sub.environment);
    const session = await stripe.checkout.sessions.retrieve(sub.checkout_session_id);
    if (session.payment_status !== 'paid' || session.amount_subtotal !== COMIC_CENTS[sub.plan] || session.currency !== 'usd' || session.metadata?.comicId !== sub.id || session.metadata?.userId !== issue.user_id) throw new LuluError(409, 'The comic payment could not be verified.');
    if (sub.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
      if (subscription.status !== 'active') throw new LuluError(409, 'This comic subscription is not currently paid and active.');
    }
  }
  const dims = await lulu('/cover-dimensions/', { method: 'POST', body: { pod_package_id: COMIC_POD, interior_page_count: pages, unit: 'pt' } });
  let files;
  try { files = await comicFiles(bytes, { width: Number(dims.width), height: Number(dims.height) }); }
  catch (e) { throw new LuluError(409, e instanceof Error ? e.message : 'Comic PDF could not be prepared.'); }
  let rowId = 'proof';
  if (action === 'submit') {
    const claim = await db.from('comic_lulu_print_jobs').insert({ issue_id: issue.id, environment: env, pod_package_id: COMIC_POD, page_count: pages, shipping_level: luluShippingLevel(), created_by: user.id }).select('id').single();
    if (claim.error) throw new LuluError(409, 'This issue already has an active Lulu job, or its print job could not be claimed.');
    rowId = claim.data.id;
  }
  try {
    const base = `${issue.user_id}/${issue.id}/lulu/${rowId}`;
    const upload = async (suffix: string, data: Uint8Array) => {
      const p = `${base}-${suffix}.pdf`;
      const r = await db.storage.from('comic-art').upload(p, data, { contentType: 'application/pdf', upsert: true }); if (r.error) throw r.error;
      const signed = await db.storage.from('comic-art').createSignedUrl(p, action === 'proof' ? 600 : 604800); if (signed.error) throw signed.error;
      return { path: p, url: signed.data.signedUrl };
    };
    const [interior, cover] = await Promise.all([upload('interior', files.interior), upload('cover', files.cover)]);
    if (action === 'proof') return { interiorUrl: interior.url, coverUrl: cover.url, pages, spinePt: 0, pod: COMIC_POD };
    const job = await lulu('/print-jobs/', { method: 'POST', body: { external_id: `zodaci-comic-${issue.id}`, contact_email: Deno.env.get('LULU_CONTACT_EMAIL')?.trim() || user.email, shipping_level: luluShippingLevel(), production_delay: PRODUCTION_DELAY_MINUTES, shipping_address: address.address, line_items: [{ external_id: issue.id, title: issue.title || 'AstroComic', quantity: 1, printable_normalization: { pod_package_id: COMIC_POD, interior: { source_url: interior.url }, cover: { source_url: cover.url } } }] } });
    if (!Number.isFinite(Number(job.id))) throw new LuluError(502, 'Lulu did not return a print job number.');
    const saved = await db.from('comic_lulu_print_jobs').update({ lulu_job_id: job.id, interior_path: interior.path, cover_path: cover.path }).eq('id', rowId);
    if (saved.error) throw saved.error;
    const result = await applyComicJobUpdate(db, { id: rowId, issue_id: issue.id, environment: env, status: 'SUBMITTING' }, job);
    return { luluJobId: job.id, ...result, note: env === 'sandbox' ? 'Test job only; nothing is printed.' : result.note };
  } catch (e) {
    // Ambiguous network/save failures keep the claim: do not risk printing a second copy.
    if (rowId !== 'proof') await db.from('comic_lulu_print_jobs').update({ status_message: 'Submission needs review in Lulu before retrying.' }).eq('id', rowId);
    throw e;
  }
}