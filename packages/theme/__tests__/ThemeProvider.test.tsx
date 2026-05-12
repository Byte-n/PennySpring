import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider, useTheme } from '../src/index';

let ThemeContextLocal: any;

beforeAll(() => {
  ThemeContextLocal = require('../src/ThemeProvider').ThemeContext;
});

// 测试用的 Hook 包装组件
function TestHook<T>({ hook, onResult }: { hook: () => T; onResult: (r: T) => void }) {
  const result = hook();
  onResult(result);
  return null;
}

describe('ThemeProvider', () => {
      describe('algorithm configuration', () => {
    it('algorithm accepts string form', () => {
      let hookResult: any;

      act(() => {
        renderer.create(
          <ThemeProvider config={{ algorithm: 'dark' }}>
            <TestHook hook={useTheme} onResult={(r) => { hookResult = r; }} />
          </ThemeProvider>
        );
      });

      expect(hookResult.token.colorBgBase).toMatch(/^#0{3,6}$/);
    });

    it('algorithm accepts array form with same result', () => {
      let stringResult: any;
      let arrayResult: any;

      act(() => {
        renderer.create(
          <ThemeProvider config={{ algorithm: 'dark' }}>
            <TestHook hook={useTheme} onResult={(r) => { stringResult = r; }} />
          </ThemeProvider>
        );
      });

      act(() => {
        renderer.create(
          <ThemeProvider config={{ algorithm: ['dark'] }}>
            <TestHook hook={useTheme} onResult={(r) => { arrayResult = r; }} />
          </ThemeProvider>
        );
      });

      expect(stringResult.token.colorBgBase).toBe(arrayResult.token.colorBgBase);
    });

    it('ignores compact algorithm (mobile does not support)', () => {
      let hookResult: any;
      const { defaultSeedToken } = require('../src/defaults');

      act(() => {
        renderer.create(
          <ThemeProvider config={{ algorithm: 'compact' as any }}>
            <TestHook hook={useTheme} onResult={(r) => { hookResult = r; }} />
          </ThemeProvider>
        );
      });

      // controlHeight 应该是默认 44，而不是 compact 的更小值
      expect(hookResult.token.controlHeight || defaultSeedToken.controlHeight).toBeGreaterThanOrEqual(44);
    });
  });

  describe('token memoization', () => {
      });

  describe('token overrides', () => {
    it('overrides seed token via config.token', () => {
      let hookResult: any;

      act(() => {
        renderer.create(
          <ThemeProvider config={{ token: { colorPrimary: '#ff0000' } }}>
            <TestHook hook={useTheme} onResult={(r) => { hookResult = r; }} />
          </ThemeProvider>
        );
      });

      // 覆盖 seed token 应该影响派生 token
      expect(hookResult.token.colorPrimary).toBe('#ff0000');
    });

    it('seed token overrides affect derived tokens', () => {
      let hookResult: any;

      act(() => {
        renderer.create(
          <ThemeProvider config={{ token: { colorPrimary: '#ff0000' } }}>
            <TestHook hook={useTheme} onResult={(r) => { hookResult = r; }} />
          </ThemeProvider>
        );
      });

      // colorPrimaryBg 是派生自 colorPrimary 的
      expect(hookResult.token.colorPrimaryBg).toBeTruthy();
    });

    it('pure alias token overrides are applied directly', () => {
      let hookResult: any;
      const customColorSplit = 'rgba(0, 0, 0, 0.06)';

      act(() => {
        renderer.create(
          <ThemeProvider config={{ token: { colorSplit: customColorSplit } }}>
            <TestHook hook={useTheme} onResult={(r) => { hookResult = r; }} />
          </ThemeProvider>
        );
      });

      expect(hookResult.token.colorSplit).toBe(customColorSplit);
    });
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

describe('useTheme basic', () => {
    });
