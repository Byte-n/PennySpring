import 'web-streams-polyfill/polyfill';

import {
  TextDecoder as Utf8TextDecoder,
  type TextDecoderOptions,
} from 'text-encoding-utf-8';
import type {
  ReadableStream,
  WritableStream,
} from 'web-streams-polyfill';

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
      controller.signal.addEventListener(
        'abort',
        () => clearTimeout(timer),
        { once: true },
      );
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
