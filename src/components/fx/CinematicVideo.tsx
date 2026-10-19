import { useEffect, useState } from 'react';
import heroVideo from '@/assets/videos/zodaci-hero.mp4.asset.json';

/** Cinematic background loop with grain + projector light. Falls back to the poster when motion is reduced. */
export function CinematicVideo({ poster, className = '' }: { poster: string; className?: string }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const m = window.matchMedia('(prefers-reduced-motion: reduce)'); setReduced(m.matches); const f = () => setReduced(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  return (
    <div aria-hidden className={`absolute inset-0 -z-20 overflow-hidden ${className}`}>
      {reduced ? <img src={poster} alt="" className="h-full w-full object-cover" /> : <video src={heroVideo.url} poster={poster} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" style={{ animation: 'cine-drift 40s ease-in-out infinite alternate' }} />}
      <div className="cine-projector absolute inset-0" />
      <div className="cine-grain absolute inset-0" />
    </div>
  );
}
