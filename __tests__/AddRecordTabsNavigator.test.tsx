import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AddRecordTabsNavigator } from '../src/navigation/AddRecordTabsNavigator';

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

jest.mock('../src/screens/addRecord/tabs/IncomeTabScreen', () => ({
  IncomeTabScreen: () => null,
}));

jest.mock('../src/screens/addRecord/tabs/ExpenseTabScreen', () => ({
  ExpenseTabScreen: () => null,
}));

jest.mock('../src/screens/addRecord/tabs/TransferTabScreen', () => ({
  TransferTabScreen: () => null,
}));

describe('AddRecordTabsNavigator', () => {
  it('registers income, expense, and transfer tabs', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<AddRecordTabsNavigator />);
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());
    const screens = mockTopTabNavigator.mock.calls[0][0];

    expect(treeString).toContain('支出');
    expect(treeString).toContain('收入');
    expect(treeString).toContain('转账');
    expect(screens).toHaveLength(3);
    expect(screens.map((screen: { name: string }) => screen.name)).toEqual([
      'ExpenseTab',
      'IncomeTab',
      'TransferTab',
    ]);
  });
});
