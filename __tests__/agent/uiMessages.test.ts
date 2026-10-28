import type { AgentMessageRow } from '@pennyspring/api';
import type { UIMessage } from 'ai';

import {
  getUiMessageText,
  rowsToUiMessages,
  toPersistedUiInput,
  trimUiMessages,
} from '../../src/agent/core/uiMessages';

function row(id: number, message: unknown): AgentMessageRow {
  return {
    id,
    threadId: 1,
    role: 'assistant',
    message: JSON.stringify(message),
    usage: '',
    createdTime: 0,
    updatedTime: 0,
  };
}

describe('rowsToUiMessages', () => {
  it('parses UI messages and keeps their ids', () => {
    const conversation: UIMessage[] = [
      {
        id: 'user-1',
        role: 'user',
        parts: [{ type: 'text', text: '上个月吃饭花了多少？' }],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [{ type: 'text', text: '上个月吃饭共 120 元。' }],
      },
    ];

    const messages = rowsToUiMessages([
      row(1, conversation[0]),
      row(2, conversation[1]),
    ]);

    expect(messages).toEqual(conversation);
    expect(getUiMessageText(messages[0] as UIMessage)).toBe(
      '上个月吃饭花了多少？',
    );
  });

  it('skips rows that are not UI messages', () => {
    expect(
      rowsToUiMessages([
        row(1, { role: 'user', content: '不是 UI 消息' }),
        row(2, 'not json'),
        row(3, { id: 'missing-parts', role: 'user' }),
      ]),
    ).toEqual([]);
  });
});

describe('trimUiMessages', () => {
  it('keeps the most recent messages starting from a user message', () => {
    const messages: UIMessage[] = Array.from({ length: 30 }, (_, index) => ({
      id: String(index),
      role: index % 2 === 0 ? 'user' : 'assistant',
      parts: [{ type: 'text', text: String(index) }],
    }));

    const result = trimUiMessages(messages, 6);

    expect(result).toHaveLength(6);
    expect(result[0]?.role).toBe('user');
    expect(result[result.length - 1]?.id).toBe('29');
  });
});

describe('toPersistedUiInput', () => {
  it('serializes a UI message and its usage', () => {
    const message: UIMessage = {
      id: 'ui-1',
      role: 'assistant',
      parts: [{ type: 'text', text: '你好' }],
    };

    expect(
      toPersistedUiInput(message, {
        promptTokens: 1,
        completionTokens: 2,
        totalTokens: 3,
      }),
    ).toEqual({
      role: 'assistant',
      message: JSON.stringify(message),
      usage: JSON.stringify({
        promptTokens: 1,
        completionTokens: 2,
        totalTokens: 3,
      }),
    });
  });

  it('skips system messages', () => {
    expect(
      toPersistedUiInput({
        id: 'ui-1',
        role: 'system',
        parts: [{ type: 'text', text: 'system' }],
      }),
    ).toBeNull();
  });
});
