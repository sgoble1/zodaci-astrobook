import { describe, expect, it } from 'vitest';
import { PAID_STAGES, csvCell, nextStage, ordersCsv, stageError } from './bookFulfillment';
import { PAID_BOOK_STATUSES, isPaidBook } from '../../supabase/functions/_shared/book-delivery-rules';

describe('AstroBook fulfillment stages', () => {
  it('runs paid → print brief sent → printing → quality check → shipped → delivered', () => {
    expect([...PAID_STAGES]).toEqual(['paid', 'print_brief_sent', 'printing', 'quality_check', 'shipped', 'delivered']);
  });
  it('server paid statuses match the client stages', () => expect(PAID_BOOK_STATUSES).toEqual([...PAID_STAGES]));
  it('treats every production stage as paid', () => {
    for (const status of PAID_STAGES) expect(isPaidBook({ status, payment_total_cents: 5999 })).toBe(true);
  });
  it('advances a printed order one stage at a time', () => {
    expect(nextStage('paid', 'print')).toBe('print_brief_sent');
    expect(nextStage('quality_check', 'print')).toBe('shipped');
    expect(nextStage('delivered', 'print')).toBeNull();
  });
  it('never moves a digital edition into printing', () => {
    expect(nextStage('paid', 'digital')).toBeNull();
    expect(stageError('paid', 'printing', 'digital')).not.toBeNull();
  });
  it('blocks production before payment', () => expect(stageError('awaiting_payment', 'print_brief_sent', 'print')).not.toBeNull());
  it('blocks marking paid by hand', () => expect(stageError('draft', 'paid', 'print')).not.toBeNull());
  it('requires shipped before delivered', () => expect(stageError('quality_check', 'delivered', 'print', { carrier: 'UPS', tracking: '1Z' })).not.toBeNull());
  it('requires tracking to ship', () => {
    expect(stageError('quality_check', 'shipped', 'print', { carrier: 'UPS', tracking: '' })).not.toBeNull();
    expect(stageError('quality_check', 'shipped', 'print', { carrier: 'UPS', tracking: '1Z999' })).toBeNull();
  });
});

describe('order CSV', () => {
  it('neutralizes spreadsheet formulas', () => expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`));
  it('writes one header and one row per order', () => {
    const csv = ordersCsv([{ id: 'a1', created_at: '2026-10-01T00:00:00Z', edition: 'classic', format: 'print', status: 'quality_check', payment_total_cents: 5999, payment_tax_cents: 0, manuscript_pages: 120, gift: false, gift_message: '', lulu_reference: 'LU-1', tracking_number: '', shipping_address: { name: 'Ana', city: 'Austin', state: 'TX', postal_code: '78701' }, payment_hold: null }], () => 'Classic');
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('"Quality check"');
    expect(lines[1]).toContain('"59.99"');
  });
});
