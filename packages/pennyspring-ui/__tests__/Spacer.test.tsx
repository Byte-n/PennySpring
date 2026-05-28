import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Spacer } from '../src/Spacer';

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}

function renderSpacer(
  props: Partial<React.ComponentProps<typeof Spacer>> = {},
  tokenOverrides?: Record<string, number>,
) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      tokenOverrides ? (
        <ThemeProvider config={{ token: tokenOverrides }}>
          <Spacer {...props} />
        </ThemeProvider>
      ) : (
        <Spacer {...props} />
      ),
    );
  });
  return testRenderer!;
}

function getSpacerRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByProps({ testID: 'spacer' });
}

describe('Spacer', () => {
  describe('default behavior', () => {
    it('defaults to flex 1 when neither size nor flex is provided', () => {
      const testRenderer = renderSpacer();
      const rootStyle = flattenStyle(getSpacerRoot(testRenderer).props.style);

      expect(rootStyle.flex).toBe(1);
      expect(rootStyle.width).toBeUndefined();
      expect(rootStyle.height).toBeUndefined();
    });

    it('defaults direction to horizontal', () => {
      const testRenderer = renderSpacer(
        { size: 'normal' },
        { paddingXS: 10 },
      );
      const rootStyle = flattenStyle(getSpacerRoot(testRenderer).props.style);

      expect(rootStyle.width).toBe(10);
      expect(rootStyle.height).toBeUndefined();
    });
  });

  describe('size mapping', () => {
    it.each([
      ['small', 4],
      ['normal', 8],
      ['large', 12],
    ] as const)(
      'maps %s size to layout gap token for width in horizontal direction',
      (size, expectedWidth) => {
        const testRenderer = renderSpacer(
          { size },
          { paddingXXS: 4, paddingXS: 8, paddingSM: 12 },
        );
        const rootStyle = flattenStyle(getSpacerRoot(testRenderer).props.style);

        expect(rootStyle.width).toBe(expectedWidth);
        expect(rootStyle.height).toBeUndefined();
      },
    );

    it.each([
      ['small', 2],
      ['normal', 4],
      ['large', 6],
    ] as const)(
      'maps %s size to half-gap token for height in vertical direction',
      (size, expectedHeight) => {
        const testRenderer = renderSpacer(
          { size, direction: 'vertical' },
          { paddingXXS: 4, paddingXS: 8, paddingSM: 12 },
        );
        const rootStyle = flattenStyle(getSpacerRoot(testRenderer).props.style);

        expect(rootStyle.height).toBe(expectedHeight);
        expect(rootStyle.width).toBeUndefined();
      },
    );
  });

  describe('flex override', () => {
    it('applies custom flex value when size is not provided', () => {
      const testRenderer = renderSpacer({ flex: 0 });
      const rootStyle = flattenStyle(getSpacerRoot(testRenderer).props.style);

      expect(rootStyle.flex).toBe(0);
      expect(rootStyle.width).toBeUndefined();
      expect(rootStyle.height).toBeUndefined();
    });

    it('does not apply flex when size is provided', () => {
      const testRenderer = renderSpacer(
        { size: 'normal', flex: 2 },
        { paddingXS: 8 },
      );
      const rootStyle = flattenStyle(getSpacerRoot(testRenderer).props.style);

      expect(rootStyle.width).toBe(8);
      expect(rootStyle.flex).toBeUndefined();
    });
  });

  describe('external style override', () => {
    it('merges external style after token styles, allowing override', () => {
      const testRenderer = renderSpacer({
        flex: 1,
        style: { flex: 3, backgroundColor: 'red' },
      });
      const rootStyle = flattenStyle(getSpacerRoot(testRenderer).props.style);

      expect(rootStyle.flex).toBe(3);
      expect(rootStyle.backgroundColor).toBe('red');
    });
  });
});
