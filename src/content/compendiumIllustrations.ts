import { registerPrivateValue } from '@/lib/privateEditionStore';
export let COMPENDIUM_ILLUSTRATIONS: { n:number; title:string; src:string }[]=[];
registerPrivateValue('privateAssets','illustrations', v => { COMPENDIUM_ILLUSTRATIONS=v as typeof COMPENDIUM_ILLUSTRATIONS }, []);
