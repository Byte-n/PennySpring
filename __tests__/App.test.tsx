/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-navigation/native', () => {
  const ReactLocal = require('react');

  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement('mock-navigation-container', null, children),
  };
});

const mockStackScreen = jest.fn();

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const ReactLocal = require('react');

    return {
      Navigator: ({ children }: { children: React.ReactNode }) =>
        ReactLocal.createElement('mock-native-stack', null, children),
      Screen: (props: Record<string, unknown>) => {
        mockStackScreen(props);
        return ReactLocal.createElement('mock-native-stack-screen');
      },
    };
  },
}));

jest.mock('../src/screens/HomeScreen', () => {
  const ReactLocal = require('react');

  return {
    HomeScreen: () => ReactLocal.createElement('mock-home-screen'),
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

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('renders HomeScreen inside navigation with hidden native header', async () => {
  let testRenderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(<App />);
  });

  const treeString = JSON.stringify(testRenderer!.toJSON());
  const screenProps = mockStackScreen.mock.calls[0][0];

  expect(treeString).toContain('mock-navigation-container');
  expect(treeString).toContain('mock-native-stack');
  expect(screenProps.name).toBe('Home');
  expect(screenProps.component).toBeDefined();
  expect(screenProps.options).toEqual({ headerShown: false });
});

test('renders navigation content inside a safe area view', async () => {
  let testRenderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(<App />);
  });

  const safeAreaView = testRenderer!.root.findAll(
    (node) => String(node.type) === 'mock-safe-area-view'
  )[0];
  const navigationContainer = safeAreaView.findAll(
    (node) => String(node.type) === 'mock-navigation-container'
  )[0];

  expect(safeAreaView.props.edges).toEqual(['top', 'right', 'bottom', 'left']);
  expect(safeAreaView.props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ flex: 1 })])
  );
  expect(navigationContainer).toBeDefined();
});
