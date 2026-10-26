import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { IndexBar } from '../src/IndexBar';
import { List } from '../src/List';
import { Row } from '../src/Row';
import { Column } from '../src/Column';
import { Text } from '../src/Text';
import type { IndexBarItem, IndexBarProps } from '../src/IndexBar';

const mockScrollTo = jest.fn();

jest.mock('react-native', () => {
  const ReactModule = require('react');
  const ReactNative = jest.requireActual('react-native');

  const MockScrollView = ReactModule.forwardRef((props: object, ref: React.Ref<unknown>) => {
    ReactModule.useImperativeHandle(ref, () => ({
      scrollTo: mockScrollTo,
    }));

    return ReactModule.createElement(ReactNative.ScrollView, props);
  });

  const MockFlatList = (props: { data?: unknown[]; renderItem?: (info: { item: unknown; index: number }) => React.ReactNode }) =>
    ReactModule.createElement(
      ReactNative.View,
      null,
      ...(props.data ?? []).map((item, index) => props.renderItem?.({ item, index }) ?? null),
    );

  return new Proxy(ReactNative, {
    get(target: typeof ReactNative, prop: keyof typeof ReactNative) {
      if (prop === 'ScrollView') {
        return MockScrollView;
      }

      if (prop === 'FlatList') {
        return MockFlatList;
      }

      return target[prop];
    },
  });
});

const DEFAULT_DATA: IndexBarItem[] = [
  {
    index: 'A',
    titleText: '标题A',
  },
  {
    index: 'B',
    titleText: '标题B',
  },
  {
    index: 'C',
    title: <RNText>标题C</RNText>,
  },
];

const PANEL_ITEMS: Record<string, string[]> = {
  A: ['苹果', '杏子'],
  B: ['香蕉', '菠萝'],
  C: ['车厘子'],
};

const PANEL_LAYOUT_Y: Record<string, number> = {
  A: 0,
  B: 120,
  C: 240,
};

function renderPanel(item: IndexBarItem) {
  return (
    <List
      data={PANEL_ITEMS[String(item.index)]}
      renderItem={({ item: label }) => <Text>{label}</Text>}
    />
  );
}

function renderIndexBar(props: Partial<IndexBarProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  const {
    data = DEFAULT_DATA,
    renderPanel: renderPanelProp = renderPanel,
    ...restProps
  } = props;

  act(() => {
    testRenderer = renderer.create(
      <>
        <IndexBar data={data} renderPanel={renderPanelProp} {...restProps} />
      </>,
    );
  });

  return testRenderer!;
}

function layoutPanels(testRenderer: renderer.ReactTestRenderer) {
  DEFAULT_DATA.forEach(item => {
    const panel = testRenderer.root.findByProps({
      testID: `index-bar-panel-${String(item.index)}`,
    });

    act(() => {
      panel.props.onLayout({
        nativeEvent: {
          layout: {
            y: PANEL_LAYOUT_Y[String(item.index)],
          },
        },
      });
    });
  });
}

function pressIndexItem(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  const target = testRenderer.root.findByProps({
    testID: `index-bar-item-${String(value)}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

describe('IndexBar', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
  });

  it('renders panels and sidebar indexes from data', () => {
    // Arrange & Act
    const testRenderer = renderIndexBar();
    const content = JSON.stringify(testRenderer.toJSON());

    // Assert
    expect(content).toContain('标题A');
    expect(content).toContain('标题B');
    expect(content).toContain('标题C');
    expect(content).toContain('苹果');
    expect(content).toContain('香蕉');
    expect(content).toContain('A');
    expect(content).toContain('B');
    expect(content).toContain('C');
  });

  it('updates uncontrolled value and calls onChange/onPress when index item is pressed', () => {
    // Arrange
    const onChange = jest.fn();
    const onPress = jest.fn();
    const testRenderer = renderIndexBar({
      defaultValue: 'A',
      onChange,
      onPress,
    });

    // Act
    pressIndexItem(testRenderer, 'B');

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][1]).toBe('B');
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('scrolls to the matching panel when index item is pressed', () => {
    // Arrange
    const testRenderer = renderIndexBar({
      defaultValue: 'A',
    });
    layoutPanels(testRenderer);

    // Act
    pressIndexItem(testRenderer, 'B');

    // Assert
    expect(mockScrollTo).toHaveBeenCalledWith({
      animated: true,
      y: PANEL_LAYOUT_Y.B,
    });
  });

  it('keeps selected index controlled by value prop', () => {
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderIndexBar({
      value: 'A',
      onChange,
    });

    // Act
    pressIndexItem(testRenderer, 'B');

    // Assert
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('blocks interaction and navigation when disabled at root or panel level', () => {
    // Arrange
    const onChange = jest.fn();
    const disabledRoot = renderIndexBar({
      disabled: true,
      onChange,
    });

    const disabledPanel = renderIndexBar({
      onChange,
      data: [
        {
          index: 'A',
          titleText: '标题A',
        },
        {
          disabled: true,
          index: 'B',
          titleText: '标题B',
        },
      ],
    });

    // Act
    pressIndexItem(disabledRoot, 'B');
    const disabledItem = pressIndexItem(disabledPanel, 'B');

    // Assert
    expect(onChange).not.toHaveBeenCalled();
    expect(mockScrollTo).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });

  it('uses Text semantic props for panel title and index text', () => {
    // Arrange
    const testRenderer = renderIndexBar({
      value: 'A',
    });

    // Act
    const panelTitleText = testRenderer.root.findByProps({
      testID: 'index-bar-panel-title-text-A',
    });
    const selectedIndexText = testRenderer.root.findByProps({
      testID: 'index-bar-index-text-A',
    });
    const unselectedIndexText = testRenderer.root.findByProps({
      testID: 'index-bar-index-text-B',
    });

    // Assert
    expect(panelTitleText.type).toBe(Text);
    expect(panelTitleText.props.size).toBe('sm');
    expect(panelTitleText.props.color).toBe('secondary');
    expect(panelTitleText.props.weight).toBe('strong');
    expect(selectedIndexText.props.size).toBe('md');
    expect(selectedIndexText.props.color).toBe('primary');
    expect(selectedIndexText.props.weight).toBe('strong');
    expect(unselectedIndexText.props.size).toBe('md');
    expect(unselectedIndexText.props.color).toBe('secondary');
    expect(unselectedIndexText.props.weight).toBe('regular');
  });

  it('uses Row and Column primitives for root and sidebar layout', () => {
    // Arrange
    const testRenderer = renderIndexBar();

    // Act
    const rootNodes = testRenderer.root.findAll(
      node => node.props.testID === 'index-bar-root',
    );
    const sideBarNodes = testRenderer.root.findAll(
      node => node.props.testID === 'index-bar-sidebar',
    );

    // Assert
    expect(rootNodes.some(node => node.type === Row)).toBe(true);
    expect(sideBarNodes.some(node => node.type === Column)).toBe(true);
  });
});
