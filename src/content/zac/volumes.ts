/** Curatorial metadata only. All founder chapters remain in protected storage. */
export const ZAC_VOLUMES = [
  { id:'I', title:'Foundation & Ascendant', prompt:'What in this foundation is recognizable, and what needs checking against your actual experience?' },
  { id:'II', title:'The Lights & Inner Circles', prompt:'When do identity, emotional needs and your way of communicating support one another?' },
  { id:'III', title:'Desire, Drive & Structure', prompt:'What do you want, what effort can you sustain, and where is a clearer boundary needed?' },
  { id:'IV', title:'Outer Thresholds', prompt:'Which beliefs or habits are ready for review, without assuming that change must be dramatic?' },
  { id:'V', title:'Aspects & Geometry', prompt:'Choose one measured contact. What are the needs on both sides, and what practical compromise could you test?' },
  { id:'VI', title:'Workbooks & Integration', prompt:'What small action would make this reading useful, and how will you know whether it helped?' },
] as const;
export type CuratedChapter = { id:string; title:string; label:string; part:string };
export function zacVolume(e:CuratedChapter): typeof ZAC_VOLUMES[number]['id'] {
  const t=`${e.title} ${e.label}`;
  if(/workbook|integration|practice|exercise|reflection|journal|affirmation|prompt|ritual|modern life|career|family|relationship|numerolog|vedic|chinese|tradition|forecast|transit|timing|profection/i.test(t)) return 'VI';
  if(/aspect|square|trine|sextile|opposition|conjunction|geometry|harmonic|midpoint|tension/i.test(t)) return 'V';
  if(/jupiter|uranus|neptune|pluto|outer/i.test(t)) return 'IV';
  if(/venus|mars|saturn|desire|drive|structure/i.test(t)) return 'III';
  if(/sun|moon|mercury|lights|communication/i.test(t)) return 'II';
  if(/ascendant|rising|foundation|birth|natal|house|element|introduction|foreword/i.test(t)) return 'I';
  return 'VI'; // Remaining source systems and integration never disappear.
}
export function curateZac<T extends CuratedChapter>(entries:T[]) { return ZAC_VOLUMES.map(v=>({...v,entries:entries.filter(e=>zacVolume(e)===v.id)})); }