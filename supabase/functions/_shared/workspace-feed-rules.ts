// Deliberately never transmit raw messages, component names, URLs or arbitrary context.
export const WORKSPACE_PROJECT_ID = 'aee2e954-f4db-40c2-b757-ce2ed7d7a9d3';
export const WORKSPACE_FEED_URL = 'https://compthaus.online/api/public/webhooks/workspace-feed';
export type FailureKind = 'runtime_error' | 'unhandled_rejection' | 'route_failure';
const routes = new Set(['auth', 'access', 'coming-soon', 'welcome', 'about', 'astrobook', 'astrocomic', 'books', 'book-preview', 'demo', 'shop', 'store', 'pricing', 'accuracy', 'dashboard', 'forecast', 'dreams', 'my-chart', 'my-readings', 'official-astrobook', 'official-astrocomic', 'april', 'shane', 'zac', 'shared', 'admin', 'developer', 'investors', 'library', 'checkout']);
const names = new Set(['Error', 'TypeError', 'ReferenceError', 'RangeError', 'SyntaxError', 'URIError', 'EvalError', 'ChunkLoadError']);
export function safeRoute(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/[route]';
  const parts = value.split(/[?#]/)[0].split('/').filter(Boolean);
  if (!parts.length) return '/';
  if (!routes.has(parts[0])) return '/[route]';
  return `/${parts[0]}${parts.length > 1 ? '/[detail]' : ''}`;
}
export function sanitizeFailure(value: unknown) {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const kind: FailureKind = input.kind === 'route_failure' || input.kind === 'unhandled_rejection' ? input.kind : 'runtime_error';
  const name = typeof input.name === 'string' && names.has(input.name) ? input.name : 'Error';
  const frames = typeof input.stack === 'string'
    ? [...input.stack.slice(0, 8000).matchAll(/\b([A-Za-z0-9_-]{1,100}\.(?:js|tsx|ts|jsx)):(\d{1,7}):(\d{1,7})\b/g)].slice(0, 8).map(m => `${m[1]}:${m[2]}:${m[3]}`)
    : [];
  return { kind, name, route: safeRoute(input.route), frames };
}
export function failureSummary(kind: FailureKind): string {
  return kind === 'route_failure' ? 'A page failed to render or load.' : kind === 'unhandled_rejection' ? 'An unhandled asynchronous error occurred.' : 'An uncaught application error occurred.';
}