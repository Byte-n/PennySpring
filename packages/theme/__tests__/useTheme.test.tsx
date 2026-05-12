import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider, useTheme } from '../src/index';

// 测试用的 Hook 包装组件
function TestHook<T>({ hook, onResult }: { hook: () => T; onResult: (r: T) => void }) {
  const result = hook();
  onResult(result);
  return null;
}

describe('useTheme', () => {
      describe('hook behavior', () => {
    it('returns { token: AliasToken } structure', () => {
      let hookResult: any;

      act(() => {
        renderer.create(
          <ThemeProvider>
            <TestHook
              hook={useTheme}
              onResult={(r) => { hookResult = r; }}
            />
          </ThemeProvider>
        );
      });

      expect(hookResult).toHaveProperty('token');
      expect(typeof hookResult.token).toBe('object');
    });

    it('token contains all AliasToken fields in default mode', () => {
      let hookResult: any;

      act(() => {
        renderer.create(
          <ThemeProvider>
            <TestHook
              hook={useTheme}
              onResult={(r) => { hookResult = r; }}
            />
          </ThemeProvider>
        );
      });

      const { token } = hookResult;

      // 核心颜色 token
      expect(token.colorPrimary).toBeTruthy();
      expect(token.colorText).toBeTruthy();
      expect(token.colorBgContainer).toBeTruthy();

      // 阴影 token
      expect(token.boxShadow).toBeTruthy();
      expect(token.boxShadow).toHaveProperty('shadowColor');
      expect(token.boxShadow).toHaveProperty('shadowOffset');
      expect(token.boxShadow).toHaveProperty('shadowOpacity');
      expect(token.boxShadow).toHaveProperty('shadowRadius');
      expect(token.boxShadow).toHaveProperty('elevation');

      // 间距 token
      expect(token.paddingSM).toBeGreaterThan(0);
      expect(token.marginXS).toBeGreaterThan(0);

      // 字体 token
      expect(token.fontSize).toBeGreaterThan(0);
      expect(token.lineHeight).toBeGreaterThan(0);

    });

    it('returns different tokens in dark mode', () => {
      let defaultResult: any;
      let darkResult: any;

      act(() => {
        renderer.create(
          <ThemeProvider>
            <TestHook
              hook={useTheme}
              onResult={(r) => { defaultResult = r; }}
            />
          </ThemeProvider>
        );
      });

      act(() => {
        renderer.create(
          <ThemeProvider config={{ algorithm: 'dark' }}>
            <TestHook
              hook={useTheme}
              onResult={(r) => { darkResult = r; }}
            />
          </ThemeProvider>
        );
      });

      expect(defaultResult.token.colorBgBase).not.toBe(darkResult.token.colorBgBase);
      expect(darkResult.token.colorBgBase).toMatch(/^#0{3,6}$/);
    });
  });
});
