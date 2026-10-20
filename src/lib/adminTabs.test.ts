import { describe, expect, it } from 'vitest';
import { ADMIN_TAB_GROUPS, resolveAdminTab } from './adminTabs';

describe('admin tabs', () => {
  it('groups tabs as Content, Operations and Platform', () => expect(ADMIN_TAB_GROUPS.map(g => g.label)).toEqual(['Content', 'Operations', 'Platform']));
  it('opens Growth by default for admins', () => expect(resolveAdminTab(null, true)).toBe('growth'));
  it('opens Upload by default for members', () => expect(resolveAdminTab(null, false)).toBe('upload'));
  it('keeps the tab from the link', () => expect(resolveAdminTab('audit', true)).toBe('audit'));
  it('never opens an admin-only tab for a member', () => expect(resolveAdminTab('audit', false)).toBe('upload'));
  it('ignores unknown tabs', () => expect(resolveAdminTab('nope', true)).toBe('growth'));
});
