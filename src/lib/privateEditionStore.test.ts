import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearPrivateEdition, hydratePrivateEdition, registerPrivateValue } from './privateEditionStore';

afterEach(clearPrivateEdition);

describe('authorized private archive hydration', () => {
  it('restores workbook questions when a lazy module registers after loading', () => {
    hydratePrivateEdition({ workbook: { ALL_QUESTIONS: [{ key: 'saved-question' }] } });
    const set = vi.fn();
    registerPrivateValue('workbook', 'ALL_QUESTIONS', set, []);
    expect(set).toHaveBeenCalledWith([{ key: 'saved-question' }]);
  });
  it('revives topic matchers for late-loaded categories', () => {
    hydratePrivateEdition({ lateTopics: { chapters: { __regex: 'moon', flags: 'i' } } });
    const set = vi.fn();
    registerPrivateValue('lateTopics', 'chapters', set, null);
    expect(set.mock.calls[0][0].test('Moon')).toBe(true);
  });
  it('never exposes the previous account archive after clearing', () => {
    hydratePrivateEdition({ previousAccount: { chapters: ['private'] } });
    clearPrivateEdition();
    const set = vi.fn();
    registerPrivateValue('previousAccount', 'chapters', set, []);
    expect(set).not.toHaveBeenCalled();
  });
  it('clears registered values and replaces content on an account change', () => {
    const set = vi.fn();
    registerPrivateValue('accountSwitch', 'chapters', set, []);
    hydratePrivateEdition({ accountSwitch: { chapters: ['first'] } });
    clearPrivateEdition();
    expect(set).toHaveBeenLastCalledWith([]);
    hydratePrivateEdition({ accountSwitch: { chapters: ['second'] } });
    expect(set).toHaveBeenLastCalledWith(['second']);
  });
});