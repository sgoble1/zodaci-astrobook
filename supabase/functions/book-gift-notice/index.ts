// Sends the gift notice for a paid AstroBook written for someone else. Only the buyer can send it, once, when they choose.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { sendAppEmail } from '../_shared/app-email.ts';
import { verifiedGiftPurchase } from './rules.ts';
import { giftToken, hashGiftToken } from '../_shared/gift-claim-rules.ts';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const EDITION: Record<string, string> = { digital: 'Digital', pocket: 'Pocket', classic: 'Classic', signature: 'Signature', linen: "Collector's Linen" };

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Service unavailable');
    const db = createClient(url, key);
    const token = req.headers.get('Authorization')?.replace(/^Bearer /, '');
    if (!token) return json({ error: 'Please sign in.' }, 401);
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return json({ error: 'Please sign in.' }, 401);
    const body = z.object({ orderId: z.string().uuid() }).strict().safeParse(await req.json().catch(() => null));
    if (!body.success) return json({ error: 'Invalid order.' }, 400);
    const { data: order, error } = await db.from('book_orders').select('*').eq('id', body.data.orderId).eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!order) return json({ error: 'Order unavailable.' }, 404);
    if (!order.gift || !order.recipient_email) return json({ error: 'This order has no recipient email.' }, 409);
    if (!verifiedGiftPurchase(order)) return json({ error: 'The gift notice can be sent once live payment is verified.' }, 409);
    if (order.recipient_notified_at) return json({ ok: true, alreadySent: true, sentAt: order.recipient_notified_at });
    if (order.environment !== 'live') return json({ error: 'Gift notices are sent only for live paid gifts.' }, 409);
    const signing = Deno.env.get('GIFT_CLAIM_SIGNING_SECRET');
    if (!signing) return json({ error: 'Gift links are not configured yet.' }, 503);
    const claimToken = await giftToken(order.id, signing);
    const {data:existingClaim,error:existingError}=await db.from('book_gift_claims').select('revoked_at,claimed_at,expires_at').eq('order_id',order.id).maybeSingle();
    if(existingError)throw existingError;
    if(existingClaim?.revoked_at)return json({error:'This gift link has been revoked.'},409);
    if(existingClaim&&!existingClaim.claimed_at&&Date.parse(existingClaim.expires_at)<=Date.now()){
      const {error:renewError}=await db.from('book_gift_claims').update({expires_at:new Date(Date.now()+90*864e5).toISOString()}).eq('order_id',order.id).is('claimed_at',null).is('revoked_at',null);
      if(renewError)throw renewError;
    }
    const { error: claimError } = await db.from('book_gift_claims').upsert({ order_id: order.id, token_hash: await hashGiftToken(claimToken), expires_at: new Date(Date.now() + 90 * 864e5).toISOString() }, { onConflict: 'order_id', ignoreDuplicates: true });
    if (claimError) throw claimError;
    const { data: profile } = await db.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
    const recipient = z.string().trim().email().max(254).safeParse(order.recipient_email);
    if (!recipient.success) return json({ error: 'The recipient email is invalid.' }, 409);
    const r = await sendAppEmail('book-gift', recipient.data, {
      idempotencyKey: `book-gift-${order.id}`,
      templateData: { recipientName: order.recipient_name, senderName: (profile?.display_name || '').slice(0, 80), edition: EDITION[order.edition] ?? '', digital: order.format === 'digital', message: order.gift_message, claimUrl: `https://zodaci.com/gift/${claimToken}` },
    });
    if (!r.sent) return json({ error: r.reason === 'recipient_suppressed' ? 'That address has opted out of Zodaci emails, so the notice was not sent.' : 'The notice could not be sent. Please try again later.' }, r.reason === 'recipient_suppressed' ? 409 : 502);
    const sentAt = new Date().toISOString();
    const { error: updateError } = await db.from('book_orders').update({ recipient_notified_at: sentAt }).eq('id', order.id).is('recipient_notified_at', null);
    if (updateError) throw updateError;
    return json({ ok: true, sentAt });
  } catch (e) {
    console.error('book-gift-notice', e instanceof Error ? e.message : e);
    return json({ error: 'The notice could not be sent. Please try again later.' }, 500);
  }
});
