import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { composeManuscript } from '@/lib/bookManuscript';
import { computeChart } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import fontUrl from '@/assets/fonts/manuscript.ttf?url';

export function ManuscriptPreview({ birth, edition, extras, coverUrl, onReady }: { birth: MyBirth; edition:string; extras:string[]; coverUrl?:string; onReady:(file:{blob:Blob;pages:number})=>void }) {
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [preview,setPreview]=useState<{url:string;pages:number}|null>(null);
  return <section className="space-y-4 border-t border-border pt-6"><h2 className="text-2xl">Review your real manuscript</h2><p className="text-sm text-muted-foreground">Your four foundations, saved personal chapters, selected cover and numbered contents are composed into a PDF. The actual page count is shown before ordering; printer approval is still required.</p><Button variant="outline" disabled={busy || !coverUrl} onClick={async()=> {
    setBusy(true);setError('');
    try {
      const {data:user}=await supabase.auth.getUser();if(!user.user)throw new Error('Please sign in.');
      // Include every finished chart-based page (readings, timing, other systems, Masterbook) so the book is as complete as possible.
      const {data,error:err}=await supabase.from('generated_pages').select('title,content').eq('owner_id',user.user.id).eq('status','ready').order('section').order('created_at');
      if(err)throw err;
      const c=computeChart(toChartInput(birth));
      const chartFacts=[...c.bodies.map(b=>`${b.name}: ${b.sign} ${b.deg}°${String(b.min).padStart(2,'0')}′${birth.time&&b.house?` · house ${b.house}`:''}`),...c.aspects.map(a=>`${a.a} ${a.type} ${a.b} · orb ${a.orb.toFixed(2)}°`),...c.flags.map(f=>`Limitation: ${f.topic}: ${f.note}`)].join('\n\n');
      const fontBuffer: ArrayBuffer = await (await fetch(fontUrl)).arrayBuffer();
      const coverBuffer: ArrayBuffer | undefined = coverUrl ? await (await fetch(coverUrl)).arrayBuffer() : undefined;
      const result=await composeManuscript({name:birth.name,birthFacts:`${birth.date} · ${birth.time??'Time unknown'} · ${birth.placeLabel} · ${birth.tz} · ${birth.houseSystem}`,chartFacts,chapters:data??[],edition,extras,fontBytes:new Uint8Array(fontBuffer),cover:coverBuffer ? new Uint8Array(coverBuffer) : undefined});
      const blob=new Blob([result.bytes as BlobPart],{type:'application/pdf'});if(preview)URL.revokeObjectURL(preview.url);setPreview({url:URL.createObjectURL(blob),pages:result.pages});onReady({blob,pages:result.pages});
    }catch(e){setError(e instanceof Error?e.message:'Manuscript could not be composed.');}finally{setBusy(false);}
  }}><FileText />{busy?'Composing manuscript…':'Compose manuscript PDF'}</Button>{preview&&<div className="space-y-3"><p role="status">{preview.pages} pages composed · {edition==='expanded'?400:250}-page edition target. Additional writing may be needed before printing.</p><Button asChild variant="outline"><a href={preview.url} download="My-AstroBook-Manuscript.pdf"><Download />Download & review PDF</a></Button></div>}{error&&<p role="alert" className="text-destructive">{error} <a href="/my-masterbook" className="underline">My Masterbook</a></p>}</section>;
}