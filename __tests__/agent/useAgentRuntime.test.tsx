import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';
import type { BookRow } from '@pennyspring/api';

import { useAgentRuntime } from '../../src/agent/ui/useAgentRuntime';
import type { AgentSessionState } from '../../src/agent/ui/useAgentSession';

const mockUseChatRuntime = jest.fn((_options: unknown) => ({}));
const mockCreateAgentTransport = jest.fn(() => ({}));

jest.mock('@assistant-ui/ai-sdk', () => ({
  useChatRuntime: (options: unknown) => mockUseChatRuntime(options),
}));

jest.mock('../../src/agent/ui/agentTransport', () => ({
  createAgentTransport: () => mockCreateAgentTransport(),
}));

jest.mock('../../src/stores/bookStore', () => {
  const state = {
    currentBook: { id: 1 },
    currentBookRef: { kind: 'local', id: 1 },
  };
  return {
    useBookStore: (selector: (value: typeof state) => unknown) =>
      selector(state),
    useGlobalApi: () => ({
      agent: { appendMessages: jest.fn(async () => []) },
    }),
  };
});

const BOOK = { id: 1, name: '测试账本' } as BookRow;

const SESSION = {
  markActivity: jest.fn(),
  ensureTitle: jest.fn(async () => undefined),
  accumulateUsage: jest.fn(),
  refreshThreads: jest.fn(async () => undefined),
} as unknown as AgentSessionState;

function Probe(): null {
  useAgentRuntime({
    book: BOOK,
    session: SESSION,
    threadId: 1,
    initialMessages: [],
  });
  return null;
}

describe('useAgentRuntime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatRuntime.mockReturnValue({});
    mockCreateAgentTransport.mockReturnValue({});
  });

  it('auto-continues a run when the last assistant message has approval responses', () => {
    act(() => {
      TestRenderer.create(<Probe />);
    });

    const options = mockUseChatRuntime.mock.calls[0]?.[0] as {
      sendAutomaticallyWhen?: unknown;
    };
    expect(options.sendAutomaticallyWhen).toBe(
      lastAssistantMessageIsCompleteWithApprovalResponses,
    );
  });
});
