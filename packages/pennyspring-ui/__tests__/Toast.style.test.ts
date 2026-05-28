import { SIZE_TOKEN_MAP, useStyles } from '../src/Toast/style';

describe('Toast style exports', () => {
  it('exports SIZE_TOKEN_MAP with entries for all component sizes', () => {
    expect(SIZE_TOKEN_MAP).toBeDefined();
    expect(SIZE_TOKEN_MAP.small).toBeDefined();
    expect(SIZE_TOKEN_MAP.normal).toBeDefined();
    expect(SIZE_TOKEN_MAP.large).toBeDefined();

    expect(SIZE_TOKEN_MAP.small.textSize).toBe('sm');
    expect(SIZE_TOKEN_MAP.normal.textSize).toBe('md');
    expect(SIZE_TOKEN_MAP.large.textSize).toBe('lg');
  });

  it('each SIZE_TOKEN_MAP entry provides verticalPadding and horizontalPadding functions', () => {
    const sizes = ['small', 'normal', 'large'] as const;

    for (const size of sizes) {
      const entry = SIZE_TOKEN_MAP[size];
      expect(typeof entry.verticalPadding).toBe('function');
      expect(typeof entry.horizontalPadding).toBe('function');
    }
  });

  it('exports useStyles hook', () => {
    expect(typeof useStyles).toBe('function');
  });
});
