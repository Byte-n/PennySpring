import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CheckCircleIcon } from 'phosphor-react-native';
import { defaultSeedToken, ThemeProvider } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Icon } from '../src/Icon';
import type { IconProps as PhosphorIconProps } from 'phosphor-react-native';

const token = formatToken(derivative(defaultSeedToken, false));

function TestIconGlyph(props: PhosphorIconProps) {
  return React.createElement('IconGlyph', props);
}

function renderIcon(props: Partial<React.ComponentProps<typeof Icon>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Icon icon={TestIconGlyph} testID="icon-under-test" {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function getGlyph(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(
    'IconGlyph' as unknown as React.ComponentType,
  );
}

describe('Icon', () => {
  it('renders built-in icon name', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <Icon icon="check-circle" testID="icon-under-test" />
        </ThemeProvider>,
      );
    });

    const iconNode = testRenderer!.root.findByProps({
      testID: 'icon-under-test',
    });

    expect(iconNode).toBeDefined();
  });

  it('supports phosphor icon component directly', () => {
    const testRenderer = renderIcon({ icon: CheckCircleIcon });
    const iconNode = testRenderer.root.findByProps({
      testID: 'icon-under-test',
    });

    expect(iconNode).toBeDefined();
  });

  it('uses normal icon size by default', () => {
    // Arrange + Act
    const testRenderer = renderIcon();

    // Assert
    expect(getGlyph(testRenderer).props.size).toBe(token.fontSize);
  });

  it('maps semantic sizes to typography tokens', () => {
    // Arrange + Act
    const smallRenderer = renderIcon({ size: 'small' });
    const normalRenderer = renderIcon({ size: 'normal' });
    const largeRenderer = renderIcon({ size: 'large' });

    // Assert
    expect(getGlyph(smallRenderer).props.size).toBe(token.fontSizeSM);
    expect(getGlyph(normalRenderer).props.size).toBe(token.fontSize);
    expect(getGlyph(largeRenderer).props.size).toBe(token.fontSizeLG);
  });

  it('resolves text-aligned semantic colors and alias color tokens', () => {
    // Arrange + Act
    const semanticRenderer = renderIcon({ color: 'secondary' });
    const aliasRenderer = renderIcon({ color: 'textDescription' });

    // Assert
    expect(getGlyph(semanticRenderer).props.color).toBe(
      token.colorTextSecondary,
    );
    expect(getGlyph(aliasRenderer).props.color).toBe(
      token.colorTextDescription,
    );
  });

  it('falls back to icon color for unknown runtime color values', () => {
    // Arrange + Act
    const testRenderer = renderIcon({ color: '#123456' as never });

    // Assert
    expect(getGlyph(testRenderer).props.color).toBe(token.colorIcon);
  });

  it('resolves duotone color and forwards base icon props', () => {
    // Arrange + Act
    const testRenderer = renderIcon({
      duotoneColor: 'heading',
      duotoneOpacity: token.opacityLoading,
      mirrored: true,
      weight: 'duotone',
    });

    // Assert
    const glyph = getGlyph(testRenderer);
    expect(glyph.props.duotoneColor).toBe(token.colorTextHeading);
    expect(glyph.props.duotoneOpacity).toBe(token.opacityLoading);
    expect(glyph.props.mirrored).toBe(true);
    expect(glyph.props.weight).toBe('duotone');
  });
});
