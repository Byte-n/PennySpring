import type { AgentMessageRow } from '@pennyspring/api';
import type { UIMessage } from 'ai';

import {
  getUiMessageText,
  hasUiMessageContent,
  rowsToUiMessages,
  toPersistedUiInput,
  trimUiMessagesByTokens,
} from '../../src/agent/core/uiMessages';
import { estimateTokens } from '../../src/agent/core/tokens';

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

  it('keeps the latest row when the same UI message is persisted twice', () => {
    const userMessage: UIMessage = {
      id: 'user-1',
      role: 'user',
      parts: [{ type: 'text', text: '帮我记一笔午饭' }],
    };
    const pendingMessage: UIMessage = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-createRecord',
          toolCallId: 'tool-1',
          state: 'approval-requested',
          input: { typeId: 2, amount: 30 },
          approval: { id: 'approval-1' },
        },
      ],
    };
    const completedMessage: UIMessage = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-createRecord',
          toolCallId: 'tool-1',
          state: 'output-available',
          input: { typeId: 2, amount: 30 },
          output: { ok: true, recordId: 9 },
          approval: { id: 'approval-1', approved: true },
        },
        { type: 'text', text: '已记录午饭 30 元。' },
      ],
    };

    const messages = rowsToUiMessages([
      row(1, userMessage),
      row(2, pendingMessage),
      row(3, completedMessage),
    ]);

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual(userMessage);
    expect(messages[1]).toEqual(completedMessage);
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

describe('trimUiMessagesByTokens', () => {
  it('keeps every message when the budget is sufficient', () => {
    const messages: UIMessage[] = Array.from({ length: 6 }, (_, index) => ({
      id: String(index),
      role: index % 2 === 0 ? 'user' : 'assistant',
      parts: [{ type: 'text', text: '短消息' }],
    }));

    expect(trimUiMessagesByTokens(messages, 10_000)).toEqual(messages);
  });

  it('drops older messages and starts from a user message', () => {
    const messages: UIMessage[] = Array.from({ length: 30 }, (_, index) => ({
      id: String(index),
      role: index % 2 === 0 ? 'user' : 'assistant',
      parts: [{ type: 'text', text: '历史消息'.repeat(250) }],
    }));

    const result = trimUiMessagesByTokens(messages, 5_000);

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(30);
    expect(result[0]?.role).toBe('user');
    expect(result[result.length - 1]?.id).toBe('29');
  });

  it('always keeps the newest message when the budget is tiny', () => {
    const messages: UIMessage[] = [
      {
        id: 'user-1',
        role: 'user',
        parts: [{ type: 'text', text: '上个月吃饭花了多少？' }],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [{ type: 'text', text: '共 120 元。' }],
      },
    ];

    expect(trimUiMessagesByTokens(messages, 1)).toEqual([messages[1]]);
  });

  it('estimates image payloads without counting base64 characters', () => {
    const messages: UIMessage[] = [
      {
        id: 'user-image',
        role: 'user',
        parts: [
          { type: 'text', text: '看看这张小票' },
          {
            type: 'file',
            mediaType: 'image/jpeg',
            filename: 'receipt.jpg',
            url: `data:image/jpeg;base64,${'A'.repeat(200_000)}`,
          },
        ],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [{ type: 'text', text: '收到。' }],
      },
    ];

    expect(trimUiMessagesByTokens(messages, 10_000)).toEqual(messages);
  });
});

describe('hasUiMessageContent', () => {
  it('treats reasoning text as visible content', () => {
    expect(
      hasUiMessageContent({
        id: 'assistant-reasoning',
        role: 'assistant',
        parts: [
          { type: 'reasoning', text: '先核对类型和资产。', state: 'done' },
        ],
      }),
    ).toBe(true);
    expect(
      hasUiMessageContent({
        id: 'assistant-blank-reasoning',
        role: 'assistant',
        parts: [{ type: 'reasoning', text: '   ' }],
      }),
    ).toBe(false);
  });

  it('treats image parts as visible content', () => {
    expect(
      hasUiMessageContent({
        id: 'user-image',
        role: 'user',
        parts: [
          {
            type: 'file',
            mediaType: 'image/jpeg',
            filename: 'receipt.jpg',
            url: 'data:image/jpeg;base64,QUJD',
          },
        ],
      }),
    ).toBe(true);
    expect(
      hasUiMessageContent({
        id: 'user-blank',
        role: 'user',
        parts: [{ type: 'text', text: '   ' }],
      }),
    ).toBe(false);
  });
});

describe('estimateTokens', () => {
  it('counts CJK characters heavier than latin characters', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('中文')).toBe(2);
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('中文abcd')).toBe(3);
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
