import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockThemeToken = { colorText: 'theme-color-text' };

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
  useTheme: () => ({ token: mockThemeToken }),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { FlatList, Text, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const theme = jest.requireMock('@pennyspring/theme');

  return {
    ...theme,
    Column: passthrough(View),
    FlatList: passthrough(FlatList),
    Input: () => null,
    Row: passthrough(View),
    ListPicker: () => null,
    Text: passthrough(Text),
  };
});

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');

  const MockPhosphorIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);

  return new Proxy(
    { __esModule: true },
    {
      get: () => MockPhosphorIcon,
    },
  );
});

import { IconPreviewScreen } from '../src/screens/iconPreview/IconPreviewScreen';

describe('IconPreviewScreen', () => {
  it('renders phosphor icons with the current theme text color', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<IconPreviewScreen />);
    });

    const icons = renderer!.root.findAll(
      node => String(node.type) === 'MockPhosphorIcon',
    );

    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon.props.color).toBe(mockThemeToken.colorText);
    }
  });
});
