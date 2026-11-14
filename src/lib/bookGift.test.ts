import { describe, it, expect } from 'vitest';
import { BOOK_FOR_ME, giftOrderFields, isGift, validateGift, dedicationFor, recipientBirth } from '@/lib/bookGift';

const jo = { name: 'Jo', birth_date: '1990-06-01', birth_time: null, place_label: 'Austin, Texas', lat: 30.27, lon: -97.74, tz: 'America/Chicago' };

describe('AstroBook gifts', () => {
  it('a book for someone else is always a gift, written from their birth details', () => {
    const f = { ...BOOK_FOR_ME, mode: 'other' as const, recipientId: 'x', email: 'jo@example.com', message: 'Happy birthday' };
    const cols = giftOrderFields(f, jo, true, 'placidus');
    expect(cols.gift).toBe(true);
    expect(cols.recipient_name).toBe('Jo');
    expect(cols.recipient_birth).toMatchObject({ date: '1990-06-01', time: null, tz: 'America/Chicago' });
    expect(recipientBirth(jo).name).toBe('Jo');
  });
  it('a digital book for yourself is never a gift', () => {
    expect(isGift({ ...BOOK_FOR_ME, giftForMe: true }, true)).toBe(false);
    expect(giftOrderFields({ ...BOOK_FOR_ME, giftForMe: true, message: 'hi' }, undefined, true, 'placidus').gift_message).toBe('');
  });
  it('rejects extra sections, a missing recipient, bad emails and notes over 500 characters', () => {
    const other = { ...BOOK_FOR_ME, mode: 'other' as const };
    expect(validateGift(other, undefined, [])).toMatch(/Choose who/);
    expect(validateGift(other, jo, ['Career'])).toMatch(/Extra sections/);
    expect(validateGift({ ...other, email: 'nope' }, jo, [])).toMatch(/valid email/);
    expect(validateGift({ ...other, message: 'x'.repeat(501) }, jo, [])).toMatch(/500/);
    expect(validateGift({ ...other, email: 'jo@example.com' }, jo, [])).toBeNull();
  });
  it('prints a dedication only when there is a note', () => {
    expect(dedicationFor({ ...BOOK_FOR_ME, mode: 'other', message: '  ' }, false, 'Jo')).toBeUndefined();
    expect(dedicationFor({ ...BOOK_FOR_ME, mode: 'other', message: 'For you', from: 'Sam' }, false, 'Jo')).toEqual({ to: 'Jo', from: 'Sam', message: 'For you' });
  });
});
