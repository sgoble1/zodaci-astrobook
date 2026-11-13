import { describe, expect, it } from 'vitest';
import { ATTR, describeAttributes, detailsValid, lineKey, needsBirthDetails, toLineAttributes, validateDetails } from './shopifyCart';

const ok = { recipient: 'Maya', birthDate: '1990-06-15', birthTime: '08:30', birthCity: 'Chicago, IL' };
const today = new Date('2026-11-13T12:00:00Z');

describe('personalised shop items', () => {
  it('asks for birth details only on listings tagged personalized', () => {
    expect(needsBirthDetails({ tags: ['Catalog import', 'personalized'] })).toBe(true);
    expect(needsBirthDetails({ tags: ['Personalised'] })).toBe(true);
    // Issue #1 is the same fixed story for every reader.
    expect(needsBirthDetails({ tags: ['astrocomic', 'comic', 'pre-order', 'print'] })).toBe(false);
    expect(needsBirthDetails({ tags: ['sign:leo'] })).toBe(false);
  });
  it('rejects a future birth date and accepts today', () => {
    expect(validateDetails({ ...ok, birthDate: '2026-11-14' }, today).birthDate).toBeTruthy();
    expect(detailsValid({ ...ok, birthDate: '2026-11-13' }, today)).toBe(true);
  });
  it('allows an unknown birth time but not a malformed one', () => {
    expect(detailsValid({ ...ok, birthTime: '' }, today)).toBe(true);
    expect(validateDetails({ ...ok, birthTime: '25:00' }, today).birthTime).toBeTruthy();
  });
  it('requires a name and a city', () => {
    const e = validateDetails({ ...ok, recipient: ' ', birthCity: 'x' }, today);
    expect(e.recipient).toBeTruthy(); expect(e.birthCity).toBeTruthy();
  });
  it('sends the five fulfilment attributes, writing Unknown for a missing time', () => {
    const a = toLineAttributes({ ...ok, birthTime: '' }, 'Atomic Zodiac');
    expect(a.map(x => x.key)).toEqual([ATTR.recipient, ATTR.date, ATTR.time, ATTR.city, ATTR.format]);
    expect(a.find(x => x.key === ATTR.time)?.value).toBe('Unknown');
    expect(toLineAttributes(ok, 'Default Title').some(x => x.key === ATTR.format)).toBe(false);
  });
  it('keeps the same item for two different people as separate cart lines', () => {
    expect(lineKey('v1', toLineAttributes(ok))).not.toBe(lineKey('v1', toLineAttributes({ ...ok, recipient: 'Sam' })));
    expect(lineKey('v1')).toBe('v1');
  });
  it('summarises the recipient for the cart', () => {
    expect(describeAttributes(toLineAttributes(ok))).toMatch(/^For Maya · .*1990 · Chicago, IL$/);
  });
});
