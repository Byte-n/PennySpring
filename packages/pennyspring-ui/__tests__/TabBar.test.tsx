import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Column } from '../src/Column';
import { Row } from '../src/Row';
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

  describe('issue 1: style implementation in style/index.ts', () => {
    it('exports useStyles from the style directory', () => {
      const styleModule = require('../src/TabBar/style');

      expect(styleModule.useStyles).toBeDefined();
      expect(typeof styleModule.useStyles).toBe('function');
    });
  });

  describe('issue 2: uses Row and Column layout components', () => {
    it('uses Row as the root container', () => {
      const testRenderer = renderTabBar();
      const rows = testRenderer.root.findAllByType(Row);

      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('uses Column to structure each tab item content', () => {
      const testRenderer = renderTabBar({
        items: [
          {
            key: 'home',
            titleText: '首页',
            icon: <RNText>H</RNText>,
          },
        ],
      });
      const columns = testRenderer.root.findAllByType(Column);

      expect(columns.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('issue 3: iconContainer marginBottom uses correct tokens', () => {
    it('applies larger marginBottom for normal size than small', () => {
      const smallRenderer = renderTabBar({ size: 'small' });
      const normalRenderer = renderTabBar({ size: 'normal' });
      const smallIcons = smallRenderer.root.findAllByProps({ testID: 'icon-container' });
      const normalIcons = normalRenderer.root.findAllByProps({ testID: 'icon-container' });
      const smallMargin = smallIcons[0].props.style.find(
        (s: Record<string, unknown>) => s && 'marginBottom' in s,
      )?.marginBottom;
      const normalMargin = normalIcons[0].props.style.find(
        (s: Record<string, unknown>) => s && 'marginBottom' in s,
      )?.marginBottom;

      expect(normalMargin).toBeGreaterThan(smallMargin);
    });

    it('applies larger marginBottom for large size than normal', () => {
      const normalRenderer = renderTabBar({ size: 'normal' });
      const largeRenderer = renderTabBar({ size: 'large' });
      const normalIcons = normalRenderer.root.findAllByProps({ testID: 'icon-container' });
      const largeIcons = largeRenderer.root.findAllByProps({ testID: 'icon-container' });
      const normalMargin = normalIcons[0].props.style.find(
        (s: Record<string, unknown>) => s && 'marginBottom' in s,
      )?.marginBottom;
      const largeMargin = largeIcons[0].props.style.find(
        (s: Record<string, unknown>) => s && 'marginBottom' in s,
      )?.marginBottom;

      expect(largeMargin).toBeGreaterThan(normalMargin);
    });
  });

  describe('issue 4: Text uses size/weight/color props', () => {
    it('passes color="secondary" to inactive title Text', () => {
      const testRenderer = renderTabBar({
        value: 'profile',
        items: [
          {
            key: 'home',
            titleText: '首页',
          },
          {
            key: 'profile',
            titleText: '我的',
          },
        ],
      });
      const textInstances = testRenderer.root.findAllByType(Text);
      const titleText = textInstances.find(
        (t: renderer.ReactTestInstance) => t.props.children === '首页',
      );

      expect(titleText).toBeDefined();
      expect(titleText!.props.color).toBe('secondary');
    });

    it('passes color="disabled" to title Text when disabled', () => {
      const testRenderer = renderTabBar({
        disabled: true,
        items: [
          {
            key: 'home',
            titleText: '首页',
          },
        ],
      });
      const textInstances = testRenderer.root.findAllByType(Text);
      const titleText = textInstances.find(
        (t: renderer.ReactTestInstance) => t.props.children === '首页',
      );

      expect(titleText).toBeDefined();
      expect(titleText!.props.color).toBe('disabled');
    });
  });

  describe('issue 5: hitSlop uses token-driven value', () => {
    it('does not use hardcoded hitSlop of 6', () => {
      const testRenderer = renderTabBar();
      const tabItem = testRenderer.root.findByProps({ testID: 'tab-bar-item-home' });
      const hitSlop = tabItem.props.hitSlop as Record<string, number>;

      expect(hitSlop).toBeDefined();
      expect(typeof hitSlop.top).toBe('number');
      expect(hitSlop.top).not.toBe(6);
    });
  });

  describe('issue 6: null/undefined slot semantics', () => {
    it('does not render title when title is explicitly null', () => {
      const testRenderer = renderTabBar({
        items: [
          {
            key: 'a',
            title: null,
            titleText: 'ShouldNotRender',
          },
        ],
      });
      const content = JSON.stringify(testRenderer.toJSON());

      expect(content).not.toContain('ShouldNotRender');
    });

    it('falls back to titleText when title is undefined', () => {
      const testRenderer = renderTabBar({
        items: [
          {
            key: 'a',
            titleText: 'FallbackTitle',
          },
        ],
      });
      const content = JSON.stringify(testRenderer.toJSON());

      expect(content).toContain('FallbackTitle');
    });

    it('does not render badge when badge is explicitly null', () => {
      const testRenderer = renderTabBar({
        items: [
          {
            key: 'a',
            titleText: 'Tab',
            badge: null,
            badgeText: 'ShouldNotRender',
          },
        ],
      });
      const content = JSON.stringify(testRenderer.toJSON());

      expect(content).not.toContain('ShouldNotRender');
    });

    it('falls back to badgeText when badge is undefined', () => {
      const testRenderer = renderTabBar({
        items: [
          {
            key: 'a',
            titleText: 'Tab',
            badgeText: '5',
          },
        ],
      });
      const content = JSON.stringify(testRenderer.toJSON());

      expect(content).toContain('5');
    });
  });
});
