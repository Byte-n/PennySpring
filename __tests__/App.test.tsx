/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { rootNavigationRef } from '../src/navigation/rootNavigationRef';
import App from '../App';

const mockAppNavigator = jest.fn();
const mockConfigProvider = jest.fn();

jest.mock('../src/navigation/rootNavigationRef', () => ({
  rootNavigationRef: {
    canGoBack: jest.fn(),
    goBack: jest.fn(),
    isReady: jest.fn(),
  },
}));

jest.mock('../src/navigation/AppNavigator', () => {
  const ReactLocal = require('react');

  return {
    AppNavigator: () => {
      mockAppNavigator();
      return ReactLocal.createElement('mock-app-navigator');
    },
  };
});

jest.mock('@pennyspring/component', () => {
  const ReactLocal = require('react');

  return {
    ConfigProvider: ({
      children,
      page,
    }: {
      children: React.ReactNode;
      page?: { onBack?: () => void };
    }) => {
      mockConfigProvider(page);

      return ReactLocal.createElement('mock-config-provider', { page }, children);
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
  jest.restoreAllMocks();
  jest.clearAllMocks();
  mockAppNavigator.mockClear();
  mockConfigProvider.mockClear();
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

test('provides navigation goBack as the default Page back behavior', async () => {
  let testRenderer: ReactTestRenderer.ReactTestRenderer;

  const isReadySpy = jest.spyOn(rootNavigationRef, 'isReady').mockReturnValue(true);
  const canGoBackSpy = jest
    .spyOn(rootNavigationRef, 'canGoBack')
    .mockReturnValue(true);
  const goBackSpy = jest.spyOn(rootNavigationRef, 'goBack').mockImplementation();

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(<App />);
  });

  const configProvider = testRenderer!.root.findAll(
    (node) => String(node.type) === 'mock-config-provider'
  )[0];

  await ReactTestRenderer.act(() => {
    configProvider.props.page.onBack();
  });

  expect(mockConfigProvider).toHaveBeenCalledWith({
    onBack: expect.any(Function),
  });
  expect(isReadySpy).toHaveBeenCalledTimes(1);
  expect(canGoBackSpy).toHaveBeenCalledTimes(1);
  expect(goBackSpy).toHaveBeenCalledTimes(1);
});

test('does not call navigation goBack when root navigation cannot go back', async () => {
  let testRenderer: ReactTestRenderer.ReactTestRenderer;

  const isReadySpy = jest.spyOn(rootNavigationRef, 'isReady').mockReturnValue(true);
  const canGoBackSpy = jest
    .spyOn(rootNavigationRef, 'canGoBack')
    .mockReturnValue(false);
  const goBackSpy = jest.spyOn(rootNavigationRef, 'goBack').mockImplementation();

  await ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(<App />);
  });

  const configProvider = testRenderer!.root.findAll(
    (node) => String(node.type) === 'mock-config-provider'
  )[0];

  await ReactTestRenderer.act(() => {
    configProvider.props.page.onBack();
  });

  expect(isReadySpy).toHaveBeenCalledTimes(1);
  expect(canGoBackSpy).toHaveBeenCalledTimes(1);
  expect(goBackSpy).not.toHaveBeenCalled();
});
