import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { HomeScreen } from '../src/screens/HomeScreen';

jest.mock('../packages/component', () => {
  const ReactLocal = require('react');
  const { Text } = require('react-native');

  return {
    TopTabNavigator: ({ screens }: { screens: readonly { label: string }[] }) => (
      <>
        {screens.map((screen) => (
          <Text key={screen.label}>{screen.label}</Text>
        ))}
      </>
    ),
  };
});

describe('HomeScreen', () => {
  it('renders detail and chart tabs', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<HomeScreen />);
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(treeString).toContain('明细');
    expect(treeString).toContain('图表');
  });
});
