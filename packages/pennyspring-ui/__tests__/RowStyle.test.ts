import { useStyles } from '../src/Row/style';

describe('Row style module', () => {
  it('exports useStyles hook from style/index.ts', () => {
    expect(useStyles).toBeDefined();
    expect(typeof useStyles).toBe('function');
  });

});
