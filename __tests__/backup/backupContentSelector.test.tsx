import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text: RNText, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const MockButton = ({
    children,
    onPress,
    testID,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    testID?: string;
  }) =>
    ReactLib.createElement(
      Pressable,
      { onPress, testID },
      ReactLib.createElement(RNText, null, children),
    );

  return {
    Button: MockButton,
    Card: passthrough(View),
    Checkbox: passthrough(View),
    Column: passthrough(View),
    Row: passthrough(View),
    Switch: () => null,
    Text: passthrough(RNText),
    createUseSheetStyle: () => () => ({}),
  };
});

import { Text } from 'react-native';

import { BackupContentSelector } from '../../src/screens/backup/components/BackupContentSelector';

const DEFAULT_OPTIONS = {
  includeAgent: false,
  includeAiConfig: false,
  includeImages: false,
};

const BASE_PROPS = {
  bookOptions: {},
  books: [],
  defaultBookOptions: DEFAULT_OPTIONS,
  includeNetworkBooks: false,
  includeSettings: false,
  onBookOptionsChange: jest.fn(),
  onIncludeNetworkBooksChange: jest.fn(),
  onIncludeSettingsChange: jest.fn(),
  onSelectedBookIdsChange: jest.fn(),
  selectedBookIds: [],
};

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((value): value is string => typeof value === 'string');
}

describe('BackupContentSelector', () => {
  it('shows a retry when local books fail to load', () => {
    const onRetry = jest.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <BackupContentSelector {...BASE_PROPS} error onRetry={onRetry} />,
      );
    });

    expect(collectTexts(renderer!)).toContain('本地账本加载失败。');

    act(() => {
      renderer!.root
        .findByProps({ testID: 'backup-content-books-retry' })
        .props.onPress();
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
