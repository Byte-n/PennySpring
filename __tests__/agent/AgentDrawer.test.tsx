import React from 'react';
import { Image } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import type { ThreadMessageLike } from '@assistant-ui/react-native';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
  type ThreadMessage,
} from '@assistant-ui/react-native';

import { AgentDrawer } from '../../src/agent/ui/AgentDrawer';
import { AgentChatContext } from '../../src/agent/ui/AgentChatContext';
import type { AgentSessionState } from '../../src/agent/ui/useAgentSession';
import type { AgentProviderConfig } from '../../src/agent/providers/types';

const mockProviderState: { providers: AgentProviderConfig[] } = {
  providers: [],
};

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
  useTheme: () => ({
    token: { motionEaseInOut: [0.645, 0.045, 0.355, 1] },
  }),
}));

jest.mock('../../src/agent/providers/useProviders', () => ({
  EMPTY_AGENT_SELECTION: { providerId: 0, modelId: '' },
  useProviders: () => ({
    data: mockProviderState.providers,
    loading: false,
    refresh: jest.fn(),
  }),
  useProviderSelection: () => ({
    data: { providerId: 0, modelId: '' },
    loading: false,
    refresh: jest.fn(),
  }),
  useQuickBookSelection: () => ({
    data: { providerId: 0, modelId: '' },
    loading: false,
    refresh: jest.fn(),
  }),
  useProviderKeyStatus: () => ({
    data: false,
    loading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('../../src/stores/bookStore', () => {
  const {
    RECORD_TYPE_CATEGORY,
    RECORD_TYPE_SPECIAL_BEHAVIOR,
    SYSTEM_STATUS,
  } = require('@pennyspring/api');

  const book = { id: 1, name: '测试账本' };
  const api = {
    type: {
      getAll: async () => [
        {
          id: 2,
          booksId: 1,
          parentId: 0,
          name: '三餐',
          icon: '',
          typeCategory: RECORD_TYPE_CATEGORY.expense,
          isSystem: SYSTEM_STATUS.custom,
          specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
          sort: 1,
          createdTime: 0,
          updatedTime: 0,
        },
      ],
    },
    tag: { getAll: async () => [] },
    asset: { getByBook: async () => [] },
    record: {
      getDetailById: async (recordId: number) => ({
        record: {
          id: recordId,
          typeId: 2,
          assetId: 0,
          intoAssetId: 0,
          booksId: 1,
          amount: 3000,
          finalAmount: 3000,
          charge: 0,
          remark: '午饭',
          reimbursable: 'none',
          recordTime: new Date(2026, 9, 30, 12, 34).getTime(),
          createdTime: 0,
          updatedTime: 0,
        },
        tagIds: [],
        imagePaths: [],
        relatedRecordIds: [],
      }),
    },
    provider: { getAll: async () => mockProviderState.providers },
  };

  return {
    useGlobalApi: () => api,
    useBookStore: (selector: (state: unknown) => unknown) =>
      selector({ currentBook: book }),
  };
});

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const {
    Image: RNImage,
    Pressable,
    Text,
    TextInput,
    View,
  } = require('react-native');

  const passthrough =
    (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  const MockCard = ({
    titleText,
    children,
    footer,
  }: {
    titleText?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
  }) =>
    ReactLib.createElement(
      View,
      null,
      titleText ? ReactLib.createElement(Text, null, titleText) : null,
      children,
      footer,
    );

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
      onChangeText: props.onChange,
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
    ReactLib.createElement(
      Text,
      { testID: 'agent-loading' },
      text ?? 'loading',
    );

  const MockActionSheet = ({
    actions = [],
    onAction,
    open,
    titleText,
  }: {
    actions?: Array<{ text: string }>;
    onAction?: (action: { text: string }, index: number) => void;
    open?: boolean;
    titleText?: string;
  }) =>
    open
      ? ReactLib.createElement(
          View,
          null,
          titleText ? ReactLib.createElement(Text, null, titleText) : null,
          actions.map((action, index) =>
            ReactLib.createElement(
              Pressable,
              {
                key: index,
                onPress: () => onAction?.(action, index),
                testID: `action-sheet-action-${index}`,
              },
              ReactLib.createElement(Text, null, action.text),
            ),
          ),
        )
      : null;

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

  const MockImage = ({
    src,
    ...props
  }: {
    src?: Record<string, unknown>;
    [key: string]: unknown;
  }) =>
    ReactLib.createElement(RNImage, {
      ...props,
      source: src,
    });

  MockImage.PreviewGroup = ({ children }: { children?: React.ReactNode }) =>
    ReactLib.createElement(ReactLib.Fragment, null, children);

  const MockImagePickerActionSheet = ({
    onChange,
    onOpenChange,
    open,
    value = [],
  }: {
    onChange?: (value: Array<Record<string, unknown>>) => void;
    onOpenChange?: (nextOpen: boolean) => void;
    open?: boolean;
    value?: Array<Record<string, unknown>>;
  }) =>
    open
      ? ReactLib.createElement(
          Pressable,
          {
            onPress: () => {
              onChange?.([
                ...value,
                {
                  base64: 'QUJD',
                  fileName: 'chat.jpg',
                  mimeType: 'image/jpeg',
                  uri: 'file:///chat.jpg',
                },
              ]);
              onOpenChange?.(false);
            },
            testID: 'mock-image-picker-action-sheet',
          },
          ReactLib.createElement(Text, null, '添加图片'),
        )
      : null;

  const theme = jest.requireMock('@pennyspring/theme');

  return {
    ...theme,
    ActionSheet: MockActionSheet,
    Button: MockButton,
    Card: MockCard,
    Column: passthrough(View),
    Empty: MockEmpty,
    Icon: () => null,
    Image: MockImage,
    ImagePicker: { ActionSheet: MockImagePickerActionSheet },
    Loading: MockLoading,
    Popover: ({
      children,
      content,
      open,
    }: {
      children?: React.ReactNode;
      content?: React.ReactNode;
      open?: boolean;
    }) => ReactLib.createElement(View, null, children, open ? content : null),
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
    currentThread: {
      id: 1,
      booksId: 1,
      title: '',
      providerId: 1,
      modelId: 'model-a',
      createdTime: 0,
      updatedTime: 0,
    },
    sessionVersion: 0,
    initialMessages: [],
    createThread: jest.fn(() => Promise.resolve(true)),
    ensureThread: jest.fn(() => Promise.resolve(null)),
    syncDraftSelection: jest.fn(),
    ensureQuickBookThread: jest.fn(() => Promise.resolve(null)),
    selectThread: jest.fn(() => Promise.resolve(true)),
    deleteThread: jest.fn(() => Promise.resolve()),
    deleteCurrentThread: jest.fn(() => Promise.resolve()),
    refreshThreads: jest.fn(() => Promise.resolve()),
    ensureTitle: jest.fn(() => Promise.resolve()),
    updateThreadModel: jest.fn(() => Promise.resolve()),
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
  onOpenModelSettings: () => void;
}

function Harness({
  session,
  configured,
  initialMessages,
  adapter,
  onOpenSettings,
  onOpenSessions,
  onOpenModelSettings,
}: HarnessProps) {
  const runtime = useLocalRuntime(adapter, { initialMessages });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AgentChatContext.Provider value={session}>
        <AgentDrawer
          configured={configured}
          onOpenChange={jest.fn()}
          onOpenModelSettings={onOpenModelSettings}
          onOpenSettings={onOpenSettings}
          onOpenSessions={onOpenSessions}
          onPendingQuickBookSent={jest.fn()}
          open
          pendingQuickBook={null}
          runtimeErrorText=""
          session={session}
        />
      </AgentChatContext.Provider>
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
        abortSignal.addEventListener('abort', () => resolve({ content: [] }), {
          once: true,
        });
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
  mockProviderState.providers = [];
});

function renderDrawer(options: RenderOptions = {}) {
  const session = createSession(options.session);
  const onOpenSettings = jest.fn();
  const onOpenSessions = jest.fn();
  const onOpenModelSettings = jest.fn();
  const adapter = options.adapter ?? createAdapter();
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <Harness
        adapter={adapter}
        configured={options.configured ?? true}
        initialMessages={options.initialMessages ?? []}
        onOpenModelSettings={onOpenModelSettings}
        onOpenSessions={onOpenSessions}
        onOpenSettings={onOpenSettings}
        session={session}
      />,
    );
  });

  mountedRenderers.push(renderer!);
  return {
    renderer: renderer!,
    onOpenModelSettings,
    onOpenSessions,
    onOpenSettings,
    session,
  };
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
      return collectText((node as HostNode).children ?? []);
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

const PENDING_RECORD_APPROVAL: ThreadMessageLike[] = [
  { role: 'user', content: '帮我记一笔午饭 30 元' },
  {
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'call-record-1',
        toolName: 'createRecords',
        args: {
          records: [
            {
              typeId: 2,
              amount: 30,
              date: '2026-10-30',
              time: '12:34',
              remark: '午饭',
            },
          ],
        },
        argsText:
          '{"records":[{"typeId":2,"amount":30,"date":"2026-10-30","time":"12:34","remark":"午饭"}]}',
        approval: { id: 'approval-1' },
      },
    ],
  },
];

const COMPLETED_RECORD_APPROVAL: ThreadMessageLike[] = [
  { role: 'user', content: '帮我记一笔午饭 30 元' },
  {
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'call-record-1',
        toolName: 'createRecords',
        args: {
          records: [
            {
              typeId: 2,
              amount: 30,
              date: '2026-10-30',
              time: '12:34',
              remark: '午饭',
            },
          ],
        },
        argsText:
          '{"records":[{"typeId":2,"amount":30,"date":"2026-10-30","time":"12:34","remark":"午饭"}]}',
        approval: { id: 'approval-1', approved: true },
        result: { ok: true, count: 1, records: [{ recordId: 99 }] },
      },
    ],
  },
];

const PENDING_UPDATE_APPROVAL: ThreadMessageLike[] = [
  { role: 'user', content: '把午饭那笔改成 35 元' },
  {
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'call-record-update-1',
        toolName: 'updateRecords',
        args: { updates: [{ recordId: 100, amount: 35 }] },
        argsText: '{"updates":[{"recordId":100,"amount":35}]}',
        approval: { id: 'approval-update-1' },
      },
    ],
  },
];

const PENDING_DELETE_APPROVAL: ThreadMessageLike[] = [
  { role: 'user', content: '删掉午饭那笔' },
  {
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'call-record-delete-1',
        toolName: 'deleteRecords',
        args: { recordIds: [100] },
        argsText: '{"recordIds":[100]}',
        approval: { id: 'approval-delete-1' },
      },
    ],
  },
];

const CONVERSATION_WITH_REASONING: ThreadMessageLike[] = [
  { role: 'user', content: '帮我记一笔午饭 30 元' },
  {
    role: 'assistant',
    content: [
      { type: 'reasoning', text: '先核对类型和资产，再写入账本。' },
      { type: 'text', text: '已记录午饭 30 元。' },
    ],
  },
];

const IMAGE_URI = 'data:image/jpeg;base64,QUJD';
const CONVERSATION_WITH_IMAGE: ThreadMessageLike[] = [
  {
    role: 'user',
    content: [{ type: 'text', text: '看看这张小票' }],
    attachments: [
      {
        id: 'attachment-1',
        type: 'image',
        name: 'receipt.jpg',
        contentType: 'image/jpeg',
        content: [{ type: 'image', image: IMAGE_URI }],
        status: { type: 'complete' },
      },
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

  it('renders the record approval card for a pending createRecords call', async () => {
    const { renderer } = renderDrawer({
      initialMessages: PENDING_RECORD_APPROVAL,
    });

    await act(async () => {
      await flush();
    });

    expect(renderedText(renderer)).toContain('待确认的记账');
    expect(renderedText(renderer)).toContain('¥30.00');
    expect(renderedText(renderer)).toContain('确认记账');
    expect(
      renderer.root.findAllByProps({ testID: 'agent-record-confirm' }).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({ testID: 'agent-record-cancel' }).length,
    ).toBeGreaterThan(0);
  });

  it('renders the record update card for a pending updateRecords call', async () => {
    const { renderer } = renderDrawer({
      initialMessages: PENDING_UPDATE_APPROVAL,
    });

    await act(async () => {
      await flush();
    });

    const text = renderedText(renderer);
    expect(text).toContain('待确认的修改');
    expect(text).toContain('¥35.00');
    expect(text).toContain('#100');
    expect(text).toContain('确认修改');
    expect(
      renderer.root.findAllByProps({ testID: 'agent-record-update-confirm' })
        .length,
    ).toBeGreaterThan(0);
  });

  it('renders the record deletion card for a pending deleteRecords call', async () => {
    const { renderer } = renderDrawer({
      initialMessages: PENDING_DELETE_APPROVAL,
    });

    await act(async () => {
      await flush();
    });

    const text = renderedText(renderer);
    expect(text).toContain('待确认的删除');
    expect(text).toContain('#100');
    expect(text).toContain('确认删除');
    expect(
      renderer.root.findAllByProps({ testID: 'agent-record-delete-confirm' })
        .length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({ testID: 'agent-record-delete-cancel' })
        .length,
    ).toBeGreaterThan(0);
  });

  it('renders no approval hint in the composer', async () => {
    const { renderer } = renderDrawer({
      initialMessages: PENDING_RECORD_APPROVAL,
    });

    await act(async () => {
      await flush();
    });

    expect(renderedText(renderer)).not.toContain('请先确认或取消待处理的记账');
    expect(
      renderer.root.findAllByProps({ testID: 'agent-approval-pending' }),
    ).toHaveLength(0);
  });

  it('keeps the approved record card in restored history', async () => {
    const { renderer } = renderDrawer({
      initialMessages: COMPLETED_RECORD_APPROVAL,
    });

    await act(async () => {
      await flush();
    });

    expect(renderedText(renderer)).toContain('已记账');
    expect(renderedText(renderer)).toContain('共 1 笔');
  });

  it('collapses reasoning by default and expands it on tap', () => {
    const { renderer } = renderDrawer({
      initialMessages: CONVERSATION_WITH_REASONING,
    });

    expect(renderedText(renderer)).toContain('思考过程');
    expect(renderedText(renderer)).not.toContain('先核对类型和资产');

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-thinking-toggle' })
        .props.onPress();
    });

    expect(renderedText(renderer)).toContain('先核对类型和资产，再写入账本。');

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-thinking-toggle' })
        .props.onPress();
    });

    expect(renderedText(renderer)).not.toContain('先核对类型和资产');
  });

  it('renders an assistant turn that only contains reasoning', () => {
    const { renderer } = renderDrawer({
      initialMessages: [
        { role: 'user', content: '帮我记一笔午饭 30 元' },
        {
          role: 'assistant',
          content: [{ type: 'reasoning', text: '先核对类型和资产。' }],
        },
      ],
    });

    expect(renderedText(renderer)).toContain('思考过程');
  });

  it('renders user image attachments in the bubble', () => {
    const { renderer } = renderDrawer({
      initialMessages: CONVERSATION_WITH_IMAGE,
    });

    const images = renderer.root.findAllByType(Image);

    expect(images).toHaveLength(1);
    expect(images[0]?.props.source).toEqual({ uri: IMAGE_URI });
    expect(renderedText(renderer)).toContain('看看这张小票');
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

  it('creates a new session from the header', async () => {
    const { renderer, session } = renderDrawer();

    await act(async () => {
      renderer.root
        .findByProps({ testID: 'agent-new-session-button' })
        .props.onPress();
      await flush();
    });

    expect(session.createThread).toHaveBeenCalledTimes(1);
  });

  it('disables the new-session button while sending or on a draft', () => {
    const sending = renderDrawer({ session: { sending: true } });
    expect(
      sending.renderer.root.findByProps({
        testID: 'agent-new-session-button',
      }).props.disabled,
    ).toBe(true);

    const draft = renderDrawer({ session: { currentThreadId: 0 } });
    expect(
      draft.renderer.root.findByProps({
        testID: 'agent-new-session-button',
      }).props.disabled,
    ).toBe(true);
  });

  it('switches the conversation model and opens model settings', () => {
    const provider: AgentProviderConfig = {
      id: 1,
      descriptorId: 'openai-compatible',
      name: '测试',
      baseUrl: 'https://api.example.com/v1',
      defaultModelId: 'model-a',
      models: [
        {
          modelId: 'model-a',
          contextWindow: 32_768,
          reasoningEffort: 'off',
          multimodal: false,
        },
        {
          modelId: 'model-b',
          contextWindow: 128_000,
          reasoningEffort: 'high',
          multimodal: false,
        },
      ],
      storeResponses: true,
      createdTime: 0,
      updatedTime: 0,
    };
    mockProviderState.providers = [provider];

    const { renderer, onOpenModelSettings, session } = renderDrawer();

    expect(renderedText(renderer)).toContain('model-a');

    act(() => {
      renderer.root.findByProps({ testID: 'agent-model-chip' }).props.onPress();
    });
    expect(renderedText(renderer)).toContain('切换模型');

    act(() => {
      renderer.root
        .findByProps({ testID: 'action-sheet-action-1' })
        .props.onPress();
    });
    expect(session.updateThreadModel).toHaveBeenCalledWith({
      providerId: 1,
      modelId: 'model-b',
    });

    act(() => {
      renderer.root
        .findByProps({ testID: 'action-sheet-action-2' })
        .props.onPress();
    });
    expect(onOpenModelSettings).toHaveBeenCalledTimes(1);
  });

  it('disables image staging for a non-multimodal thread model', () => {
    const provider: AgentProviderConfig = {
      id: 1,
      descriptorId: 'openai-compatible',
      name: '测试',
      baseUrl: 'https://api.example.com/v1',
      defaultModelId: 'model-text',
      models: [
        {
          modelId: 'model-text',
          contextWindow: 32_768,
          reasoningEffort: 'off',
          multimodal: false,
        },
      ],
      storeResponses: true,
      createdTime: 0,
      updatedTime: 0,
    };
    mockProviderState.providers = [provider];

    const { renderer } = renderDrawer({
      session: {
        currentThread: {
          id: 1,
          booksId: 1,
          title: '',
          providerId: 1,
          modelId: 'model-text',
          createdTime: 0,
          updatedTime: 0,
        },
      },
    });

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-plus-button' })
        .props.onPress();
    });
    expect(renderedText(renderer)).toContain('当前模型不支持');
    expect(
      renderer.root.findByProps({ testID: 'agent-composer-image-option' }).props
        .disabled,
    ).toBe(true);
  });

  it('removes a single staged image', () => {
    const provider: AgentProviderConfig = {
      id: 1,
      descriptorId: 'openai-compatible',
      name: '测试',
      baseUrl: 'https://api.example.com/v1',
      defaultModelId: 'model-vision',
      models: [
        {
          modelId: 'model-vision',
          contextWindow: 128_000,
          reasoningEffort: 'off',
          multimodal: true,
        },
      ],
      storeResponses: true,
      createdTime: 0,
      updatedTime: 0,
    };
    mockProviderState.providers = [provider];

    const { renderer } = renderDrawer({
      session: {
        currentThread: {
          id: 1,
          booksId: 1,
          title: '',
          providerId: 1,
          modelId: 'model-vision',
          createdTime: 0,
          updatedTime: 0,
        },
      },
    });

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-plus-button' })
        .props.onPress();
    });
    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-composer-image-option' })
        .props.onPress();
    });
    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-image-picker-action-sheet' })
        .props.onPress();
    });

    expect(renderedText(renderer)).toContain('1 / 4');

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-image-remove-0' })
        .props.onPress();
    });

    expect(renderedText(renderer)).not.toContain('1 / 4');
    expect(
      renderer.root.findAllByProps({ testID: 'agent-image-staging-bar' }),
    ).toHaveLength(0);
  });

  it('shows thinking and stops the run while responding', async () => {
    let signal: AbortSignal | undefined;
    const { renderer } = renderDrawer({
      adapter: createPendingAdapter(nextSignal => {
        signal = nextSignal;
      }),
    });

    act(() => {
      renderer.root
        .findByProps({ testID: 'agent-input' })
        .props.onChangeText('本月支出按类型统计');
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
