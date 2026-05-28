import { useStyles } from '../src/Row/style';
import type { RowStyleOptions } from '../src/Row/style';

describe('Row style module', () => {
  it('exports useStyles hook from style/index.ts', () => {
    expect(useStyles).toBeDefined();
    expect(typeof useStyles).toBe('function');
  });

  it('exports RowStyleOptions type', () => {
    // Type-only export; verify the module resolves without error
    const options: RowStyleOptions = {
      align: 'center',
      gap: 'normal',
      justify: 'start',
      wrap: false,
    };
    expect(options).toBeDefined();
  });
});
