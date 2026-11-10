import { useAprilSpace } from '@/hooks/useAprilSpace';
import { COMPENDIUM_ILLUSTRATIONS } from '@/content/compendiumIllustrations';

/** April's sixteen private, symbolic chapter plates. */
export function IllustrationGallery() {
  const april = useAprilSpace();
  if (!april) return null;
  return (
    <section aria-labelledby="ill-gallery" className="space-y-4">
      <div>
        <div className="font-label text-[10px] tracking-[0.14em] text-primary">Illustration Reference Guide · all 16 plates</div>
        <h2 id="ill-gallery" className="font-display text-2xl mt-1">The Compendium illustrations</h2>
        <p className="text-sm text-muted-foreground mt-1">Original atomic-zodiac illustrations of the chapter themes. These are symbolic scenes, not portraits or records of life events.</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {COMPENDIUM_ILLUSTRATIONS.map(i => (
          <li key={i.n} className="overflow-hidden rounded border border-border bg-card/60">
            <a href={i.src} target="_blank" rel="noreferrer" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <img src={i.src} alt={`Illustration ${i.n}: ${i.title}`} loading="lazy" width={940} height={940} className="aspect-square w-full object-contain" />
              <div className="p-2 text-xs"><span className="text-gold">{String(i.n).padStart(2, '0')}</span> · {i.title}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
