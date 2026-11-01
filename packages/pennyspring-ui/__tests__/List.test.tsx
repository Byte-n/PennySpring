import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FlatList, StyleSheet, View } from 'react-native';
import { ThemeProvider } from '@pennyspring/theme';
import { List } from '../src/List';
import { Icon } from '../src/Icon';
import { SwipeAction } from '../src/SwipeAction';
import { Text } from '../src/Text';
import type { ListItemData } from '../src/List';

function renderList(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(element);
  });
  return testRenderer!;
}

describe('List', () => {
  it('disables scrolling by default and enables it when requested', () => {
    const defaultList = renderList(<List data={[]} />);
    const scrollableList = renderList(<List data={[]} scrollEnabled />);

    expect(defaultList.root.findByType(FlatList).props.scrollEnabled).toBe(
      false,
    );
    expect(scrollableList.root.findByType(FlatList).props.scrollEnabled).toBe(
      true,
    );
  });

  it('wraps rendered rows with SwipeAction when row actions are provided', () => {
    const testRenderer = renderList(
      <List
        data={['one']}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSwipeActions={() => ({
          rightActions: [{ key: 'delete', actionText: '删除' }],
        })}
      />,
    );

    const flatList = testRenderer.root.findByType(FlatList);
    const row = flatList.props.renderItem({
      item: 'one',
      index: 0,
      separators: {},
    });

    expect(row.type).toBe(SwipeAction);
  });

  it('renders data through a FlatList and forwards row rendering', () => {
    const testRenderer = renderList(
      <List
        data={['one', 'two']}
        renderItem={({ item }) => <Text>{item}</Text>}
      />,
    );
    const flatList = testRenderer.root.findByType(FlatList);
    expect(flatList.props.data).toEqual(['one', 'two']);
    const renderedRow = flatList.props.renderItem({
      item: 'one',
      index: 0,
      separators: {},
    });
    expect(renderedRow.props.children.props.children).toBe('one');
  });

  it('shows a disclosure icon only when navigation is explicitly declared', () => {
    const navigable = renderRow([
      { disclosure: true, onPress: jest.fn(), titleText: '打开账本' },
    ]);
    const action = renderRow([{ onPress: jest.fn(), titleText: '执行操作' }]);

    expect(
      navigable.root
        .findAllByType(Icon)
        .some(node => node.props.icon === 'caret-right'),
    ).toBe(true);
    expect(
      action.root
        .findAllByType(Icon)
        .some(node => node.props.icon === 'caret-right'),
    ).toBe(false);
  });

  it('renders section rows from section data and passes only domain items to renderItem', () => {
    const renderItem = jest.fn(({ item }: { item: { title: string } }) => (
      <Text>{item.title}</Text>
    ));
    const testRenderer = renderList(
      <List
        sections={[
          {
            key: 'local',
            titleText: '本地账本',
            countText: '1',
            data: [{ title: '日常账本' }],
          },
        ]}
        renderItem={renderItem}
      />,
    );
    const flatList = testRenderer.root.findByType(FlatList);

    expect(flatList.props.data).toHaveLength(2);
    expect(renderItem.mock.calls[0]?.[0].item).toEqual({ title: '日常账本' });
    expect(
      testRenderer.root
        .findAllByType(Text)
        .some(node => node.props.children === '本地账本'),
    ).toBe(true);
  });

  it('renders metric values in aligned columns from data', () => {
    const testRenderer = renderRow([
      {
        titleText: '餐饮',
        metrics: [
          { key: 'percent', label: '占比', value: '35.4%' },
          { key: 'amount', label: '金额', value: '¥2,421.30' },
        ],
      },
    ]);
    const values = testRenderer.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(values).toContain('35.4%');
    expect(values).toContain('¥2,421.30');
  });

  it('renders empty content when there are no rows', () => {
    const testRenderer = renderList(
      <List data={[]} empty={<Text>Nothing here</Text>} />,
    );
    const flatList = testRenderer.root.findByType(FlatList);
    expect(
      flatList.props.ListEmptyComponent.props.children.props.children,
    ).toBe('Nothing here');
  });

  it('renders loading content in the list footer', () => {
    const testRenderer = renderList(
      <List data={[]} loading loadingText="Loading more" />,
    );
    expect(
      testRenderer.root
        .findAllByType(Text)
        .some(node => node.props.children === 'Loading more'),
    ).toBe(true);
  });

  it('toggles a collapsible group and reports the new state', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderList(
      <List
        collapsible
        titleText="Group"
        open={false}
        onOpenChange={onOpenChange}
      >
        <Text>Nested row</Text>
      </List>,
    );
    const header = testRenderer.root
      .findAll(node => typeof node.props.onPress === 'function')
      .at(-1);
    act(() => header?.props.onPress());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

const ROW_TOKENS = {
  colorFillQuaternary: 'fillQuaternaryToken',
  colorFillTertiary: 'fillTertiaryToken',
  colorPrimary: 'primaryToken',
  colorPrimaryBg: 'primaryBgToken',
  colorSplit: 'splitToken',
  lineWidth: 1,
  lineWidthBold: 3,
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
    const testRenderer = renderRow([
      { icon: 'list', titleText: '餐饮 · 外卖' },
    ]);
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

  it('renders custom trailing content from right', () => {
    const testRenderer = renderRow([
      { right: '¥128.00', titleText: '餐饮 · 外卖' },
    ]);
    const rightNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '¥128.00');

    expect(rightNode).toBeTruthy();
  });

  it('renders a data-driven badge beside the title', () => {
    const testRenderer = renderRow([
      { badgeText: '已隐藏', titleText: '现金账户' },
    ]);
    const badge = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '已隐藏');

    expect(badge?.props.size).toBe('xs');
    expect(badge).toBeTruthy();
  });

  it('keeps trailing content and adds a check icon when selected', () => {
    const testRenderer = renderRow([
      { right: '28', selected: true, titleText: '已选中' },
    ]);
    const icon = testRenderer.root.findByType(Icon);
    const rowStyle = getRowStyle(testRenderer);

    expect(icon.props.icon).toBe('check');
    expect(icon.props.size).toBe(18);
    expect(rowStyle.backgroundColor).toBe(ROW_TOKENS.colorPrimaryBg);
    expect(
      testRenderer.root
        .findAllByType(Text)
        .some(node => node.props.children === '28'),
    ).toBe(true);
  });

  it('marks a selected row with a primary left bar', () => {
    const testRenderer = renderRow([{ selected: true, titleText: '已选中' }]);
    const marker = testRenderer.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.position === 'absolute' &&
        style?.width === ROW_TOKENS.lineWidthBold
      );
    });
    const markerStyle = StyleSheet.flatten(marker?.props.style);

    expect(marker).toBeTruthy();
    expect(markerStyle.backgroundColor).toBe(ROW_TOKENS.colorPrimary);
    expect(markerStyle.left).toBe(0);
    expect(markerStyle.top).toBe(0);
    expect(markerStyle.bottom).toBe(0);
  });

  it('leaves rows without the left bar when not selected', () => {
    const testRenderer = renderRow([{ titleText: '未选中' }]);
    const marker = testRenderer.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.position === 'absolute' &&
        style?.width === ROW_TOKENS.lineWidthBold
      );
    });

    expect(marker).toBeUndefined();
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

    const platedDivider = StyleSheet.flatten(
      findDivider(renderRow(platedRows, 0))?.props.style,
    );
    const textOnlyDivider = StyleSheet.flatten(
      findDivider(renderRow(textOnlyRows, 0))?.props.style,
    );
    const lastRowDivider = findDivider(renderRow(platedRows, 1));

    expect(platedDivider.left).toBe(66);
    expect(textOnlyDivider.left).toBe(16);
    expect(lastRowDivider).toBeUndefined();
  });

  it('greys a disabled row without fading the whole row', () => {
    const testRenderer = renderRow([
      { disabled: true, icon: 'list', titleText: '已归档账本' },
    ]);
    const rowStyle = getRowStyle(testRenderer);
    const plate = testRenderer.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.width === 38 && style?.height === 38;
    });
    const titleNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '已归档账本');

    expect(rowStyle.opacity).toBeUndefined();
    expect(StyleSheet.flatten(plate?.props.style).backgroundColor).toBe(
      ROW_TOKENS.colorFillQuaternary,
    );
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
    expect(
      StyleSheet.flatten(header?.props.style).backgroundColor,
    ).toBeUndefined();
  });
});
