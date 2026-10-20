import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { BOOK_VERSIONS } from '@/lib/books';
import { POD_PACKAGES, TRIM_PT, carrierFrom, coverLayout, foilText, interiorPageCount, listPriceCents, luluAddress, luluErrorText, orderPatches, pageLimitError, spineWidthPt } from '../../supabase/functions/_shared/lulu-rules';
import { buildCoverWrap, buildInterior } from '../../supabase/functions/_shared/lulu-files';

const today = '2026-10-20';
const address = { name: 'Ada Lovelace', line1: '12 Orbit Way', line2: '', city: 'Austin', state: 'tx', postal_code: '78701', country: 'US', phone: '+1 512 555 0100' };

describe('Lulu products', () => {
  it('maps every printed AstroBook version to its Lulu product and trim', () => {
    for (const v of BOOK_VERSIONS.filter(b => b.format === 'print')) {
      const id = v.id as keyof typeof POD_PACKAGES;
      expect(POD_PACKAGES[id]).toMatch(/^\d{4}X\d{4}\.FC\.(STD|PRE)\.(PB|CW|LW)\.\d{3}[A-Z]{2}\d{3}\.[GM][A-Z][A-Z]$/);
      expect(TRIM_PT[id]).toEqual(v.trimPt);
    }
    expect(POD_PACKAGES.linen).toBe('0850X1100.FC.PRE.LW.080CW444.MNG');
  });
  it('uses the published spec-sheet list price per copy', () => {
    expect(listPriceCents('classic', 136)).toBe(199 + Math.round(13.89 * 136));
    expect(listPriceCents('signature', 24)).toBe(1098 + Math.round(21.48 * 24));
  });
  it('drops the cover page and pads the interior to an even page count', () => {
    expect(interiorPageCount(121)).toBe(120);
    expect(interiorPageCount(120)).toBe(120);
    expect(pageLimitError('pocket', 30)).toMatch(/at least 32/);
    expect(pageLimitError('signature', 24)).toBeNull();
  });
  it('follows Lulu spine rules for paperback and hardcover', () => {
    expect(spineWidthPt(POD_PACKAGES.classic, 444)).toBeCloseTo((1 + 0.06) * 72);
    expect(spineWidthPt(POD_PACKAGES.signature, 100)).toBe(0.5 * 72);
    expect(spineWidthPt(POD_PACKAGES.linen, 200)).toBe(0.75 * 72);
  });
});

describe('Lulu shipping address', () => {
  it('maps a saved order address without altering it', () => {
    expect(luluAddress(address).address).toEqual({ name: 'Ada Lovelace', street1: '12 Orbit Way', city: 'Austin', state_code: 'TX', country_code: 'US', postcode: '78701', phone_number: '+1 512 555 0100' });
  });
  it('refuses addresses Lulu would have to shorten, and non-US addresses', () => {
    expect(luluAddress({ ...address, line1: '1234 Extraordinarily Long Avenue Name' }).error).toMatch(/at most 30/);
    expect(luluAddress({ ...address, country: 'CA' }).error).toMatch(/US addresses/);
    expect(luluAddress({ ...address, state: '' }).error).toMatch(/state/);
  });
  it('keeps foil stamping within Lulu’s character rules', () => {
    expect(foilText('April')).toEqual({ foil_stamp_title_text: 'AstroBook', foil_stamp_author_text: 'April' });
    expect(foilText('张伟').foil_stamp_author_text).toBe('Zodaci');
    const long = foilText('A'.repeat(60));
    expect(long.foil_stamp_title_text.length + long.foil_stamp_author_text.length).toBeLessThanOrEqual(42);
  });
});

describe('Lulu status to order stage', () => {
  const shipped = { status: { name: 'SHIPPED', changed: '2026-10-18T10:00:00Z' }, line_items: [{ status: { messages: { tracking_id: '1Z999', tracking_urls: ['https://track.example/1Z999'], carrier_name: 'UPS Ground' } } }] };
  it('never changes an order for a sandbox test job', () => {
    expect(orderPatches({ status: 'paid' }, { status: { name: 'IN_PRODUCTION' } }, 'sandbox', today).patches).toEqual([]);
  });
  it('moves production orders forward only', () => {
    expect(orderPatches({ status: 'paid' }, { status: { name: 'UNPAID' } }, 'production', today).patches).toEqual([{ status: 'print_brief_sent' }]);
    expect(orderPatches({ status: 'print_brief_sent' }, { status: { name: 'IN_PRODUCTION' } }, 'production', today).patches).toEqual([{ status: 'printing' }]);
    expect(orderPatches({ status: 'printing' }, { status: { name: 'UNPAID' } }, 'production', today).patches).toEqual([]);
  });
  it('ships with the carrier and tracking Lulu reports', () => {
    expect(orderPatches({ status: 'printing' }, shipped, 'production', today).patches).toEqual([{ status: 'shipped', carrier: 'UPS', tracking_number: '1Z999', shipped_at: '2026-10-18' }]);
    expect(orderPatches({ status: 'printing' }, { ...shipped, status: { name: 'DELIVERED', changed: '2026-10-19T00:00:00Z' } }, 'production', today).patches.map(p => p.status)).toEqual(['shipped', 'delivered']);
  });
  it('leaves unknown carriers for the dispatch desk', () => {
    const r = orderPatches({ status: 'printing' }, { ...shipped, line_items: [{ status: { messages: { tracking_id: 'X1', carrier_name: 'DHL' } } }] }, 'production', today);
    expect(r.patches).toEqual([]);
    expect(r.note).toMatch(/Dispatch desk/);
    expect(carrierFrom('FedEx Home')).toBe('FedEx');
  });
  it('returns a rejected job’s order to Paid so it can be resent', () => {
    expect(orderPatches({ status: 'print_brief_sent' }, { status: { name: 'REJECTED' } }, 'production', today).patches).toEqual([{ status: 'paid' }]);
    expect(orderPatches({ status: 'printing' }, { status: { name: 'CANCELED' } }, 'production', today).patches).toEqual([]);
  });
  it('summarises Lulu validation errors', () => {
    expect(luluErrorText({ shipping_address: { street1: ['Ensure this field has no more than 30 characters.'] } })).toBe('shipping_address.street1: Ensure this field has no more than 30 characters.');
    expect(luluErrorText({ detail: 'Authentication credentials were not provided.' })).toBe('Authentication credentials were not provided.');
  });
});

describe('Lulu print files', () => {
  const book = async (pages: number, size: [number, number]) => {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < pages; i++) pdf.addPage(size).drawRectangle({ x: 10, y: 10, width: 20, height: 20 });
    return pdf.save();
  };
  it('builds an even interior without the cover page', async () => {
    const out = await buildInterior(await book(41, TRIM_PT.classic));
    expect(out.pages).toBe(40);
    const odd = await buildInterior(await book(42, TRIM_PT.classic));
    expect(odd.pages).toBe(42);
    const doc = await PDFDocument.load(odd.bytes);
    expect(doc.getPage(0).getSize()).toEqual({ width: 432, height: 648 });
  });
  it('places the front cover on the right of a paperback wrap', async () => {
    const pages = 120, spine = spineWidthPt(POD_PACKAGES.classic, pages);
    const width = 432 * 2 + spine + 18, height = 648 + 18;
    const { bytes, layout } = await buildCoverWrap(await book(3, TRIM_PT.classic), { pod: POD_PACKAGES.classic, interiorPages: pages, width, height, trim: TRIM_PT.classic });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getPage(0).getSize()).toEqual({ width, height });
    expect(layout.flap).toBe(0);
    expect(layout.frontX).toBeCloseTo(width - 9 - 432);
  });
  it('recognises dust-jacket flaps on the linen edition', () => {
    const pages = 200, spine = spineWidthPt(POD_PACKAGES.linen, pages), flap = 3.5 * 72;
    const width = 612 * 2 + spine + flap * 2 + 18, height = 792 + 18;
    const layout = coverLayout(POD_PACKAGES.linen, pages, width, height, TRIM_PT.linen);
    expect(layout.flap).toBeCloseTo(flap);
    expect(layout.frontX).toBeCloseTo(width - 9 - flap - 612);
    expect(layout.backX).toBeCloseTo(9 + flap);
  });
});
