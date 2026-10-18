import {describe,it,expect} from 'vitest';
import {isPaidBook,bookPdfPath} from '../../supabase/functions/_shared/book-delivery-rules';
describe('paid PDF delivery',()=>{
  it('rejects unpaid orders',()=>{
    expect(isPaidBook({status:'awaiting_payment',payment_total_cents:null})).toBe(false);
    expect(isPaidBook({status:'paid',payment_total_cents:null})).toBe(false);
  });
  it('allows verified paid orders throughout fulfillment',()=>{
    for(const status of ['paid','printing','shipped','delivered']) expect(isPaidBook({status,payment_total_cents:5900})).toBe(true);
    expect(isPaidBook({status:'canceled',payment_total_cents:5900})).toBe(false);
  });
  it('isolates order snapshots from final files',()=>{
    expect(bookPdfPath('user','order-a')).toBe('user/order-a/reviewed.pdf');
    expect(bookPdfPath('user','order-a',true)).toBe('user/order-a/AstroBook.pdf');
    expect(bookPdfPath('user','order-b',true)).not.toBe(bookPdfPath('user','order-a',true));
  });
});
