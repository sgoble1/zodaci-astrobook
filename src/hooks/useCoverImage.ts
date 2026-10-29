import { useEffect, useState } from 'react';
import { renderCoverCanvas, type CoverSpec } from '@/lib/coverRender';

/**
 * A JPEG data URL of the finished cover (artwork + name + subtitle + wordmark) at a screen resolution.
 * Used for thumbnails, the public cover preview and the 3D book, so every preview shows the same typography.
 */
export function useCoverImage(spec: CoverSpec | null, ppi = 48) {
  const [url, setUrl] = useState('');
  const key = spec ? JSON.stringify([spec.source, spec.crop, spec.name, spec.trimPt, ppi]) : '';
  useEffect(() => {
    if (!spec) { setUrl(''); return; }
    let on = true;
    // Coalesce fast typing into one render.
    const t = window.setTimeout(() => {
      renderCoverCanvas(spec, ppi).then(c => { if (on) setUrl(c.toDataURL('image/jpeg', 0.88)); }).catch(() => { if (on) setUrl(''); });
    }, 120);
    return () => { on = false; window.clearTimeout(t); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return url;
}
