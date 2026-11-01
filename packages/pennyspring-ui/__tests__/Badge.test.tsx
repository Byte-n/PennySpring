import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Badge } from '../src/Badge';
import { Text } from '../src/Text';
import { DEFAULT_OVERFLOW_COUNT } from '../src/Badge/Badge';

const token = formatToken(derivative(defaultSeedToken, false));

function renderBadge(props: Partial<React.ComponentProps<typeof Badge>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Badge {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function getIndicatorStyle(testRenderer: renderer.ReactTestRenderer) {
  return flattenStyle(
    testRenderer.root.findByProps({ testID: 'badge-indicator' }).props.style,
  );
}

function getIndicatorAnchorStyle(testRenderer: renderer.ReactTestRenderer) {
  return flattenStyle(
    testRenderer.root.findByProps({ testID: 'badge-anchor' }).props.style,
  );
}

function getIndicatorStyleByText(
  testRenderer: renderer.ReactTestRenderer,
  _text: string,
) {
  return getIndicatorStyle(testRenderer);
}

function getIndicatorAnchorStyleByText(
  testRenderer: renderer.ReactTestRenderer,
  _text: string,
) {
  return getIndicatorAnchorStyle(testRenderer);
}

function getDotIndicatorStyle(testRenderer: renderer.ReactTestRenderer) {
  return getIndicatorAnchorStyle(testRenderer);
}

describe('Badge', () => {
  it('renders nothing when count is missing and dot is disabled', () => {
    const testRenderer = renderBadge();

    expect(testRenderer.toJSON()).toBeNull();
  });

  it('supports overflow count and showZero behavior for numeric count', () => {
    const overflowRenderer = renderBadge({
      count: 120,
      overflowCount: 99,
    });
    const hiddenZeroRenderer = renderBadge({
      count: 0,
    });
    const shownZeroRenderer = renderBadge({
      count: 0,
      showZero: true,
    });

    expect(JSON.stringify(overflowRenderer.toJSON())).toContain('99+');
    expect(hiddenZeroRenderer.toJSON()).toBeNull();
    expect(JSON.stringify(shownZeroRenderer.toJSON())).toContain('0');
  });

  it('supports dot mode and hides zero dot when count equals zero', () => {
    const dotRenderer = renderBadge({
      dot: true,
    });
    const hiddenDotRenderer = renderBadge({
      count: 0,
      dot: true,
    });

    expect(dotRenderer.root.findAllByType(RNText)).toHaveLength(0);
    expect(hiddenDotRenderer.toJSON()).toBeNull();
  });

  it('overlays indicator when children exist and keeps standalone indicator relative', () => {
    const withChildRenderer = renderBadge({
      count: 6,
      children: <View />,
    });
    const standaloneRenderer = renderBadge({
      count: 6,
    });

    expect(getIndicatorAnchorStyleByText(withChildRenderer, '6').position).toBe(
      'absolute',
    );
    expect(
      getIndicatorAnchorStyleByText(standaloneRenderer, '6').position,
    ).toBeUndefined();
    expect(
      getIndicatorAnchorStyleByText(withChildRenderer, '6').borderWidth,
    ).toBe(2);
    expect(
      getIndicatorAnchorStyleByText(standaloneRenderer, '6').borderWidth,
    ).toBeUndefined();
  });

  it('positions child dot badge by its own radius', () => {
    const testRenderer = renderBadge({
      count: 1,
      dot: true,
      children: <View />,
    });
    const indicatorStyle = getDotIndicatorStyle(testRenderer);

    expect(indicatorStyle.transform).toEqual([
      { translateX: 4 },
      { translateY: -4 },
    ]);
  });

  it('applies tuple offset to child badge position', () => {
    const testRenderer = renderBadge({
      count: 1,
      dot: true,
      offset: [3, 5],
      children: <View />,
    });
    const indicatorStyle = getDotIndicatorStyle(testRenderer);

    expect(indicatorStyle.transform).toEqual([
      { translateX: 4 + 3 },
      { translateY: -4 + 5 },
    ]);
  });

  it('applies numeric offset to both child badge axes', () => {
    const testRenderer = renderBadge({
      count: 1,
      dot: true,
      offset: 4,
      children: <View />,
    });
    const indicatorStyle = getDotIndicatorStyle(testRenderer);

    expect(indicatorStyle.transform).toEqual([
      { translateX: 4 + 4 },
      { translateY: -4 + 4 },
    ]);
  });

  it('maps default color to neutral style instead of danger style', () => {
    const defaultRenderer = renderBadge({
      count: 1,
    });
    const dangerRenderer = renderBadge({
      count: 1,
      color: 'danger',
    });

    expect(getIndicatorStyleByText(defaultRenderer, '1').backgroundColor).toBe(
      token.colorText,
    );
    expect(getIndicatorStyleByText(dangerRenderer, '1').backgroundColor).toBe(
      token.colorError,
    );
  });

  it('keeps children when badge should be hidden', () => {
    const hiddenWithChildRenderer = renderBadge({
      count: 0,
      showZero: false,
      children: <View testID="badge-child" />,
    });

    const childNode = hiddenWithChildRenderer.root.findByProps({
      testID: 'badge-child',
    });

    expect(childNode).toBeTruthy();
    expect(hiddenWithChildRenderer.root.findAllByType(RNText)).toHaveLength(0);
  });

  it('uses Text semantic props for count content instead of injecting text color and size via style', () => {
    // Arrange
    const testRenderer = renderBadge({
      count: 8,
      size: 'large',
    });

    // Act
    const badgeTextNode = testRenderer.root.findByType(Text);
    const mergedStyle = flattenStyle(badgeTextNode.props.style);

    // Assert
    expect(badgeTextNode.props.color).toBe('lightSolid');
    expect(badgeTextNode.props.weight).toBe('semibold');
    expect(badgeTextNode.props.size).toBe('sm');
    expect(mergedStyle.color).toBeUndefined();
    expect(mergedStyle.fontSize).toBeUndefined();
    expect(mergedStyle.fontWeight).toBeUndefined();
  });

  it('uses named default overflow threshold when overflowCount is not provided', () => {
    // Arrange
    const exceededCount = DEFAULT_OVERFLOW_COUNT + 1;

    // Act
    const testRenderer = renderBadge({
      count: exceededCount,
    });

    // Assert
    expect(JSON.stringify(testRenderer.toJSON())).toContain(
      `${DEFAULT_OVERFLOW_COUNT}+`,
    );
  });
});
