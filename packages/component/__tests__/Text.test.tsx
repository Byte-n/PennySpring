import React from 'react';
import renderer, { act } from 'react-test-renderer';
import type { TextStyle } from 'react-native';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Text } from '../src/Text';
import type { TextColor, TextWeight } from '../src/Text';

const token = formatToken(derivative(defaultSeedToken, false));

const EXPECTED_SIZE_STYLES = {
  sm: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  md: {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },
  lg: {
    fontSize: token.fontSizeLG,
    lineHeight: token.lineHeightLG,
  },
  xl: {
    fontSize: token.fontSizeXL,
    lineHeight: token.lineHeightXL,
  },
  h1: {
    fontSize: token.fontSizeHeading1,
    lineHeight: token.lineHeightHeading1,
  },
  h2: {
    fontSize: token.fontSizeHeading2,
    lineHeight: token.lineHeightHeading2,
  },
  h3: {
    fontSize: token.fontSizeHeading3,
    lineHeight: token.lineHeightHeading3,
  },
  h4: {
    fontSize: token.fontSizeHeading4,
    lineHeight: token.lineHeightHeading4,
  },
  h5: {
    fontSize: token.fontSizeHeading5,
    lineHeight: token.lineHeightHeading5,
  },
} as const;

const EXPECTED_WEIGHT_STYLES = {
  light: String(token.fontWeightLight) as TextStyle['fontWeight'],
  regular: String(token.fontWeightRegular) as TextStyle['fontWeight'],
  medium: String(token.fontWeightMedium) as TextStyle['fontWeight'],
  semibold: String(token.fontWeightSemiBold) as TextStyle['fontWeight'],
  bold: String(token.fontWeightBold) as TextStyle['fontWeight'],
  strong: String(token.fontWeightStrong) as TextStyle['fontWeight'],
} as const satisfies Record<TextWeight, TextStyle['fontWeight']>;

const EXPECTED_COLOR_STYLES = {
  base: token.colorTextBase,
  default: token.colorText,
  secondary: token.colorTextSecondary,
  tertiary: token.colorTextTertiary,
  quaternary: token.colorTextQuaternary,
  heading: token.colorTextHeading,
  label: token.colorTextLabel,
  description: token.colorTextDescription,
  disabled: token.colorTextDisabled,
  placeholder: token.colorTextPlaceholder,
  lightSolid: token.colorTextLightSolid,
} as const satisfies Record<TextColor, string>;

function renderText(props: React.ComponentProps<typeof Text>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Text {...props} />
      </ThemeProvider>
    );
  });

  return testRenderer!;
}

function getTextStyle(testRenderer: renderer.ReactTestRenderer) {
  const textNode = testRenderer.root.findByType(Text);
  const rnText = textNode.findByType('Text' as unknown as React.ComponentType);
  const flatStyles = Array.isArray(rnText.props.style)
    ? rnText.props.style
    : [rnText.props.style];

  return Object.assign({}, ...flatStyles);
}

describe('Text', () => {
  describe('size-to-token mapping', () => {
    it('uses base font tokens when no size prop is provided', () => {
      const testRenderer = renderText({ children: 'Hello' });
      const style = getTextStyle(testRenderer);

      expect(style.fontSize).toBe(EXPECTED_SIZE_STYLES.md.fontSize);
      expect(style.lineHeight).toBe(EXPECTED_SIZE_STYLES.md.lineHeight);
      expect(style.fontFamily).toBe(token.fontFamily);
      expect(style.color).toBe(token.colorText);
      expect(style.fontWeight).toBe(String(token.fontWeightRegular));
    });

    it('maps size="sm" to fontSizeSM and lineHeightSM', () => {
      const testRenderer = renderText({ size: 'sm', children: 'Hello' });
      const style = getTextStyle(testRenderer);

      expect(style.fontSize).toBe(EXPECTED_SIZE_STYLES.sm.fontSize);
      expect(style.lineHeight).toBe(EXPECTED_SIZE_STYLES.sm.lineHeight);
    });

    it.each(['md', 'lg', 'xl', 'h1', 'h2', 'h3', 'h4', 'h5'] as const)(
      'maps size="%s" to exact fontSize and lineHeight tokens',
      (size) => {
        const testRenderer = renderText({ size, children: 'Hello' });
        const style = getTextStyle(testRenderer);

        expect(style.fontSize).toBe(EXPECTED_SIZE_STYLES[size].fontSize);
        expect(style.lineHeight).toBe(EXPECTED_SIZE_STYLES[size].lineHeight);
      }
    );

    it('heading sizes have decreasing fontSize from h1 to h5', () => {
      const sizes = ['h1', 'h2', 'h3', 'h4', 'h5'] as const;
      const fontSizes = sizes.map((size) => {
        const testRenderer = renderText({ size, children: 'Hello' });
        return getTextStyle(testRenderer).fontSize;
      });

      for (let i = 0; i < fontSizes.length - 1; i++) {
        expect(fontSizes[i]).toBeGreaterThan(fontSizes[i + 1]);
      }
    });
  });

  describe('weight-to-token mapping', () => {
    it('uses regular font weight for body sizes when no weight prop is provided', () => {
      const testRenderer = renderText({ size: 'md', children: 'Hello' });
      const style = getTextStyle(testRenderer);

      expect(style.fontWeight).toBe(String(token.fontWeightRegular));
    });

    it('uses strong font weight for heading sizes when no weight prop is provided', () => {
      const testRenderer = renderText({ size: 'h2', children: 'Hello' });
      const style = getTextStyle(testRenderer);

      expect(style.fontWeight).toBe(String(token.fontWeightStrong));
    });

    it.each(
      Object.entries(EXPECTED_WEIGHT_STYLES) as Array<
        [TextWeight, TextStyle['fontWeight']]
      >
    )('maps weight="%s" to its fontWeight token', (weight, expectedWeight) => {
      const testRenderer = renderText({ weight, children: 'Hello' });
      const style = getTextStyle(testRenderer);

      expect(style.fontWeight).toBe(expectedWeight);
    });

    it('allows explicit weight to override size-derived default fontWeight', () => {
      const testRenderer = renderText({
        size: 'h2',
        weight: 'regular',
        children: 'Hello',
      });
      const style = getTextStyle(testRenderer);

      expect(style.fontWeight).toBe(String(token.fontWeightRegular));
    });
  });

  describe('color-to-token mapping', () => {
    it('uses default text color when no color prop is provided', () => {
      const testRenderer = renderText({ children: 'Hello' });
      const style = getTextStyle(testRenderer);

      expect(style.color).toBe(token.colorText);
    });

    it.each(
      Object.entries(EXPECTED_COLOR_STYLES) as Array<[TextColor, string]>
    )('maps color="%s" to its color token', (color, expectedColor) => {
      const testRenderer = renderText({ color, children: 'Hello' });
      const style = getTextStyle(testRenderer);

      expect(style.color).toBe(expectedColor);
    });
  });

  describe('style override', () => {
    it('allows user style to override token-derived fontSize', () => {
      const testRenderer = renderText({
        size: 'md',
        children: 'Hello',
        style: { fontSize: 20 },
      });
      const style = getTextStyle(testRenderer);

      expect(style.fontSize).toBe(20);
    });

    it('allows user style to override token-derived fontWeight', () => {
      const testRenderer = renderText({
        size: 'h2',
        children: 'Hello',
        style: { fontWeight: '400' },
      });
      const style = getTextStyle(testRenderer);

      expect(style.fontWeight).toBe('400');
    });

    it('allows user style to override token-derived color', () => {
      const testRenderer = renderText({
        color: 'secondary',
        children: 'Hello',
        style: { color: '#333333' },
      });
      const style = getTextStyle(testRenderer);

      expect(style.color).toBe('#333333');
    });

    it('merges additional user style properties', () => {
      const testRenderer = renderText({
        size: 'md',
        children: 'Hello',
        style: { color: '#333333' },
      });
      const style = getTextStyle(testRenderer);

      expect(style.fontSize).toBe(16);
      expect(style.color).toBe('#333333');
    });
  });

  describe('children rendering', () => {
    it('renders string children', () => {
      const testRenderer = renderText({ children: 'Hello' });
      const textNode = testRenderer.root.findByType(Text);
      const rnText = textNode.findByType('Text' as unknown as React.ComponentType);

      expect(rnText.props.children).toBe('Hello');
    });

    it('renders nested Text children', () => {
      const testRenderer = renderText({
        children: (
          <>
            <Text style={{ fontWeight: 'bold' }}>Bold</Text>
            {' normal'}
          </>
        ),
      });
      const nestedText = testRenderer.root
        .findAllByType(Text)
        .find(node => node.props.children === 'Bold');

      expect(nestedText).toBeDefined();
    });
  });

  describe('native props forwarding', () => {
    it('forwards numberOfLines to underlying RN Text', () => {
      const testRenderer = renderText({
        size: 'md',
        numberOfLines: 2,
        children: 'Hello',
      });
      const textNode = testRenderer.root.findByType(Text);
      const rnText = textNode.findByType('Text' as unknown as React.ComponentType);

      expect(rnText.props.numberOfLines).toBe(2);
    });

    it('forwards onPress to underlying RN Text', () => {
      const onPress = jest.fn();
      const testRenderer = renderText({
        size: 'md',
        onPress,
        children: 'Hello',
      });
      const textNode = testRenderer.root.findByType(Text);
      const rnText = textNode.findByType('Text' as unknown as React.ComponentType);

      expect(rnText.props.onPress).toBe(onPress);
    });
  });
});
