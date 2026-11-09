import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text: RNText, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  return {
    Button: ({
      children,
      onPress,
    }: {
      children?: React.ReactNode;
      onPress?: () => void;
    }) =>
      ReactLib.createElement(
        'MockButton',
        { onPress },
        ReactLib.createElement(RNText, null, children),
      ),
    Row: passthrough(View),
    Text: passthrough(RNText),
    createUseSheetStyle: () => () => ({}),
  };
});

import { ResourceLoadError } from '../src/screens/addRecord/components/ResourceLoadError';

describe('ResourceLoadError', () => {
  it('renders nothing while the resources load successfully', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <ResourceLoadError error={false} onRetry={jest.fn()} />,
      );
    });

    expect(renderer!.toJSON()).toBeNull();
  });

  it('shows the failure notice and retries all resources on press', () => {
    const onRetry = jest.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <ResourceLoadError
          error
          messageText="资产、标签或关联记录加载失败"
          onRetry={onRetry}
        />,
      );
    });

    const texts = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);
    expect(texts).toContain('资产、标签或关联记录加载失败');

    act(() => {
      renderer!.root.findByType('MockButton' as never).props.onPress();
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
