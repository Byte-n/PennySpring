import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TestScreen } from '../src/screens/test/TestScreen';

jest.mock('@pennyspring/component', () => {
  const ReactLocal = require('react');
  const ReactNative = require('react-native');

  return {
    Page: ({
      children,
      title,
    }: {
      children?: React.ReactNode;
      title?: React.ReactNode;
    }) =>
      ReactLocal.createElement(
        ReactNative.View,
        { accessibilityLabel: 'Page wrapper' },
        ReactLocal.createElement(ReactNative.Text, null, title),
        children,
      ),
    Text: ReactNative.Text,
    TextPreview: () =>
      ReactLocal.createElement(ReactNative.Text, null, 'TextPreview'),
  };
});

jest.mock('@pennyspring/theme', () => {
  const ReactLocal = require('react');

  return {
    ThemePreview: () => {
      const ReactNative = require('react-native');

      return ReactLocal.createElement(ReactNative.Text, null, 'Theme Preview');
    },
    createUseSheetStyle:
      (factory: (token: Record<string, unknown>) => Record<string, unknown>) =>
      () =>
        factory({
          borderRadius: 8,
          borderRadiusSM: 4,
          colorBgLayout: 'layout',
          colorBgTextActive: 'active',
          controlItemBgActive: 'selected',
          paddingSM: 12,
          paddingXXS: 4,
          paddingXS: 8,
        }),
  };
});

describe('TestScreen', () => {
  it('renders preview tabs and switches between ThemePreview and TextPreview', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<TestScreen />);
    });

    expect(
      testRenderer!.root.findByProps({ accessibilityLabel: 'Page wrapper' }),
    ).toBeTruthy();
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Test');
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Theme');
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Text');
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Theme Preview');
    expect(JSON.stringify(testRenderer!.toJSON())).not.toContain('TextPreview');

    const textTab = testRenderer!.root.findByProps({
      accessibilityLabel: 'Text preview tab',
    });

    act(() => {
      textTab.props.onPress();
    });

    expect(JSON.stringify(testRenderer!.toJSON())).not.toContain(
      'Theme Preview',
    );
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('TextPreview');
  });
});
