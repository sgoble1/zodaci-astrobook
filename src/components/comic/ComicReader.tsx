import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { AstroComicShowcase } from '@/content/sampleComic';

type Scripted = { pageNumber: number; title: string; placement: string; summary: string };

/** Full read-through of an example issue: every drawn page large with its panels, then the scripted pages. */
export function ComicReader({ issue, scripted = [], label = 'Read the full example issue' }: { issue: AstroComicShowcase; scripted?: Scripted[]; label?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="lg"><BookOpen aria-hidden />{label}</Button></DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <div className="relative">
          <img src={issue.cover} alt={issue.coverAlt} width={1024} height={1536} className="mx-auto max-h-[80vh] w-auto" />
          <div className={issue.lettered ? 'sr-only' : 'absolute inset-x-0 top-0 bg-gradient-to-b from-background/85 to-transparent p-6 pb-16 text-center'}>
            <p className="font-label text-xs tracking-[0.16em] text-primary">{issue.banner}</p>
            <DialogTitle className="mt-2 font-display text-4xl font-normal">{issue.title}</DialogTitle>
            <DialogDescription className="mt-2 italic">{issue.subCaption}</DialogDescription>
          </div>
        </div>
        <div className="comic-sheet m-3 space-y-14 p-5 sm:m-5 sm:p-10">
          {issue.pages.map(p => (
            <section key={p.pageNumber} aria-label={`Page ${p.pageNumber}: ${p.actTitle}`} className="space-y-3">
              <div className="comic-rule flex items-baseline justify-between pb-2"><h3 className="font-display text-2xl uppercase">{p.actTitle}</h3><span className="comic-tag text-xs">{p.placement} · p.{p.pageNumber}</span></div>
              <div className="comic-cell">
                <img src={p.art} alt={p.panels[0].visualPrompt} width={1536} height={1024} loading="lazy" className="w-full" />
                <p className="comic-caption absolute left-3 top-3 max-w-md text-sm">{p.panels[0].narration}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {p.panels.slice(1).map((panel, k) => (
                  <div key={k} className="comic-cell min-h-40 p-3">
                    <img src={p.art} alt="" aria-hidden width={1536} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-50" style={{ objectPosition: k ? '85% 45%' : '20% 40%', transform: 'scale(1.6)' }} />
                    <div className="relative flex h-full flex-col justify-end gap-2">
                      <p className="comic-caption text-sm">{panel.narration}</p>
                      {panel.dialogue && <p className="comic-balloon mb-2 text-sm">{panel.dialogue}</p>}
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
              <ol className="grid gap-3 sm:grid-cols-2">{scripted.map(s => <li key={s.pageNumber} className="comic-card p-4"><p className="font-label text-xs tracking-[0.16em] text-primary">p.{s.pageNumber} · {s.placement}</p><p className="mt-1 font-display text-lg">{s.title}</p><p className="mt-1 text-sm text-muted-foreground">{s.summary}</p></li>)}</ol>
            </section>
          )}
          <p className="text-center"><span className="comic-tag text-xs">{issue.footer}</span></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
