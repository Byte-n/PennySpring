import React from 'react';

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
    RootStackNavigator: () =>
      ReactLocal.createElement('mock-root-stack-navigator'),
  };
});
