import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

const mockRootNavigationRef = {
  current: null as unknown,
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
    RootStackNavigator: () =>
      ReactLocal.createElement('mock-root-stack-navigator'),
  };
});

test('renders root stack navigator inside navigation container', async () => {
  const { NavigationContainer } = require('@react-navigation/native');
  const { rootNavigationRef } = require('../src/navigation/rootNavigationRef');
  const { RootStackNavigator } = require('../src/navigation/RootStackNavigator');

  let testRenderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(
      <NavigationContainer ref={rootNavigationRef}>
        <RootStackNavigator />
      </NavigationContainer>
    );
  });

  const navigationContainer = testRenderer!.root.findAll(
    (node) => String(node.type) === 'mock-navigation-container'
  )[0];
  const rootStackNavigator = testRenderer!.root.findAll(
    (node) => String(node.type) === 'mock-root-stack-navigator'
  )[0];

  expect(navigationContainer.props.ref).toBe(mockRootNavigationRef);
  expect(rootStackNavigator).toBeDefined();
});
