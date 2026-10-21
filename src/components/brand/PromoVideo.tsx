import { useId, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import promo1080 from '@/assets/videos/zodaci-promo-1080.mp4.asset.json';
import promo720 from '@/assets/videos/zodaci-promo-720.mp4.asset.json';
import promoPoster from '@/assets/videos/zodaci-promo-poster.jpg.asset.json';
import { useJsonLd } from '@/hooks/useJsonLd';
import { PROMO_VIDEO } from '@/content/promoVideo';

/**
 * The Zodaci promo film. Nothing downloads until the visitor presses play (it has music), then the
 * native player takes over with sound, so it never autoplays or fights reduced-motion settings.
 */
export function PromoVideo({ className = '', schema = false }: { className?: string; schema?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const summaryId = `${useId()}-promo-summary`;
  useJsonLd('promo-video', schema ? {
    '@type': 'VideoObject', name: PROMO_VIDEO.title, description: PROMO_VIDEO.description,
    thumbnailUrl: `${PROMO_VIDEO.origin}${promoPoster.url}`, contentUrl: `${PROMO_VIDEO.origin}${promo1080.url}`,
    uploadDate: PROMO_VIDEO.uploadDate, duration: PROMO_VIDEO.isoDuration,
  } : null);

  const start = () => { setPlaying(true); requestAnimationFrame(() => { void ref.current?.play().catch(() => undefined); }); };

  return (
    <figure className={`overflow-hidden rounded-2xl border border-border bg-card/40 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.6)] ${className}`}>
      <div className="relative aspect-video w-full bg-background">
        {playing && !failed ? (
          <video ref={ref} controls playsInline preload="auto" poster={promoPoster.url} aria-describedby={summaryId} onError={() => setFailed(true)} className="h-full w-full">
            <source src={promo720.url} type="video/mp4" media="(max-width: 768px)" />
            <source src={promo1080.url} type="video/mp4" />
          </video>
        ) : (
          <button type="button" onClick={start} disabled={failed} aria-describedby={summaryId}
            className="group absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed">
            <img src={promoPoster.url} alt="" width={1600} height={900} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" aria-hidden="true" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="inline-flex items-center gap-3 rounded-full border border-gold/50 bg-background/70 px-5 py-3 text-sm text-foreground backdrop-blur-md transition-colors duration-700 group-hover:border-gold group-hover:bg-background/85">
                <Play className="h-5 w-5 fill-current text-gold" aria-hidden="true" />
                {failed ? 'The film couldn’t play here' : `Play the film · ${PROMO_VIDEO.lengthLabel}`}
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption id={summaryId} className="px-5 py-4 text-sm text-muted-foreground">
        <span className="text-foreground">{PROMO_VIDEO.title}.</span> {PROMO_VIDEO.summary} <span className="whitespace-nowrap">Music only, no narration.</span>
      </figcaption>
    </figure>
  );
}
