import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { AgentDrawer } from '../../src/agent/ui/AgentDrawer';
import type { AgentChatState } from '../../src/agent/ui/useAgentChat';

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
  useTheme: () => ({ token: {} }),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text, TextInput, View } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const MockButton = ({
    children,
    disabled,
    onPress,
    testID,
  }: {
    children?: React.ReactNode;
    disabled?: boolean;
    onPress?: () => void;
    testID?: string;
  }) =>
    ReactLib.createElement(
      Pressable,
      { disabled, onPress: disabled ? undefined : onPress, testID },
      typeof children === 'string'
        ? ReactLib.createElement(Text, null, children)
        : children,
    );

  const MockInput = (props: Record<string, any>) =>
    ReactLib.createElement(TextInput, {
      onChangeText: props.onChange,
      onSubmitEditing: props.onSubmitEditing,
      placeholder: props.placeholder,
      testID: props.testID,
      value: props.value,
    });

  const MockEmpty = ({ descriptionText, titleText }: { descriptionText?: string; titleText?: string }) =>
    ReactLib.createElement(Text, { testID: 'agent-empty' }, titleText ?? descriptionText);

  const MockLoading = ({ text }: { text?: string }) =>
    ReactLib.createElement(Text, { testID: 'agent-loading' }, text ?? 'loading');

  const MockFloatingPanel = ({
    children,
    open,
    renderHeaderRight,
  }: {
    children?: React.ReactNode;
    open?: boolean;
    renderHeaderRight?: (params: unknown) => React.ReactNode;
  }) =>
    open
      ? ReactLib.createElement(
          View,
          null,
          renderHeaderRight
            ? renderHeaderRight({ cancel: () => undefined, confirm: async () => undefined })
            : null,
          children,
        )
      : null;

  return {
    Button: MockButton,
    Column: passthrough(View),
    Empty: MockEmpty,
    Input: MockInput,
    Loading: MockLoading,
    Popup: { FloatingPanel: MockFloatingPanel },
    Row: passthrough(View),
    Text: passthrough(Text),
  };
});

jest.mock('phosphor-react-native', () => {
  const ReactLib = require('react');
  const MockIcon = (props: Record<string, unknown>) =>
    ReactLib.createElement('MockPhosphorIcon', props);
  return new Proxy({ __esModule: true }, { get: () => MockIcon });
});

const EMPTY_USAGE = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

function createChat(overrides: Partial<AgentChatState> = {}): AgentChatState {
  return {
    loading: false,
    sending: false,
    messages: [],
    streamingText: '',
    activeTool: null,
    errorText: '',
    usage: EMPTY_USAGE,
    threads: [],
    threadsLoading: false,
    currentThreadId: null,
    send: jest.fn(() => Promise.resolve()),
    stop: jest.fn(),
    createThread: jest.fn(() => Promise.resolve(true)),
    selectThread: jest.fn(() => Promise.resolve(true)),
    deleteThread: jest.fn(() => Promise.resolve()),
    deleteCurrentThread: jest.fn(() => Promise.resolve()),
    ...overrides,
  };
}

function renderDrawer(
  chat: AgentChatState,
  options: {
    configured?: boolean;
    onOpenSettings?: () => void;
    onOpenSessions?: () => void;
  } = {},
) {
  const onOpenSettings = options.onOpenSettings ?? jest.fn();
  const onOpenSessions = options.onOpenSessions ?? jest.fn();
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <AgentDrawer
        chat={chat}
        configured={options.configured ?? true}
        onOpenChange={jest.fn()}
        onOpenSessions={onOpenSessions}
        onOpenSettings={onOpenSettings}
        open
      />,
    );
  });
  return { renderer: renderer!, onOpenSessions, onOpenSettings };
}

type HostNode = {
  type: string;
  props: Record<string, unknown>;
  children?: unknown[];
};

function collectText(nodes: readonly unknown[]): string {
  return nodes
    .map(node => {
      if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
      }
      if (!node || typeof node !== 'object') {
        return '';
      }
      return collectText(((node as HostNode).children) ?? []);
    })
    .join(' ');
}

function renderedText(renderer: TestRenderer.ReactTestRenderer): string {
  const root = renderer.toJSON();
  return collectText(root === null ? [] : (Array.isArray(root) ? root : [root]));
}

describe('AgentDrawer', () => {
  it('shows the setup notice and suggestions when the agent is not configured', () => {
    const { renderer, onOpenSettings } = renderDrawer(createChat(), {
      configured: false,
    });

    expect(renderer.root.findByProps({ testID: 'agent-empty' }).props.children).toBe(
      '记账遇到问题，可以直接问我。',
    );

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-notice-settings-button' })
        .props.onPress();
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-suggestion-0' })
        .props.onPress();
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(2);
  });

  it('sends the trimmed draft when the send button is pressed', () => {
    const chat = createChat();
    const { renderer } = renderDrawer(chat);

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-input' })
        .props.onChange('  上个月吃饭花了多少？  ');
    });

    const sendButton = renderer.root.findByProps({ testID: 'agent-send-button' });
    expect(sendButton.props.disabled).toBe(false);

    act(() => {
      sendButton.props.onPress();
    });

    expect(chat.send).toHaveBeenCalledWith('上个月吃饭花了多少？');
  });

  it('keeps the send button disabled for a blank draft', () => {
    const { renderer } = renderDrawer(createChat());

    expect(
      renderer.root.findByProps({ testID: 'agent-send-button' }).props.disabled,
    ).toBe(true);
  });

  it('opens the session list from the header', () => {
    const { renderer, onOpenSessions } = renderDrawer(createChat());

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-sessions-button' })
        .props.onPress();
    });

    expect(onOpenSessions).toHaveBeenCalledTimes(1);
  });

  it('shows streamed text and replaces send with stop while responding', () => {
    const chat = createChat({ sending: true, streamingText: '正在统计支出…' });
    const { renderer } = renderDrawer(chat);

    expect(renderedText(renderer)).toContain('正在统计支出…');

    act(() => {
      renderer.root.findByProps({ testID: 'agent-stop-button' }).props.onPress();
    });
    expect(chat.stop).toHaveBeenCalledTimes(1);
  });

  it('renders user and assistant messages but skips tool payloads', () => {
    const chat = createChat({
      messages: [
        { role: 'user', content: '上个月吃饭花了多少？' },
        {
          role: 'assistant',
          content: '',
          toolCalls: [{ id: 'call_1', name: 'queryRecords', arguments: '{}' }],
        },
        {
          role: 'tool',
          content: '{"count":3,"totals":{"expense":120}}',
          toolCallId: 'call_1',
          toolName: 'queryRecords',
        },
        { role: 'assistant', content: '上个月吃饭共 120.00 元。' },
      ],
    });
    const { renderer } = renderDrawer(chat);

    const text = renderedText(renderer);

    expect(text).toContain('上个月吃饭花了多少？');
    expect(text).toContain('上个月吃饭共 120.00 元。');
    expect(text).toContain('已查询账本数据');
    expect(text).not.toContain('{"count":3,"totals":{"expense":120}}');
  });

  it('renders assistant markdown without the raw markers', () => {
    const chat = createChat({
      messages: [
        { role: 'assistant', content: '**合计 120 元**' },
      ],
    });
    const { renderer } = renderDrawer(chat);

    const text = renderedText(renderer);
    expect(text).toContain('合计 120 元');
    expect(text).not.toContain('**合计 120 元**');
  });

  it('shows the current tool status while a tool runs', () => {
    const chat = createChat({ sending: true, activeTool: '正在查询账本数据…' });
    const { renderer } = renderDrawer(chat);

    expect(renderedText(renderer)).toContain('正在查询账本数据…');
  });
});
