import { registerPrivateValue } from '@/lib/privateEditionStore';
export type TocEntry = { id:string; title:string; label?:string; part?:string; words?:number; sections?:string[] };
export let entries: TocEntry[] = [];
registerPrivateValue('masterbookToc','default', v => {entries=v as TocEntry[]}, []);
