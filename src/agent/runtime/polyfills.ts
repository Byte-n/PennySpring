import 'web-streams-polyfill/polyfill';

import {
  TextDecoder as Utf8TextDecoder,
  type TextDecoderOptions,
} from 'text-encoding-utf-8';
import type { ReadableStream, WritableStream } from 'web-streams-polyfill';

interface TextDecoderLike {
  decode(
    input?: ArrayBuffer | ArrayBufferView,
    options?: { stream?: boolean },
  ): string;
}

interface TextDecoderConstructor {
  new (label?: string, options?: TextDecoderOptions): TextDecoderLike;
}

interface TransformController<T> {
  enqueue(chunk: T): void;
}

interface TransformStreamLike<Input, Output> {
  readonly readable: ReadableStream<Output>;
  readonly writable: WritableStream<Input>;
}

interface TransformStreamConstructor {
  new <Input, Output>(transformer: {
    transform?: (chunk: Input, controller: TransformController<Output>) => void;
    flush?: (controller: TransformController<Output>) => void;
  }): TransformStreamLike<Input, Output>;
}

interface TextDecoderStreamLike {
  readonly readable: ReadableStream<string>;
  readonly writable: WritableStream<ArrayBuffer | ArrayBufferView>;
}

interface TextDecoderStreamConstructor {
  new (label?: string, options?: TextDecoderOptions): TextDecoderStreamLike;
}

interface AgentStreamGlobals {
  TextDecoder?: TextDecoderConstructor;
  TextDecoderStream?: TextDecoderStreamConstructor;
  TransformStream: TransformStreamConstructor;
}

const streamGlobals = globalThis as unknown as AgentStreamGlobals;

if (streamGlobals.TextDecoder === undefined) {
  streamGlobals.TextDecoder = Utf8TextDecoder;
}

class TextDecoderStream implements TextDecoderStreamLike {
  readonly readable: ReadableStream<string>;
  readonly writable: WritableStream<ArrayBuffer | ArrayBufferView>;

  constructor(label?: string, options?: TextDecoderOptions) {
    const decoder = new (streamGlobals.TextDecoder as TextDecoderConstructor)(
      label,
      options,
    );
    const transform = new streamGlobals.TransformStream<
      ArrayBuffer | ArrayBufferView,
      string
    >({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        if (text.length > 0) {
          controller.enqueue(text);
        }
      },
      flush(controller) {
        const text = decoder.decode();
        if (text.length > 0) {
          controller.enqueue(text);
        }
      },
    });

    this.readable = transform.readable;
    this.writable = transform.writable;
  }
}

if (streamGlobals.TextDecoderStream === undefined) {
  streamGlobals.TextDecoderStream = TextDecoderStream;
}

interface StructuredCloneGlobal {
  structuredClone?: <T>(value: T) => T;
}

const cloneGlobals = globalThis as unknown as StructuredCloneGlobal;

function createDataCloneError(value: unknown): Error {
  const message = `Failed to execute 'structuredClone' on 'Window': ${String(value)} could not be cloned.`;
  const DOMExceptionCtor = (
    globalThis as unknown as {
      DOMException?: new (message: string, name: string) => Error;
    }
  ).DOMException;
  if (DOMExceptionCtor) {
    return new DOMExceptionCtor(message, 'DataCloneError');
  }
  const error = new Error(message);
  error.name = 'DataCloneError';
  return error;
}

function cloneArrayBufferView(view: ArrayBufferView): ArrayBufferView {
  if (view instanceof DataView) {
    return new DataView(view.buffer.slice(0), view.byteOffset, view.byteLength);
  }
  // ArrayBufferView 接口不含 slice，但具体 TypedArray 均实现该拷贝方法。
  return (view as unknown as { slice(): ArrayBufferView }).slice();
}

function cloneStructuredValue<T>(value: T, seen: Map<unknown, unknown>): T {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'function' || typeof value === 'symbol') {
      throw createDataCloneError(value);
    }
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value) as T;
  }

  if (Array.isArray(value)) {
    const result: unknown[] = new Array(value.length);
    seen.set(value, result);
    value.forEach((item, index) => {
      result[index] = cloneStructuredValue(item, seen);
    });
    return result as T;
  }

  if (value instanceof Date) {
    const result = new Date(value.getTime());
    seen.set(value, result);
    return result as T;
  }

  if (value instanceof RegExp) {
    const result = new RegExp(value.source, value.flags);
    seen.set(value, result);
    return result as T;
  }

  if (value instanceof Map) {
    const result = new Map<unknown, unknown>();
    seen.set(value, result);
    value.forEach((item, key) => {
      result.set(
        cloneStructuredValue(key, seen),
        cloneStructuredValue(item, seen),
      );
    });
    return result as T;
  }

  if (value instanceof Set) {
    const result = new Set<unknown>();
    seen.set(value, result);
    value.forEach(item => {
      result.add(cloneStructuredValue(item, seen));
    });
    return result as T;
  }

  if (value instanceof ArrayBuffer) {
    const result = value.slice(0);
    seen.set(value, result);
    return result as T;
  }

  if (ArrayBuffer.isView(value)) {
    const result = cloneArrayBufferView(value);
    seen.set(value, result);
    return result as T;
  }

  if (value instanceof Error) {
    const result = new Error(value.message);
    result.name = value.name;
    result.stack = value.stack;
    seen.set(value, result);
    return result as T;
  }

  const result: Record<string, unknown> = {};
  seen.set(value, result);
  Object.keys(value).forEach(key => {
    result[key] = cloneStructuredValue(
      (value as Record<string, unknown>)[key],
      seen,
    );
  });
  return result as T;
}

// Hermes 未提供 structuredClone，AI SDK 的审批校验与消息快照依赖它。
if (cloneGlobals.structuredClone === undefined) {
  cloneGlobals.structuredClone = <T>(value: T): T =>
    cloneStructuredValue(value, new Map());
}

interface AbortSignalConstructorLike {
  any?: (signals: readonly AbortSignal[]) => AbortSignal;
  timeout?: (milliseconds: number) => AbortSignal;
  prototype: AbortSignal & {
    reason?: unknown;
    throwIfAborted?: () => void;
  };
}

function createAbortReason(name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

const AbortSignalCtor = (
  globalThis as unknown as { AbortSignal?: AbortSignalConstructorLike }
).AbortSignal;

if (AbortSignalCtor) {
  if (typeof AbortSignalCtor.any !== 'function') {
    AbortSignalCtor.any = (signals: readonly AbortSignal[]): AbortSignal => {
      const controller = new AbortController();
      const handleAbort = (): void => {
        controller.abort(
          createAbortReason('AbortError', 'The operation was aborted'),
        );
        for (const signal of signals) {
          signal.removeEventListener('abort', handleAbort);
        }
      };

      for (const signal of signals) {
        if (signal.aborted) {
          handleAbort();
          break;
        }
        signal.addEventListener('abort', handleAbort, { once: true });
      }
      return controller.signal;
    };
  }

  if (typeof AbortSignalCtor.timeout !== 'function') {
    AbortSignalCtor.timeout = (milliseconds: number): AbortSignal => {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort(
          createAbortReason('TimeoutError', 'The operation timed out'),
        );
      }, milliseconds);
      controller.signal.addEventListener('abort', () => clearTimeout(timer), {
        once: true,
      });
      return controller.signal;
    };
  }

  const prototype = AbortSignalCtor.prototype;
  if (typeof prototype.throwIfAborted !== 'function') {
    prototype.throwIfAborted = function throwIfAborted(): void {
      if (this.aborted) {
        throw this.reason instanceof Error
          ? this.reason
          : createAbortReason('AbortError', 'The operation was aborted');
      }
    };
  }
}
