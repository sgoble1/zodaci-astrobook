import { describe, expect, it } from 'vitest';
import { STAFF_QUESTIONS } from './staffQuestions';
import { STAFF } from '@/lib/observatory';
import { PAVILION_TABS } from '@/components/shop/PavilionTabs';
describe('consult and pavilion registries', () => {
  it('every staff chip names a real staff member', () => { for (const g of STAFF_QUESTIONS) expect(STAFF[g.staff]).toBeDefined(); });
  it('pavilion keeps the old shop addresses', () => { expect(PAVILION_TABS.map(t => t.to)).toEqual(['/store', '/books', '/keepsakes']); });
});
