import type { AgentMessageRow } from '@pennyspring/api';

import {
  parseUsage,
  sumUsage,
  toTokenUsage,
} from '../../src/agent/core/messages';
import { formatTokenCount } from '../../src/agent/ui/chatModel';

function createRow(overrides: Partial<AgentMessageRow> = {}): AgentMessageRow {
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

describe('sumUsage', () => {
  it('汇总已持久化的 token 用量', () => {
    const rows = [
      createRow({
        usage: '{"promptTokens":10,"completionTokens":2,"totalTokens":12}',
      }),
      createRow({
        id: 2,
        role: 'assistant',
        usage: '{"promptTokens":20,"completionTokens":3,"totalTokens":23}',
      }),
      createRow({ id: 3, role: 'assistant', usage: '' }),
    ];

    expect(sumUsage(rows)).toEqual({
      promptTokens: 30,
      completionTokens: 5,
      totalTokens: 35,
    });
  });

  it('解析合法值与非法值', () => {
    expect(
      parseUsage('{"promptTokens":1,"completionTokens":2,"totalTokens":3}'),
    ).toEqual({ promptTokens: 1, completionTokens: 2, totalTokens: 3 });
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
