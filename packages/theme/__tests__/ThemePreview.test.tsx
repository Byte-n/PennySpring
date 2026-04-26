describe('ThemePreview', () => {
  it('is a function component', () => {
    const { ThemePreview } = require('../src/ThemePreview');
    expect(typeof ThemePreview).toBe('function');
  });

  it('can be imported from the package entry point', () => {
    const { ThemePreview } = require('../src/index');
    expect(typeof ThemePreview).toBe('function');
  });
});

describe('barrel exports', () => {
  it('exports ThemeProvider from index', () => {
    const { ThemeProvider } = require('../src/index');
    expect(typeof ThemeProvider).toBe('function');
  });

  it('exports useTheme from index', () => {
    const { useTheme } = require('../src/index');
    expect(typeof useTheme).toBe('function');
  });

  it('exports toShadowStyle from index', () => {
    const { toShadowStyle } = require('../src/index');
    expect(typeof toShadowStyle).toBe('function');
  });

  it('exports defaultSeedToken from index', () => {
    const { defaultSeedToken } = require('../src/index');
    expect(defaultSeedToken.colorPrimary).toBe('#1677ff');
  });

  it('exports defaultPresetColors from index', () => {
    const { defaultPresetColors } = require('../src/index');
    expect(defaultPresetColors.blue).toBe('#1677FF');
  });

  it('exports ThemeContext from index', () => {
    const { ThemeContext } = require('../src/index');
    expect(ThemeContext).toBeTruthy();
  });
});
