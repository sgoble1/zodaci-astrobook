import type { ShopifyProduct } from '@/lib/shopify';

/**
 * Personalised shop items (any listing tagged "personalized") need the birth details of the person
 * they are drawn for. Those details travel with the Shopify cart line as underscore-prefixed attributes, which Shopify
 * keeps on the order for fulfilment but hides from the storefront checkout summary. Nothing else in the cart carries
 * personal data.
 */
export type CartAttribute = { key: string; value: string };
export type PersonalDetails = { recipient: string; birthDate: string; birthTime: string; birthCity: string };

export const ATTR = { recipient: '_RecipientName', date: '_BirthDate', time: '_BirthTime', city: '_BirthCity', format: '_Format' } as const;

export const EMPTY_DETAILS: PersonalDetails = { recipient: '', birthDate: '', birthTime: '', birthCity: '' };

/**
 * Whether a listing must collect birth details before it can be added to the cart. Only an explicit "personalized" tag
 * counts: shop listings such as AstroComic Issue #1 are the same fixed story for every reader, and chart-written
 * AstroBooks and monthly AstroComics are ordered through their own pages, not the shop cart.
 */
export function needsBirthDetails(p: Pick<ShopifyProduct['node'], 'tags'>): boolean {
  return (p.tags ?? []).some(t => /^personali[sz]ed$/i.test(t.trim()));
}

export type DetailErrors = Partial<Record<keyof PersonalDetails, string>>;

/** Same limits the order form shows; today is the latest allowed birth date. */
export function validateDetails(d: PersonalDetails, today = new Date()): DetailErrors {
  const e: DetailErrors = {};
  const name = d.recipient.trim();
  if (!name) e.recipient = 'Add the name to print.';
  else if (name.length > 60) e.recipient = 'Keep the name under 60 characters.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.birthDate)) e.birthDate = 'Add a birth date.';
  else {
    const t = Date.parse(`${d.birthDate}T00:00:00Z`);
    const max = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    if (Number.isNaN(t)) e.birthDate = 'That date doesn’t exist.';
    else if (t > max) e.birthDate = 'The birth date can’t be in the future.';
    else if (t < Date.UTC(1900, 0, 1)) e.birthDate = 'Use a date from 1900 onward.';
  }
  if (d.birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.birthTime)) e.birthTime = 'Use a time like 08:30, or leave it blank.';
  const city = d.birthCity.trim();
  if (city.length < 2) e.birthCity = 'Add the birth city.';
  else if (city.length > 80) e.birthCity = 'Keep the city under 80 characters.';
  return e;
}

export const detailsValid = (d: PersonalDetails, today?: Date) => Object.keys(validateDetails(d, today)).length === 0;

export function toLineAttributes(d: PersonalDetails, format?: string): CartAttribute[] {
  const out: CartAttribute[] = [
    { key: ATTR.recipient, value: d.recipient.trim() },
    { key: ATTR.date, value: d.birthDate },
    { key: ATTR.time, value: d.birthTime || 'Unknown' },
    { key: ATTR.city, value: d.birthCity.trim() },
  ];
  if (format && format !== 'Default Title') out.push({ key: ATTR.format, value: format });
  return out;
}

/** Cart identity: the same variant made for two different people is two separate lines. */
export function lineKey(variantId: string, attributes?: CartAttribute[]): string {
  if (!attributes?.length) return variantId;
  return `${variantId}|${[...attributes].sort((a, b) => a.key.localeCompare(b.key)).map(a => `${a.key}=${a.value}`).join('&')}`;
}

export const sameAttributes = (a: CartAttribute[] = [], b: CartAttribute[] = []) => lineKey('', a) === lineKey('', b);

/** A short, human summary for the cart ("For Maya · 15 Jun 1990 · Chicago"). */
export function describeAttributes(attrs?: CartAttribute[]): string | null {
  if (!attrs?.length) return null;
  const get = (k: string) => attrs.find(a => a.key === k)?.value;
  const name = get(ATTR.recipient); const date = get(ATTR.date); const city = get(ATTR.city);
  if (!name) return null;
  const when = date ? new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;
  return ['For ' + name, when, city].filter(Boolean).join(' · ');
}
