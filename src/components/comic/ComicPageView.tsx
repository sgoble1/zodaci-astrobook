import type { ComicPage, ComicPanel } from '@/lib/comic';
import cover from '@/assets/astrocomic-cover.jpg';

const SHAPE: Record<ComicPanel['shape'], string> = {
  bleed: 'col-span-2 min-h-[9rem]', wide: 'col-span-2 min-h-[6rem]', square: 'min-h-[7rem]', tall: 'row-span-2 min-h-[10rem]', oval: 'col-span-2 min-h-[6rem] rounded-[50%]',
};

/** One page of an issue plan, laid out like a digest page: panels with scene direction, captions and lettering. */
export function ComicPageView({ page, compact = false }: { page: ComicPage; compact?: boolean }) {
  const isCover = page.section === 'Cover';
  return (
    <figure className={`comic-page relative flex flex-col overflow-hidden rounded-sm border-2 border-foreground/80 bg-background ${compact ? 'aspect-[11/17] text-[10px]' : 'aspect-[11/17] text-xs sm:text-sm'}`} aria-label={`Page ${page.n}: ${page.title}`}>
      {isCover ? (
        <div className="relative flex-1">
          <img src={cover} alt="" width={1024} height={1584} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/90 to-transparent p-3 sm:p-4">
            <p className="font-smallcaps text-[10px] text-gold">AstroComic</p>
            <p className="font-display text-lg leading-tight sm:text-2xl">{page.title}</p>
          </div>
          {page.panels[0]?.caption && <p className="absolute bottom-2 right-2 rounded-sm bg-background/80 px-2 py-0.5 text-[10px]">{page.panels[0].caption}</p>}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 p-2 sm:p-3">
          <div className="flex items-baseline justify-between gap-2 border-b border-foreground/30 pb-1">
            <span className="font-smallcaps text-[9px] text-gold">{page.section}</span>
            <span className="text-[9px] text-muted-foreground">{page.n}</span>
          </div>
          <p className="font-display leading-tight text-base sm:text-lg">{page.title}</p>
          <div className="grid flex-1 auto-rows-min grid-cols-2 gap-1.5">
            {page.panels.map((panel, i) => (
              <div key={i} className={`comic-panel relative flex flex-col justify-between border-2 border-foreground/80 bg-card/70 p-2 ${SHAPE[panel.shape]}`}>
                <p className="italic text-muted-foreground leading-snug">{panel.scene}</p>
                {panel.balloons?.map((b, j) => <p key={j} className="mt-1 self-start rounded-2xl border border-foreground/60 bg-foreground px-2 py-1 text-background leading-snug"><span className="font-semibold">{b.who}:</span> {b.text}</p>)}
                {panel.caption && <p className="mt-1 border border-gold/60 bg-background/90 px-1.5 py-0.5 leading-snug">{panel.caption}</p>}
              </div>
            ))}
          </div>
          {page.body && page.body.length > 0 && <ul className={`space-y-1 leading-snug ${compact ? 'line-clamp-6' : ''}`}>{page.body.map((t, i) => <li key={i}>{t}</li>)}</ul>}
        </div>
      )}
    </figure>
  );
}
