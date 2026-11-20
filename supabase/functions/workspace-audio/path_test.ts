import { ownerLibraryPath } from '../_shared/library-path.ts';

const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
Deno.test('audio paths retain valid owner podcast uploads', () => {
  for (const path of [`${owner}/podcast/123-episode.wav`, `${owner}/podcast/nested/episode.mp3`, `${owner}/podcast/123-my_episode.wav`]) {
    if (!ownerLibraryPath(owner, path)) throw new Error('Valid owner path rejected');
  }
});
Deno.test('audio paths reject cross-owner paths and ambiguous traversal', () => {
  const invalid: unknown[] = [`${other}/podcast/private.wav`, `${owner}/../${other}/private.wav`, `${owner}/%2e%2e/private.wav`, `${owner}/podcast%2f..%2fprivate.wav`, `${owner}/podcast//file.wav`, `${owner}/podcast/./file.wav`, `${owner}\\podcast\\file.wav`, `${owner}/podcast/file.wav?token=x`, `${owner}/podcast/file\u0000.wav`, `${owner}/`, '', null, {}];
  for (const path of invalid) if (ownerLibraryPath(owner, path)) throw new Error('Unsafe path accepted');
});