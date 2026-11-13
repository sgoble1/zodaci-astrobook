import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useLibrary';
import { tourSteps } from '@/content/welcomeTour';

const KEY = 'zodaci-welcome-tour-v1';
/** Steps come from the menu registry, so section names always match the menus. */
const STEPS = tourSteps();

export function replayWelcomeTour() { localStorage.removeItem(KEY); window.dispatchEvent(new Event('zodaci-tour')); }

export function WelcomeTour() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  useEffect(() => {
    const check = () => { if (session && !localStorage.getItem(KEY) && !document.body.dataset.genOverlay) { setI(0); setOpen(true); } };
    check(); window.addEventListener('zodaci-tour', check);
    return () => window.removeEventListener('zodaci-tour', check);
  }, [session]);
  const close = () => { localStorage.setItem(KEY, '1'); setOpen(false); };
  const s = STEPS[i];
  return (
    <Dialog open={open} onOpenChange={o => !o && close()}>
      <DialogContent className="max-w-md overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.6 }} className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-3xl text-primary">{s.icon}</div>
            <DialogTitle className="font-display text-2xl">{s.title}</DialogTitle>
            <DialogDescription className="text-base">{s.body}</DialogDescription>
            {s.to && <Button asChild variant="link" onClick={close}><Link to={s.to}>{s.cta ?? 'Take me there'}</Link></Button>}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5" role="img" aria-label={`Step ${i + 1} of ${STEPS.length}`}>{STEPS.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`} />)}</div>
          <div className="flex gap-2">
            {i > 0 ? <Button variant="ghost" size="sm" onClick={() => setI(i - 1)}>Back</Button> : <Button variant="ghost" size="sm" onClick={close}>Skip</Button>}
            <Button size="sm" onClick={() => i < STEPS.length - 1 ? setI(i + 1) : close()}>{i < STEPS.length - 1 ? 'Next' : 'Start exploring'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
