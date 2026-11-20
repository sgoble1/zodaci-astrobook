import { luluAddress, POD_PACKAGES, pageLimitError, type PrintEdition } from './lulu-rules.ts';
export function validateDropShip(order:{status:string;environment:string;payment_total_cents:number|null;payment_hold:string|null;edition:string;pages:number;address:Record<string,string>},interior:string,cover:string,production:boolean){
 const errors:string[]=[];const edition=order.edition as PrintEdition;if(!(edition in POD_PACKAGES))errors.push('Unknown print edition');else{const err=pageLimitError(edition,order.pages);if(err)errors.push(err);}
 if(!['paid','print_brief_sent','printing','quality_check'].includes(order.status)||order.payment_total_cents===null||order.payment_hold)errors.push('Verified unheld payment is required');if(production&&order.environment!=='live')errors.push('Sandbox orders cannot enter production');
 for(const link of [interior,cover]){try{const url=new URL(link);if(url.protocol!=='https:'||url.username||url.password)errors.push('Print files require secure signed HTTPS links');}catch{errors.push('Print file link invalid');}}
 const ship=luluAddress(order.address);if(ship.error)errors.push(ship.error);
 return {ok:errors.length===0,errors,payload:errors.length?null:{shipping_address:ship.address,line_items:[{quantity:1,printable_normalization:{pod_package_id:POD_PACKAGES[edition],interior:{source_url:interior},cover:{source_url:cover}}}]}};
}