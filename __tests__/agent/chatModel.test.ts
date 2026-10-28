import type { AgentMessageRow } from '@pennyspring/api';
import type { ModelMessage } from 'ai';

import {
  parseUsage,
  rowsToModelMessages,
  selectRecentModelMessages,
  sumUsage,
  toDisplayMessages,
  toPersistedInputs,
  toTokenUsage,
} from '../../src/agent/core/messages';
import { formatTokenCount } from '../../src/agent/ui/chatModel';

function createRow(
  overrides: Partial<AgentMessageRow> = {},
): AgentMessageRow {
  return {
    id: 1,
    threadId: 1,
    role: 'user',
    message: '',
    usage: '',
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  };
}

const USER_MESSAGE: ModelMessage = { role: 'user', content: '这个月花了多少' };
const TOOL_CALL_MESSAGE: ModelMessage = {
  role: 'assistant',
  content: [
    {
      type: 'tool-call',
      toolCallId: 'call_1',
      toolName: 'queryRecords',
      input: { from: '2026-09-01' },
    },
  ],
};
const TOOL_RESULT_MESSAGE: ModelMessage = {
  role: 'tool',
  content: [
    {
      type: 'tool-result',
      toolCallId: 'call_1',
      toolName: 'queryRecords',
      output: { type: 'text', value: '{"count":1}' },
    },
  ],
};
const ASSISTANT_MESSAGE: ModelMessage = {
  role: 'assistant',
  content: '这个月共 120.00 元。',
};

describe('rowsToModelMessages', () => {
  it('只还原可解析的消息 JSON', () => {
    const rows = [
      createRow({ message: JSON.stringify(USER_MESSAGE) }),
      createRow({ id: 2, role: 'assistant', message: 'not json' }),
      createRow({ id: 3, role: 'tool', message: '{}' }),
    ];

    expect(rowsToModelMessages(rows)).toEqual([USER_MESSAGE]);
  });
});

describe('toDisplayMessages', () => {
  it('把用户与助手消息转成展示模型，并标记工具调用', () => {
    expect(
      toDisplayMessages([
        USER_MESSAGE,
        TOOL_CALL_MESSAGE,
        TOOL_RESULT_MESSAGE,
        ASSISTANT_MESSAGE,
      ]),
    ).toEqual([
      { role: 'user', content: '这个月花了多少', hasToolCalls: false },
      { role: 'assistant', content: '', hasToolCalls: true },
      { role: 'assistant', content: '这个月共 120.00 元。', hasToolCalls: false },
    ]);
  });

  it('拼接多段文本内容', () => {
    const message: ModelMessage = {
      role: 'assistant',
      content: [
        { type: 'text', text: '第一段' },
        { type: 'text', text: '第二段' },
      ],
    };

    expect(toDisplayMessages([message])).toEqual([
      { role: 'assistant', content: '第一段第二段', hasToolCalls: false },
    ]);
  });
});

describe('toPersistedInputs', () => {
  it('序列化消息并把 usage 只挂到最后一个 assistant 消息', () => {
    const rows = toPersistedInputs(
      [USER_MESSAGE, TOOL_CALL_MESSAGE, TOOL_RESULT_MESSAGE, ASSISTANT_MESSAGE],
      { promptTokens: 10, completionTokens: 4, totalTokens: 14 },
    );

    expect(rows.map(row => row.role)).toEqual([
      'user',
      'assistant',
      'tool',
      'assistant',
    ]);
    expect(rows[0]?.message).toBe(JSON.stringify(USER_MESSAGE));
    expect(rows[1]?.usage).toBeUndefined();
    expect(rows[3]?.usage).toBe(
      '{"promptTokens":10,"completionTokens":4,"totalTokens":14}',
    );
  });

  it('丢弃 system 消息', () => {
    const rows = toPersistedInputs([
      { role: 'system', content: '系统提示' },
      USER_MESSAGE,
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.role).toBe('user');
  });
});

describe('sumUsage', () => {
  it('汇总已持久化的 token 用量', () => {
    const rows = [
      createRow({ usage: '{"promptTokens":10,"completionTokens":2,"totalTokens":12}' }),
      createRow({ id: 2, role: 'assistant', usage: '{"promptTokens":20,"completionTokens":3,"totalTokens":23}' }),
      createRow({ id: 3, role: 'tool', usage: '' }),
    ];

    expect(sumUsage(rows)).toEqual({
      promptTokens: 30,
      completionTokens: 5,
      totalTokens: 35,
    });
  });

  it('解析 snake_case 与非法值', () => {
    expect(parseUsage('{"prompt_tokens":1,"completion_tokens":2,"total_tokens":3}')).toEqual(
      { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
    );
    expect(parseUsage('')).toBeUndefined();
    expect(parseUsage('[]')).toBeUndefined();
  });

  it('格式化 token 数', () => {
    expect(formatTokenCount(999)).toBe('999');
    expect(formatTokenCount(1200)).toBe('1.2k');
    expect(formatTokenCount(2_400_000)).toBe('2.4M');
  });
});

describe('toTokenUsage', () => {
  it('把 AI SDK usage 转成项目用量结构', () => {
    expect(
      toTokenUsage({
        inputTokens: 10,
        inputTokenDetails: {
          noCacheTokens: 10,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        },
        outputTokens: 4,
        outputTokenDetails: { textTokens: 4, reasoningTokens: 0 },
        totalTokens: 14,
      }),
    ).toEqual({ promptTokens: 10, completionTokens: 4, totalTokens: 14 });
  });
});

describe('selectRecentModelMessages', () => {
  it('保留最近窗口，并把起点从 tool 回退到对应的 assistant', () => {
    expect(
      selectRecentModelMessages(
        [USER_MESSAGE, TOOL_CALL_MESSAGE, TOOL_RESULT_MESSAGE, ASSISTANT_MESSAGE],
        2,
      ),
    ).toEqual([
      TOOL_CALL_MESSAGE,
      TOOL_RESULT_MESSAGE,
      ASSISTANT_MESSAGE,
    ]);
  });
});
