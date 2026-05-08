import React from 'react';
import { Pressable, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Space } from '../src/Space';

const token = formatToken(derivative(defaultSeedToken, false));

const SMALL_GAP = token.marginXXS;
const NORMAL_GAP = token.marginXS;
const LARGE_GAP = token.marginSM;

function renderSpace(props: Partial<React.ComponentProps<typeof Space>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Space {...props}>
          <Text>Income</Text>
          {null}
          <Text>Expense</Text>
          {undefined}
          <Text>Balance</Text>
        </Space>
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

    return node.type === View && Array.isArray(style) && style.includes(markerStyle);
  });
}

function getSpaceRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(View);
}

function getSpaceItems(testRenderer: renderer.ReactTestRenderer) {
  return getSpaceRoot(testRenderer).findAll((node) => {
    return node.type === View && node !== getSpaceRoot(testRenderer);
  });
}

describe('Space', () => {
  it('renders valid children horizontally by default', () => {
    const testRenderer = renderSpace();
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);

    expect(rootStyle.flexDirection).toBe('row');
    expect(getSpaceItems(testRenderer)).toHaveLength(3);
  });

  it('renders valid children vertically when direction is vertical', () => {
    const testRenderer = renderSpace({ direction: 'vertical' });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);

    expect(rootStyle.flexDirection).toBe('column');
    expect(getSpaceItems(testRenderer)).toHaveLength(3);
  });

  it('maps horizontal Space size to item spacing tokens', () => {
    function renderHorizontalGap(size: React.ComponentProps<typeof Space>['size']) {
      const testRenderer = renderSpace({ size });

      return flattenStyle(getSpaceItems(testRenderer)[0].props.style).marginRight;
    }

    expect(renderHorizontalGap('small')).toBe(SMALL_GAP);
    expect(renderHorizontalGap('normal')).toBe(NORMAL_GAP);
    expect(renderHorizontalGap('large')).toBe(LARGE_GAP);
  });

  it('maps vertical Space size to item spacing tokens', () => {
    function renderVerticalGap(size: React.ComponentProps<typeof Space>['size']) {
      const testRenderer = renderSpace({ direction: 'vertical', size });

      return flattenStyle(getSpaceItems(testRenderer)[0].props.style).marginBottom;
    }

    expect(renderVerticalGap('small')).toBe(SMALL_GAP);
    expect(renderVerticalGap('normal')).toBe(NORMAL_GAP);
    expect(renderVerticalGap('large')).toBe(LARGE_GAP);
  });

  it('does not add trailing spacing to the last item', () => {
    const testRenderer = renderSpace();
    const lastItemStyle = flattenStyle(getSpaceItems(testRenderer)[2].props.style);

    expect(lastItemStyle.marginRight).toBeUndefined();
    expect(lastItemStyle.marginBottom).toBeUndefined();
  });

  it('maps align and justify props to flexbox styles', () => {
    const testRenderer = renderSpace({
      align: 'center',
      justify: 'between',
    });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);

    expect(rootStyle.alignItems).toBe('center');
    expect(rootStyle.justifyContent).toBe('space-between');
  });

  it('adds wrapping behavior and vertical spacing when wrap is enabled', () => {
    const testRenderer = renderSpace({ wrap: true });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    const firstItemStyle = flattenStyle(getSpaceItems(testRenderer)[0].props.style);

    expect(rootStyle.flexWrap).toBe('wrap');
    expect(firstItemStyle.marginBottom).toBe(NORMAL_GAP);
  });

  it('stretches the root container when block is enabled', () => {
    const testRenderer = renderSpace({ block: true });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);

    expect(rootStyle.alignSelf).toBe('stretch');
  });

  it('applies root and item styles after token styles', () => {
    const rootStyle = { flex: 1 };
    const itemStyle = { marginRight: 0 };
    const testRenderer = renderSpace({
      style: rootStyle,
      styles: { item: itemStyle },
    });
    const root = getSpaceRoot(testRenderer);
    const firstItem = findNodesWithStyle(testRenderer, itemStyle)[0];

    expect(root.props.style).toContain(rootStyle);
    expect(flattenStyle(firstItem.props.style).marginRight).toBe(0);
  });

  it('does not bind built-in press behavior', () => {
    const testRenderer = renderSpace();

    expect(testRenderer.root.findAllByType(Pressable)).toHaveLength(0);
    expect(
      testRenderer.root.findAll((node) => node.props.accessibilityRole === 'button'),
    ).toHaveLength(0);
  });
});
