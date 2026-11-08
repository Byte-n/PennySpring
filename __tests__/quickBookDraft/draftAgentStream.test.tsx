import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text: RNText, View } = require('react-native');
  return {
    createUseSheetStyle: () => () => ({}),
    Column: ({ children }: { children?: unknown }) =>
      ReactLib.createElement(View, null, children),
    Text: ({ children }: { children?: unknown }) =>
      ReactLib.createElement(RNText, null, children),
  };
});

jest.mock('../../src/agent/ui/ThinkingBlock', () => {
  const ReactLib = require('react');
  const { Text: RNText } = require('react-native');
  return {
    ThinkingBlock: ({
      status,
      text,
    }: {
      status: { type: string };
      text: string;
    }) =>
      ReactLib.createElement(RNText, null, `thinking:${status.type}:${text}`),
  };
});

jest.mock('../../src/component/MarkdownText', () => {
  const ReactLib = require('react');
  const { Text: RNText } = require('react-native');
  return {
    MarkdownText: ({ content }: { content: string }) =>
      ReactLib.createElement(RNText, null, content),
  };
});

jest.mock('../../src/agent/ui/ToolStatusNote', () => {
  const ReactLib = require('react');
  const { Text: RNText } = require('react-native');
  return {
    ToolStatusNote: ({
      status,
      toolName,
    }: {
      status: string;
      toolName: string;
    }) => ReactLib.createElement(RNText, null, `tool:${toolName}:${status}`),
  };
});

import { DraftAgentStream } from '../../src/screens/home/tabs/draft/DraftAgentStream';

describe('DraftAgentStream', () => {
  it('renders reasoning, text and tool parts in stream order', () => {
    let renderer: TestRenderer.ReactTestRenderer | undefined;

    act(() => {
      renderer = TestRenderer.create(
        <DraftAgentStream
          parts={[
            {
              type: 'reasoning',
              id: 'r1',
              text: '先看金额',
              isDone: true,
            },
            {
              type: 'text',
              id: 't1',
              text: '识别到两笔',
              isDone: false,
            },
            {
              type: 'tool',
              toolCallId: 'call-1',
              toolName: 'saveRecordDrafts',
              status: 'running',
            },
          ]}
        />,
      );
    });

    const texts = renderer?.root
      .findAllByType(Text)
      .map(node => node.props.children);
    expect(texts).toEqual([
      'thinking:complete:先看金额',
      '识别到两笔',
      'tool:saveRecordDrafts:running',
    ]);
  });

  it('renders the streamed draft summary and item count before the tool status', () => {
    let renderer: TestRenderer.ReactTestRenderer | undefined;

    act(() => {
      renderer = TestRenderer.create(
        <DraftAgentStream
          parts={[
            {
              type: 'tool',
              toolCallId: 'call-1',
              toolName: 'saveRecordDrafts',
              status: 'preparing',
              summary: '午餐两笔',
              itemCount: 2,
            },
          ]}
        />,
      );
    });

    const texts = renderer?.root
      .findAllByType(Text)
      .map(node => node.props.children);
    expect(texts).toEqual([
      '午餐两笔',
      '已识别 2 笔',
      'tool:saveRecordDrafts:preparing',
    ]);
  });
});
