import { createHash } from 'node:crypto';

/**
 * Menghitung Strong ETag RFC 9110 / RFC 7232 untuk entitas resource.
 * Format Strong ETag diapit tanda kutip ganda tanpa prefiks W/, contoh: "d41d8cd98f00b204e9800998ecf8427e"
 */
export function computeEntityETag(entity: Record<string, any>): string {
  if (!entity || typeof entity !== 'object') {
    return '""';
  }

  const cleanObj: Record<string, any> = {};
  const sortedKeys = Object.keys(entity)
    .filter(
      (key) =>
        !['loans', 'book', 'member'].includes(key) &&
        typeof entity[key] !== 'function',
    )
    .sort();

  for (const key of sortedKeys) {
    const value = entity[key];
    if (value instanceof Date) {
      cleanObj[key] = value.toISOString();
    } else {
      cleanObj[key] = value ?? null;
    }
  }

  const hash = createHash('sha1')
    .update(JSON.stringify(cleanObj))
    .digest('hex');
  return `"${hash}"`;
}

/**
 * Mengevaluasi kondisi header If-Match sesuai RFC 9110 Section 13.1.1.
 * - Header If-Match menggunakan strong comparison.
 * - Weak entity tags (diawali W/) TIDAK PERNAH dianggap cocok.
 * - Header '*' cocok jika entitas ada.
 * - Jika header tidak diberikan (undefined), evaluasi lolos (backward compatibility).
 */
export function validateIfMatch(
  ifMatchHeader: string | undefined,
  currentETag: string,
): { matched: boolean; reason?: string } {
  // Jika klien tidak mengirimkan header If-Match, pertahankan kompatibilitas lama
  if (ifMatchHeader === undefined || ifMatchHeader === null || ifMatchHeader.trim() === '') {
    return { matched: true };
  }

  const rawHeader = ifMatchHeader.trim();

  // Weak ETag W/"..." tidak diizinkan untuk perbandingan kuat If-Match
  if (rawHeader.startsWith('W/') || rawHeader.startsWith('w/')) {
    return {
      matched: false,
      reason:
        'Weak entity tags (W/...) tidak dapat digunakan pada evaluasi strong comparison If-Match (RFC 9110)',
    };
  }

  // Asterisk '*' berarti entitas harus ada (target resource exists)
  if (rawHeader === '*') {
    return { matched: true };
  }

  // Dukung daftar ETag dipisah koma: "etag1", "etag2"
  const requestedTags = rawHeader.split(',').map((tag) => tag.trim());
  const normalizedCurrent =
    currentETag.startsWith('"') && currentETag.endsWith('"')
      ? currentETag
      : `"${currentETag}"`;

  for (const tag of requestedTags) {
    if (tag.startsWith('W/') || tag.startsWith('w/')) {
      continue;
    }
    const normalizedTag =
      tag.startsWith('"') && tag.endsWith('"') ? tag : `"${tag}"`;
    if (normalizedTag === normalizedCurrent) {
      return { matched: true };
    }
  }

  return {
    matched: false,
    reason: `Precondition Failed: Resource ETag ${normalizedCurrent} tidak cocok dengan If-Match ${rawHeader}`,
  };
}
