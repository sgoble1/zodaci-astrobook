import { describe,expect,it } from 'vitest';
import { HOUSE_BLOCKS,SIGN_BLOCKS,ASPECT_BLOCKS } from '@/content/placements/blocks';
import { deterministicReadings } from './deterministicReadings';
import { curateZac } from '@/content/zac/volumes';
import { computeChart } from './astro';
describe('public deterministic chapters',()=>{
  it('covers the specified 120 sign + 120 house + 40 aspect matrix',()=>{expect(Object.keys(SIGN_BLOCKS)).toHaveLength(120);expect(Object.keys(HOUSE_BLOCKS)).toHaveLength(120);expect(Object.keys(ASPECT_BLOCKS)).toHaveLength(40);});
  it('assembles ten chart-specific chapters without changing chart math',()=>{const c=computeChart({date:'2000-01-01',time:'12:00',tz:'UTC',lat:0,lon:0,placeLabel:'Greenwich',placeSource:'manual'});const before=JSON.stringify(c);for(const tone of ['oracle','educational','professional'] as const){const r=deterministicReadings(c,tone);expect(r).toHaveLength(10);expect(r[0].text).toContain('Capricorn');expect(r[0].text).toContain('Closest measured contact:');}expect(JSON.stringify(c)).toBe(before);});
  it('does not invent untimed houses or Moon certainty',()=>{const c=computeChart({date:'2000-01-01',time:null,tz:'UTC',lat:0,lon:0,placeLabel:'Greenwich',placeSource:'manual'});const r=deterministicReadings(c);expect(r.find(x=>x.key==='moon')?.text).toContain('Moon provisional');expect(r.map(x=>x.text).join('\n')).not.toMatch(/house \d/);});
  it('curates all 198 entries exactly once without rewriting originals',()=>{const e=Array.from({length:198},(_,i)=>({id:`zac-${i}`,title:i%2?'Sun':'World traditions',label:'',part:'Original'}));const before=JSON.stringify(e);const grouped=curateZac(e).flatMap(v=>v.entries);expect(grouped).toHaveLength(198);expect(new Set(grouped.map(x=>x.id)).size).toBe(198);expect(JSON.stringify(e)).toBe(before);});
});