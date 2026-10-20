import { describe, expect, it } from 'vitest';
import { manuscriptManifest, type SavedChapter } from './manuscriptManifest';
const row = (title: string, section = 'My Masterbook', updated_at = '2026-10-18T12:00:00Z'): SavedChapter => ({ title, section, updated_at, content: 'Saved reading', status: 'ready' });
describe('reviewed edition manifests', () => {
  it('standard includes Masterbook but not unrelated topics', () => expect(manuscriptManifest([row('Inner world'), row('Career', 'Topic Reading')], 'standard', [], null).map(r => r.title)).toEqual(['Inner world']));
  it('expanded includes additional saved topics', () => expect(manuscriptManifest([row('Inner world'), row('Career', 'Topic Reading')], 'expanded', [], null)).toHaveLength(2));
  it('does not sell the same content as expanded', () => expect(() => manuscriptManifest([row('Inner world')], 'expanded', [], null)).toThrow('none are finished yet'));
  it('excludes content older than the saved birth chart', () => expect(manuscriptManifest([row('Old', 'My Masterbook', '2026-10-17T12:00:00Z'), row('Current')], 'standard', [], '2026-10-18T00:00:00Z').map(r => r.title)).toEqual(['Current']));
  it('includes a selected extra once', () => expect(manuscriptManifest([row('Creativity', 'Topic Reading'), row('Creativity', 'My Masterbook')], 'standard', ['Creativity'], null)).toHaveLength(1));
  it('rejects an unfinished charged extra', () => expect(() => manuscriptManifest([row('Inner world')], 'standard', ['Creativity'], null)).toThrow('Finish the extra'));
});