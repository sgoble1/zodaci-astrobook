import { registerPrivateValue } from '@/lib/privateEditionStore';
let images: Record<string, string> = {};
registerPrivateValue('privateAssets', 'images', value => { images = value as Record<string, string>; }, {});
export const privateImage = (key: string) => images[key] ?? '';