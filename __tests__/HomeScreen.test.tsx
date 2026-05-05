import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { HomeScreen } from '../src/screens/home/HomeScreen';

const mockHomeTabsNavigator = jest.fn();

jest.mock('../src/navigation/HomeTabsNavigator', () => {
  const ReactLocal = require('react');

  return {
    HomeTabsNavigator: () => {
      mockHomeTabsNavigator();
      return ReactLocal.createElement('mock-home-tabs-navigator');
    },
  };
});

describe('HomeScreen', () => {
  it('delegates production tab registration to HomeTabsNavigator', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<HomeScreen />);
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(treeString).toContain('mock-home-tabs-navigator');
    expect(mockHomeTabsNavigator).toHaveBeenCalledTimes(1);
  });
});
