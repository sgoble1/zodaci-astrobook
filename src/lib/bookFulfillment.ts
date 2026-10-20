/**
 * AstroBook order stages — the single client source for labels, ordering and CSV export.
 * The database check constraint, guard triggers and supabase/functions/_shared/book-delivery-rules.ts mirror PAID_STAGES.
 */
export const PAID_STAGES = ['paid', 'print_brief_sent', 'printing', 'quality_check', 'shipped', 'delivered'] as const;
export type PaidStage = typeof PAID_STAGES[number];
export type OrderStatus = 'draft' | 'quote_requested' | 'awaiting_payment' | 'canceled' | PaidStage;
export const ALL_STATUSES: OrderStatus[] = ['draft', 'quote_requested', 'awaiting_payment', ...PAID_STAGES, 'canceled'];
/** Stages after payment that only printed books pass through. */
export const PRODUCTION_STAGES: OrderStatus[] = ['print_brief_sent', 'printing', 'quality_check', 'shipped', 'delivered'];

export const STAGE_LABEL: Record<OrderStatus, string> = {
  draft: 'Draft', quote_requested: 'Quote requested', awaiting_payment: 'Awaiting payment', paid: 'Paid',
  print_brief_sent: 'Sent to printer', printing: 'Printing', quality_check: 'Quality check', shipped: 'Shipped', delivered: 'Delivered', canceled: 'Canceled',
};

/** What each stage means for the customer. */
export const STAGE_DETAIL: Record<OrderStatus, string> = {
  draft: 'Your book is being prepared. Review the manuscript, then pay to place the order.',
  quote_requested: 'We are checking the details of this order.',
  awaiting_payment: 'Checkout is open. Your order is placed once payment is confirmed.',
  paid: 'Payment confirmed. Your final PDF is ready and your book is queued for printing.',
  print_brief_sent: 'Your book file and print specification have been sent to our printer.',
  printing: 'Your copy is on the press.',
  quality_check: 'Your printed copy is being checked before it ships.',
  shipped: 'Your book is on its way.',
  delivered: 'Your book has been delivered.',
  canceled: 'This order was canceled.',
};

export const statusLabel = (s: string) => STAGE_LABEL[s as OrderStatus] ?? s.replace(/_/g, ' ');
export const isPaidStage = (s: string): s is PaidStage => (PAID_STAGES as readonly string[]).includes(s);

/** The stages a customer sees as a progress line for their order format. */
export const stagesFor = (format: string): PaidStage[] => format === 'digital' ? ['paid'] : [...PAID_STAGES];

/** The next production stage for a paid printed order, or null when there is nothing further to do. */
export function nextStage(status: string, format: string): PaidStage | null {
  if (format === 'digital' || !isPaidStage(status)) return null;
  const i = PAID_STAGES.indexOf(status);
  return i < PAID_STAGES.length - 1 ? PAID_STAGES[i + 1] : null;
}

/** Why a stage change is not allowed (mirrors the database guards), or null. */
export function stageError(prev: string, next: string, format: string, ship: { carrier?: string; tracking?: string } = {}): string | null {
  if (prev === next) return null;
  if (next === 'paid' && !isPaidStage(prev)) return 'Payment is confirmed by the payment provider, not by hand.';
  if (PRODUCTION_STAGES.includes(next as OrderStatus)) {
    if (format === 'digital') return 'Digital AstroBooks are downloaded, not printed or shipped.';
    if (!isPaidStage(prev)) return 'Only paid orders can move into production.';
  }
  if (next === 'delivered' && prev !== 'shipped') return 'Mark the order shipped before delivered.';
  if ((next === 'shipped' || next === 'delivered') && (!ship.carrier || !ship.tracking?.trim())) return 'Add the carrier and tracking number before marking this order shipped.';
  return null;
}

type CsvOrder = {
  id: string; created_at: string; edition: string; format: string; status: string; payment_total_cents: number | null; payment_tax_cents?: number | null;
  manuscript_pages: number | null; gift: boolean; gift_message: string; lulu_reference: string; carrier?: string; tracking_number: string; shipped_at?: string | null;
  shipping_address: Record<string, string> | null; payment_hold: string | null;
};

/** Spreadsheet-safe cell: quoted, and never starting with a formula character. */
export function csvCell(v: unknown): string {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export const ORDER_CSV_HEADER = ['Order', 'Created', 'Version', 'Format', 'Stage', 'Paid (USD)', 'Tax (USD)', 'Pages', 'Gift', 'Gift message', 'Printer reference', 'Carrier', 'Tracking', 'Shipped on', 'Recipient', 'Address 1', 'Address 2', 'City', 'State', 'ZIP', 'Payment review'];

export function ordersCsv(orders: CsvOrder[], versionName: (edition: string, format: string) => string): string {
  const dollars = (c: number | null | undefined) => c == null ? '' : (c / 100).toFixed(2);
  const rows = orders.map(o => { const a = o.shipping_address ?? {}; return [
    o.id, o.created_at.slice(0, 10), versionName(o.edition, o.format), o.format, statusLabel(o.status), dollars(o.payment_total_cents), dollars(o.payment_tax_cents),
    o.manuscript_pages ?? '', o.gift ? 'yes' : 'no', o.gift_message, o.lulu_reference, o.carrier ?? '', o.tracking_number, o.shipped_at ?? '',
    a.name ?? '', a.line1 ?? '', a.line2 ?? '', a.city ?? '', a.state ?? '', a.postal_code ?? '', o.payment_hold ?? '',
  ]; });
  return [ORDER_CSV_HEADER, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
}

/** Save text as a downloaded file in the browser. */
export function downloadText(name: string, text: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['\ufeff', text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
