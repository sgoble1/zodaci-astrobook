import { useEffect, useState } from 'react';
import heroVideo from '@/assets/videos/zodaci-hero.mp4.asset.json';
import heroWebm from '@/assets/videos/zodaci-hero.webm.asset.json';
import videoPoster from '@/assets/videos/zodaci-video-poster.jpg.asset.json';

/** Cinematic background loop with grain + projector light. Falls back to the poster when motion is reduced. */
export function CinematicVideo({ poster, className = '' }: { poster?: string; className?: string }) {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  useEffect(() => { const m = window.matchMedia('(prefers-reduced-motion: reduce)'); setReduced(m.matches); const f = () => setReduced(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  return (
    <div aria-hidden className={`absolute inset-0 -z-20 overflow-hidden ${className}`}>
      {reduced || failed ? <img loading="lazy" decoding="async" src={posterFailed && poster ? poster : videoPoster.url} alt="" className="h-full w-full object-cover" onError={() => setPosterFailed(true)} /> : (
        <video poster={videoPoster.url} autoPlay muted loop playsInline preload="auto" className="cine-video h-full w-full object-cover">
          <source src={heroWebm.url} type="video/webm" />
          {/* With <source> children the failure event fires on the last source, not on the video. */}
          <source src={heroVideo.url} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
      <div className="cine-projector absolute inset-0" />
      <div className="cine-grain absolute inset-0" />
    </div>
  );
}
