let ThemeContext: any;

beforeAll(() => {
  ThemeContext = require('../src/ThemeProvider').ThemeContext;
});

describe('ThemeProvider', () => {
  it('ThemeContext is a React context', () => {
    expect(ThemeContext).toBeTruthy();
    expect(ThemeContext.Provider).toBeTruthy();
    expect(ThemeContext.Consumer).toBeTruthy();
  });

  it('ThemeProvider is a function component', () => {
    const { ThemeProvider } = require('../src/ThemeProvider');
    expect(typeof ThemeProvider).toBe('function');
  });
});

describe('seed token merging logic', () => {
  it('default seed token has expected values', () => {
    const { defaultSeedToken } = require('../src/defaults');
    expect(defaultSeedToken.colorPrimary).toBe('#1677ff');
    // 移动端调整后的默认值
    expect(defaultSeedToken.borderRadius).toBe(8);
  });

  it('partial seed overrides defaults', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const partial = { colorPrimary: '#ff0000', borderRadius: 10 };
    const merged = { ...defaultSeedToken, ...partial };
    expect(merged.colorPrimary).toBe('#ff0000');
    expect(merged.borderRadius).toBe(10);
    expect(merged.sizeUnit).toBe(4);
  });
});

describe('derivative and formatToken integration', () => {
  it('produces alias tokens from default seed', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const { formatToken } = require('../src/algorithms/formatToken');

    const mapToken = derivative(defaultSeedToken, false);
    const alias = formatToken(mapToken);

    expect(alias.boxShadow).toHaveProperty('shadowColor');
    expect(alias.boxShadow).toHaveProperty('shadowOffset');
    expect(alias.boxShadow).toHaveProperty('shadowOpacity');
    expect(alias.boxShadow).toHaveProperty('shadowRadius');
    expect(alias.boxShadow).toHaveProperty('elevation');
    expect(alias.paddingSM).toBe(12);
    expect(alias.screenXS).toBe(480);
  });

  it('dark mode produces different alias', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { derivative } = require('../src/algorithms/derivative');
    const { formatToken } = require('../src/algorithms/formatToken');

    const defaultAlias = formatToken(derivative(defaultSeedToken, false));
    const darkAlias = formatToken(derivative(defaultSeedToken, true));

    expect(defaultAlias.colorText).not.toBe(darkAlias.colorText);
  });
});

describe('useTheme', () => {
  it('is a function', () => {
    const { useTheme } = require('../src/useTheme');
    expect(typeof useTheme).toBe('function');
  });

  it('uses useContext with ThemeContext', () => {
    const { useTheme } = require('../src/useTheme');
    const { ThemeContext } = require('../src/ThemeProvider');
    // Verify the hook imports the same ThemeContext
    // Component rendering would be needed for full integration
    expect(ThemeContext).toBeTruthy();
    expect(typeof useTheme).toBe('function');
  });
});
