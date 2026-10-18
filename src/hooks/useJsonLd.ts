import { useEffect } from 'react';
/** Publishes schema.org structured data for the current page and removes it on leave. */
export function useJsonLd(id: string, data: object | null) {
  const text = data ? JSON.stringify({ '@context': 'https://schema.org', ...data }) : '';
  useEffect(() => {
    if (!text) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json'; el.id = id; el.text = text;
    document.getElementById(id)?.remove(); document.head.appendChild(el);
    return () => el.remove();
  }, [id, text]);
}
