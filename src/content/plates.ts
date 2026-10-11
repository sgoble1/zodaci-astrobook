import { privateImage } from '@/content/privateAssets';
const NUM = ['', 'I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'];
export function withPlates(md:string):string { return md.replace(/^\|\s*Illustration ([IVX]+) — (.+?)\s*\|\s*\n\|---\|\s*$/gm, (all,num:string,rest:string) => {const n=NUM.indexOf(num);const url=privateImage('plates/plate-'+String(n).padStart(2,'0')+'.jpg');return url ? '!['+rest+']('+url+')' : all;}); }
