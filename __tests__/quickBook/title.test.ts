import { buildQuickBookThreadTitle } from '../../src/features/quickBook/title';

describe('buildQuickBookThreadTitle', () => {
  it('builds a fixed title with month, day, hour and minute', () => {
    expect(buildQuickBookThreadTitle(new Date(2026, 9, 30, 14, 22))).toBe(
      '截图记账 10-30 14:22',
    );
  });

  it('pads single digit months, days, hours and minutes', () => {
    expect(buildQuickBookThreadTitle(new Date(2026, 0, 5, 9, 3))).toBe(
      '截图记账 01-05 09:03',
    );
  });
});
