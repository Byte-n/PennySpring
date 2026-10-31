import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { AgentThreadRow } from '@pennyspring/api';

import { AgentSessionsPanel } from '../../src/agent/ui/AgentSessionsPanel';
import type { AgentSessionState } from '../../src/agent/ui/useAgentSession';

const mockToastShow = jest.fn();

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Pressable, Text, View } = require('react-native');

  const passthrough = (Component: React.ComponentType) =>
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
      ReactLib.createElement(Text, null, children),
    );

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
    Popup: { FloatingPanel: MockFloatingPanel },
    useToast: () => ({ show: mockToastShow }),
  };
});

jest.mock('../../src/components/ManageConfirmDialog', () => {
  const ReactLib = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    ManageConfirmDialog: ({
      onConfirm,
      open,
      titleText,
    }: {
      onConfirm: () => Promise<void>;
      open: boolean;
      titleText: string;
    }) =>
      open
        ? ReactLib.createElement(
            Pressable,
            { onPress: () => onConfirm(), testID: 'confirm-delete' },
            ReactLib.createElement(Text, null, titleText),
          )
        : null,
  };
});

jest.mock('../../src/agent/ui/AgentSessionList', () => {
  const ReactLib = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    AgentSessionList: ({
      threads,
      onDelete,
      onSelect,
    }: {
      threads: AgentThreadRow[];
      onDelete: (thread: AgentThreadRow) => void;
      onSelect: (thread: AgentThreadRow) => void;
    }) =>
      ReactLib.createElement(
        ReactLib.Fragment,
        null,
        ...threads.map(thread =>
          ReactLib.createElement(
            ReactLib.Fragment,
            { key: thread.id },
            ReactLib.createElement(
              Pressable,
              { onPress: () => onSelect(thread), testID: `select-${thread.id}` },
              ReactLib.createElement(Text, null, 'select'),
            ),
            ReactLib.createElement(
              Pressable,
              { onPress: () => onDelete(thread), testID: `delete-${thread.id}` },
              ReactLib.createElement(Text, null, 'delete'),
            ),
          ),
        ),
      ),
  };
});

const THREADS: AgentThreadRow[] = [
  { id: 1, booksId: 1, title: '本月支出', providerId: 0, modelId: '', createdTime: 0, updatedTime: 1_700_000_000_000 },
  { id: 2, booksId: 1, title: '', providerId: 0, modelId: '', createdTime: 0, updatedTime: 1_700_000_600_000 },
];

function createChat(
  overrides: Partial<AgentSessionState> = {},
): AgentSessionState {
  return {
    loading: false,
    sending: false,
    errorText: '',
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    threads: THREADS,
    threadsLoading: false,
    currentThreadId: 1,
    currentThread: null,
    initialMessages: [],
    createThread: jest.fn(() => Promise.resolve(true)),
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

function renderPanel(
  chat: AgentSessionState,
  onOpenChange = jest.fn(),
) {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <AgentSessionsPanel chat={chat} onOpenChange={onOpenChange} open />,
    );
  });
  return { onOpenChange, renderer: renderer! };
}

beforeEach(() => {
  mockToastShow.mockClear();
});

describe('AgentSessionsPanel', () => {
  it('creates a session and closes the panel', async () => {
    const chat = createChat();
    const { renderer, onOpenChange } = renderPanel(chat);

    await act(async () => {
      renderer.root.findByProps({ testID: 'agent-session-create' }).props.onPress();
    });

    expect(chat.createThread).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockToastShow).toHaveBeenCalledWith({ messageText: '已新建会话' });
  });

  it('restores the selected session and closes the panel', async () => {
    const chat = createChat();
    const { renderer, onOpenChange } = renderPanel(chat);

    await act(async () => {
      renderer.root.findByProps({ testID: 'select-2' }).props.onPress();
    });

    expect(chat.selectThread).toHaveBeenCalledWith(2);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('deletes the session after confirming', async () => {
    const chat = createChat();
    const { renderer } = renderPanel(chat);

    act(() => {
      renderer.root.findByProps({ testID: 'delete-2' }).props.onPress();
    });

    await act(async () => {
      await renderer.root.findByProps({ testID: 'confirm-delete' }).props.onPress();
    });

    expect(chat.deleteThread).toHaveBeenCalledWith(2);
    expect(mockToastShow).toHaveBeenCalledWith({ messageText: '已删除「新对话」' });
  });
});
