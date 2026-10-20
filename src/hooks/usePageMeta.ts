import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PUBLIC_PATHS = ['/welcome', '/about', '/astrobook', '/astrocomic', '/academy', '/compatibility', '/book-preview', '/pricing', '/blog', '/faq', '/privacy', '/terms', '/demo', '/themes', '/community', '/community/guidelines'];
export function isIndexablePage(path: string) {
  return PUBLIC_PATHS.includes(path) || /^\/(themes|academy|blog|lp)\/[^/]+(?:\/[^/]+)?\/?$/.test(path);
}

const set = (sel: string, attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
};

/** Sets a page-specific title, description and social tags. */
export function usePageMeta(title: string, description: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = title;
    document.documentElement.dataset.metaPath = pathname;
    set('meta[name="description"]', 'name', 'description', description);
    set('meta[property="og:title"]', 'property', 'og:title', title);
    set('meta[property="og:description"]', 'property', 'og:description', description);
    set('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    set('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    set('meta[property="og:type"]', 'property', 'og:type', 'website');
    set('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    const isPublic = isIndexablePage(pathname);
    set('meta[property="og:url"]', 'property', 'og:url', `https://zodaci.com${pathname}`);
    // Preserve the private subdomain's stricter search exclusion.
    if (!/^april\./i.test(window.location.hostname)) {
      set('meta[name="robots"]', 'name', 'robots', isPublic ? 'index, follow' : 'noindex, follow');
    }
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    // Private pages must not keep the previous public page's canonical after client-side navigation.
    if (!isPublic) canonical?.remove();
    if (isPublic) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = `https://zodaci.com${pathname}`;
    }
  }, [title, description, pathname]);
}
