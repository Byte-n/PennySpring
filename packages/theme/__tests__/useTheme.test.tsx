describe('useTheme', () => {
  it('is a function', () => {
    const { useTheme } = require('../src/useTheme');
    expect(typeof useTheme).toBe('function');
  });

  it('can be imported without error', () => {
    const { useTheme } = require('../src/useTheme');
    expect(useTheme).toBeTruthy();
  });
});
