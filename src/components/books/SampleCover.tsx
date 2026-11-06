import { cn } from '@/lib/utils';
import { LEAD_COVER, type CoverSample } from '@/content/coverSamples';

/**
 * A public sample AstroBook cover shown as a printed book: the flat cover with a shaded spine, page edges and a
 * print-offset shadow. The cover carries an invented reader's name and birth details (see content/coverSamples.ts).
 */
export function SampleCover({ sample = LEAD_COVER, className, caption, eager = false, sizes }: { sample?: CoverSample; className?: string; caption?: boolean; eager?: boolean; sizes?: string }) {
  return (
    <figure className={cn('sample-book', className)}>
      <div className="sample-book-body">
        <img src={sample.src} alt={sample.alt} width={1024} height={1536} loading={eager ? 'eager' : 'lazy'} decoding="async" sizes={sizes} />
      </div>
      {caption && <figcaption className="mt-3 text-center text-xs leading-snug text-muted-foreground"><span className="block font-label text-sm tracking-[0.12em] text-primary">{sample.edition} · {sample.sign}</span>Sample cover for a fictional reader</figcaption>}
    </figure>
  );
}
