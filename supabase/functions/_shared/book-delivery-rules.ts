export function isPaidBook(o: {status: string; payment_total_cents: number | null}) {
  return ['paid','printing','shipped','delivered'].includes(o.status) && o.payment_total_cents !== null;
}
export function bookPdfPath(user: string, order: string, final = false) {
  return `${user}/${order}/${final ? 'AstroBook' : 'reviewed'}.pdf`;
}
