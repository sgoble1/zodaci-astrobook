import { registerPrivateValue } from '@/lib/privateEditionStore';
import { privateImage } from '@/content/privateAssets';
export let COMPENDIUM_ILLUSTRATIONS: { n:number; title:string; src:string }[]=[];
registerPrivateValue('privateAssets','illustrations', v => { COMPENDIUM_ILLUSTRATIONS=(v as typeof COMPENDIUM_ILLUSTRATIONS).map(item => ({ ...item, src: privateImage(item.src) })); }, []);
