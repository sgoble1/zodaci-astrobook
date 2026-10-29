import { describe, expect, it } from 'vitest';
import { ADMIN_TAB_GROUPS, resolveAdminTab } from './adminTabs';

describe('admin tabs', () => {
  it('groups tabs as Content, Operations and Platform', () => expect(ADMIN_TAB_GROUPS.map(g => g.label)).toEqual(['Content', 'Operations', 'Platform']));
  it('opens Growth by default for admins', () => expect(resolveAdminTab(null, true)).toBe('growth'));
  it('opens Edit sections by default for members', () => expect(resolveAdminTab(null, false)).toBe('sections'));
  it('keeps the tab from the link', () => expect(resolveAdminTab('audit', true)).toBe('audit'));
  it('never opens an admin-only tab for a member', () => expect(resolveAdminTab('audit', false)).toBe('sections'));
  it('keeps the document upload panel admin-only as requested', () => {
    expect(ADMIN_TAB_GROUPS.flatMap(g => g.tabs).find(t => t.id === 'upload')?.adminOnly).toBe(true);
    expect(resolveAdminTab('upload', false)).toBe('sections');
    expect(resolveAdminTab('upload', true)).toBe('upload');
  });
  it('keeps the shop and AI tools admin-only', () => {
    for (const id of ['shop', 'studio']) { expect(resolveAdminTab(id, false)).toBe('sections'); expect(resolveAdminTab(id, true)).toBe(id); }
  });
  it('ignores unknown tabs', () => expect(resolveAdminTab('nope', true)).toBe('growth'));
});
