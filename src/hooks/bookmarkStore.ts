/** Owner-keyed request sharing, invalidated on account changes and mutations. */
export function createBookmarkStore<T>() {
  let version = 0;
  const requests = new Map<string, Promise<T[]>>();
  return {
    clear() { version++; requests.clear(); },
    load(ownerId: string, fetchRows: () => Promise<T[]>): Promise<T[]> {
      const existing = requests.get(ownerId);
      if (existing) return existing;
      const started = version;
      const request = fetchRows().then(rows => started === version ? rows : []).catch(error => {
        if (requests.get(ownerId) === request) requests.delete(ownerId);
        throw error;
      });
      requests.set(ownerId, request);
      return request;
    },
  };
}