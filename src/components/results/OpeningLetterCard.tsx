import { useMemo, useState } from 'react';
import { ChevronDown, Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { ChartResult } from '@/lib/astro';
import { buildOpeningLetter, letterText } from '@/lib/openingLetter';
import { Button } from '@/components/ui/button';

/**
 * The Opening Letter (spec §3.4): a personal letter written from the member's own calculated chart.
 * Shows the first two paragraphs, then expands; copy and print keep the letter with the member.
 */
export function OpeningLetterCard({ chart, name, placeLabel, timeKnown }: { chart: ChartResult; name: string; placeLabel: string; timeKnown: boolean }) {
  const letter = useMemo(() => buildOpeningLetter({ chart, name: name || 'Friend', placeLabel, timeKnown }), [chart, name, placeLabel, timeKnown]);
  const [open, setOpen] = useState(false);
  const shown = open ? letter.paragraphs : letter.paragraphs.slice(0, 2);
  const copy = async () => {
    try { await navigator.clipboard.writeText(letterText(letter)); toast.success('Letter copied'); }
    catch { toast.error('Copying is blocked in this browser. Select the text instead.'); }
  };
  const print = () => {
    const w = window.open('', '_blank', 'width=760,height=900');
    if (!w) { toast.error('Allow pop-ups to print your letter.'); return; }
    const esc = (t: string) => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
    w.document.write(`<!doctype html><title>Your opening letter</title><style>body{font:16px/1.7 Georgia,serif;max-width:40rem;margin:3rem auto;padding:0 1.5rem;color:#111}p{margin:0 0 1rem}</style>${[letter.salutation, ...letter.paragraphs, letter.closing, letter.signature].map(p => `<p>${esc(p)}</p>`).join('')}`);
    w.document.close(); w.focus(); w.print();
  };
  return (
    <section aria-labelledby="opening-letter" className="relative overflow-hidden rounded-2xl border border-gold/40 bg-card p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-primary/10" aria-hidden />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-smallcaps text-xs text-gold">Written from your chart</p>
            <h2 id="opening-letter" className="font-display text-3xl">Your opening letter</h2>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copy}><Copy className="h-4 w-4" aria-hidden />Copy</Button>
            <Button size="sm" variant="outline" onClick={print}><Printer className="h-4 w-4" aria-hidden />Print</Button>
          </div>
        </div>
        <div className="mt-5 max-w-prose space-y-4 font-display text-lg leading-relaxed md:text-xl">
          <p>{letter.salutation}</p>
          {shown.map((p, i) => <p key={i}>{p}</p>)}
          {open && <><p>{letter.closing}</p><p className="text-gold">{letter.signature}</p></>}
        </div>
        <Button variant="ghost" className="mt-4" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${open ? 'rotate-180' : ''}`} aria-hidden />{open ? 'Show less' : `Read the whole letter (${letter.words} words)`}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">Calculated from your saved birth details{timeKnown ? '' : '; without a birth time, your rising sign and houses are left out'}. No AI wrote this letter.</p>
      </div>
    </section>
  );
}
