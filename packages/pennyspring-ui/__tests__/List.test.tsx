import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FlatList, Pressable, StyleSheet, Text as NativeText, View } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { List } from '../src/List';
import { Text } from '../src/Text';
import { Grid } from '../src/Grid';

const LAYOUT_WIDTH = 360;

interface LayoutFixtureNode {
  style: Record<string, unknown>;
  testID?: string;
  measure?: { width: number; height: number };
  children: LayoutFixtureNode[];
}

function createLayoutFixture(instance: ReactTestInstance): LayoutFixtureNode[] {
  const isView = instance.type === View || instance.type === Pressable;
  const isText = instance.type === NativeText;

  if (isView || isText) {
    const style = isText ? {} : StyleSheet.flatten(instance.props.style) ?? {};
    const node: LayoutFixtureNode = {
      style,
      children: isText
        ? []
        : instance.children.flatMap(child =>
            typeof child === 'string' || typeof child === 'number' ? [] : createLayoutFixture(child),
          ),
    };
    if (typeof instance.props.testID === 'string') node.testID = instance.props.testID;
    if (isText) node.measure = { width: 16, height: 20 };
    return [node];
  }

  return instance.children.flatMap(child =>
    typeof child === 'string' || typeof child === 'number' ? [] : createLayoutFixture(child),
  );
}

function measureElementWidth(element: React.ReactElement, testID: string): number {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<View style={{ width: LAYOUT_WIDTH }}>{element}</View>);
  });

  try {
    const fixture = createLayoutFixture(testRenderer!.root);
    const layoutScript = `
      import { loadYoga } from 'yoga-layout/load';
      const yoga = await loadYoga();
      const fixture = JSON.parse(await new Promise(resolve => {
        let input = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => input += chunk);
        process.stdin.on('end', () => resolve(input));
      }));
      const nodes = new Map();
      function build(item, parent) {
        const node = yoga.Node.create();
        const style = item.style;
        if (item.measure) node.setMeasureFunc(() => item.measure);
        if (style.flexDirection === 'row') node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
        if (style.width !== undefined) node.setWidth(style.width);
        if (style.height !== undefined) node.setHeight(style.height);
        if (style.flex !== undefined) node.setFlex(style.flex);
        if (style.alignSelf === 'stretch') node.setAlignSelf(yoga.ALIGN_STRETCH);
        if (style.alignItems === 'center') node.setAlignItems(yoga.ALIGN_CENTER);
        if (style.justifyContent === 'space-between') node.setJustifyContent(yoga.JUSTIFY_SPACE_BETWEEN);
        if (style.paddingHorizontal !== undefined) {
          node.setPadding(yoga.EDGE_LEFT, style.paddingHorizontal);
          node.setPadding(yoga.EDGE_RIGHT, style.paddingHorizontal);
        }
        if (style.paddingVertical !== undefined) {
          node.setPadding(yoga.EDGE_TOP, style.paddingVertical);
          node.setPadding(yoga.EDGE_BOTTOM, style.paddingVertical);
        }
        if (style.marginTop !== undefined) node.setMargin(yoga.EDGE_TOP, style.marginTop);
        if (style.minHeight !== undefined) node.setMinHeight(style.minHeight);
        if (item.testID) nodes.set(item.testID, node);
        parent.insertChild(node, parent.getChildCount());
        for (const child of item.children) build(child, node);
      }
      const root = yoga.Node.create();
      root.setWidth(${LAYOUT_WIDTH});
      for (const item of fixture) build(item, root);
      root.calculateLayout(${LAYOUT_WIDTH}, 'auto', yoga.DIRECTION_LTR);
      const target = nodes.get(${JSON.stringify(testID)});
      if (!target) throw new Error('Target layout node not found');
      console.log(target.getComputedWidth());
      root.freeRecursive();
    `;
    const { execFileSync } = jest.requireActual<{
      execFileSync: (
        file: string,
        args: string[],
        options: { input: string; encoding: 'utf8' },
      ) => string;
    }>('child_process');
    const output = execFileSync('node', ['--input-type=module', '-e', layoutScript], {
      input: JSON.stringify(fixture),
      encoding: 'utf8',
    });
    return Number(output.trim());
  } finally {
    act(() => testRenderer!.unmount());
  }
}

function renderList(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => { testRenderer = renderer.create(element); });
  return testRenderer!;
}

describe('List', () => {
  it('renders data through a FlatList and forwards row rendering', () => {
    const testRenderer = renderList(<List data={['one', 'two']} renderItem={({ item }) => <Text>{item}</Text>} />);
    const flatList = testRenderer.root.findByType(FlatList);
    expect(flatList.props.data).toEqual(['one', 'two']);
    const renderedRow = flatList.props.renderItem({ item: 'one', index: 0, separators: {} });
    expect(renderedRow.props.children.props.children).toBe('one');
  });

  it('renders empty content when there are no rows', () => {
    const testRenderer = renderList(<List data={[]} empty={<Text>Nothing here</Text>} />);
    const flatList = testRenderer.root.findByType(FlatList);
    expect(flatList.props.ListEmptyComponent.props.children.props.children).toBe('Nothing here');
  });

  it('renders loading content in the list footer', () => {
    const testRenderer = renderList(<List data={[]} loading loadingText="Loading more" />);
    expect(testRenderer.root.findAllByType(Text).some(node => node.props.children === 'Loading more')).toBe(true);
  });

  it('toggles a collapsible group and reports the new state', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderList(<List collapsible titleText="Group" open={false} onOpenChange={onOpenChange}><Text>Nested row</Text></List>);
    const header = testRenderer.root.findAll(node => typeof node.props.onPress === 'function').at(-1);
    act(() => header?.props.onPress());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('keeps a single grid cell at its column width in a collapsible title', () => {
    const testRenderer = renderList(
      <List
        collapsible
        open={false}
        title={(
          <Grid columns={5} style={{ flex: 1 }}>
            <Grid.Item testID="single-grid-cell">
              <Text>其他</Text>
            </Grid.Item>
          </Grid>
        )}
      />,
    );
    const header = testRenderer.root.findByType(FlatList).props.ListHeaderComponent;
    const width = measureElementWidth(header, 'single-grid-cell');

    expect(width).toBeGreaterThan(LAYOUT_WIDTH / 10);
  });
});
