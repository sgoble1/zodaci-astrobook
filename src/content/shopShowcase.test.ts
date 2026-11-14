import { describe, it, expect } from 'vitest';
import { orderDepartments, SHOP_DEPARTMENTS } from './shopShowcase';
describe('admin shop layout', () => {
  it('puts chosen departments first in the chosen order', () => { expect(orderDepartments(['books', 'mugs']).slice(0, 2).map(d => d.id)).toEqual(['books', 'mugs']); });
  it('keeps every department and ignores unknown ids', () => { const o = orderDepartments(['nope', 'tees']); expect(o).toHaveLength(SHOP_DEPARTMENTS.length); expect(o[0].id).toBe('tees'); });
  it('empty order keeps the default', () => { expect(orderDepartments([]).map(d => d.id)).toEqual(SHOP_DEPARTMENTS.map(d => d.id)); });
});
