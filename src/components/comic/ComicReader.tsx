import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { AstroComicShowcase } from '@/content/comicIssue1';

type Scripted = { pageNumber: number; title: string; placement: string; summary: string };

/** Full read-through of an example issue: every drawn page large with its panels, then the scripted pages. */
export function ComicReader({ issue, scripted = [], label = 'Read the full example issue' }: { issue: AstroComicShowcase; scripted?: Scripted[]; label?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="lg"><BookOpen aria-hidden />{label}</Button></DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <div className="relative">
          <img src={issue.cover} alt={issue.coverAlt} width={1024} height={1536} className="mx-auto max-h-[80vh] w-auto" />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/85 to-transparent p-6 pb-16 text-center">
            <p className="font-smallcaps text-xs text-gold">{issue.banner}</p>
            <DialogTitle className="mt-2 font-display text-4xl font-normal">{issue.title}</DialogTitle>
            <DialogDescription className="mt-2 italic">{issue.subCaption}</DialogDescription>
          </div>
        </div>
        <div className="space-y-14 p-5 sm:p-10">
          {issue.pages.map(p => (
            <section key={p.pageNumber} aria-label={`Page ${p.pageNumber}: ${p.actTitle}`} className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-border pb-2"><h3 className="font-display text-2xl">{p.actTitle}</h3><span className="font-smallcaps text-xs text-gold">{p.placement} · p.{p.pageNumber}</span></div>
              <div className="relative overflow-hidden border-2 border-foreground/80">
                <img src={p.art} alt={p.panels[0].visualPrompt} width={1536} height={1024} loading="lazy" className="w-full" />
                <p className="absolute left-3 top-3 max-w-md border border-gold/60 bg-background/90 px-3 py-2 text-sm leading-snug">{p.panels[0].narration}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {p.panels.slice(1).map((panel, k) => (
                  <div key={k} className="relative min-h-40 overflow-hidden border-2 border-foreground/80 p-3">
                    <img src={p.art} alt="" aria-hidden width={1536} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45" style={{ objectPosition: k ? '85% 45%' : '20% 40%', transform: 'scale(1.6)' }} />
                    <div className="relative flex h-full flex-col justify-end gap-2">
                      <p className="border border-gold/60 bg-background/90 px-2 py-1 text-sm">{panel.narration}</p>
                      {panel.dialogue && <p className="w-fit rounded-2xl bg-foreground px-3 py-1 text-sm text-background">{panel.dialogue}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {scripted.length > 0 && (
            <section aria-label="Scripted pages" className="space-y-3">
              <h3 className="font-display text-2xl">Still to be drawn</h3>
              <p className="text-sm text-muted-foreground">These pages are written and laid out; their art is in production.</p>
              <ol className="grid gap-3 sm:grid-cols-2">{scripted.map(s => <li key={s.pageNumber} className="vellum p-4"><p className="font-smallcaps text-xs text-gold">p.{s.pageNumber} · {s.placement}</p><p className="mt-1 font-display text-lg">{s.title}</p><p className="mt-1 text-sm text-muted-foreground">{s.summary}</p></li>)}</ol>
            </section>
          )}
          <p className="text-center font-smallcaps text-xs text-gold">{issue.footer}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
