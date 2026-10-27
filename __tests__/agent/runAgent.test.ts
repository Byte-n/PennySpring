import { runAgent } from '../../src/agent/core/loop/runAgent';
import { selectRecentMessages } from '../../src/agent/core/context';
import { AgentError } from '../../src/agent/core/protocol/errors';
import type {
  ChatMessage,
  StreamEvent,
  ToolCall,
  Transport,
  TransportRequest,
} from '../../src/agent/core/types';

const TOOL_SCHEMA = {
  name: 'queryRecords',
  description: '查询记录',
  parameters: { type: 'object', properties: {} },
};

function createScriptedTransport(
  scripts: StreamEvent[][],
  requests: TransportRequest[],
): Transport {
  return async function* transport(request) {
    requests.push(request);
    const events = scripts.shift() ?? [{ type: 'finish', reason: 'stop' }];
    for (const event of events) {
      yield event;
    }
  };
}

function toolCallEvents(call: ToolCall, reason = 'tool_calls'): StreamEvent[] {
  const half = Math.floor(call.arguments.length / 2);
  return [
    {
      type: 'tool-call-delta',
      index: 0,
      id: call.id,
      name: call.name,
      argumentsDelta: call.arguments.slice(0, half),
    },
    {
      type: 'tool-call-delta',
      index: 0,
      argumentsDelta: call.arguments.slice(half),
    },
    { type: 'finish', reason },
  ];
}

function textEvents(text: string, reason = 'stop'): StreamEvent[] {
  return [
    { type: 'text', delta: text.slice(0, 2) },
    { type: 'text', delta: text.slice(2) },
    { type: 'finish', reason },
  ];
}

describe('runAgent', () => {
  it('把工具结果按 assistant(tool_calls) → tool 顺序追加，并在下一轮带上完整链', async () => {
    const requests: TransportRequest[] = [];
    const toolCalls: ToolCall[] = [];
    const transport = createScriptedTransport(
      [
        toolCallEvents({
          id: 'call_1',
          name: 'queryRecords',
          arguments: '{"from":"2026-09-01"}',
        }),
        textEvents('上个月吃饭花了 10.00 元'),
      ],
      requests,
    );

    const result = await runAgent({
      transport,
      messages: [
        { role: 'system', content: '系统提示' },
        { role: 'user', content: '上个月吃饭花了多少' },
      ],
      tools: [TOOL_SCHEMA],
      executeTool: async call => {
        toolCalls.push(call);
        return '{"total":10}';
      },
      onToolCall: call => toolCalls.push(call),
    });

    expect(result.messages.map(message => message.role)).toEqual([
      'assistant',
      'tool',
      'assistant',
    ]);
    expect(result.messages[0]?.toolCalls).toEqual([
      { id: 'call_1', name: 'queryRecords', arguments: '{"from":"2026-09-01"}' },
    ]);
    expect(result.messages[1]).toMatchObject({
      role: 'tool',
      content: '{"total":10}',
      toolCallId: 'call_1',
      toolName: 'queryRecords',
    });
    expect(result.messages[2]?.content).toBe('上个月吃饭花了 10.00 元');
    expect(toolCalls).toHaveLength(2);

    expect(requests).toHaveLength(2);
    expect(requests[1]?.messages.map(message => message.role)).toEqual([
      'system',
      'user',
      'assistant',
      'tool',
    ]);
  });

  it('命中 maxSteps 后不再发请求，但保留完整的工具链', async () => {
    const requests: TransportRequest[] = [];
    const transport = createScriptedTransport(
      [
        toolCallEvents({ id: 'call_1', name: 'queryRecords', arguments: '{}' }),
        toolCallEvents({ id: 'call_2', name: 'queryRecords', arguments: '{}' }),
      ],
      requests,
    );

    const result = await runAgent({
      transport,
      messages: [{ role: 'user', content: '查一下' }],
      tools: [TOOL_SCHEMA],
      maxSteps: 2,
      executeTool: async () => '{"ok":true}',
    });

    expect(requests).toHaveLength(2);
    expect(result.messages.map(message => message.role)).toEqual([
      'assistant',
      'tool',
      'assistant',
      'tool',
    ]);
  });

  it('maxSteps 超过硬上限时按 5 次截断', async () => {
    const requests: TransportRequest[] = [];
    const transport = createScriptedTransport(
      new Array(10)
        .fill(null)
        .map(() => toolCallEvents({ id: 'call', name: 'queryRecords', arguments: '{}' })),
      requests,
    );

    await runAgent({
      transport,
      messages: [{ role: 'user', content: '查一下' }],
      tools: [TOOL_SCHEMA],
      maxSteps: 99,
      executeTool: async () => '{"ok":true}',
    });

    expect(requests).toHaveLength(5);
  });

  it('已中断的 signal 不会发起请求', async () => {
    const requests: TransportRequest[] = [];
    const controller = new AbortController();
    controller.abort();
    const transport = createScriptedTransport([], requests);

    await expect(
      runAgent({
        transport,
        messages: [{ role: 'user', content: '你好' }],
        tools: [TOOL_SCHEMA],
        executeTool: async () => '',
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ code: 'aborted' });
    expect(requests).toHaveLength(0);
  });

  it('工具执行期间中断后不再发起下一轮请求', async () => {
    const requests: TransportRequest[] = [];
    const controller = new AbortController();
    const transport = createScriptedTransport(
      [
        toolCallEvents({ id: 'call_1', name: 'queryRecords', arguments: '{}' }),
        textEvents('不应出现'),
      ],
      requests,
    );

    await expect(
      runAgent({
        transport,
        messages: [{ role: 'user', content: '查一下' }],
        tools: [TOOL_SCHEMA],
        executeTool: async () => {
          controller.abort();
          return '{"ok":true}';
        },
        signal: controller.signal,
      }),
    ).rejects.toBeInstanceOf(AgentError);
    expect(requests).toHaveLength(1);
  });

  it('工具执行失败时把错误作为工具结果回灌，循环继续', async () => {
    const requests: TransportRequest[] = [];
    const transport = createScriptedTransport(
      [
        toolCallEvents({ id: 'call_1', name: 'queryRecords', arguments: '{}' }),
        textEvents('查询失败了'),
      ],
      requests,
    );

    const result = await runAgent({
      transport,
      messages: [{ role: 'user', content: '查一下' }],
      tools: [TOOL_SCHEMA],
      executeTool: async () => {
        throw new Error('数据库不可用');
      },
    });

    expect(result.messages[1]).toMatchObject({
      role: 'tool',
      content: '工具执行失败：数据库不可用',
    });
    expect(requests).toHaveLength(2);
  });

  it('请求前按 historyLimit 裁剪，且不切断 tool_call 与 tool 结果的配对', async () => {
    const requests: TransportRequest[] = [];
    const transport = createScriptedTransport([textEvents('好')], requests);
    const history: ChatMessage[] = [
      { role: 'system', content: '系统' },
      { role: 'user', content: '问题一' },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call_1', name: 'queryRecords', arguments: '{}' }],
      },
      { role: 'tool', content: '{}', toolCallId: 'call_1', toolName: 'queryRecords' },
      { role: 'user', content: '问题二' },
    ];

    await runAgent({
      transport,
      messages: history,
      tools: [TOOL_SCHEMA],
      historyLimit: 2,
      executeTool: async () => '',
    });

    expect(requests[0]?.messages.map(message => message.role)).toEqual([
      'system',
      'assistant',
      'tool',
      'user',
    ]);
  });

  it('模型返回空内容时不追加消息', async () => {
    const requests: TransportRequest[] = [];
    const transport = createScriptedTransport([textEvents('')], requests);

    const result = await runAgent({
      transport,
      messages: [{ role: 'user', content: '你好' }],
      tools: [TOOL_SCHEMA],
      executeTool: async () => '',
    });

    expect(result.messages).toEqual([]);
    expect(requests).toHaveLength(1);
  });

  it('收集每轮 usage 并挂到对应的 assistant 消息上', async () => {
    const requests: TransportRequest[] = [];
    const usage = { promptTokens: 100, completionTokens: 8, totalTokens: 108 };
    const transport = createScriptedTransport(
      [
        [
          { type: 'text', delta: '好的' },
          { type: 'finish', reason: 'stop' },
          { type: 'usage', usage },
        ],
      ],
      requests,
    );

    const result = await runAgent({
      transport,
      messages: [{ role: 'user', content: '你好' }],
      tools: [TOOL_SCHEMA],
      executeTool: async () => '',
    });

    expect(result.usage).toEqual([usage]);
    expect(result.messages[0]?.usage).toEqual(usage);
  });
});

describe('selectRecentMessages', () => {
  it('窗口起点落在 tool 消息时，向前补齐 assistant 调用', () => {
    const messages: ChatMessage[] = [
      { role: 'system', content: '系统' },
      { role: 'user', content: '问题一' },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call_1', name: 'queryRecords', arguments: '{}' }],
      },
      { role: 'tool', content: '{}', toolCallId: 'call_1', toolName: 'queryRecords' },
      { role: 'user', content: '问题二' },
    ];

    expect(selectRecentMessages(messages, 2).map(message => message.role)).toEqual([
      'system',
      'assistant',
      'tool',
      'user',
    ]);
  });

  it('消息数不超过上限时原样返回', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '一' },
      { role: 'assistant', content: '二' },
    ];

    expect(selectRecentMessages(messages, 20)).toBe(messages);
  });
});
