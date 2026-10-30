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

describe('structuredClone polyfill', () => {
  type StructuredCloneFn = <T>(value: T) => T;
  const scope = globalThis as { structuredClone?: StructuredCloneFn };

  it('structuredClone 缺失时安装并深拷贝数据、保留循环引用', () => {
    const native = scope.structuredClone;
    delete scope.structuredClone;
    try {
      jest.isolateModules(() => {
        require('../../src/agent/runtime/polyfills');
      });

      const source: {
        name: string;
        when: Date;
        nested: { list: number[] };
        self?: unknown;
      } = {
        name: 'createRecord',
        when: new Date('2026-10-31T00:00:00Z'),
        nested: { list: [1, 2] },
      };
      source.self = source;

      const clone = (scope as { structuredClone: StructuredCloneFn })
        .structuredClone;
      const cloned = clone(source);

      expect(cloned).not.toBe(source);
      expect(cloned.nested).not.toBe(source.nested);
      expect(cloned.nested.list).not.toBe(source.nested.list);
      expect(cloned.when).not.toBe(source.when);
      expect(cloned.when.getTime()).toBe(source.when.getTime());
      expect(cloned.self).toBe(cloned);
    } finally {
      scope.structuredClone = native;
    }
  });
});
