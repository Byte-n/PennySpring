import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
}));

jest.mock('phosphor-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({ __esModule: true }, { get: () => MockIcon });
});

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text: RNText, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  return {
    Button: ({
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
      ),
    Column: passthrough(View),
    Empty: ({
      action,
      titleText,
    }: {
      action?: React.ReactNode;
      titleText?: string;
    }) =>
      ReactLib.createElement(
        View,
        null,
        titleText ? ReactLib.createElement(RNText, null, titleText) : null,
        action,
      ),
    Icon: () => null,
    List: () => null,
    Loading: () => null,
    Row: (props: Record<string, unknown>) =>
      ReactLib.createElement(View, props, props.children as React.ReactNode),
    Text: passthrough(RNText),
    createUseSheetStyle: () => () => ({}),
    useTheme: () => ({ token: {} }),
  };
});

import { Text } from 'react-native';

import { AgentSessionList } from '../../src/agent/ui/AgentSessionList';

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((value): value is string => typeof value === 'string');
}

describe('AgentSessionList 加载失败', () => {
  it('shows a retry when loading sessions fails', () => {
    const onRetry = jest.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <AgentSessionList
          currentThreadId={null}
          errorText="网络不可达"
          onDelete={jest.fn()}
          onRetry={onRetry}
          onSelect={jest.fn()}
          threads={[]}
        />,
      );
    });

    expect(collectTexts(renderer!)).toContain('会话加载失败');

    act(() => {
      renderer!.root
        .findByProps({ testID: 'agent-session-list-retry' })
        .props.onPress();
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
