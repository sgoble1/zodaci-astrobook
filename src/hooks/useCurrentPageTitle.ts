import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { crumbTitleFrom } from '@/lib/pageTitle';

/**
 * The current page's own title for breadcrumbs. usePageMeta stamps the path it set the title for, so a title left
 * over from the previous page is never shown under the new one.
 */
export function useCurrentPageTitle(): string | null {
  const { pathname } = useLocation();
  const read = () => (typeof document !== 'undefined' && document.documentElement.dataset.metaPath === pathname ? crumbTitleFrom(document.title) : null);
  const [title, setTitle] = useState<string | null>(read);
  useEffect(() => {
    const update = () => setTitle(read());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.head, { subtree: true, childList: true, characterData: true });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-meta-path'] });
    return () => obs.disconnect();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return title;
}
