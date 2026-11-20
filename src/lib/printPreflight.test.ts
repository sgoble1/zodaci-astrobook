import { describe,it,expect } from 'vitest';
import { validateDropShip } from '../../supabase/functions/_shared/print-preflight-rules';
describe('drop-ship preflight',()=>{
 const order={status:'paid',environment:'live',payment_total_cents:8900,payment_hold:null,edition:'classic',pages:74,address:{name:'Test Reader',line1:'12 Orbit Way',city:'Austin',state:'TX',postal_code:'78701',country:'US',phone:'+1 512 555 0100'}};
 it('formats a validated one-copy print payload',()=>{const r=validateDropShip(order,'https://files.example/interior','https://files.example/cover',true);expect(r.ok).toBe(true);expect(r.payload?.line_items[0].quantity).toBe(1);expect(r.payload?.shipping_address?.country_code).toBe('US');});
 it('blocks production for sandbox, unpaid or held orders',()=>{expect(validateDropShip({...order,environment:'sandbox'},'https://x.test/a','https://x.test/b',true).ok).toBe(false);expect(validateDropShip({...order,status:'draft'},'https://x.test/a','https://x.test/b',false).ok).toBe(false);expect(validateDropShip({...order,payment_hold:'refund'},'https://x.test/a','https://x.test/b',true).ok).toBe(false);});
 it('rejects missing bleed-stage files or invalid addresses',()=>{expect(validateDropShip({...order,address:{}},'http://x.test/a','https://x.test/b',true).ok).toBe(false);});
});