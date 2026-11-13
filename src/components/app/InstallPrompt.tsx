import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KEY = 'zodaci-install-dismissed';
type BIP = Event & { prompt: () => Promise<void> };

/** Phone-only "add Zodaci to your home screen" note. Uses the existing manifest; no offline caching. Dismissal is remembered per device. */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (localStorage.getItem(KEY) || window.matchMedia('(display-mode: standalone)').matches || window.self !== window.top) return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const onBip = (e: Event) => { e.preventDefault(); setEvt(e as BIP); setOpen(true); };
    window.addEventListener('beforeinstallprompt', onBip);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const t = isIos ? window.setTimeout(() => { setIos(true); setOpen(true); }, 20000) : 0;
    return () => { window.removeEventListener('beforeinstallprompt', onBip); clearTimeout(t); };
  }, []);
  if (!open) return null;
  const close = () => { localStorage.setItem(KEY, '1'); setOpen(false); };
  return (
    <div role="dialog" aria-label="Add Zodaci to your home screen" className="obs-panel fixed inset-x-3 bottom-20 z-50 flex items-start gap-3 bg-card p-4 text-sm shadow-lg md:hidden">
      <div className="flex-1 space-y-2">
        <p className="font-medium">Keep Zodaci on your home screen</p>
        <p className="text-muted-foreground">{ios ? 'Tap the Share button, then “Add to Home Screen”.' : 'Open your chart with one tap, like an app.'}</p>
        {evt && <Button size="sm" variant="primary" onClick={async () => { await evt.prompt(); close(); }}>Add to home screen</Button>}
      </div>
      <button type="button" onClick={close} aria-label="Not now" className="p-1 text-muted-foreground"><X className="h-4 w-4" /></button>
    </div>
  );
}
