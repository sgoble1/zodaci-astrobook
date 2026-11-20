/** Check the stored item's owner, not the viewer: workspace members may play shared owner files. */
export function ownerLibraryPath(ownerId: unknown, path: unknown): path is string {
  if (typeof ownerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ownerId)) return false;
  if (typeof path !== 'string' || path.length > 1024 || !path.startsWith(`${ownerId}/`)) return false;
  // Reject ambiguous encodings, traversal, controls and URL/backslash separators before privileged signing.
  if (/[\\%?#\u0000-\u001f\u007f]/.test(path)) return false;
  const segments = path.split('/');
  return segments.length >= 2 && segments.every(segment => segment !== '' && segment !== '.' && segment !== '..');
}