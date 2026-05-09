import React from 'react';
import { Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Grid } from '../src/Grid';

const GAP = 8;
const HORIZONTAL_GAP = 10;
const VERTICAL_GAP = 14;
const SMALL_GAP = 4;
const NORMAL_GAP = 8;
const LARGE_GAP = 12;
const FULL_PERCENT = 100;

function renderGrid(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<ThemeProvider>{element}</ThemeProvider>);
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function findGridItems(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll((node) => {
    return node.type === View && node.props.testID === 'grid-item';
  });
}

describe('Grid', () => {
  it('renders children as wrapped grid items', () => {
    const testRenderer = renderGrid(
      <Grid columns={3}>
        <Grid.Item>
          <Text>Food</Text>
        </Grid.Item>
        <Grid.Item>
          <Text>Travel</Text>
        </Grid.Item>
        <Grid.Item>
          <Text>Salary</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(flattenStyle(root.props.style).flexWrap).toBe('wrap');
    expect(findGridItems(testRenderer)).toHaveLength(3);
    expect(treeString.indexOf('Food')).toBeLessThan(treeString.indexOf('Travel'));
    expect(treeString.indexOf('Travel')).toBeLessThan(treeString.indexOf('Salary'));
  });

  it('maps scalar gap to matching horizontal and vertical item padding', () => {
    const testRenderer = renderGrid(
      <Grid columns={2} gap={GAP}>
        <Grid.Item>
          <Text>Food</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const item = findGridItems(testRenderer)[0];

    expect(flattenStyle(root.props.style).marginHorizontal).toBe(-GAP / 2);
    expect(flattenStyle(root.props.style).marginVertical).toBe(-GAP / 2);
    expect(flattenStyle(item.props.style).paddingHorizontal).toBe(GAP / 2);
    expect(flattenStyle(item.props.style).paddingVertical).toBe(GAP / 2);
  });

  it('maps tuple gap to horizontal and vertical item padding', () => {
    const testRenderer = renderGrid(
      <Grid columns={2} gap={[HORIZONTAL_GAP, VERTICAL_GAP]}>
        <Grid.Item>
          <Text>Food</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const item = findGridItems(testRenderer)[0];

    expect(flattenStyle(root.props.style).marginHorizontal).toBe(-HORIZONTAL_GAP / 2);
    expect(flattenStyle(root.props.style).marginVertical).toBe(-VERTICAL_GAP / 2);
    expect(flattenStyle(item.props.style).paddingHorizontal).toBe(HORIZONTAL_GAP / 2);
    expect(flattenStyle(item.props.style).paddingVertical).toBe(VERTICAL_GAP / 2);
  });

  it('maps size gap to theme spacing tokens', () => {
    const testRenderer = renderGrid(
      <Grid columns={2} gap="normal">
        <Grid.Item>
          <Text>Food</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const item = findGridItems(testRenderer)[0];

    expect(flattenStyle(root.props.style).marginHorizontal).toBe(-NORMAL_GAP / 2);
    expect(flattenStyle(root.props.style).marginVertical).toBe(-NORMAL_GAP / 2);
    expect(flattenStyle(item.props.style).paddingHorizontal).toBe(NORMAL_GAP / 2);
    expect(flattenStyle(item.props.style).paddingVertical).toBe(NORMAL_GAP / 2);
  });

  it('maps tuple size gap to theme spacing tokens', () => {
    const testRenderer = renderGrid(
      <Grid columns={2} gap={['small', 'large']}>
        <Grid.Item>
          <Text>Food</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const item = findGridItems(testRenderer)[0];

    expect(flattenStyle(root.props.style).marginHorizontal).toBe(-SMALL_GAP / 2);
    expect(flattenStyle(root.props.style).marginVertical).toBe(-LARGE_GAP / 2);
    expect(flattenStyle(item.props.style).paddingHorizontal).toBe(SMALL_GAP / 2);
    expect(flattenStyle(item.props.style).paddingVertical).toBe(LARGE_GAP / 2);
  });

  it('supports mixed number and size tuple gap', () => {
    const testRenderer = renderGrid(
      <Grid columns={2} gap={[HORIZONTAL_GAP, 'small']}>
        <Grid.Item>
          <Text>Food</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const item = findGridItems(testRenderer)[0];

    expect(flattenStyle(root.props.style).marginHorizontal).toBe(-HORIZONTAL_GAP / 2);
    expect(flattenStyle(root.props.style).marginVertical).toBe(-SMALL_GAP / 2);
    expect(flattenStyle(item.props.style).paddingHorizontal).toBe(HORIZONTAL_GAP / 2);
    expect(flattenStyle(item.props.style).paddingVertical).toBe(SMALL_GAP / 2);
  });

  it('uses span to calculate item width from column count', () => {
    const testRenderer = renderGrid(
      <Grid columns={4}>
        <Grid.Item span={2}>
          <Text>Wide</Text>
        </Grid.Item>
        <Grid.Item>
          <Text>Narrow</Text>
        </Grid.Item>
      </Grid>,
    );
    const items = findGridItems(testRenderer);

    expect(flattenStyle(items[0].props.style).width).toBe(`${FULL_PERCENT / 2}%`);
    expect(flattenStyle(items[1].props.style).width).toBe(`${FULL_PERCENT / 4}%`);
  });

  it('clamps item span to available columns', () => {
    const testRenderer = renderGrid(
      <Grid columns={3}>
        <Grid.Item span={5}>
          <Text>Wide</Text>
        </Grid.Item>
        <Grid.Item span={0}>
          <Text>Narrow</Text>
        </Grid.Item>
      </Grid>,
    );
    const items = findGridItems(testRenderer);

    expect(flattenStyle(items[0].props.style).width).toBe(`${FULL_PERCENT}%`);
    expect(flattenStyle(items[1].props.style).width).toBe(`${FULL_PERCENT / 3}%`);
  });

  it('normalizes non-finite layout numbers', () => {
    const testRenderer = renderGrid(
      <Grid columns={Number.NaN} gap={[Number.NaN, Number.POSITIVE_INFINITY]}>
        <Grid.Item span={Number.NaN}>
          <Text>Safe</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const item = findGridItems(testRenderer)[0];

    expect(flattenStyle(root.props.style).marginHorizontal).toBe(0);
    expect(flattenStyle(root.props.style).marginVertical).toBe(0);
    expect(flattenStyle(item.props.style).width).toBe(`${FULL_PERCENT}%`);
  });

  it('renders pressable items only when onPress is provided', () => {
    const handlePress = jest.fn();
    const testRenderer = renderGrid(
      <Grid columns={2}>
        <Grid.Item onPress={handlePress}>
          <Text>Clickable</Text>
        </Grid.Item>
        <Grid.Item>
          <Text>Static</Text>
        </Grid.Item>
      </Grid>,
    );

    const pressableNodes = testRenderer.root.findAll((node) => {
      return node.props.testID === 'grid-item' && node.props.onPress !== undefined;
    });

    expect(pressableNodes).toHaveLength(1);

    act(() => {
      pressableNodes[0].props.onPress();
    });

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('applies root and item styles after built-in layout styles', () => {
    const rootStyle = { flexDirection: 'column' as const };
    const itemStyle = { paddingHorizontal: 0 };
    const testRenderer = renderGrid(
      <Grid columns={2} gap={GAP} style={rootStyle}>
        <Grid.Item style={itemStyle}>
          <Text>Food</Text>
        </Grid.Item>
      </Grid>,
    );
    const root = testRenderer.root.findByProps({ testID: 'grid' });
    const item = findGridItems(testRenderer)[0];

    expect(flattenStyle(root.props.style).flexDirection).toBe('column');
    expect(flattenStyle(item.props.style).paddingHorizontal).toBe(0);
  });
});
