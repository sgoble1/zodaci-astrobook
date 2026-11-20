import type { ChartResult } from './astro';
export const FIVE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
/** Visible stems/branches from the canonical solar-term calculator; never imply this count is a full strength model. */
export function baziBalance(chart: ChartResult) {
  const day = chart.bazi.find(p => p.label === 'Day');
  const counts = FIVE_ELEMENTS.map(element => ({ element, count: chart.elements[element] ?? 0 }));
  const total = counts.reduce((sum, e) => sum + e.count, 0);
  const index = FIVE_ELEMENTS.findIndex(e => e === day?.stemElement);
  const resource = index < 0 ? null : FIVE_ELEMENTS[(index + 4) % 5];
  const support = index < 0 ? 0 : (chart.elements[day?.stemElement ?? ''] ?? 0) + (resource ? chart.elements[resource] ?? 0 : 0);
  return { day, counts, total, resource, support, supportPercent: total ? support / total * 100 : 0, hourKnown: chart.bazi.some(p => p.label === 'Hour') };
}

export const BAZI_STRENGTH_VERSION = 'zodaci-seasonal-1';
/** Adopted hidden-stem table; qi ranks are not classical percentages. */
export const HIDDEN_STEMS: Record<string, { stem:string; element:typeof FIVE_ELEMENTS[number]; weight:number }[]> = {
  '子':[{stem:'癸',element:'Water',weight:1}],
  '丑':[{stem:'己',element:'Earth',weight:1},{stem:'癸',element:'Water',weight:.5},{stem:'辛',element:'Metal',weight:.25}],
  '寅':[{stem:'甲',element:'Wood',weight:1},{stem:'丙',element:'Fire',weight:.5},{stem:'戊',element:'Earth',weight:.25}],
  '卯':[{stem:'乙',element:'Wood',weight:1}],
  '辰':[{stem:'戊',element:'Earth',weight:1},{stem:'乙',element:'Wood',weight:.5},{stem:'癸',element:'Water',weight:.25}],
  '巳':[{stem:'丙',element:'Fire',weight:1},{stem:'戊',element:'Earth',weight:.5},{stem:'庚',element:'Metal',weight:.25}],
  '午':[{stem:'丁',element:'Fire',weight:1},{stem:'己',element:'Earth',weight:.5}],
  '未':[{stem:'己',element:'Earth',weight:1},{stem:'丁',element:'Fire',weight:.5},{stem:'乙',element:'Wood',weight:.25}],
  '申':[{stem:'庚',element:'Metal',weight:1},{stem:'壬',element:'Water',weight:.5},{stem:'戊',element:'Earth',weight:.25}],
  '酉':[{stem:'辛',element:'Metal',weight:1}],
  '戌':[{stem:'戊',element:'Earth',weight:1},{stem:'辛',element:'Metal',weight:.5},{stem:'丁',element:'Fire',weight:.25}],
  '亥':[{stem:'壬',element:'Water',weight:1},{stem:'甲',element:'Wood',weight:.5}],
};
/** 旺/相/休/囚/死 relative to month command; coefficients are disclosed product conventions. */
export function seasonalWeights(monthElement:string) {
  const i=FIVE_ELEMENTS.findIndex(e=>e===monthElement);if(i<0)throw new Error('Month element unavailable');
  return Object.fromEntries(FIVE_ELEMENTS.map((e,n)=>[e, n===i?1.4:n===(i+1)%5?1.2:n===(i+4)%5?1:n===(i+3)%5?.8:.6])) as Record<typeof FIVE_ELEMENTS[number],number>;
}
export function baziStrength(chart:Pick<ChartResult,'bazi'>) {
  const day=chart.bazi.find(p=>p.label==='Day');const month=chart.bazi.find(p=>p.label==='Month');if(!day||!month)return null;
  const command=HIDDEN_STEMS[month.branch]?.[0];if(!command)return null;const season=seasonalWeights(command.element);
  const contributions=chart.bazi.flatMap(p=>{const hidden=HIDDEN_STEMS[p.branch]??[];return [{pillar:p.label,stem:p.stem,element:p.stemElement as typeof FIVE_ELEMENTS[number],source:'Visible stem',base:1},...hidden.map((h,i)=>({pillar:p.label,stem:h.stem,element:h.element,source:`Hidden ${i===0?'main':i===1?'middle':'residual'} qi`,base:h.weight})),...(p.label==='Month'?[{pillar:p.label,stem:command.stem,element:command.element,source:'Month-command bonus',base:1}]:[])].map(r=>({...r,multiplier:season[r.element],weighted:r.base*season[r.element]}));});
  const totals=FIVE_ELEMENTS.map(element=>({element,weight:contributions.filter(r=>r.element===element).reduce((s,r)=>s+r.weighted,0)}));
  const di=FIVE_ELEMENTS.findIndex(e=>e===day.stemElement);if(di<0)return null;
  const at=(i:number)=>totals[(di+i)%5].weight;
  const groups={peer:at(0),resource:at(4),output:at(1),wealth:at(2),authority:at(3)};const support=groups.peer+groups.resource;const demand=groups.output+groups.wealth+groups.authority;const total=support+demand;const score=total?support/total*100:0;
  return {version:BAZI_STRENGTH_VERSION,command:command.element,totals,contributions,groups,support,demand,total,score,balance:score>=60?'Support-led':score<=40?'Demand-led':'Mixed support and demand',partial:!chart.bazi.some(p=>p.label==='Hour'),roots:chart.bazi.filter(p=>(HIDDEN_STEMS[p.branch]??[]).some(h=>h.element===day.stemElement)).map(p=>p.label)};
}