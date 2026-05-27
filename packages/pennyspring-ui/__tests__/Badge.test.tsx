import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Badge } from '../src/Badge';

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

function readText(node: renderer.ReactTestInstance) {
  const { children } = node.props;

  if (Array.isArray(children)) {
    return children.join('');
  }

  return String(children ?? '');
}

function getIndicatorStyleByText(
  testRenderer: renderer.ReactTestRenderer,
  text: string,
) {
  const textNode = testRenderer.root.findAllByType(RNText).find((node) => {
    return readText(node) === text;
  });

  if (!textNode?.parent) {
    throw new Error(`Cannot find indicator for text: ${text}`);
  }

  let currentNode: renderer.ReactTestInstance | null = textNode.parent;

  while (currentNode !== null) {
    const flattened = flattenStyle(currentNode.props.style);

    if (
      flattened.minHeight !== undefined
      && flattened.minWidth !== undefined
      && flattened.justifyContent === 'center'
    ) {
      return flattened;
    }

    currentNode = currentNode.parent;
  }

  throw new Error(`Cannot resolve indicator style for text: ${text}`);
}

function getDotIndicatorStyle(testRenderer: renderer.ReactTestRenderer) {
  const dotNode = testRenderer.root.findAll((node) => {
    const flattened = flattenStyle(node.props.style);

    return flattened.width !== undefined
      && flattened.height !== undefined
      && flattened.width === flattened.height
      && flattened.borderRadius === flattened.width;
  })[0];

  if (dotNode?.parent == null) {
    throw new Error('Cannot find dot indicator style node');
  }

  return flattenStyle(dotNode.parent.props.style);
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

    expect(getIndicatorStyleByText(withChildRenderer, '6').position).toBe('absolute');
    expect(getIndicatorStyleByText(standaloneRenderer, '6').position).toBeUndefined();
  });

  it('positions child dot badge by its own radius', () => {
    const testRenderer = renderBadge({
      count: 1,
      dot: true,
      children: <View />,
    });
    const indicatorStyle = getDotIndicatorStyle(testRenderer);

    expect(indicatorStyle.transform).toEqual([
      { translateX: token.sizeXS / 2 },
      { translateY: -token.sizeXS / 2 },
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
      { translateX: token.sizeXS / 2 + 3 },
      { translateY: -token.sizeXS / 2 + 5 },
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
      { translateX: token.sizeXS / 2 + 4 },
      { translateY: -token.sizeXS / 2 + 4 },
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

    expect(getIndicatorStyleByText(defaultRenderer, '1').backgroundColor).toBe(token.colorText);
    expect(getIndicatorStyleByText(dangerRenderer, '1').backgroundColor).toBe(token.colorError);
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
});
