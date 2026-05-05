import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { HomeTabsNavigator } from '../src/navigation/HomeTabsNavigator';

const mockTopTabNavigator = jest.fn();

jest.mock('../packages/component', () => {
  const ReactLocal = require('react');
  const { Text } = require('react-native');

  return {
    TopTabNavigator: ({ screens }: { screens: readonly { label: string; name: string }[] }) => {
      mockTopTabNavigator(screens);

      return ReactLocal.createElement(
        ReactLocal.Fragment,
        null,
        screens.map((screen) =>
          ReactLocal.createElement(Text, { key: screen.name }, screen.label)
        )
      );
    },
  };
});

jest.mock('../src/screens/home/tabs/DetailTabScreen', () => ({
  DetailTabScreen: () => null,
}));

jest.mock('../src/screens/home/tabs/ChartTabScreen', () => ({
  ChartTabScreen: () => null,
}));

describe('HomeTabsNavigator', () => {
  it('registers only production detail and chart tabs', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<HomeTabsNavigator />);
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());
    const screens = mockTopTabNavigator.mock.calls[0][0];

    expect(treeString).toContain('明细');
    expect(treeString).toContain('图表');
    expect(screens).toHaveLength(2);
    expect(screens.map((screen: { name: string }) => screen.name)).toEqual([
      'DetailTab',
      'ChartTab',
    ]);
    expect(treeString).not.toContain('主题预览');
    expect(treeString).not.toContain('TextPreview');
  });
});
