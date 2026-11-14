// Sends the gift notice for a paid AstroBook written for someone else. Only the buyer can send it, once, when they choose.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { sendAppEmail } from '../_shared/app-email.ts';
import { isPaidBook } from '../_shared/book-delivery-rules.ts';

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
    if (!isPaidBook(order) || order.payment_hold) return json({ error: 'The gift notice can be sent once payment is confirmed.' }, 409);
    if (order.recipient_notified_at) return json({ ok: true, alreadySent: true, sentAt: order.recipient_notified_at });
    const { data: profile } = await db.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
    const r = await sendAppEmail('book-gift', order.recipient_email, {
      idempotencyKey: `book-gift-${order.id}`,
      templateData: { recipientName: order.recipient_name, senderName: (profile?.display_name || '').slice(0, 80), edition: EDITION[order.edition] ?? '', digital: order.format === 'digital', message: order.gift_message },
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
