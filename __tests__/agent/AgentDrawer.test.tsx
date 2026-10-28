import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { ThreadMessageLike } from '@assistant-ui/react-native';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
  type ThreadMessage,
} from '@assistant-ui/react-native';

import { AgentDrawer } from '../../src/agent/ui/AgentDrawer';
import type { AgentSessionState } from '../../src/agent/ui/useAgentSession';

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

  const MockTextarea = (props: Record<string, any>) =>
    ReactLib.createElement(TextInput, {
      multiline: true,
      onChangeText: props.onChangeText,
      placeholder: props.placeholder,
      testID: props.testID,
      value: props.value,
    });

  const MockEmpty = ({
    descriptionText,
    titleText,
  }: {
    descriptionText?: string;
    titleText?: string;
  }) =>
    ReactLib.createElement(
      Text,
      { testID: 'agent-empty' },
      titleText ?? descriptionText,
    );

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
            ? renderHeaderRight({
                cancel: () => undefined,
                confirm: async () => undefined,
              })
            : null,
          children,
        )
      : null;

  return {
    Button: MockButton,
    Column: passthrough(View),
    Empty: MockEmpty,
    Icon: () => null,
    Loading: MockLoading,
    Popover: ({
      children,
      content,
      open,
    }: {
      children?: React.ReactNode;
      content?: React.ReactNode;
      open?: boolean;
    }) =>
      ReactLib.createElement(View, null, children, open ? content : null),
    Popup: { FloatingPanel: MockFloatingPanel },
    Row: passthrough(View),
    Text: passthrough(Text),
    Textarea: MockTextarea,
    useToast: () => ({
      show: jest.fn(() => 0),
      hide: jest.fn(),
      clear: jest.fn(),
    }),
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

function createSession(
  overrides: Partial<AgentSessionState> = {},
): AgentSessionState {
  return {
    loading: false,
    sending: false,
    errorText: '',
    usage: EMPTY_USAGE,
    threads: [],
    threadsLoading: false,
    currentThreadId: 1,
    initialMessages: [],
    createThread: jest.fn(() => Promise.resolve(true)),
    selectThread: jest.fn(() => Promise.resolve(true)),
    deleteThread: jest.fn(() => Promise.resolve()),
    deleteCurrentThread: jest.fn(() => Promise.resolve()),
    refreshThreads: jest.fn(() => Promise.resolve()),
    ensureTitle: jest.fn(() => Promise.resolve()),
    markActivity: jest.fn(),
    accumulateUsage: jest.fn(),
    setSending: jest.fn(),
    setErrorText: jest.fn(),
    ...overrides,
  };
}

interface HarnessProps {
  session: AgentSessionState;
  configured: boolean;
  initialMessages: readonly ThreadMessageLike[];
  adapter: ChatModelAdapter;
  onOpenSettings: () => void;
  onOpenSessions: () => void;
}

function Harness({
  session,
  configured,
  initialMessages,
  adapter,
  onOpenSettings,
  onOpenSessions,
}: HarnessProps) {
  const runtime = useLocalRuntime(adapter, { initialMessages });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AgentDrawer
        configured={configured}
        onOpenChange={jest.fn()}
        onOpenSettings={onOpenSettings}
        onOpenSessions={onOpenSessions}
        open
        runtimeErrorText=""
        session={session}
      />
    </AssistantRuntimeProvider>
  );
}

function createAdapter(): ChatModelAdapter {
  return {
    run: async () => ({
      content: [{ type: 'text', text: '收到' }],
    }),
  };
}

function createPendingAdapter(
  onSignal: (signal: AbortSignal) => void,
): ChatModelAdapter {
  return {
    run: ({ abortSignal }) =>
      new Promise(resolve => {
        onSignal(abortSignal);
        abortSignal.addEventListener(
          'abort',
          () => resolve({ content: [] }),
          { once: true },
        );
      }),
  };
}

function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

interface RenderOptions {
  session?: Partial<AgentSessionState>;
  configured?: boolean;
  initialMessages?: readonly ThreadMessageLike[];
  adapter?: ChatModelAdapter;
}

const mountedRenderers: TestRenderer.ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    mountedRenderers.splice(0).forEach(renderer => renderer.unmount());
  });
});

function renderDrawer(options: RenderOptions = {}) {
  const session = createSession(options.session);
  const onOpenSettings = jest.fn();
  const onOpenSessions = jest.fn();
  const adapter = options.adapter ?? createAdapter();
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <Harness
        adapter={adapter}
        configured={options.configured ?? true}
        initialMessages={options.initialMessages ?? []}
        onOpenSessions={onOpenSessions}
        onOpenSettings={onOpenSettings}
        session={session}
      />,
    );
  });

  mountedRenderers.push(renderer!);
  return { renderer: renderer!, onOpenSessions, onOpenSettings, session };
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
  return collectText(root === null ? [] : Array.isArray(root) ? root : [root]);
}

function messageText(message: ThreadMessage): string {
  return message.content
    .map(part => (part.type === 'text' ? part.text : ''))
    .join('');
}

const CONVERSATION: ThreadMessageLike[] = [
  { role: 'user', content: '上个月吃饭花了多少？' },
  {
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'call-1',
        toolName: 'queryRecords',
        args: {},
        argsText: '{}',
        result: { total: 120 },
      },
      { type: 'text', text: '**合计 120 元**' },
    ],
  },
];

describe('AgentDrawer', () => {
  it('shows the setup notice and opens settings from a suggestion', () => {
    const { renderer, onOpenSettings } = renderDrawer({ configured: false });

    expect(
      renderer.root.findByProps({ testID: 'agent-empty' }).props.children,
    ).toBe('记账遇到问题，可以直接问我。');

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

  it('renders messages, markdown and completed tool status', () => {
    const { renderer } = renderDrawer({ initialMessages: CONVERSATION });

    const text = renderedText(renderer);

    expect(text).toContain('上个月吃饭花了多少？');
    expect(text).toContain('合计 120 元');
    expect(text).not.toContain('**合计 120 元**');
    expect(text).toContain('已查询账本数据');
  });

  it('sends the trimmed draft when the send button is pressed', async () => {
    const runSpy = jest.fn();
    const adapter: ChatModelAdapter = {
      run: async ({ messages }) => {
        runSpy(messages);
        return { content: [{ type: 'text', text: '收到' }] };
      },
    };
    const { renderer } = renderDrawer({ adapter });

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-input' })
        .props.onChangeText('  上个月吃饭花了多少？  ');
    });

    const sendButton = renderer.root.findByProps({
      testID: 'agent-send-button',
    });
    expect(sendButton.props.disabled).toBe(false);

    await act(async () => {
      sendButton.props.onPress();
      await flush();
    });

    expect(runSpy).toHaveBeenCalledTimes(1);
    const messages = runSpy.mock.calls[0][0] as ThreadMessage[];
    expect(messageText(messages[messages.length - 1]!).trim()).toBe(
      '上个月吃饭花了多少？',
    );
  });

  it('keeps the send button disabled for a blank draft', () => {
    const { renderer } = renderDrawer();

    expect(
      renderer.root.findByProps({ testID: 'agent-send-button' }).props.disabled,
    ).toBe(true);
  });

  it('opens the session list from the header', () => {
    const { renderer, onOpenSessions } = renderDrawer();

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-sessions-button' })
        .props.onPress();
    });

    expect(onOpenSessions).toHaveBeenCalledTimes(1);
  });

  it('shows thinking and stops the run while responding', async () => {
    let signal: AbortSignal | undefined;
    const { renderer } = renderDrawer({
      adapter: createPendingAdapter(nextSignal => {
        signal = nextSignal;
      }),
    });

    act(() => {
      renderer.root.findByProps({ testID: 'agent-input' }).props.onChangeText(
        '本月支出按类型统计',
      );
    });

    await act(async () => {
      renderer.root
        .findByProps({ testID: 'agent-send-button' })
        .props.onPress();
      await flush();
    });

    expect(renderedText(renderer)).toContain('正在思考…');
    const stopButton = renderer.root.findByProps({
      testID: 'agent-stop-button',
    });
    expect(signal).toBeDefined();

    await act(async () => {
      stopButton.props.onPress();
      await flush();
    });

    expect(signal?.aborted).toBe(true);
  });

  it('shows session errors above the conversation', () => {
    const { renderer } = renderDrawer({
      session: { errorText: '读取会话失败' },
    });

    expect(renderedText(renderer)).toContain('读取会话失败');
  });
});
