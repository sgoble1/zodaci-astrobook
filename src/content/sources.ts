import { registerPrivateValue } from '@/lib/privateEditionStore';
export type BuiltInSource = { id:string; title:string; fileName:string; url:string; size:number; type:string; ext:string; usedIn:string };
export let BUILT_IN_SOURCES: BuiltInSource[] = [];
registerPrivateValue('sources','BUILT_IN_SOURCES', value => { BUILT_IN_SOURCES=value as BuiltInSource[] }, []);
export const fmtSize = (n?:number|null) => !n ? '' : n > 1e6 ? (n/1e6).toFixed(1)+' MB' : Math.round(n/1e3)+' KB';
