/* @license Enterprise */

import { createHash } from 'node:crypto';

export const POSTGRES_MAX_IDENTIFIER_BYTE_LENGTH = 63;
const HASH_LENGTH = 8;
const MAX_PREFIX_BYTE_LENGTH =
  POSTGRES_MAX_IDENTIFIER_BYTE_LENGTH - 1 - HASH_LENGTH; // 54 bytes

const truncateToMaxUtf8Bytes = (str: string, maxBytes: number): string => {
  let byteLength = 0;
  let truncated = '';

  for (const char of str) {
    const charBytes = Buffer.byteLength(char, 'utf8');

    if (byteLength + charBytes > maxBytes) {
      break;
    }

    byteLength += charBytes;
    truncated += char;
  }

  return truncated;
};

export const buildSafeTableAlias = (alias: string): string => {
  if (Buffer.byteLength(alias, 'utf8') <= POSTGRES_MAX_IDENTIFIER_BYTE_LENGTH) {
    return alias;
  }

  const prefix = truncateToMaxUtf8Bytes(alias, MAX_PREFIX_BYTE_LENGTH);
  const hash = createHash('sha256')
    .update(alias, 'utf8')
    .digest('hex')
    .slice(0, HASH_LENGTH);

  return `${prefix}_${hash}`;
};
