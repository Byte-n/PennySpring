import '../../src/agent/runtime/polyfills';

describe('agent runtime polyfills', () => {
  it('AbortSignal.any 在任一信号中断时同步中断', () => {
    const first = new AbortController();
    const second = new AbortController();
    const combined = AbortSignal.any([first.signal, second.signal]);

    expect(combined.aborted).toBe(false);
    second.abort();

    expect(combined.aborted).toBe(true);
  });

  it('AbortSignal.timeout 到期后中断', async () => {
    const signal = AbortSignal.timeout(10);

    await new Promise(resolve => setTimeout(resolve, 30));

    expect(signal.aborted).toBe(true);
  });

  it('throwIfAborted 在中断后抛出错误', () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => controller.signal.throwIfAborted()).toThrow();
  });
});
