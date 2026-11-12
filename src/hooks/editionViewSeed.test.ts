import { describe, it, expect } from 'vitest';
import { seedViewFromLastTab, ADMIN_EDITION_KEY } from './useAprilSpace';
const mem = () => { const m = new Map<string,string>(); return { getItem:(k:string)=>m.get(k)??null, setItem:(k:string,v:string)=>{m.set(k,v);}, removeItem:(k:string)=>{m.delete(k);} } as unknown as Storage; };
describe('view-as choice in new tabs', () => {
  it('copies the last chosen edition into a new tab', () => { const s=mem(),l=mem(); l.setItem(ADMIN_EDITION_KEY,'zac'); seedViewFromLastTab(s,l); expect(s.getItem(ADMIN_EDITION_KEY)).toBe('zac'); });
  it('keeps a tab’s own choice', () => { const s=mem(),l=mem(); s.setItem(ADMIN_EDITION_KEY,'april'); l.setItem(ADMIN_EDITION_KEY,'zac'); seedViewFromLastTab(s,l); expect(s.getItem(ADMIN_EDITION_KEY)).toBe('april'); });
  it('ignores unknown values', () => { const s=mem(),l=mem(); l.setItem(ADMIN_EDITION_KEY,'x'); seedViewFromLastTab(s,l); expect(s.getItem(ADMIN_EDITION_KEY)).toBeNull(); });
});
