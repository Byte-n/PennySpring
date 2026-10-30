import { z } from 'zod';

import { createAgentTool } from '../../src/agent/tools/createAgentTool';

const inputSchema = z.object({ value: z.number() });

type ExecuteFn = (
  input: { value: number },
  options: { abortSignal?: { aborted: boolean } },
) => Promise<string>;

function createExecute(
  execute: (input: { value: number }) => Promise<string>,
): ExecuteFn {
  const agentTool = createAgentTool({
    name: 'demo',
    description: 'demo tool',
    inputSchema,
    execute,
  });
  return agentTool.execute as unknown as ExecuteFn;
}

describe('createAgentTool', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the execute result', async () => {
    const execute = createExecute(async input => `value:${input.value}`);

    await expect(execute({ value: 2 }, {})).resolves.toBe('value:2');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('logs once and wraps execution errors with the tool name', async () => {
    const cause = new Error('boom');
    const execute = createExecute(async () => {
      throw cause;
    });

    await expect(execute({ value: 1 }, {})).rejects.toThrow(
      '工具 demo 执行失败：boom',
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('[agent:demo] 工具执行失败', cause);
  });

  it('does not log or wrap abort errors', async () => {
    const abortError = new Error('请求已取消');
    abortError.name = 'AbortError';
    const execute = createExecute(async () => {
      throw abortError;
    });

    await expect(execute({ value: 1 }, {})).rejects.toBe(abortError);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('does not log or wrap when the run is already aborted', async () => {
    const cause = new Error('boom');
    const execute = createExecute(async () => {
      throw cause;
    });

    await expect(
      execute({ value: 1 }, { abortSignal: { aborted: true } }),
    ).rejects.toBe(cause);
    expect(console.error).not.toHaveBeenCalled();
  });
});
