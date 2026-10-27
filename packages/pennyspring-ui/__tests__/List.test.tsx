import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FlatList, Pressable, StyleSheet, Text as NativeText, View } from 'react-native';
import { ThemeProvider } from '@pennyspring/theme';
import type { ReactTestInstance } from 'react-test-renderer';
import { List } from '../src/List';
import { Icon } from '../src/Icon';
import { Text } from '../src/Text';
import { Grid } from '../src/Grid';
import type { ListItemData } from '../src/List';

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

const ROW_TOKENS = {
  colorFillQuaternary: 'fillQuaternaryToken',
  colorFillTertiary: 'fillTertiaryToken',
  colorPrimary: 'primaryToken',
  colorPrimaryBg: 'primaryBgToken',
  colorSplit: 'splitToken',
  lineWidth: 1,
  marginSM: 12,
  marginXS: 8,
  marginXXS: 4,
  padding: 16,
} as const;

function renderRow(data: ListItemData[], index = 0) {
  let listRenderer: renderer.ReactTestRenderer;

  act(() => {
    listRenderer = renderer.create(
      <ThemeProvider config={{ token: ROW_TOKENS }}>
        <List data={data} />
      </ThemeProvider>,
    );
  });

  const element = listRenderer!.root.findByType(FlatList).props.renderItem({
    index,
    item: data[index],
    separators: {},
  });

  let rowRenderer: renderer.ReactTestRenderer;

  act(() => {
    rowRenderer = renderer.create(element);
  });

  act(() => listRenderer!.unmount());

  return rowRenderer!;
}

function getRowStyle(testRenderer: renderer.ReactTestRenderer) {
  const row = testRenderer.root.findAllByProps({ testID: 'row' })[0];

  return StyleSheet.flatten(row.props.style);
}

describe('List row spec', () => {
  it('gives a single-line row 56 height and 16 / 8 padding', () => {
    const rowStyle = getRowStyle(renderRow([{ titleText: '餐饮 · 外卖' }]));

    expect(rowStyle.minHeight).toBe(56);
    expect(rowStyle.paddingHorizontal).toBe(ROW_TOKENS.padding);
    expect(rowStyle.paddingVertical).toBe(ROW_TOKENS.marginXS);
    expect(rowStyle.gap).toBe(ROW_TOKENS.marginSM);
  });

  it('raises a two-line row to 64', () => {
    const rowStyle = getRowStyle(
      renderRow([{ descriptionText: '工作日午餐', titleText: '餐饮 · 外卖' }]),
    );

    expect(rowStyle.minHeight).toBe(64);
  });

  it('wraps the icon in a 38 plate and keeps the title at 14 medium', () => {
    const testRenderer = renderRow([{ icon: 'list', titleText: '餐饮 · 外卖' }]);
    const plate = testRenderer.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.width === 38 && style?.height === 38;
    });
    const plateStyle = StyleSheet.flatten(plate?.props.style);
    const icon = testRenderer.root.findByType(Icon);
    const titleNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '餐饮 · 外卖');

    expect(plateStyle?.borderRadius).toBe(12);
    expect(plateStyle?.backgroundColor).toBe(ROW_TOKENS.colorFillTertiary);
    expect(icon.props.size).toBe(20);
    expect(icon.props.color).toBe('textSecondary');
    expect(titleNode?.props.size).toBe('sm');
    expect(titleNode?.props.weight).toBe('medium');
    expect(titleNode?.props.color).toBe('default');
  });

  it('splits the amount into integer and decimal with a semantic tone', () => {
    const testRenderer = renderRow([
      { amountText: { tone: 'expense', value: 128 }, titleText: '餐饮 · 外卖' },
    ]);
    const textNodes = testRenderer.root.findAllByType(Text);
    const integer = textNodes.find(node => node.props.children === '128');
    const decimal = textNodes.find(node => node.props.children === '.00');

    expect(integer?.props.weight).toBe('semibold');
    expect(integer?.props.color).toBe('errorText');
    expect(decimal?.props.color).toBe('errorText');
  });

  it('prefixes income amounts with a plus sign', () => {
    const testRenderer = renderRow([
      { amountText: { tone: 'income', value: '12,800.00' }, titleText: '工资入账' },
    ]);
    const signNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '+¥');

    expect(signNode).toBeTruthy();
  });

  it('replaces the trailing content with a check icon when selected', () => {
    const testRenderer = renderRow([
      { amountText: { value: 28 }, selected: true, titleText: '已选中' },
    ]);
    const icon = testRenderer.root.findByType(Icon);
    const rowStyle = getRowStyle(testRenderer);

    expect(icon.props.icon).toBe('check');
    expect(icon.props.size).toBe(18);
    expect(rowStyle.backgroundColor).toBe(ROW_TOKENS.colorPrimaryBg);
    expect(testRenderer.root.findAllByType(Text).some(node => node.props.children === '28')).toBe(false);
  });

  it('insets the divider to 66 for plated rows and 16 for text-only rows', () => {
    const platedRows: ListItemData[] = [
      { icon: 'list', titleText: '餐饮' },
      { icon: 'list', titleText: '交通' },
    ];
    const textOnlyRows: ListItemData[] = [
      { titleText: '餐饮' },
      { titleText: '交通' },
    ];
    const findDivider = (testRenderer: renderer.ReactTestRenderer) =>
      testRenderer.root.findAllByType(View).find(node => {
        const style = StyleSheet.flatten(node.props.style);

        return style?.position === 'absolute' && style?.height === 1;
      });

    const platedDivider = StyleSheet.flatten(findDivider(renderRow(platedRows, 0))?.props.style);
    const textOnlyDivider = StyleSheet.flatten(findDivider(renderRow(textOnlyRows, 0))?.props.style);
    const lastRowDivider = findDivider(renderRow(platedRows, 1));

    expect(platedDivider.left).toBe(66);
    expect(textOnlyDivider.left).toBe(16);
    expect(lastRowDivider).toBeUndefined();
  });

  it('greys a disabled row without fading the whole row', () => {
    const testRenderer = renderRow([{ disabled: true, icon: 'list', titleText: '已归档账本' }]);
    const rowStyle = getRowStyle(testRenderer);
    const plate = testRenderer.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.width === 38 && style?.height === 38;
    });
    const titleNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '已归档账本');

    expect(rowStyle.opacity).toBeUndefined();
    expect(StyleSheet.flatten(plate?.props.style).backgroundColor).toBe(ROW_TOKENS.colorFillQuaternary);
    expect(titleNode?.props.color).toBe('tertiary');
  });

  it('renders the collapsible group header at 32 height', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider config={{ token: ROW_TOKENS }}>
          <List collapsible titleText="支出分类 · 8" />
        </ThemeProvider>,
      );
    });

    const header = testRenderer!.root
      .findAllByType(View)
      .find(node => StyleSheet.flatten(node.props.style)?.minHeight === 32);

    expect(header).toBeTruthy();
    expect(StyleSheet.flatten(header?.props.style).backgroundColor).toBeUndefined();
  });
});
