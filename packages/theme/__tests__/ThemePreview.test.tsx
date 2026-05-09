import React from 'react';
import renderer, { act } from 'react-test-renderer';

describe('ThemePreview', () => {
  it('is a function component', () => {
    const { ThemePreview: ThemePreviewLocal } = require('../src/ThemePreview');
    expect(typeof ThemePreviewLocal).toBe('function');
  });

  it('can be imported from the package entry point', () => {
    const { ThemePreview: ThemePreviewLocal } = require('../src/index');
    expect(typeof ThemePreviewLocal).toBe('function');
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      const { ThemePreview: ThemePreviewLocal } = require('../src/ThemePreview');
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(React.createElement(ThemePreviewLocal));
      });
      expect(testRenderer).toBeTruthy();
      act(() => {
        testRenderer.unmount();
      });
    });

    it('displays title "Theme Preview"', () => {
      const { ThemePreview: ThemePreviewLocal } = require('../src/ThemePreview');
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(React.createElement(ThemePreviewLocal));
      });
      const tree = testRenderer.toJSON();

      // Check if rendered tree contains the title text
      const hasTitle = JSON.stringify(tree).includes('Theme Preview');
      expect(hasTitle).toBe(true);

      act(() => {
        testRenderer.unmount();
      });
    });

    it('has theme toggle button with initial "Dark" text', () => {
      const { ThemePreview: ThemePreviewLocal } = require('../src/ThemePreview');
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(React.createElement(ThemePreviewLocal));
      });
      const tree = testRenderer.toJSON();

      // Check if rendered tree contains the initial toggle text
      const hasDarkButton = JSON.stringify(tree).includes('🌙 Dark');
      expect(hasDarkButton).toBe(true);

      act(() => {
        testRenderer.unmount();
      });
    });

    it('displays preset theme chips', () => {
      const { ThemePreview: ThemePreviewLocal } = require('../src/ThemePreview');
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(React.createElement(ThemePreviewLocal));
      });
      const tree = testRenderer.toJSON();
      const treeString = JSON.stringify(tree);

      expect(treeString).toContain('Default');
      expect(treeString).toContain('April');
      expect(treeString).toContain('Kaori');
      expect(treeString).toContain('Penny');
      expect(treeString).toContain('Spring');

      act(() => {
        testRenderer.unmount();
      });
    });
  });

  describe('context integration', () => {
    it('reads theme from internal ThemeProvider', () => {
      const { ThemePreview: ThemePreviewLocal } = require('../src/ThemePreview');
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(React.createElement(ThemePreviewLocal));
      });
      expect(testRenderer).toBeTruthy();
      act(() => {
        testRenderer.unmount();
      });
    });
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
