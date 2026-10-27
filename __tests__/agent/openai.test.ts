import {
  buildChatRequest,
  createSseParser,
  createToolCallAccumulator,
} from '../../src/agent/core/protocol/openai';
import {
  AgentError,
  toHttpError,
  toNetworkError,
} from '../../src/agent/core/protocol/errors';
import type { ChatMessage } from '../../src/agent/core/types';

const TOOL_SCHEMA = {
  name: 'queryRecords',
  description: '查询记录',
  parameters: { type: 'object', properties: {} },
};

describe('buildChatRequest', () => {
  it('把账本、用户与工具调用链映射为 OpenAI 消息结构', () => {
    const messages: ChatMessage[] = [
      { role: 'system', content: '系统提示' },
      { role: 'user', content: '上个月吃饭花了多少' },
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          { id: 'call_1', name: 'queryRecords', arguments: '{"from":"2026-09-01"}' },
        ],
      },
      { role: 'tool', content: '{"total":10}', toolCallId: 'call_1', toolName: 'queryRecords' },
    ];

    const payload = buildChatRequest({
      model: 'test-model',
      messages,
      tools: [TOOL_SCHEMA],
    });

    expect(payload).toMatchObject({
      model: 'test-model',
      stream: true,
      messages: [
        { role: 'system', content: '系统提示' },
        { role: 'user', content: '上个月吃饭花了多少' },
        {
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              id: 'call_1',
              type: 'function',
              function: {
                name: 'queryRecords',
                arguments: '{"from":"2026-09-01"}',
              },
            },
          ],
        },
        { role: 'tool', content: '{"total":10}', tool_call_id: 'call_1' },
      ],
      tools: [
        {
          type: 'function',
          function: TOOL_SCHEMA,
        },
      ],
    });
  });

  it('没有工具时不携带 tools 字段', () => {
    const payload = buildChatRequest({
      model: 'test-model',
      messages: [{ role: 'user', content: '你好' }],
      tools: [],
    });

    expect(payload).not.toHaveProperty('tools');
    expect(payload).not.toHaveProperty('tool_choice');
  });
});

describe('createSseParser', () => {
  it('按行缓冲，跨 chunk 的 data 行也能完整解析', () => {
    const parser = createSseParser();

    const first = parser.push('data: {"choices":[{"delta":{"content":"你');
    const second = parser.push('好"},"finish_reason":null}]}\n\ndata: [DONE]\n');

    expect(first).toEqual([]);
    expect(second).toEqual([{ type: 'text', delta: '你好' }]);
  });

  it('解析 tool_calls 分片并透传 index、id、name 与 arguments 增量', () => {
    const parser = createSseParser();

    const events = parser.push(
      [
        'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_1","function":{"name":"queryRecords","arguments":""}}]},"finish_reason":null}]}',
        '',
        'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\"from\\":"}}]},"finish_reason":null}]}',
        '',
        'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"2026-09-01\\"}"}}]},"finish_reason":"tool_calls"}]}',
        '',
        'data: [DONE]',
        '',
      ].join('\n'),
    );

    expect(events).toEqual([
      {
        type: 'tool-call-delta',
        index: 0,
        id: 'call_1',
        name: 'queryRecords',
        argumentsDelta: '',
      },
      { type: 'tool-call-delta', index: 0, argumentsDelta: '{"from":' },
      {
        type: 'tool-call-delta',
        index: 0,
        argumentsDelta: '"2026-09-01"}',
      },
      { type: 'finish', reason: 'tool_calls' },
    ]);
  });

  it('跳过空行、注释行与非 data 行', () => {
    const parser = createSseParser();

    const events = parser.push(
      [
        ': keep-alive',
        'event: message',
        '',
        'data: {"choices":[{"delta":{"content":"好"},"finish_reason":"stop"}]}',
        '',
      ].join('\n'),
    );

    expect(events).toEqual([
      { type: 'text', delta: '好' },
      { type: 'finish', reason: 'stop' },
    ]);
  });

  it('单独下发 usage 的 chunk 也会被收集', () => {
    const parser = createSseParser();

    const events = parser.push(
      'data: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":2,"total_tokens":12}}\n\n',
    );

    expect(events).toEqual([
      {
        type: 'usage',
        usage: { promptTokens: 10, completionTokens: 2, totalTokens: 12 },
      },
    ]);
  });

  it('忽略无法解析的 data 行，但会把协议错误转成 AgentError', () => {
    const parser = createSseParser();

    expect(parser.push('data: not-json\n\n')).toEqual([]);
    expect(() =>
      parser.push('data: {"error":{"message":"quota exceeded"}}\n\n'),
    ).toThrow('模型服务返回错误：quota exceeded');
  });
});

describe('createToolCallAccumulator', () => {
  it('按 index 拼接多个工具调用并补全缺失字段', () => {
    const accumulator = createToolCallAccumulator();

    accumulator.apply({ type: 'tool-call-delta', index: 0, id: 'call_1', name: 'queryRecords' });
    accumulator.apply({ type: 'tool-call-delta', index: 2, name: 'queryRecords' });
    accumulator.apply({ type: 'tool-call-delta', index: 0, argumentsDelta: '{"a":' });
    accumulator.apply({ type: 'tool-call-delta', index: 0, argumentsDelta: '1}' });
    accumulator.apply({ type: 'tool-call-delta', index: 2, argumentsDelta: '' });

    expect(accumulator.list()).toEqual([
      { id: 'call_1', name: 'queryRecords', arguments: '{"a":1}' },
      { id: 'call_2', name: 'queryRecords', arguments: '{}' },
    ]);
  });
});

describe('错误归一化', () => {
  it('把常见 HTTP 状态转成可操作的中文提示', () => {
    expect(toHttpError(401, '').message).toContain('API Key 无效或已过期');
    expect(toHttpError(403, '').message).toContain('无权访问');
    expect(toHttpError(404, '').message).toContain('Base URL 应形如');
    expect(toHttpError(429, '').message).toContain('请求过于频繁');
    expect(toHttpError(500, 'boom').message).toContain('服务端错误');
  });

  it('优先使用响应体里的 error.message', () => {
    const error = toHttpError(400, '{"error":{"message":"model not found"}}');

    expect(error.message).toContain('model not found');
  });

  it('中断与网络错误都归一化为 AgentError', () => {
    const abortError = Object.assign(new Error('Aborted'), { name: 'AbortError' });

    expect(toNetworkError(abortError)).toMatchObject({
      code: 'aborted',
      message: '请求已取消',
    });
    expect(toNetworkError(new TypeError('Network request failed'))).toMatchObject({
      code: 'network',
    });
    expect(toNetworkError(new TypeError('Network request failed')).message).toContain(
      '网络请求失败',
    );
  });

  it('AgentError 保留 code 与 status', () => {
    const error = toHttpError(429, '');

    expect(error).toBeInstanceOf(AgentError);
    expect(error.code).toBe('rate-limited');
    expect(error.status).toBe(429);
  });
});
