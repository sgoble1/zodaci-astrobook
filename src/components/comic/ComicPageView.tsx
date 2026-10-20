import { useMemo } from 'react';
import QRCode from 'qrcode';
import type { ComicPage, ComicPanel } from '@/lib/comic';
import { QR_URL, isQrPanel } from '@/lib/comicPrint';
import cover from '@/assets/astrocomic-cover.jpg';

const SHAPE: Record<ComicPanel['shape'], string> = {
  bleed: 'col-span-2 min-h-[9rem]', wide: 'col-span-2 min-h-[6rem]', square: 'min-h-[7rem]', tall: 'row-span-2 min-h-[10rem]', oval: 'col-span-2 min-h-[6rem] rounded-[50%]',
};

/**
 * One page of an issue, laid out like a digest page. Without artwork it shows the script (scene direction, captions,
 * lettering); with `art` (panel key "page-panel" → image URL) it shows the illustrated panels with the same lettering.
 */
export function ComicPageView({ page, compact = false, art }: { page: ComicPage; compact?: boolean; art?: Record<string, string> }) {
  const full = page.section === 'Cover' || page.section === 'Back Cover';
  const fullArt = art?.[`${page.n}-0`];
  return (
    <figure className={`comic-page relative flex flex-col overflow-hidden rounded-sm border-2 border-foreground/80 bg-background ${compact ? 'aspect-[11/17] text-[10px]' : 'aspect-[11/17] text-xs sm:text-sm'}`} aria-label={`Page ${page.n}: ${page.title}`}>
      {full ? (
        <div className="relative flex-1">
          {page.section === 'Cover' || fullArt
            ? <img src={fullArt ?? cover} alt={fullArt ? page.panels[0]?.scene ?? '' : ''} width={1024} height={1584} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            : <p className="absolute inset-0 p-3 italic leading-snug text-muted-foreground">{page.panels[0]?.scene}</p>}
          {page.section === 'Cover' ? (
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/90 to-transparent p-3 sm:p-4">
              <p className="font-smallcaps text-[10px] text-gold">AstroComic</p>
              <p className={`font-display leading-tight ${compact ? 'text-sm' : 'text-lg sm:text-2xl'}`}>{page.title}</p>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-3 sm:p-4">
              <p className={`font-display leading-tight ${compact ? 'text-xs' : 'text-base sm:text-lg'}`}>{page.body?.[0] ?? 'AstroComic by Zodaci'}</p>
              <p className="text-[10px] text-muted-foreground">{page.title}</p>
            </div>
          )}
          {page.section === 'Cover' && page.panels[0]?.caption && <p className="absolute bottom-2 right-2 rounded-sm bg-background/80 px-2 py-0.5 text-[10px]">{page.panels[0].caption}</p>}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 p-2 sm:p-3">
          <div className="flex items-baseline justify-between gap-2 border-b border-foreground/30 pb-1">
            <span className="font-smallcaps text-[9px] text-gold">{page.section}</span>
            <span className="text-[9px] text-muted-foreground">{page.n}</span>
          </div>
          <p className={`font-display leading-tight ${compact ? 'text-xs' : 'text-base sm:text-lg'}`}>{page.title}</p>
          <div className="grid flex-1 auto-rows-min grid-cols-2 gap-1.5">
            {page.panels.map((panel, i) => {
              const src = art?.[`${page.n}-${i}`];
              return (
                <div key={i} className={`comic-panel relative flex flex-col justify-between overflow-hidden border-2 border-foreground/80 bg-card/70 p-2 ${SHAPE[panel.shape]}`}>
                  {src && <img src={src} alt={panel.scene} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                  {!src && (isQrPanel(panel) ? <QrMark /> : <p className="italic text-muted-foreground leading-snug">{panel.scene}</p>)}
                  <div className="relative space-y-1">
                    {panel.caption && <p className="border border-gold/60 bg-background/90 px-1.5 py-0.5 leading-snug">{panel.caption}</p>}
                    {panel.balloons?.map((b, j) => <p key={j} className={`w-fit max-w-[85%] rounded-2xl border border-foreground/60 bg-foreground px-2 py-1 text-background leading-snug ${j % 2 ? 'ml-auto' : ''}`}><span className="font-semibold">{b.who}:</span> {b.text}</p>)}
                  </div>
                </div>
              );
            })}
          </div>
          {page.body && page.body.length > 0 && <ul className={`space-y-1 leading-snug ${compact ? 'line-clamp-6' : ''}`}>{page.body.map((t, i) => <li key={i}>{t}</li>)}</ul>}
        </div>
      )}
    </figure>
  );
}

/** The same scannable code printed on the "About Zodaci" page. */
function QrMark() {
  const { size, cells } = useMemo(() => {
    const m = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' }).modules;
    const out: [number, number][] = [];
    for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.get(r, c)) out.push([c, r]);
    return { size: m.size, cells: out };
  }, []);
  return (
    <div className="flex flex-col items-start gap-1">
      <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} role="img" aria-label="QR code for zodaci.com/my-chart" className="h-16 w-16 shrink-0 rounded-sm bg-foreground fill-background">
        {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} />)}
      </svg>
      <span className="break-words leading-snug">zodaci.com/my-chart</span>
    </div>
  );
}
