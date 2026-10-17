/* @license Enterprise */

import {
  buildSafeTableAlias,
  POSTGRES_MAX_IDENTIFIER_LENGTH,
} from 'src/engine/core-modules/record-share/utils/build-safe-table-alias.util';

describe('buildSafeTableAlias', () => {
  it('should return short aliases unmodified', () => {
    expect(buildSafeTableAlias('company')).toBe('company');
    expect(buildSafeTableAlias('person_targetCompanyId')).toBe(
      'person_targetCompanyId',
    );
  });

  it('should return alias of exactly 63 characters unmodified', () => {
    const alias63 =
      'customLeafRecord_parentCollectionId_containerId_securityGroupId';
    expect(alias63.length).toBe(POSTGRES_MAX_IDENTIFIER_LENGTH);
    expect(buildSafeTableAlias(alias63)).toBe(alias63);
  });

  it('should shorten aliases exceeding 63 characters to exactly 63 characters with hash', () => {
    const outer63 =
      'customLeafRecord_parentCollectionId_containerId_securityGroupId';
    const innerLong = `${outer63}_groupMembership`;

    expect(innerLong.length).toBe(79);

    const safeInner = buildSafeTableAlias(innerLong);

    expect(safeInner.length).toBe(POSTGRES_MAX_IDENTIFIER_LENGTH);
    expect(safeInner).not.toBe(outer63);
    expect(safeInner).toMatch(
      /^customLeafRecord_parentCollectionId_containerId_securi_[0-9a-f]{8}$/,
    );
  });

  it('should produce distinct aliases for two different long paths with same prefix', () => {
    const prefix = 'a'.repeat(60);
    const alias1 = `${prefix}_relOne`;
    const alias2 = `${prefix}_relTwo`;

    const safe1 = buildSafeTableAlias(alias1);
    const safe2 = buildSafeTableAlias(alias2);

    expect(safe1.length).toBe(POSTGRES_MAX_IDENTIFIER_LENGTH);
    expect(safe2.length).toBe(POSTGRES_MAX_IDENTIFIER_LENGTH);
    expect(safe1).not.toBe(safe2);
  });

  it('should be idempotent', () => {
    const longAlias =
      'very_long_custom_table_alias_that_definitely_exceeds_the_postgresql_sixty_three_byte_identifier_limit';
    const firstPass = buildSafeTableAlias(longAlias);
    const secondPass = buildSafeTableAlias(firstPass);

    expect(secondPass).toBe(firstPass);
  });
});
