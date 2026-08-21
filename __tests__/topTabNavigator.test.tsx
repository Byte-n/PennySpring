import React from 'react';
import { View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

import { HeaderBar } from '../src/component/TopTabNavigator/HeaderBar';

let mockMaterialTopTabBarProps: MaterialTopTabBarProps | undefined;

jest.mock('@react-navigation/material-top-tabs', () => ({
  MaterialTopTabBar: (props: MaterialTopTabBarProps) => {
    mockMaterialTopTabBarProps = props;
    return null;
  },
}));

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({
    center: {},
    container: {},
    leftActions: {},
    rightActions: {},
  }),
}));

jest.mock('@pennyspring/ui', () => ({
  Row: ({ children }: { children: React.ReactNode }) => children,
}));

describe('HeaderBar', () => {
  it('renders the material tab bar between the side actions', () => {
    const tabBarProps = {
      descriptors: {},
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
    expect(mockMaterialTopTabBarProps).toStrictEqual(tabBarProps);
  });
});
