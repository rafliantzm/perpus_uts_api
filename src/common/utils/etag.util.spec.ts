import { describe, expect, it } from 'vitest';
import { computeEntityETag, validateIfMatch } from './etag.util.js';

describe('ETag & If-Match Utilities (RFC 9110 / RFC 7232)', () => {
  it('harus menghasilkan Strong ETag tanpa prefiks W/', () => {
    const book = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      totalCopies: 5,
      availableCopies: 5,
      createdAt: new Date('2026-11-07T10:00:00.000Z'),
      updatedAt: new Date('2026-11-07T10:00:00.000Z'),
    };

    const etag = computeEntityETag(book);
    expect(etag).toMatch(/^"[a-f0-9]{40}"$/);
    expect(etag.startsWith('W/')).toBe(false);
  });

  it('harus menghasilkan ETag yang identik untuk representasi data yang sama terlepas dari urutan key', () => {
    const objA = { id: 'uuid-1', title: 'A', author: 'B' };
    const objB = { author: 'B', title: 'A', id: 'uuid-1' };

    expect(computeEntityETag(objA)).toBe(computeEntityETag(objB));
  });

  it('harus menghasilkan ETag berbeda ketika data entitas berubah', () => {
    const book1 = { id: 'uuid-1', title: 'Clean Code', totalCopies: 5 };
    const book2 = { id: 'uuid-1', title: 'Clean Code', totalCopies: 6 };

    expect(computeEntityETag(book1)).not.toBe(computeEntityETag(book2));
  });

  it('harus menolak Weak ETag (W/...) pada If-Match strong comparison', () => {
    const currentETag = '"d41d8cd98f00b204e9800998ecf8427e01234567"';
    const weakIfMatch = 'W/"d41d8cd98f00b204e9800998ecf8427e01234567"';

    const result = validateIfMatch(weakIfMatch, currentETag);
    expect(result.matched).toBe(false);
    expect(result.reason).toContain('Weak entity tags');
  });

  it('harus mencocokkan Strong ETag yang valid', () => {
    const currentETag = '"abcdef1234567890abcdef1234567890abcdef12"';
    const validIfMatch = '"abcdef1234567890abcdef1234567890abcdef12"';

    const result = validateIfMatch(validIfMatch, currentETag);
    expect(result.matched).toBe(true);
  });

  it('harus menolak ETag yang usang (stale ETag mismatch)', () => {
    const currentETag = '"new-etag-hash-value-1234567890"';
    const staleIfMatch = '"old-stale-hash-value-0987654321"';

    const result = validateIfMatch(staleIfMatch, currentETag);
    expect(result.matched).toBe(false);
    expect(result.reason).toContain('Precondition Failed');
  });

  it('harus mendukung wildcard * jika entitas ada', () => {
    const currentETag = '"any-hash"';
    const result = validateIfMatch('*', currentETag);
    expect(result.matched).toBe(true);
  });

  it('harus mendukung kompatibilitas backward jika If-Match tidak disertakan', () => {
    const currentETag = '"any-hash"';
    expect(validateIfMatch(undefined, currentETag).matched).toBe(true);
    expect(validateIfMatch('', currentETag).matched).toBe(true);
  });
});
