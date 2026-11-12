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
    <figure className={`comic-page comic-sheet relative flex flex-col overflow-hidden ${full ? 'comic-sheet-cover' : ''} ${compact ? 'aspect-[11/17] text-[10px]' : 'aspect-[11/17] text-xs sm:text-sm'}`} aria-label={`Page ${page.n}: ${page.title}`}>
      {full ? (
        <div className="relative flex-1">
          {page.section === 'Cover' || fullArt
            ? <img src={fullArt ?? cover} alt={fullArt ? page.panels[0]?.scene ?? '' : ''} width={1024} height={1536} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            : <p className="comic-direction absolute inset-0 p-3 leading-snug">{page.panels[0]?.scene}</p>}
          {page.section === 'Cover' ? (
            <div className="comic-title-band absolute inset-x-0 top-0 px-3 py-2 sm:px-4 sm:py-3">
              <p className={`comic-issue-line ${compact ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>AstroComic{page.panels[0]?.caption ? ` · ${page.panels[0].caption.replace(/^AstroComic\s*·\s*/i, '')}` : ''}</p>
              <p className={`font-display uppercase leading-[1.05] ${compact ? 'text-[11px]' : 'text-lg sm:text-2xl'}`}>{page.title}</p>
            </div>
          ) : (
            <div className="comic-title-band absolute inset-x-0 bottom-0 border-b-0 border-t-[3px] border-t-[hsl(var(--comic-ink))] px-3 py-2 sm:px-4 sm:py-3">
              <p className={`font-display leading-tight ${compact ? 'text-xs' : 'text-base sm:text-lg'}`}>{page.body?.[0] ?? 'AstroComic by Zodaci'}</p>
              <p className="comic-issue-line text-[10px]">{page.title}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 p-2 sm:p-3">
          <div className="comic-rule flex items-baseline justify-between gap-2 pb-1">
            <span className={`comic-tag ${compact ? 'text-[8px]' : 'text-[10px]'}`}>{page.section}</span>
            <span className="comic-pagenum text-[10px]">{page.n}</span>
          </div>
          <p className={`font-display uppercase leading-tight ${compact ? 'text-[11px]' : 'text-base sm:text-lg'}`}>{page.title}</p>
          <div className="grid flex-1 auto-rows-min grid-cols-2 gap-1.5">
            {page.panels.map((panel, i) => {
              const src = art?.[`${page.n}-${i}`];
              return (
                <div key={i} className={`comic-panel comic-cell flex flex-col justify-between p-2 ${SHAPE[panel.shape]}`}>
                  {src && <img src={src} alt={panel.scene} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                  {!src && (isQrPanel(panel) ? <QrMark /> : <p className="comic-direction leading-snug">{panel.scene}</p>)}
                  <div className="relative space-y-2">
                    {panel.caption && <p className="comic-caption">{panel.caption}</p>}
                    {panel.balloons?.map((b, j) => <p key={j} className={`comic-balloon ${j % 2 ? 'ml-auto' : ''}`}><span className="font-bold uppercase">{b.who}:</span> {b.text}</p>)}
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
      <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} role="img" aria-label="QR code for zodaci.com/my-chart" className="h-16 w-16 shrink-0 rounded-sm bg-[hsl(var(--comic-balloon))] fill-[hsl(var(--comic-ink))]">
        {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} />)}
      </svg>
      <span className="break-words leading-snug">zodaci.com/my-chart</span>
    </div>
  );
}
