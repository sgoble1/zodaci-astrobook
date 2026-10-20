/**
 * Lulu Print API rules shared by the lulu-print / lulu-webhook functions and unit tests.
 * Pure helpers only (no Deno or network APIs). Product codes, page limits and list prices
 * come from Lulu's published Print API spec sheet (dotted SKUs, live from 31 March 2026).
 */
export type LuluEnv = 'sandbox' | 'production';
export type PrintEdition = 'pocket' | 'classic' | 'signature' | 'linen';

/** Lulu product code (pod_package_id) per printed AstroBook version, matching src/lib/books.ts specifications. */
export const POD_PACKAGES: Record<PrintEdition, string> = {
  pocket: '0425X0687.FC.STD.PB.060UW444.GXX', // 4.25×6.875 pocketbook · standard color · perfect bound · 60# white · gloss
  classic: '0600X0900.FC.PRE.PB.080CW444.MXX', // 6×9 US trade · premium color · perfect bound · 80# coated white · matte
  signature: '0850X0850.FC.PRE.CW.080CW444.MXX', // 8.5×8.5 square · premium color · case wrap hardcover · matte
  linen: '0850X1100.FC.PRE.LW.080CW444.MNG', // 8.5×11 letter · premium color · navy linen wrap · gold foil spine
};
/** Trim size in print points (72 per inch). */
export const TRIM_PT: Record<PrintEdition, [number, number]> = { pocket: [306, 495], classic: [432, 648], signature: [612, 612], linen: [612, 792] };
/** Interior page limits from the spec sheet. */
export const PAGE_LIMITS: Record<PrintEdition, [number, number]> = { pocket: [32, 800], classic: [32, 800], signature: [24, 800], linen: [24, 800] };
/** Spec-sheet list print price per copy in US cents: base + per page (before shipping, fulfillment fee and tax). */
export const LIST_PRICE: Record<PrintEdition, { base: number; perPage: number }> = {
  pocket: { base: 199, perPage: 4.42 },
  classic: { base: 199, perPage: 13.89 },
  signature: { base: 1098, perPage: 21.48 },
  linen: { base: 1528, perPage: 21.48 },
};
export const SHIPPING_LEVELS = ['MAIL', 'PRIORITY_MAIL', 'GROUND', 'EXPEDITED', 'EXPRESS'] as const;
export type ShippingLevel = typeof SHIPPING_LEVELS[number];
export const DEFAULT_SHIPPING_LEVEL: ShippingLevel = 'GROUND';
/** Lulu holds new jobs this many minutes before production, leaving time to cancel a mistake. */
export const PRODUCTION_DELAY_MINUTES = 120;

export const PRE_PRODUCTION = ['CREATED', 'UNPAID', 'PAYMENT_IN_PROGRESS', 'PRODUCTION_DELAYED', 'PRODUCTION_READY'];
export const FAILED_STATUSES = ['FAILED', 'REJECTED', 'CANCELED', 'ERROR'];
/** Lulu only allows cancelling a job before it is paid. */
export const CANCELLABLE = ['CREATED', 'UNPAID'];

export const isPrintEdition = (e: string): e is PrintEdition => e in POD_PACKAGES;
export const isBindingHardcover = (pod: string) => /\.(CW|LW)\./.test(pod);
export const isLinen = (pod: string) => /\.LW\./.test(pod);

/** Interior pages: the reviewed manuscript minus its cover page, padded to an even count with one blank page when needed. */
export function interiorPageCount(manuscriptPages: number) {
  const inner = Math.max(0, manuscriptPages - 1);
  return inner % 2 ? inner + 1 : inner;
}
export function pageLimitError(edition: PrintEdition, pages: number): string | null {
  const [min, max] = PAGE_LIMITS[edition];
  if (pages < min) return `This book has ${pages} interior pages; Lulu needs at least ${min} for this version.`;
  if (pages > max) return `This book has ${pages} interior pages; Lulu prints at most ${max} for this version.`;
  return null;
}
export const listPriceCents = (edition: PrintEdition, pages: number) => Math.round(LIST_PRICE[edition].base + LIST_PRICE[edition].perPage * pages);

/** Spine width in points: Lulu's paperback formula, or the hardcover table, from the Lulu Book Creation Guide. */
export function spineWidthPt(pod: string, pages: number): number {
  if (!isBindingHardcover(pod)) return (pages / 444 + 0.06) * 72;
  const table: [number, number][] = [[84, .25], [140, .5], [168, .625], [194, .688], [222, .75], [250, .813], [278, .875], [306, .938], [334, 1], [360, 1.063], [388, 1.125], [416, 1.188], [444, 1.25], [472, 1.313], [500, 1.375]];
  const row = table.find(([max]) => pages <= max);
  return (row ? row[1] : 1.375 + Math.ceil((pages - 500) / 28) * .0625) * 72;
}

/**
 * Where the front cover sits inside Lulu's full cover file.
 * Layout is symmetric: [outer | (flap) | back | spine area | front | (flap) | outer]. Outer bleed/wrap equals the top/bottom margin.
 * A side remainder wider than one inch is a dust-jacket flap; a narrower one is the hardcover hinge, which belongs to the spine area.
 */
export function coverLayout(pod: string, pages: number, width: number, height: number, trim: [number, number]) {
  const [tw, th] = trim;
  const outer = (height - th) / 2;
  if (outer < 0 || width < tw * 2) throw new Error('Lulu cover dimensions are smaller than the trim size.');
  const spine = spineWidthPt(pod, pages);
  const extra = (width - tw * 2 - outer * 2 - spine) / 2;
  if (extra < -2) throw new Error('Lulu cover dimensions do not fit the calculated spine.');
  const flap = extra > 72 ? extra : 0;
  const frontX = width - outer - flap - tw;
  const backX = outer + flap;
  const spineX = (width - spine) / 2;
  return { outer, flap, spine, frontX, backX, spineX, trimW: tw, trimH: th };
}

/** Parse Lulu's decimal-string money into cents. */
export const decimalToCents = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

export type ShipTo = { name?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string; phone?: string };
/** Map a saved order address to Lulu's format. Never truncates: an address Lulu cannot accept is reported, not altered. */
export function luluAddress(a: ShipTo | null | undefined): { address?: Record<string, string>; error?: string } {
  if (!a) return { error: 'This order has no shipping address.' };
  const v = (s?: string) => (s ?? '').trim();
  const fields = { name: v(a.name), street1: v(a.line1), street2: v(a.line2), city: v(a.city), state_code: v(a.state).toUpperCase(), country_code: v(a.country).toUpperCase(), postcode: v(a.postal_code), phone_number: v(a.phone) };
  if (!fields.name || !fields.street1 || !fields.city || !fields.postcode || !fields.country_code) return { error: 'The shipping address is incomplete (name, street, city, ZIP and country are needed).' };
  if (fields.country_code !== 'US') return { error: 'AstroBook printing ships to US addresses only.' };
  if (!fields.state_code) return { error: 'The shipping address is missing its state.' };
  const limits: [keyof typeof fields, number, string][] = [['name', 35, 'Recipient name'], ['street1', 30, 'Street line 1'], ['street2', 30, 'Street line 2'], ['city', 30, 'City']];
  for (const [k, max, label] of limits) if (fields[k].length > max) return { error: `${label} is ${fields[k].length} characters; Lulu accepts at most ${max}. Send this order by hand in Lulu.` };
  if (fields.phone_number && !/^\+?[\d\s\-./()]{8,20}$/.test(fields.phone_number)) fields.phone_number = '';
  const address: Record<string, string> = Object.fromEntries(Object.entries(fields).filter(([, val]) => val !== ''));
  return { address };
}

/** Foil stamping on the linen spine accepts Roman characters only and at most 42 characters for title + author. */
export function foilText(name: string | null | undefined) {
  const title = 'AstroBook';
  const clean = (name ?? '').normalize('NFC').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  const roman = /^[A-Za-z0-9 \[\];',./!`^&*()~+=:?"\-ØŁÀ-ÖØ-öø-žˇ˘°´¨¸¯]+$/;
  let author = clean && roman.test(clean) ? clean : 'Zodaci';
  if (title.length + author.length > 42) author = author.slice(0, 42 - title.length).trim();
  return { foil_stamp_title_text: title, foil_stamp_author_text: author };
}

const CARRIERS: [RegExp, 'USPS' | 'UPS' | 'FedEx'][] = [[/fed\s*ex/i, 'FedEx'], [/\busps\b|postal service/i, 'USPS'], [/\bups\b/i, 'UPS']];
export const carrierFrom = (name: string | null | undefined) => CARRIERS.find(([re]) => re.test(name ?? ''))?.[1] ?? null;

// deno-lint-ignore no-explicit-any
type LuluJob = any;
export function trackingFrom(job: LuluJob) {
  for (const item of job?.line_items ?? []) {
    const m = item?.status?.messages ?? {};
    const urls: string[] = Array.isArray(m.tracking_urls) ? m.tracking_urls : Array.isArray(item?.tracking_urls) ? item.tracking_urls : [];
    const id = String(m.tracking_id ?? item?.tracking_id ?? '').trim();
    const carrier = String(m.carrier_name ?? item?.carrier_name ?? '').trim();
    if (id || urls.length) return { tracking_id: id.slice(0, 120), tracking_url: (urls[0] ?? '').slice(0, 500), carrier_name: carrier.slice(0, 60) };
  }
  return { tracking_id: '', tracking_url: '', carrier_name: '' };
}

const STAGES = ['paid', 'print_brief_sent', 'printing', 'quality_check', 'shipped', 'delivered'];
export type OrderPatch = { status: string; carrier?: string; tracking_number?: string; shipped_at?: string };
/**
 * Book order changes implied by a Lulu job status. Only real (production) jobs move an order; stages never go backwards,
 * except a rejected or cancelled job returns "Sent to printer" to "Paid" so the order is visibly waiting again.
 */
export function orderPatches(order: { status: string }, job: LuluJob, env: LuluEnv, today: string): { patches: OrderPatch[]; note?: string } {
  if (env !== 'production') return { patches: [] };
  const name = String(job?.status?.name ?? '');
  const at = STAGES.indexOf(order.status);
  if (at < 0) return { patches: [] };
  if (FAILED_STATUSES.includes(name)) return { patches: order.status === 'print_brief_sent' ? [{ status: 'paid' }] : [] };
  const forward = (s: string) => STAGES.indexOf(s) > at;
  if (PRE_PRODUCTION.includes(name)) return { patches: forward('print_brief_sent') ? [{ status: 'print_brief_sent' }] : [] };
  if (name === 'IN_PRODUCTION') return { patches: forward('printing') ? [{ status: 'printing' }] : [] };
  if (name === 'SHIPPED' || name === 'DELIVERED') {
    const t = trackingFrom(job); const carrier = carrierFrom(t.carrier_name);
    const changed = String(job?.status?.changed ?? '').slice(0, 10);
    const shipped_at = /^\d{4}-\d{2}-\d{2}$/.test(changed) && changed <= today ? changed : today;
    const patches: OrderPatch[] = [];
    if (forward('shipped')) {
      if (!carrier || !t.tracking_id) return { patches: [], note: `Lulu shipped this book${t.carrier_name ? ` with ${t.carrier_name}` : ''}; add the carrier and tracking on the Dispatch desk.` };
      patches.push({ status: 'shipped', carrier, tracking_number: t.tracking_id, shipped_at });
    }
    if (name === 'DELIVERED' && (forward('shipped') ? patches.length : forward('delivered'))) patches.push({ status: 'delivered' });
    return { patches };
  }
  return { patches: [] };
}

/** Flatten a Lulu error body ({field: [messages]} or {detail}) into one short admin-readable line. */
export function luluErrorText(body: unknown, fallback = 'Lulu did not accept the request.'): string {
  const parts: string[] = [];
  const walk = (v: unknown, path: string) => {
    if (parts.length > 6) return;
    if (typeof v === 'string') parts.push(path ? `${path}: ${v}` : v);
    else if (Array.isArray(v)) v.forEach(x => walk(x, path));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k === 'detail' || k === 'message' || k === 'errors' ? path : path ? `${path}.${k}` : k);
  };
  walk(body, '');
  const text = parts.join('; ').replace(/\s+/g, ' ').trim();
  return (text || fallback).slice(0, 500);
}
