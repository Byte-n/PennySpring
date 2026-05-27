import type { ColumnProps as ColumnPropsFromIndex } from '../src/Column';
import type { ColumnProps as ColumnPropsFromTypes } from '../src/Column/types';

type Assert<T extends true> = T;
type IsEqual<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends
  (<T>() => T extends TRight ? 1 : 2)
    ? true
    : false;

describe('Column API ownership', () => {
  it('exposes ColumnProps from Column/types.ts through Column entry', () => {
    // Arrange
    const assertion: Assert<
      IsEqual<ColumnPropsFromIndex, ColumnPropsFromTypes>
    > = true;

    // Assert
    expect(assertion).toBe(true);
  });
});
