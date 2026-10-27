import type { AgentMessageRow } from '@pennyspring/api';

import {
  formatTokenCount,
  parseToolCalls,
  parseUsage,
  sumUsage,
  toChatMessages,
  toPersistedInputs,
} from '../../src/agent/ui/chatModel';

function createRow(
  overrides: Partial<AgentMessageRow> = {},
): AgentMessageRow {
  return {
    id: 1,
    threadId: 1,
    role: 'user',
    content: '',
    toolCalls: '',
    toolCallId: '',
    toolName: '',
    usage: '',
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  };
}

describe('parseToolCalls', () => {
  it('parses the persisted own shape', () => {
    expect(
      parseToolCalls(
        '[{"id":"call_1","name":"queryRecords","arguments":"{\\"limit\\":5}"}]',
      ),
    ).toEqual([
      { id: 'call_1', name: 'queryRecords', arguments: '{"limit":5}' },
    ]);
  });

  it('parses the openai tool_calls shape', () => {
    expect(
      parseToolCalls(
        '[{"id":"call_2","type":"function","function":{"name":"queryRecords","arguments":{"limit":3}}}]',
      ),
    ).toEqual([
      { id: 'call_2', name: 'queryRecords', arguments: '{"limit":3}' },
    ]);
  });

  it('returns empty for blank, malformed, or non-array payloads', () => {
    expect(parseToolCalls('')).toEqual([]);
    expect(parseToolCalls('not json')).toEqual([]);
    expect(parseToolCalls('{"name":"queryRecords"}')).toEqual([]);
  });

  it('skips entries without a tool name', () => {
    expect(parseToolCalls('[{"id":"call_1"}]')).toEqual([]);
  });
});

describe('parseUsage', () => {
  it('reads camelCase and snake_case usage', () => {
    expect(
      parseUsage('{"promptTokens":10,"completionTokens":2,"totalTokens":12}'),
    ).toEqual({ promptTokens: 10, completionTokens: 2, totalTokens: 12 });
    expect(
      parseUsage('{"prompt_tokens":1,"completion_tokens":2,"total_tokens":3}'),
    ).toEqual({ promptTokens: 1, completionTokens: 2, totalTokens: 3 });
  });

  it('returns undefined for blank or malformed values', () => {
    expect(parseUsage('')).toBeUndefined();
    expect(parseUsage('[]')).toBeUndefined();
  });
});

describe('toChatMessages', () => {
  it('maps persisted rows back to chat messages', () => {
    const rows = [
      createRow({ id: 1, role: 'user', content: '上个月吃饭花了多少' }),
      createRow({
        id: 2,
        role: 'assistant',
        content: '',
        toolCalls: '[{"id":"call_1","name":"queryRecords","arguments":"{}"}]',
        usage: '{"promptTokens":10,"completionTokens":4,"totalTokens":14}',
      }),
      createRow({
        id: 3,
        role: 'tool',
        content: '{"count":1}',
        toolCallId: 'call_1',
        toolName: 'queryRecords',
      }),
    ];

    expect(toChatMessages(rows)).toEqual([
      { role: 'user', content: '上个月吃饭花了多少' },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call_1', name: 'queryRecords', arguments: '{}' }],
        usage: { promptTokens: 10, completionTokens: 4, totalTokens: 14 },
      },
      {
        role: 'tool',
        content: '{"count":1}',
        toolCallId: 'call_1',
        toolName: 'queryRecords',
      },
    ]);
  });
});

describe('toPersistedInputs', () => {
  it('drops system messages and serializes tool metadata', () => {
    expect(
      toPersistedInputs([
        { role: 'system', content: '系统提示' },
        { role: 'user', content: '你好' },
        {
          role: 'assistant',
          content: '',
          toolCalls: [{ id: 'call_1', name: 'queryRecords', arguments: '{}' }],
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        },
        {
          role: 'tool',
          content: '{"count":0}',
          toolCallId: 'call_1',
          toolName: 'queryRecords',
        },
      ]),
    ).toEqual([
      { role: 'user', content: '你好' },
      {
        role: 'assistant',
        content: '',
        toolCalls: '[{"id":"call_1","name":"queryRecords","arguments":"{}"}]',
        usage: '{"promptTokens":1,"completionTokens":1,"totalTokens":2}',
      },
      {
        role: 'tool',
        content: '{"count":0}',
        toolCallId: 'call_1',
        toolName: 'queryRecords',
      },
    ]);
  });
});

describe('sumUsage', () => {
  it('sums usage across assistant messages', () => {
    expect(
      sumUsage([
        { role: 'user', content: '一' },
        {
          role: 'assistant',
          content: '二',
          usage: { promptTokens: 10, completionTokens: 2, totalTokens: 12 },
        },
        {
          role: 'assistant',
          content: '三',
          usage: { promptTokens: 20, completionTokens: 3, totalTokens: 23 },
        },
      ]),
    ).toEqual({ promptTokens: 30, completionTokens: 5, totalTokens: 35 });
  });

  it('formats token counts compactly', () => {
    expect(formatTokenCount(999)).toBe('999');
    expect(formatTokenCount(1200)).toBe('1.2k');
    expect(formatTokenCount(2_400_000)).toBe('2.4M');
  });
});
