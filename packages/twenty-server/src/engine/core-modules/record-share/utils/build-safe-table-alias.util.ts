/* @license Enterprise */

import { createHash } from 'node:crypto';

export const POSTGRES_MAX_IDENTIFIER_LENGTH = 63;

export const buildSafeTableAlias = (alias: string): string => {
  if (alias.length <= POSTGRES_MAX_IDENTIFIER_LENGTH) {
    return alias;
  }

  const hash = createHash('sha256')
    .update(alias, 'utf8')
    .digest('hex')
    .slice(0, 8);

  return `${alias.slice(0, POSTGRES_MAX_IDENTIFIER_LENGTH - 9)}_${hash}`;
};
