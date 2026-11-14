import type { MyBirth } from '@/lib/myBirth';
import type { HouseSystem } from '@/lib/astro';

/** Who an AstroBook is written for. 'other' books use the recipient's own birth details, never the buyer's chart or readings. */
export type BookFor = { mode: 'me' | 'other'; recipientId: string; giftForMe: boolean; message: string; from: string; email: string };
export const BOOK_FOR_ME: BookFor = { mode: 'me', recipientId: '', giftForMe: false, message: '', from: '', email: '' };

type Person = { name: string; birth_date: string; birth_time: string | null; place_label: string; lat: number; lon: number; tz: string };

export const GIFT_MESSAGE_MAX = 500;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** The recipient as a chart subject (house system follows the buyer's choice, defaulting to Placidus). */
export function recipientBirth(p: Person, houseSystem: HouseSystem = 'placidus'): MyBirth {
  return { name: p.name, date: p.birth_date, time: p.birth_time, placeLabel: p.place_label, lat: p.lat, lon: p.lon, tz: p.tz, houseSystem, sex: null };
}

/** Whether this order is a gift at all (digital books for yourself are never gifts). */
export const isGift = (f: BookFor, digital: boolean) => f.mode === 'other' || (!digital && f.giftForMe);

/** Returns an error message, or null when the gift details are usable. */
export function validateGift(f: BookFor, recipient: Person | undefined, extras: string[]): string | null {
  if (f.message.length > GIFT_MESSAGE_MAX) return `Keep the gift note under ${GIFT_MESSAGE_MAX} characters.`;
  if (f.from.length > 80) return 'Keep the signature under 80 characters.';
  if (f.mode === 'me') return null;
  if (!recipient) return 'Choose who the book is for, or add them first.';
  if (extras.length) return 'Extra sections come from your own readings, so remove them for a gift written from someone else\'s chart.';
  const email = f.email.trim();
  if (email && (email.length > 254 || !EMAIL.test(email))) return 'Enter a valid email for the recipient, or leave it empty.';
  return null;
}

/** The book_orders columns for the gift (the database re-checks every rule). */
export function giftOrderFields(f: BookFor, recipient: Person | undefined, digital: boolean, houseSystem: HouseSystem) {
  const gift = isGift(f, digital);
  const other = f.mode === 'other' && recipient;
  return {
    gift,
    gift_message: gift ? f.message.trim() : '',
    recipient_name: other ? recipient.name.trim().slice(0, 80) : '',
    recipient_email: other ? f.email.trim() : '',
    recipient_birth: other ? { date: recipient.birth_date, time: recipient.birth_time, place_label: recipient.place_label, lat: recipient.lat, lon: recipient.lon, tz: recipient.tz, house_system: houseSystem } : null,
  };
}

/** The dedication page printed in the manuscript, if there is a note. */
export function dedicationFor(f: BookFor, digital: boolean, bookName: string) {
  if (!isGift(f, digital) || !f.message.trim()) return undefined;
  return { to: bookName, from: f.from.trim() || undefined, message: f.message.trim() };
}
