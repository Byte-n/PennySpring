import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Text } from '../src/Text';
import { useStyles, SIZE_MAP, WEIGHT_MAP, SIZE_DEFAULT_WEIGHT_MAP } from '../src/Text/style';

function renderWithTheme(children: React.ReactElement) {
  let result: renderer.ReactTestRenderer;
  act(() => {
    result = renderer.create(
      <ThemeProvider>{children}</ThemeProvider>,
    );
  });
  return result!;
}

describe('Text style module', () => {
  it('exports useStyles hook', () => {
    expect(typeof useStyles).toBe('function');
  });

  it('exports SIZE_MAP with entries for all TextSize values', () => {
    const expectedSizes = ['sm', 'md', 'lg', 'xl', 'h1', 'h2', 'h3', 'h4', 'h5'];
    for (const size of expectedSizes) {
      expect(SIZE_MAP).toHaveProperty(size);
      expect(typeof SIZE_MAP[size as keyof typeof SIZE_MAP].fontSize).toBe('function');
      expect(typeof SIZE_MAP[size as keyof typeof SIZE_MAP].lineHeight).toBe('function');
    }
  });

  it('exports WEIGHT_MAP with entries for all TextWeight values', () => {
    const expectedWeights = ['light', 'regular', 'medium', 'semibold', 'bold', 'strong'];
    for (const weight of expectedWeights) {
      expect(WEIGHT_MAP).toHaveProperty(weight);
      expect(typeof WEIGHT_MAP[weight as keyof typeof WEIGHT_MAP]).toBe('function');
    }
  });

  it('exports SIZE_DEFAULT_WEIGHT_MAP mapping heading sizes to strong', () => {
    expect(SIZE_DEFAULT_WEIGHT_MAP.h1).toBe('strong');
    expect(SIZE_DEFAULT_WEIGHT_MAP.h2).toBe('strong');
    expect(SIZE_DEFAULT_WEIGHT_MAP.h3).toBe('strong');
    expect(SIZE_DEFAULT_WEIGHT_MAP.h4).toBe('strong');
    expect(SIZE_DEFAULT_WEIGHT_MAP.h5).toBe('strong');
    expect(SIZE_DEFAULT_WEIGHT_MAP.sm).toBe('regular');
    expect(SIZE_DEFAULT_WEIGHT_MAP.md).toBe('regular');
  });

  it('renders Text component correctly after style migration', () => {
    const testRenderer = renderWithTheme(
      <Text size="lg" weight="bold">Styled Text</Text>,
    );
    const textNode = testRenderer.root.findByType(Text);
    const rnText = textNode.findByType('Text' as unknown as React.ComponentType);
    expect(rnText.props.children).toBe('Styled Text');
    expect(rnText.props.style[0]).toHaveProperty('fontSize');
    expect(rnText.props.style[0]).toHaveProperty('fontWeight');
  });
});
