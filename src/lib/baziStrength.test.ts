import { describe,it,expect } from 'vitest';
import { baziStrength,HIDDEN_STEMS,seasonalWeights } from './bazi';
import type { PillarCalc } from './astro';
const pillar=(label:string,stem:string,branch:string,stemElement:string):PillarCalc=>({label,stem,branch,stemElement,branchElement:'Wood',romanized:'',animal:'',polarity:'Yang',confidence:'derived',note:''});
describe('disclosed seasonal hidden-stem model',()=>{
 it('expands all twelve branches with ranked qi',()=>{expect(Object.keys(HIDDEN_STEMS)).toHaveLength(12);expect(HIDDEN_STEMS['寅'].map(r=>[r.stem,r.weight])).toEqual([['甲',1],['丙',.5],['戊',.25]]);});
 it('uses the five declared spring multipliers',()=>expect(seasonalWeights('Wood')).toEqual({Wood:1.4,Fire:1.2,Earth:.6,Metal:.8,Water:1}));
 it('reports auditable concrete weighted totals for a synthetic arithmetic fixture',()=>{const r=baziStrength({bazi:[pillar('Year','甲','寅','Wood'),pillar('Month','壬','卯','Water'),pillar('Day','甲','子','Wood'),pillar('Hour','丙','午','Fire')]});r?.totals.forEach((x,i)=>expect(x.weight).toBeCloseTo([7,3,.45,0,2][i]));expect(r?.support).toBe(9);expect(r?.demand).toBeCloseTo(3.45);expect(r?.score).toBeCloseTo(9/12.45*100);expect(r?.partial).toBe(false);});
 it('never fabricates an unknown hour',()=>{const r=baziStrength({bazi:[pillar('Year','甲','寅','Wood'),pillar('Month','壬','卯','Water'),pillar('Day','甲','子','Wood')]});expect(r?.partial).toBe(true);expect(r?.contributions.some(x=>x.pillar==='Hour')).toBe(false);});
});