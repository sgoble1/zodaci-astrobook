import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { sendAppEmail } from '../_shared/app-email.ts';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});if(req.method!=='POST')return json({error:'Method not allowed'},405);
 try{const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)return json({error:'Not configured'},503);const db=createClient(url,key);const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token)return json({error:'Sign in'},401);const {data:{user}}=await db.auth.getUser(token);if(!user)return json({error:'Sign in'},401);const {data:admin}=await db.rpc('has_role',{_user_id:user.id,_role:'admin'});if(!admin)return json({error:'Admin access required'},403);const p=z.object({issueId:z.string().uuid()}).strict().safeParse(await req.json().catch(()=>null));if(!p.success)return json({error:'Invalid issue'},400);
 const {data:i,error}=await db.from('comic_issues').select('id,user_id,subscription_id,status,title,issue_number').eq('id',p.data.issueId).maybeSingle();if(error)throw error;if(!i||!['approved','printing','shipped'].includes(i.status))return json({error:'Release this issue before notifying its reader'},409);
 const {data:s}=await db.from('comic_subscriptions').select('user_id,environment,status').eq('id',i.subscription_id).maybeSingle();if(!s||s.user_id!==i.user_id||s.environment!=='live')return json({error:'Only live issues can send a delivery notice'},409);
 const {data:r}=await db.auth.admin.getUserById(i.user_id);if(!r.user?.email||!r.user.email_confirmed_at)return json({error:'The recipient needs a verified account email'},409);
 const result=await sendAppEmail('comic-released',r.user.email,{idempotencyKey:`comic-released-${i.id}`,templateData:{issueNumber:i.issue_number,title:i.title}});if(!result.sent)return json({error:result.reason==='recipient_suppressed'?'The reader has opted out of app emails.':'Notice not sent. Try again later.'},result.reason==='recipient_suppressed'?409:502);return json({ok:true});
 }catch{return json({error:'The issue notice could not be sent'},500);}
});