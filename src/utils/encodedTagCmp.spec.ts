import { encodedTagCmp, isNewerVersion } from './encodedTagCmp';

describe('encodedTagCmp', () => {
  it('should return 0 if tags are equal', () => {
    expect(encodedTagCmp('1_1_1', '1_1_1')).toBe(0);
    expect(isNewerVersion('1_1_1', '1_1_1')).toBe(false);
  });

  it('should return 1 if tag a is greater than tag b', () => {
    const higherVersions = [
      '1_1_2',
      '1_2_1',
      '2_1_1',
      '3_2_1',
      '1_2_3',
      '1_1_100',
    ];
    const reference = '1_1_1';
    higherVersions.forEach((version) => {
      expect(encodedTagCmp(version, reference)).toEqual(1);
      expect(isNewerVersion(version, reference)).toBe(true);
    });
  });

  it('should return -1 if tag a is greater than tag b', () => {
    const lowerVersions = [
      '0_1_2',
      '1_1_0',
      '1_0_1',
      '1_0_9',
      '0_2_3',
      '0_1_100',
    ];
    const reference = '1_1_1';
    lowerVersions.forEach((version) => {
      expect(encodedTagCmp(version, reference)).toEqual(-1);
      expect(isNewerVersion(version, reference)).toBe(false);
    });
  });
});
