import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { IndexBar } from '../src/IndexBar';
import { List } from '../src/List';
import type { IndexBarProps } from '../src/IndexBar';

const token = formatToken(derivative(defaultSeedToken, false));

function renderIndexBar(props: Partial<IndexBarProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  const {
    children = (
      <>
        <IndexBar.Panel index="A" title="标题A">
          <List>
            <List.Item>苹果</List.Item>
            <List.Item>杏子</List.Item>
          </List>
        </IndexBar.Panel>
        <IndexBar.Panel index="B" title="标题B">
          <List>
            <List.Item>香蕉</List.Item>
            <List.Item>菠萝</List.Item>
          </List>
        </IndexBar.Panel>
        <IndexBar.Panel index="C" title={<RNText>标题C</RNText>}>
          <List>
            <List.Item>车厘子</List.Item>
          </List>
        </IndexBar.Panel>
      </>
    ),
    ...restProps
  } = props;

  act(() => {
    testRenderer = renderer.create(
      <>
        <IndexBar {...restProps}>{children}</IndexBar>
      </>,
    );
  });

  return testRenderer!;
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

function getIndexItemStyles(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  const item = testRenderer.root.findByProps({
    testID: `index-bar-item-${String(value)}`,
  });
  const styleResult = item.props.style({ pressed: false });

  return Array.isArray(styleResult) ? styleResult : [styleResult];
}

describe('IndexBar', () => {
  it('renders panels and sidebar indexes through IndexBar.Panel', () => {
    const testRenderer = renderIndexBar();
    const content = JSON.stringify(testRenderer.toJSON());

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
    const onChange = jest.fn();
    const onPress = jest.fn();
    const testRenderer = renderIndexBar({
      defaultValue: 'A',
      onChange,
      onPress,
    });

    pressIndexItem(testRenderer, 'B');

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][1]).toBe('B');
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('keeps selected index controlled by value prop', () => {
    const onChange = jest.fn();
    const testRenderer = renderIndexBar({
      value: 'A',
      onChange,
    });

    pressIndexItem(testRenderer, 'B');

    const selectedA = testRenderer.root.findByProps({
      testID: 'index-bar-item-A',
    });
    const selectedB = testRenderer.root.findByProps({
      testID: 'index-bar-item-B',
    });

    expect(onChange).toHaveBeenCalledWith('B');
    expect(selectedA.props.accessibilityState.selected).toBe(true);
    expect(selectedB.props.accessibilityState.selected).toBe(false);
  });

  it('blocks interaction when disabled at root or panel level', () => {
    const onChange = jest.fn();

    const disabledRoot = renderIndexBar({
      disabled: true,
      onChange,
    });

    const disabledPanel = renderIndexBar({
      onChange,
      children: (
        <>
          <IndexBar.Panel index="A" title="标题A">
            <List>
              <List.Item>苹果</List.Item>
            </List>
          </IndexBar.Panel>
          <IndexBar.Panel index="B" title="标题B" disabled>
            <List>
              <List.Item>香蕉</List.Item>
            </List>
          </IndexBar.Panel>
        </>
      ),
    });

    pressIndexItem(disabledRoot, 'B');
    const disabledItem = pressIndexItem(disabledPanel, 'B');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });

  it('supports size variants and style slots', () => {
    const rootStyle = { opacity: 0.83 };
    const sidebarStyle = { opacity: 0.84 };
    const indexItemStyle = { opacity: 0.85 };
    const testRenderer = renderIndexBar({
      defaultValue: 'A',
      size: 'small',
      style: rootStyle,
      styles: {
        sidebar: sidebarStyle,
        indexItem: indexItemStyle,
      },
    });

    const root = testRenderer.root.findByProps({ testID: 'index-bar-root' });
    const sidebar = testRenderer.root.findByProps({ testID: 'index-bar-sidebar' });
    const itemStyles = getIndexItemStyles(testRenderer, 'A');

    expect(root.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(rootStyle)]),
    );
    expect(sidebar.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(sidebarStyle)]),
    );
    expect(itemStyles).toEqual(
      expect.arrayContaining([expect.objectContaining(indexItemStyle)]),
    );
    expect(
      itemStyles.some(
        (style: { minHeight?: number } | null | undefined) =>
          style?.minHeight === token.controlHeightSM,
      ),
    ).toBe(true);
  });
});
