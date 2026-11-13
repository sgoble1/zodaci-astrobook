/** Verified against Lulu's March 2026 product sheet, not the retired 0662 code. */
export const COMIC_POD = '0663X1025.FC.PRE.SS.070CW460.GIX';
export const COMIC_TRIM = [6.663 * 72, 10.25 * 72] as [number, number];
export const COMIC_BLEED = 9;
export function comicPageError(pages: number): string | null {
  return pages < 4 || pages > 48 || pages % 4 !== 0
    ? 'Lulu saddle-stitched comics need 4–48 interior pages in multiples of four.' : null;
}
export function comicPrintError(issue: { status: string; print_pdf_path?: string; print_pdf_at?: string; print_report?: { ok?: boolean } }, sub: { status: string; environment: string; checkout_session_id?: string }, env: string): string | null {
  if (env === 'production' && sub.environment !== 'live') return 'Test-payment comics are never sent for real printing.';
  if (sub.status !== 'active' || !sub.checkout_session_id) return 'This comic purchase is not active and payment-confirmed.';
  if (issue.status !== 'approved') return 'Approve this issue before sending it to Lulu.';
  if (!issue.print_pdf_path || !issue.print_pdf_at || !issue.print_report?.ok) return 'Build a passing print file under Production first.';
  return null;
}
export function comicStatusPatch(current: string, status: string, env: string, tracking: { tracking_id: string; carrier_name: string }, today: string) {
  if (env !== 'production') return null;
  if (['CREATED','UNPAID','PAYMENT_IN_PROGRESS','PRODUCTION_DELAYED','PRODUCTION_READY','IN_PRODUCTION'].includes(status) && current === 'approved') return { status: 'printing' };
  if (['FAILED','REJECTED','CANCELED','ERROR'].includes(status) && current === 'printing') return { status: 'approved' };
  if (['SHIPPED','DELIVERED'].includes(status) && ['approved','printing'].includes(current) && tracking.tracking_id) return { status: 'shipped', carrier: tracking.carrier_name, tracking_number: tracking.tracking_id, shipped_at: today };
  return null;
}