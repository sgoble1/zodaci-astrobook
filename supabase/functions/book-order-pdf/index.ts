import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { finalizeBookPdf } from '../_shared/book-delivery.ts';
import { isPaidBook } from '../_shared/book-delivery-rules.ts';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  try {
    const url=Deno.env.get('SUPABASE_URL'), key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url || !key) throw new Error('Service unavailable');
    const db=createClient(url,key);
    const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');
    if(!token) return json({error:'Please sign in.'},401);
    const {data:{user},error:authError}=await db.auth.getUser(token);
    if(authError || !user) return json({error:'Please sign in.'},401);
    const body=z.object({orderId:z.string().uuid()}).strict().safeParse(await req.json().catch(()=>null));
    if(!body.success) return json({error:'Invalid order.'},400);
    const {data:order,error}=await db.from('book_orders').select('*').eq('id',body.data.orderId).single();
    if(error || !order) return json({error:'Order unavailable.'},404);
    if(order.user_id!==user.id){
      const {data:admin,error:roleError}=await db.rpc('has_role',{_user_id:user.id,_role:'admin'});
      if(roleError || !admin) return json({error:'Order unavailable.'},404);
    }
    if(!isPaidBook(order)) return json({error:'Your final PDF is available after payment confirmation.'},409);
    const path=await finalizeBookPdf(db,order);
    const signed=await db.storage.from('book-orders').createSignedUrl(path,60,{download:`AstroBook-${order.id.slice(0,8)}.pdf`});
    if(signed.error) throw signed.error;
    return json({url:signed.data.signedUrl});
  }catch{return json({error:'Your PDF could not be prepared. Please retry.'},500);}
});
