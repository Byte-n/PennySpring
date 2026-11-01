import React from 'react';
import { View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

import { HeaderBar } from '../src/component/TopTabNavigator/HeaderBar';
import { TopTabNavigator } from '../src/component/TopTabNavigator/TopTabNavigator';

let mockMaterialTopTabBarProps: MaterialTopTabBarProps | undefined;
let mockNavigatorProps: Record<string, unknown> | undefined;

const mockThemeToken = {
  colorPrimary: 'theme-primary',
  colorTextTertiary: 'theme-text-tertiary',
  colorFillQuaternary: 'theme-fill-quaternary',
};

jest.mock('@react-navigation/native', () => ({
  useNavigationState: (selector: (state: { index: number }) => unknown) =>
    selector({ index: 0 }),
}));

jest.mock('@react-navigation/material-top-tabs', () => {
  const ReactModule = require('react');

  return {
    MaterialTopTabBar: (props: MaterialTopTabBarProps) => {
      mockMaterialTopTabBarProps = props;
      return null;
    },
    createMaterialTopTabNavigator: () => ({
      Navigator: (props: { children?: unknown }) => {
        const { children, ...rest } = props;
        mockNavigatorProps = rest;
        return ReactModule.createElement(ReactModule.Fragment, null, children);
      },
      Screen: () => null,
    }),
  };
});

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({
    center: {},
    container: {},
    leftActions: {},
    rightActions: {},
    tabsRow: {},
    topRow: {},
    tabBar: { backgroundColor: 'theme-background' },
    tabBarIndicator: { backgroundColor: 'theme-indicator' },
    tabBarItem: { minHeight: 'theme-item-height' },
    tabBarLabel: { fontFamily: 'theme-font' },
  }),
  useTheme: () => ({ token: mockThemeToken }),
}));

jest.mock('@pennyspring/ui', () => ({
  ...jest.requireMock('@pennyspring/theme'),
  Column: ({ children }: { children: React.ReactNode }) => children,
  Row: ({ children }: { children: React.ReactNode }) => children,
}));

describe('HeaderBar', () => {
  it('renders side actions and applies the current theme to the material tab bar', () => {
    const tabBarProps = {
      descriptors: {
        detail: {
          navigation: {},
          options: { title: '明细' },
          render: jest.fn(),
          route: { key: 'detail', name: 'DetailTab' },
        },
      },
      navigation: {},
      position: {},
      state: {
        index: 0,
        key: 'tabs',
        routeNames: ['DetailTab'],
        routes: [{ key: 'detail', name: 'DetailTab' }],
        stale: false,
        type: 'tab',
      },
    } as unknown as MaterialTopTabBarProps;
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <HeaderBar
          leftActions={<View testID="left-actions" />}
          rightActions={<View testID="right-actions" />}
          tabBarProps={tabBarProps}
        />,
      );
    });

    expect(renderer!.root.findByProps({ testID: 'left-actions' })).toBeDefined();
    expect(renderer!.root.findByProps({ testID: 'right-actions' })).toBeDefined();
    expect(mockMaterialTopTabBarProps).toMatchObject({
      ...tabBarProps,
      descriptors: {
        detail: {
          options: {
            tabBarActiveTintColor: mockThemeToken.colorPrimary,
            tabBarInactiveTintColor: mockThemeToken.colorTextTertiary,
            tabBarIndicatorStyle: { backgroundColor: 'theme-indicator' },
            tabBarItemStyle: { minHeight: 'theme-item-height' },
            tabBarLabelStyle: { fontFamily: 'theme-font' },
            tabBarStyle: { backgroundColor: 'theme-background' },
            title: '明细',
          },
        },
      },
    });
  });
});

describe('TopTabNavigator', () => {
  const screens = [
    { component: () => null, labelText: '支出', name: 'ExpenseTab' },
    { component: () => null, labelText: '收入', name: 'IncomeTab' },
  ];

  beforeEach(() => {
    mockNavigatorProps = undefined;
  });

  it('passes backBehavior through when a screen overrides the default', () => {
    act(() => {
      TestRenderer.create(<TopTabNavigator backBehavior="history" screens={screens} />);
    });

    expect(mockNavigatorProps?.backBehavior).toBe('history');
  });

  it('defaults backBehavior to none so the back action bubbles to the parent navigator', () => {
    act(() => {
      TestRenderer.create(<TopTabNavigator screens={screens} />);
    });

    expect(mockNavigatorProps?.backBehavior).toBe('none');
  });
});
