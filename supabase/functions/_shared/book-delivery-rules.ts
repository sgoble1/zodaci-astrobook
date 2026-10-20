/** Mirrors PAID_STAGES in src/lib/bookFulfillment.ts and the book_orders status guards. */
export const PAID_BOOK_STATUSES = ['paid', 'print_brief_sent', 'printing', 'quality_check', 'shipped', 'delivered'];
export function isPaidBook(o: {status: string; payment_total_cents: number | null}) {
  return PAID_BOOK_STATUSES.includes(o.status) && o.payment_total_cents !== null;
}
export function bookPdfPath(user: string, order: string, final = false) {
  return `${user}/${order}/${final ? 'AstroBook' : 'reviewed'}.pdf`;
}
