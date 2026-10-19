type Setter = (value: unknown) => void;
const setters = new Map<string, { set: Setter; empty: unknown }>();
let retained: Record<string, Record<string, unknown>> | null = null;
export function registerPrivateValue(module: string, key: string, set: Setter, empty: unknown) {
  setters.set(`${module}.${key}`, { set, empty });
  // Lazy pages can register after the authorized archive has already loaded.
  if (module === 'privateAssets' && key === 'images' && retained?.privateAssets) {
    set(revive(retained.privateAssets));
  } else if (retained?.[module] && Object.prototype.hasOwnProperty.call(retained[module], key)) {
    set(revive(retained[module][key]));
  }
}
function revive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.__regex === 'string') return new RegExp(record.__regex, String(record.flags ?? ''));
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, revive(item)]));
  }
  return value;
}
export function hydratePrivateEdition(data: Record<string, Record<string, unknown>>) {
  retained = data;
  setters.get('privateAssets.images')?.set(data.privateAssets);
  for (const [module, entries] of Object.entries(data)) {
    for (const [key, value] of Object.entries(entries)) setters.get(`${module}.${key}`)?.set(revive(value));
  }
}
export function clearPrivateEdition() {
  retained = null;
  for (const entry of setters.values()) entry.set(structuredClone(entry.empty));
}