import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text: RNText, View } = require('react-native');

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
    Empty: ({
      action,
      descriptionText,
      titleText,
    }: {
      action?: React.ReactNode;
      descriptionText?: string;
      titleText?: string;
    }) =>
      ReactLib.createElement(
        View,
        null,
        titleText ? ReactLib.createElement(RNText, null, titleText) : null,
        descriptionText
          ? ReactLib.createElement(RNText, null, descriptionText)
          : null,
        action,
      ),
  };
});

import { Text } from 'react-native';

import { LoadErrorEmpty } from '../src/components/LoadErrorEmpty';

function collectTexts(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((value): value is string => typeof value === 'string');
}

describe('LoadErrorEmpty', () => {
  it('shows the default failure copy and retries on press', () => {
    const onRetry = jest.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<LoadErrorEmpty onRetry={onRetry} />);
    });

    const texts = collectTexts(renderer!);
    expect(texts).toContain('数据加载失败');
    expect(texts).toContain('请检查网络或稍后重试。');

    act(() => {
      renderer!.root.findByType('MockButton' as never).props.onPress();
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps caller-provided context-specific copy', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <LoadErrorEmpty
          descriptionText="账户数据加载失败，请检查网络或稍后重试。"
          onRetry={jest.fn()}
          titleText="账户加载失败"
        />,
      );
    });

    expect(collectTexts(renderer!)).toEqual(
      expect.arrayContaining([
        '账户加载失败',
        '账户数据加载失败，请检查网络或稍后重试。',
        '重试',
      ]),
    );
  });
});
