import { useAprilSpace } from '@/hooks/useAprilSpace';
import { COMPENDIUM_ILLUSTRATIONS } from '@/content/compendiumIllustrations';

/** Shows the 16 Master Compendium illustrations, each made from its own prompt in April's Illustration Reference Guide. */
export function IllustrationGallery() {
  const april = useAprilSpace();
  if (!april) return null;
  return (
    <section aria-labelledby="ill-gallery" className="space-y-4">
      <div>
        <div className="font-smallcaps text-[10px] text-gold">Illustration Reference Guide · all 16 plates</div>
        <h2 id="ill-gallery" className="font-display text-2xl mt-1">The Compendium illustrations</h2>
        <p className="text-sm text-muted-foreground mt-1">Each picture was made from the AI image instructions written for that plate in April's Illustration Reference Guide.</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {COMPENDIUM_ILLUSTRATIONS.map(i => (
          <li key={i.n} className="overflow-hidden rounded border border-border bg-card/60">
            <a href={i.src} target="_blank" rel="noreferrer" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <img src={i.src} alt={`Illustration ${i.n}: ${i.title}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-2 text-xs"><span className="text-gold">{String(i.n).padStart(2, '0')}</span> · {i.title}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
