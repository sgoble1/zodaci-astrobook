import { describe, expect, it } from 'vitest';
import { internalDestination } from './internalDestination';
describe('return destinations', () => {
  it('resumes a member tool including its query and chapter', () => expect(internalDestination('/my-masterbook?chapter=sun#practices')).toBe('/my-masterbook?chapter=sun#practices'));
  it('rejects external, protocol-relative and encoded escape destinations', () => {
    for (const path of ['https://example.com', '//example.com', '/%2fexample.com', '/\\example.com', '/%5cexample.com', '/%0aexample.com', '/%invalid']) expect(internalDestination(path)).toBe('/dashboard');
  });
});