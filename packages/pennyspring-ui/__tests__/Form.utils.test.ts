import { getFieldErrorMessage } from '@pennyspring/ui/src/Form/utils/fieldError.ts';
import { normalizeValidateTrigger } from '@pennyspring/ui/src/Form/utils/normalizeValidateTrigger.ts';

describe('normalizeValidateTrigger', () => {
  it('defaults to onChange', () => {
    expect(normalizeValidateTrigger()).toEqual(['onChange']);
  });

  it('deduplicates triggers while keeping declaration order', () => {
    expect(normalizeValidateTrigger(['onBlur', 'onChange', 'onBlur'])).toEqual([
      'onBlur',
      'onChange',
    ]);
  });

  it('falls back to onChange for an empty array', () => {
    expect(normalizeValidateTrigger([])).toEqual(['onChange']);
  });
});

describe('getFieldErrorMessage', () => {
  it('returns the first usable message', () => {
    expect(
      getFieldErrorMessage([
        undefined,
        { message: '第一条错误' },
        '第二条错误',
      ]),
    ).toBe('第一条错误');
  });

  it('returns undefined when no entry carries a message', () => {
    expect(getFieldErrorMessage([undefined, null, ''])).toBeUndefined();
  });
});
