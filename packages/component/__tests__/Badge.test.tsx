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

function findNodesWithStyle(
  testRenderer: renderer.ReactTestRenderer,
  markerStyle: Record<string, unknown>,
) {
  return testRenderer.root.findAll((node) => {
    const style = node.props.style;

    return style === markerStyle || (Array.isArray(style) && style.includes(markerStyle));
  });
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

function getDotStyle(testRenderer: renderer.ReactTestRenderer) {
  const dotNode = testRenderer.root.findAll((node) => {
    const flattened = flattenStyle(node.props.style);

    return flattened.width !== undefined
      && flattened.height !== undefined
      && flattened.width === flattened.height
      && flattened.borderRadius === flattened.width;
  })[0];

  if (dotNode === undefined) {
    throw new Error('Cannot find dot style node');
  }

  return flattenStyle(dotNode.props.style);
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

  it('maps size to token-driven indicator and dot dimensions', () => {
    const smallBadge = renderBadge({ size: 'small', count: 8 });
    const normalBadge = renderBadge({ size: 'normal', count: 8 });
    const largeBadge = renderBadge({ size: 'large', count: 8 });
    const largeDot = renderBadge({ size: 'large', dot: true });

    expect(getIndicatorStyleByText(smallBadge, '8').minHeight).toBe(token.controlHeightXS);
    expect(getIndicatorStyleByText(normalBadge, '8').minHeight).toBe(token.controlHeightSM);
    expect(getIndicatorStyleByText(largeBadge, '8').minHeight).toBe(token.controlHeight);

    const dotStyle = getDotStyle(largeDot);

    expect(dotStyle.width).toBe(token.sizeSM);
    expect(dotStyle.height).toBe(token.sizeSM);
  });

  it('maps semantic and preset colors to token families', () => {
    const successBadge = renderBadge({
      count: 3,
      color: 'success',
    });
    const goldBadge = renderBadge({
      count: 3,
      color: 'gold',
    });

    expect(getIndicatorStyleByText(successBadge, '3').backgroundColor).toBe(token.colorSuccess);
    expect(getIndicatorStyleByText(goldBadge, '3').backgroundColor).toBe(token.gold6);
  });

  it('renders custom node count without applying content slot style', () => {
    const contentStyle = { opacity: 0.88 };
    const customStyle = { opacity: 0.89 };
    const testRenderer = renderBadge({
      count: <RNText style={customStyle}>New</RNText>,
      styles: {
        content: contentStyle,
      },
    });

    expect(findNodesWithStyle(testRenderer, contentStyle)).toHaveLength(0);
    expect(findNodesWithStyle(testRenderer, customStyle).length).toBeGreaterThan(0);
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

  it('applies root and slot style overrides after token styles', () => {
    const rootStyle = { flex: 1 };
    const indicatorStyle = { opacity: 0.71 };
    const dotStyle = { opacity: 0.72 };
    const testRenderer = renderBadge({
      dot: true,
      style: rootStyle,
      styles: {
        indicator: indicatorStyle,
        dot: dotStyle,
      },
    });
    const root = testRenderer.root.findAllByType(View)[0];

    expect(root.props.style).toContain(rootStyle);
    expect(findNodesWithStyle(testRenderer, indicatorStyle).length).toBeGreaterThan(0);
    expect(findNodesWithStyle(testRenderer, dotStyle).length).toBeGreaterThan(0);
  });
});
