import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { giftBirthSchema,giftShippingSchema,hashGiftToken } from '../_shared/gift-claim-rules.ts';
import { isPaidBook } from '../_shared/book-delivery-rules.ts';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});if(req.method!=='POST')return json({error:'Method not allowed'},405);
  try{
    const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),anon=Deno.env.get('SUPABASE_ANON_KEY');if(!url||!key||!anon)return json({error:'Gift service unavailable.'},503);
    const authorization=req.headers.get('Authorization');if(!authorization)return json({error:'Sign in with the email address this gift was sent to.'},401);
    const admin=createClient(url,key);const {data:{user},error:authError}=await admin.auth.getUser(authorization.replace(/^Bearer /,''));if(authError||!user)return json({error:'Sign in to claim this gift.'},401);if(!user.email_confirmed_at)return json({error:'Verify your email before claiming.'},403);
    const raw=await req.text();if(raw.length>12000)return json({error:'Gift details are too long.'},413);
    const parsed=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),action:z.enum(['inspect','claim']),birth:giftBirthSchema.optional(),shipping:giftShippingSchema.optional()}).strict().safeParse(JSON.parse(raw));if(!parsed.success)return json({error:'Check your birth details, time zone and shipping address.'},400);
    const hash=await hashGiftToken(parsed.data.token);const {data:c,error}=await admin.from('book_gift_claims').select('order_id,expires_at,revoked_at,recipient_id,claimed_at,recipient_birth,shipping_address').eq('token_hash',hash).maybeSingle();if(error)throw error;
    if(!c||c.revoked_at)return json({error:'This gift link is unavailable. Ask the sender to check it.'},404);
    const {data:o,error:oe}=await admin.from('book_orders').select('id,gift,recipient_email,recipient_name,edition,format,status,payment_total_cents,payment_hold,environment,gift_message').eq('id',c.order_id).single();if(oe)throw oe;
    if(!o.gift||o.recipient_email.toLowerCase()!==user.email?.toLowerCase()||!isPaidBook(o)||o.environment!=='live')return json({error:'This gift is not available to this account.'},403);
    if(c.recipient_id&&c.recipient_id!==user.id)return json({error:'This gift has already been claimed.'},409);
    if(!c.claimed_at&&Date.parse(c.expires_at)<=Date.now())return json({error:'This gift link has expired. Ask the sender to check it.'},410);
    if(parsed.data.action==='inspect')return json({ok:true,edition:o.edition,format:o.format,name:o.recipient_name,message:o.gift_message,claimed:Boolean(c.claimed_at),birth:c.recipient_id===user.id?c.recipient_birth:null,shipping:c.recipient_id===user.id?c.shipping_address:null});
    if(!parsed.data.birth||(o.format!=='digital'&&!parsed.data.shipping))return json({error:'Complete your birth details and required shipping address.'},400);
    const client=createClient(url,anon,{global:{headers:{Authorization:authorization}}});const r=await client.rpc('claim_book_gift',{_token_hash:hash,_birth:parsed.data.birth,_shipping:parsed.data.shipping??{}});if(r.error)return json({error:'This gift could not be claimed. Check the details or reopen your gift.'},409);return json({ok:true,gift:r.data?.[0]});
  }catch{return json({error:'Your gift could not open. Try again.'},500);}
});