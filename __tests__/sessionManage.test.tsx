import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { AgentThreadRow } from '@pennyspring/api';

import { SessionManageScreen } from '../src/screens/sessionManage/SessionManageScreen';
import type { AgentSessionState } from '../src/agent/ui/useAgentSession';

const mockGoBack = jest.fn();
const mockOpenAgent = jest.fn();
const mockToastShow = jest.fn();
const mockChat: Partial<AgentSessionState> = {};

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Text, View } = require('react-native');

  const passthrough = (Component: React.ComponentType) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Component, props, children);

  return {
    Column: passthrough(View),
    Text: passthrough(Text),
    useToast: () => ({ show: mockToastShow }),
  };
});

jest.mock('../src/navigation', () => ({
  useNavigation: () => ({ goBack: mockGoBack, setOptions: jest.fn() }),
}));

jest.mock('../src/components/HeaderAddButton', () => ({
  createHeaderAddButton: () => () => null,
}));

jest.mock('../src/agent/ui/AgentChatContext', () => ({
  useAgentChatState: () => mockChat,
}));

jest.mock('../src/agent/ui/AgentLauncherContext', () => ({
  useAgentLauncher: () => ({ openAgent: mockOpenAgent }),
}));

jest.mock('../src/agent/ui/AgentSessionList', () => {
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

jest.mock('../src/components/ManageConfirmDialog', () => {
  const ReactLib = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    ManageConfirmDialog: ({
      onConfirm,
      open,
    }: {
      onConfirm: () => Promise<void>;
      open: boolean;
    }) =>
      open
        ? ReactLib.createElement(
            Pressable,
            { onPress: () => onConfirm(), testID: 'confirm-delete' },
            ReactLib.createElement(Text, null, 'confirm'),
          )
        : null,
  };
});

const THREADS: AgentThreadRow[] = [
  { id: 1, booksId: 1, title: '本月支出', createdTime: 0, updatedTime: 1_700_000_000_000 },
  { id: 2, booksId: 1, title: '', createdTime: 0, updatedTime: 1_700_000_600_000 },
];

function setupChat(overrides: Partial<AgentSessionState> = {}): void {
  Object.assign(mockChat, {
    loading: false,
    sending: false,
    errorText: '',
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    threads: THREADS,
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
  });
}

function renderScreen() {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<SessionManageScreen />);
  });
  return renderer!;
}

beforeEach(() => {
  mockGoBack.mockClear();
  mockOpenAgent.mockClear();
  mockToastShow.mockClear();
  setupChat();
});

describe('SessionManageScreen', () => {
  it('restores a session, returns to home and opens the assistant', async () => {
    const renderer = renderScreen();

    await act(async () => {
      await renderer.root.findByProps({ testID: 'select-2' }).props.onPress();
    });

    expect(mockChat.selectThread).toHaveBeenCalledWith(2);
    expect(mockToastShow).toHaveBeenCalledWith({ messageText: '已恢复「新对话」' });
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    expect(mockOpenAgent).toHaveBeenCalledTimes(1);
  });

  it('deletes a session after confirming', async () => {
    const renderer = renderScreen();

    act(() => {
      renderer.root.findByProps({ testID: 'delete-2' }).props.onPress();
    });

    await act(async () => {
      await renderer.root.findByProps({ testID: 'confirm-delete' }).props.onPress();
    });

    expect(mockChat.deleteThread).toHaveBeenCalledWith(2);
    expect(mockToastShow).toHaveBeenCalledWith({ messageText: '已删除「新对话」' });
  });

  it('does not navigate when the session cannot be restored', async () => {
    setupChat({ selectThread: jest.fn(() => Promise.resolve(false)) });
    const renderer = renderScreen();

    await act(async () => {
      await renderer.root.findByProps({ testID: 'select-2' }).props.onPress();
    });

    expect(mockGoBack).not.toHaveBeenCalled();
    expect(mockOpenAgent).not.toHaveBeenCalled();
  });
});
