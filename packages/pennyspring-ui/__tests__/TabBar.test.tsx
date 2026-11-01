import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Text } from '../src/Text';
import { TabBar } from '../src/TabBar';
import type { TabBarProps } from '../src/TabBar';

function renderTabBar(props: Partial<TabBarProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <TabBar
          items={[
            { value: 'home', titleText: '首页', icon: <RNText>H</RNText> },
            {
              value: 'assets',
              titleText: '资产',
              icon: <RNText>A</RNText>,
              badgeText: '3',
            },
            { value: 'profile', titleText: '我的', icon: <RNText>P</RNText> },
          ]}
          {...props}
        />
      </>,
    );
  });

  return testRenderer!;
}

function pressItem(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  const target = testRenderer.root.findByProps({
    testID: `tab-bar-item-${String(value)}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

function findTitleText(
  testRenderer: renderer.ReactTestRenderer,
  label: string,
) {
  return testRenderer.root
    .findAllByType(Text)
    .find(node => node.props.children === label);
}

describe('TabBar', () => {
  it('renders item title, icon and badge text', () => {
    const content = JSON.stringify(renderTabBar().toJSON());

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
    const testRenderer = renderTabBar({ defaultValue: 'home', onChange });

    pressItem(testRenderer, 'assets');

    expect(onChange).toHaveBeenCalledWith('assets');
  });

  it('keeps a controlled value derived from props while reporting presses', () => {
    const onChange = jest.fn();
    const testRenderer = renderTabBar({ onChange, value: 'home' });

    pressItem(testRenderer, 'assets');

    expect(onChange).toHaveBeenCalledWith('assets');
    const activeBadge = testRenderer.root.findAllByProps({
      testID: 'tab-bar-badge',
    });
    expect(activeBadge.length).toBeGreaterThan(0);
  });

  it('calls onPress before reporting the change', () => {
    const calls: string[] = [];
    const testRenderer = renderTabBar({
      defaultValue: 'home',
      onChange: () => {
        calls.push('change');
      },
      onPress: () => {
        calls.push('press');
      },
    });

    pressItem(testRenderer, 'assets');

    expect(calls).toEqual(['press', 'change']);
  });

  it('blocks interaction when disabled at root or item level', () => {
    const onChange = jest.fn();
    const disabledRoot = renderTabBar({ disabled: true, onChange });
    const disabledItem = renderTabBar({
      defaultValue: 'home',
      onChange,
      items: [
        { value: 'home', titleText: '首页' },
        { disabled: true, value: 'assets', titleText: '资产' },
      ],
    });

    pressItem(disabledRoot, 'assets');
    const item = pressItem(disabledItem, 'assets');

    expect(onChange).not.toHaveBeenCalled();
    expect(item.props.disabled).toBe(true);
  });

  it('prefers activeIcon for the selected tab and icon otherwise', () => {
    const testRenderer = renderTabBar({
      items: [
        {
          activeIcon: <RNText>ACTIVE</RNText>,
          icon: <RNText>INACTIVE</RNText>,
          value: 'home',
          titleText: '首页',
        },
        {
          activeIcon: <RNText>ACTIVE-2</RNText>,
          icon: <RNText>INACTIVE-2</RNText>,
          value: 'assets',
          titleText: '资产',
        },
      ],
      value: 'home',
    });
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('ACTIVE');
    expect(content).toContain('INACTIVE-2');
    expect(content).not.toContain('"INACTIVE"');
    expect(content).not.toContain('"ACTIVE-2"');
  });

  it('maps title color and weight to the selection state', () => {
    const testRenderer = renderTabBar({
      items: [
        { value: 'home', titleText: '首页' },
        { value: 'assets', titleText: '资产' },
        { disabled: true, value: 'profile', titleText: '我的' },
      ],
      value: 'home',
    });

    expect(findTitleText(testRenderer, '首页')!.props.color).toBe('primary');
    expect(findTitleText(testRenderer, '首页')!.props.weight).toBe('strong');
    expect(findTitleText(testRenderer, '资产')!.props.color).toBe('tertiary');
    expect(findTitleText(testRenderer, '资产')!.props.weight).toBe('regular');
    expect(findTitleText(testRenderer, '我的')!.props.color).toBe('quaternary');
  });

  it('uses the same 12px title size for every TabBar size', () => {
    for (const size of ['small', 'normal', 'large'] as const) {
      const testRenderer = renderTabBar({
        items: [{ value: 'home', titleText: '首页' }],
        size,
      });

      expect(findTitleText(testRenderer, '首页')!.props.size).toBe('xs');
    }
  });

  it('caps badge text at 99+', () => {
    const testRenderer = renderTabBar({
      items: [
        { badgeText: '9', value: 'a', titleText: 'A' },
        { badgeText: '120', value: 'b', titleText: 'B' },
      ],
    });
    const badges = testRenderer.root
      .findAllByType(Text)
      .filter(
        node => node.props.children === '9' || node.props.children === '99+',
      );

    expect(badges.map(node => node.props.children).sort()).toEqual([
      '9',
      '99+',
    ]);
  });

  it('renders a custom badge node as a dot', () => {
    const testRenderer = renderTabBar({
      items: [
        {
          badge: <View testID="custom-dot" />,
          value: 'home',
          titleText: '首页',
        },
      ],
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'custom-dot' }).length,
    ).toBeGreaterThan(0);
  });

  describe('null/undefined slot semantics', () => {
    it('does not render title when title is explicitly null', () => {
      const content = JSON.stringify(
        renderTabBar({
          items: [{ value: 'a', title: null, titleText: 'ShouldNotRender' }],
        }).toJSON(),
      );

      expect(content).not.toContain('ShouldNotRender');
    });

    it('falls back to titleText when title is undefined', () => {
      const content = JSON.stringify(
        renderTabBar({
          items: [{ value: 'a', titleText: 'FallbackTitle' }],
        }).toJSON(),
      );

      expect(content).toContain('FallbackTitle');
    });

    it('does not render badge when badge is explicitly null', () => {
      const content = JSON.stringify(
        renderTabBar({
          items: [
            {
              badge: null,
              badgeText: 'ShouldNotRender',
              value: 'a',
              titleText: 'Tab',
            },
          ],
        }).toJSON(),
      );

      expect(content).not.toContain('ShouldNotRender');
    });

    it('falls back to badgeText when badge is undefined', () => {
      const content = JSON.stringify(
        renderTabBar({
          items: [{ badgeText: '5', value: 'a', titleText: 'Tab' }],
        }).toJSON(),
      );

      expect(content).toContain('5');
    });
  });
});
