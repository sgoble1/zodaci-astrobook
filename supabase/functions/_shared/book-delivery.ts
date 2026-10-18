import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { bookPdfPath, isPaidBook } from './book-delivery-rules.ts';
type Order = {id:string;user_id:string;status:string;payment_total_cents:number|null;manuscript_path:string|null;manuscript_pages:number|null;final_pdf_path:string|null};
// Freeze the reviewed content, never rewrite purchased content or consume AI credits.
export async function snapshotBookPdf(db: SupabaseClient, o: Order) {
  const path = bookPdfPath(o.user_id,o.id);
  const existing = await db.storage.from('book-orders').download(path);
  if (!existing.error && existing.data) return path;
  if (!o.manuscript_path?.startsWith(`${o.user_id}/manuscripts/`)) throw new Error('Invalid manuscript');
  const source = await db.storage.from('library').download(o.manuscript_path);
  if (source.error || !source.data || source.data.size > 40*1024*1024) throw new Error('Manuscript unavailable');
  const bytes = new Uint8Array(await source.data.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0,5)) !== '%PDF-') throw new Error('Invalid PDF');
  const pdf = await PDFDocument.load(bytes);
  if (pdf.getPageCount() !== o.manuscript_pages || pdf.getPageCount()<4) throw new Error('Page count mismatch');
  const uploaded = await db.storage.from('book-orders').upload(path,bytes,{contentType:'application/pdf',upsert:false});
  if (uploaded.error) {
    const saved = await db.storage.from('book-orders').download(path);
    if (saved.error) throw uploaded.error;
  }
  return path;
}
export async function finalizeBookPdf(db: SupabaseClient,o: Order) {
  if (!isPaidBook(o)) throw new Error('Payment not confirmed');
  const path = bookPdfPath(o.user_id,o.id,true);
  if (o.final_pdf_path === path) return path;
  const reviewed = await snapshotBookPdf(db,o);
  const source = await db.storage.from('book-orders').download(reviewed);
  if (source.error || !source.data) throw new Error('Reviewed PDF unavailable');
  const pdf = await PDFDocument.load(await source.data.arrayBuffer());
  pdf.setAuthor('Zodaci'); pdf.setSubject(`AstroBook · Order ${o.id}`);
  const uploaded = await db.storage.from('book-orders').upload(path,await pdf.save(),{contentType:'application/pdf',upsert:false});
  if (uploaded.error) {
    const saved = await db.storage.from('book-orders').download(path);
    if (saved.error) throw uploaded.error;
  }
  const saved = await db.from('book_orders').update({final_pdf_path:path,pdf_ready_at:new Date().toISOString()}).eq('id',o.id).eq('user_id',o.user_id);
  if (saved.error) throw saved.error;
  return path;
}
