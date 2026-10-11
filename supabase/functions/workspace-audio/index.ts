import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)return json({error:'Audio is not configured'},500);
 const admin=createClient(url,key);const {data:{user}}=await admin.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ',''));if(!user)return json({error:'Sign in first'},401);
 const body=z.object({itemId:z.string().uuid()}).safeParse(await req.json().catch(()=>null));if(!body.success)return json({error:'Invalid episode'},400);
 const {data:item}=await admin.from('library_items').select('owner_id,workspace_id,file_path,kind').eq('id',body.data.itemId).maybeSingle();if(!item||item.kind!=='podcast')return json({error:'Episode unavailable'},404);
 if(item.owner_id!==user.id){if(!item.workspace_id)return json({error:'Episode unavailable'},404);const {data:member}=await admin.from('space_members').select('user_id').eq('space_id',item.workspace_id).eq('user_id',user.id).maybeSingle();if(!member)return json({error:'Episode unavailable'},404);}
 const signed=await admin.storage.from('library').createSignedUrl(item.file_path,300);if(signed.error)return json({error:'Audio unavailable'},500);return json({url:signed.data.signedUrl});
});