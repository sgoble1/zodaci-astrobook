import { useEffect } from 'react';

const set = (sel: string, attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
};

/** Sets a page-specific title, description and social tags. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    set('meta[name="description"]', 'name', 'description', description);
    set('meta[property="og:title"]', 'property', 'og:title', title);
    set('meta[property="og:description"]', 'property', 'og:description', description);
    set('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    set('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    set('meta[property="og:type"]', 'property', 'og:type', 'website');
    set('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
    const publicPaths = ['/welcome', '/about', '/astrobook', '/book-preview', '/pricing', '/blog', '/faq', '/privacy', '/terms'];
    if (publicPaths.includes(window.location.pathname)) {
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = `https://zodaci.com${window.location.pathname}`;
    }
  }, [title, description]);
}
