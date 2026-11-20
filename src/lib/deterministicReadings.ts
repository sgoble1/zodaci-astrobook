import { fmtLon, type ChartResult } from './astro';
import type { Tone } from './perception';
import { ASPECT_BLOCKS, aspectFallback, HOUSE_BLOCKS, PLANET_VOICES, SIGN_BLOCKS, type EditorialPlanet } from '@/content/placements/blocks';
export function deterministicPlanet(chart: ChartResult, key: string, tone: Tone = 'oracle'): string {
  const b=chart.bodies.find(b=>b.key===key); const voice=PLANET_VOICES[key as EditorialPlanet]; if(!b||!voice) return '';
  const timed=Boolean(chart.input.time); const closest=chart.aspects.filter(a=>(a.a===b.name||a.b===b.name)&& (timed || (a.a!=='Moon'&&a.b!=='Moon'))).sort((a,b)=>a.orb-b.orb)[0];
  const parts=[`${b.name}: ${fmtLon(b.lon).text}${timed&&b.house?`, house ${b.house}`:''}.`, SIGN_BLOCKS[`${key}:${b.sign}`]];
  if(!timed&&b.key==='moon') parts.unshift('Moon provisional: this position uses local noon. A different birth time may change its degree, sign and contacts; read the following as a possibility, not a settled placement.');
  if(timed&&b.house) parts.push(HOUSE_BLOCKS[`${key}:${b.house}`]);
  if(closest) { const other=closest.a===b.name?closest.b:closest.a;const ok=Object.entries(PLANET_VOICES).find(([,p])=>p.name===other)?.[0]; const block=ok?(ASPECT_BLOCKS[`${key}:${ok}:${closest.type}`]??ASPECT_BLOCKS[`${ok}:${key}:${closest.type}`]):null;parts.push(`Closest measured contact: ${b.name} ${closest.type.toLowerCase()} ${other}, orb ${closest.orb.toFixed(2)}°. ${block??`This ${closest.type.toLowerCase()} ${aspectFallback(closest.type)}. Treat the contact as a question about balancing these functions, not a report of an event.`}`); }
  if(b.retro&&!['sun','moon'].includes(b.key)) parts.push(`${b.name} was retrograde at birth. In this symbolic tradition, its ${voice.subject} may be approached through review or private rehearsal; that does not establish a delay, deficit or life history.`);
  if(tone==='educational') parts.unshift('Study note: the sign describes manner, the house describes arena and the aspect describes a relationship between chart functions. Keep these layers distinct before synthesizing them.');
  if(tone==='professional') parts.unshift('Practitioner note: this delineation records calculated geometry and separates interpretive hypotheses from biographical evidence. Verify relevance with the reader.');
  return parts.filter(Boolean).join('\n\n');
}
export function deterministicReadings(chart: ChartResult,tone:Tone='oracle') { return Object.entries(PLANET_VOICES).map(([key,p])=>({key,title:p.name,text:deterministicPlanet(chart,key,tone)})).filter(r=>r.text); }