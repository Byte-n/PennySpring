import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AppNavigator } from '../src/navigation/AppNavigator';
import { rootNavigationRef } from '../src/navigation/rootNavigationRef';

const mockRootNavigationRef = {
  canGoBack: jest.fn(),
  goBack: jest.fn(),
  isReady: jest.fn(),
};

jest.mock('@react-navigation/native', () => {
  const ReactLocal = require('react');

  return {
    createNavigationContainerRef: () => mockRootNavigationRef,
    NavigationContainer: ({
      children,
      ref,
    }: {
      children: React.ReactNode;
      ref?: unknown;
    }) =>
      ReactLocal.createElement(
        'mock-navigation-container',
        {
          ref,
        },
        children,
      ),
  };
});

jest.mock('../src/navigation/RootStackNavigator', () => {
  const ReactLocal = require('react');

  return {
    RootStackNavigator: () => ReactLocal.createElement('mock-root-stack-navigator'),
  };
});

describe('AppNavigator', () => {
  it('attaches the root navigation ref to NavigationContainer', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<AppNavigator />);
    });

    const navigationContainer = testRenderer!.root.find(
      node => String(node.type) === 'mock-navigation-container',
    );

    expect(navigationContainer.props.ref).toBe(rootNavigationRef);
  });
});
