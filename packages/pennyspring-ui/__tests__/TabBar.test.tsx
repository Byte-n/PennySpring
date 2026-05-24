import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { TabBar } from '../src/TabBar';
import type { TabBarProps } from '../src/TabBar';

function renderTabBar(props: Partial<TabBarProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <TabBar
          items={[
            {
              key: 'home',
              titleText: '首页',
              icon: <RNText>H</RNText>,
            },
            {
              key: 'assets',
              titleText: '资产',
              icon: <RNText>A</RNText>,
              badgeText: '3',
            },
            {
              key: 'profile',
              titleText: '我的',
              icon: <RNText>P</RNText>,
            },
          ]}
          {...props}
        />
      </>,
    );
  });

  return testRenderer!;
}

function pressByKey(
  testRenderer: renderer.ReactTestRenderer,
  key: string | number,
) {
  const target = testRenderer.root.findByProps({
    testID: `tab-bar-item-${String(key)}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

describe('TabBar', () => {
  it('renders item title, icon and badge text', () => {
    const testRenderer = renderTabBar();
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('首页');
    expect(content).toContain('资产');
    expect(content).toContain('我的');
    expect(content).toContain('H');
    expect(content).toContain('A');
    expect(content).toContain('P');
    expect(content).toContain('3');
  });

  it('updates uncontrolled value and calls onChange', () => {
    const onChange = jest.fn();
    const testRenderer = renderTabBar({
      defaultValue: 'home',
      onChange,
    });

    pressByKey(testRenderer, 'assets');

    expect(onChange).toHaveBeenCalledWith('assets');
  });

  it('keeps selected item derived from controlled value', () => {
    const onChange = jest.fn();
    const testRenderer = renderTabBar({
      value: 'home',
      onChange,
    });

    pressByKey(testRenderer, 'assets');

    expect(onChange).toHaveBeenCalledWith('assets');
  });

  it('blocks interaction when disabled at root or item level', () => {
    const onChange = jest.fn();
    const disabledRoot = renderTabBar({
      disabled: true,
      onChange,
    });
    const disabledItem = renderTabBar({
      defaultValue: 'home',
      onChange,
      items: [
        {
          key: 'home',
          titleText: '首页',
        },
        {
          key: 'assets',
          titleText: '资产',
          disabled: true,
        },
      ],
    });

    pressByKey(disabledRoot, 'assets');
    const item = pressByKey(disabledItem, 'assets');

    expect(onChange).not.toHaveBeenCalled();
    expect(item.props.disabled).toBe(true);
  });
});
