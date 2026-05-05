/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

const mockAppNavigator = jest.fn();

jest.mock('../src/navigation', () => {
  const ReactLocal = require('react');

  return {
    AppNavigator: () => {
      mockAppNavigator();
      return ReactLocal.createElement('mock-app-navigator');
    },
  };
});

jest.mock('react-native-safe-area-context', () => {
  const ReactLocal = require('react');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement('mock-safe-area-provider', null, children),
    SafeAreaView: ({
      children,
      edges,
      style,
    }: {
      children: React.ReactNode;
      edges?: readonly string[];
      style?: unknown;
    }) =>
      ReactLocal.createElement(
        'mock-safe-area-view',
        {
          edges,
          style,
        },
        children
      ),
  };
});

beforeEach(() => {
  mockAppNavigator.mockClear();
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('delegates navigation rendering to src/navigation', async () => {
  let testRenderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(<App />);
  });

  const treeString = JSON.stringify(testRenderer!.toJSON());

  expect(treeString).toContain('mock-app-navigator');
  expect(mockAppNavigator).toHaveBeenCalledTimes(1);
});

test('renders navigation content inside a safe area view', async () => {
  let testRenderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(<App />);
  });

  const safeAreaView = testRenderer!.root.findAll(
    (node) => String(node.type) === 'mock-safe-area-view'
  )[0];
  const appNavigator = safeAreaView.findAll(
    (node) => String(node.type) === 'mock-app-navigator'
  )[0];

  expect(safeAreaView.props.edges).toEqual(['top', 'right', 'bottom', 'left']);
  expect(safeAreaView.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ flex: 1 })])
  );
  expect(appNavigator).toBeDefined();
});
