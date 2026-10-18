import { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function OrderPdfDownload({ orderId }: { orderId: string }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false); setBlob(null);
    void (async () => {
      try {
        const { data, error: failure } = await supabase.functions.invoke('book-order-pdf', { body: { orderId } });
        if (failure || typeof data?.url !== 'string') throw new Error('Unavailable');
        const response = await fetch(data.url);
        if (!response.ok) throw new Error('Unavailable');
        const file = await response.blob();
        if (!file.size || !file.type.includes('pdf')) throw new Error('Invalid PDF');
        if (active) setBlob(file);
      } catch { if (active) setError(true); }
    })();
    return () => { active = false; };
  }, [orderId, retry]);
  const download = async () => {
    if (!blob) return;
    const filename = `AstroBook-${orderId.slice(0, 8)}.pdf`;
    const file = new File([blob], filename, { type: 'application/pdf' });
    if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: filename }); return; }
      catch (e) { if (e instanceof DOMException && e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };
  if (error) return <div className="flex flex-wrap items-center gap-2"><span role="alert" className="text-sm text-destructive">Couldn’t load your PDF.</span><Button variant="outline" size="sm" onClick={() => setRetry(n => n + 1)}><RefreshCw />Retry PDF</Button></div>;
  return <Button variant="outline" disabled={!blob} onClick={() => void download()}><Download />{blob ? 'Download printable PDF' : 'Preparing your PDF…'}</Button>;
}