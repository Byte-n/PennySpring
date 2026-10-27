import {
  AgentError,
  createAbortedError,
  toHttpError,
  toNetworkError,
} from '../core/protocol/errors';
import { buildChatRequest, createSseParser } from '../core/protocol/openai';
import type { StreamEvent, Transport } from '../core/types';
import { buildChatCompletionsUrl, isValidBaseUrl } from '../core/url';

export const DEFAULT_STREAM_TIMEOUT_MS = 120_000;

export interface StreamTransportConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs?: number;
}

interface EventQueue<T> {
  push: (item: T) => void;
  close: () => void;
  fail: (error: unknown) => void;
  next: () => Promise<IteratorResult<T>>;
}

function createEventQueue<T>(): EventQueue<T> {
  const items: T[] = [];
  let waiter: (() => void) | null = null;
  let closed = false;
  let failure: { error: unknown } | null = null;

  const wake = (): void => {
    const resolve = waiter;
    waiter = null;
    resolve?.();
  };

  return {
    push(item) {
      if (closed || failure) {
        return;
      }
      items.push(item);
      wake();
    },
    close() {
      if (closed || failure) {
        return;
      }
      closed = true;
      wake();
    },
    fail(error) {
      if (closed || failure) {
        return;
      }
      failure = { error };
      wake();
    },
    async next() {
      for (;;) {
        if (items.length > 0) {
          return { done: false, value: items.shift() as T };
        }
        if (failure) {
          throw failure.error;
        }
        if (closed) {
          return { done: true, value: undefined as never };
        }
        await new Promise<void>(resolve => {
          waiter = resolve;
        });
      }
    },
  };
}

export function createXhrStreamTransport(
  config: StreamTransportConfig,
): Transport {
  return async function* stream(request) {
    const apiKey = config.apiKey.trim();
    const model = config.model.trim();

    if (!apiKey) {
      throw new AgentError('not-configured', '请先在设置中填写 API Key。');
    }
    if (!model) {
      throw new AgentError('not-configured', '请先在设置中填写模型名称。');
    }
    if (!isValidBaseUrl(config.baseUrl)) {
      throw new AgentError(
        'not-configured',
        'Base URL 格式不正确，应形如 https://host/v1。',
      );
    }
    if (request.signal?.aborted) {
      throw createAbortedError();
    }

    const queue = createEventQueue<StreamEvent>();
    const parser = createSseParser();
    const xhr = new XMLHttpRequest();
    let consumedLength = 0;

    function consume(): void {
      if (xhr.status < 200 || xhr.status >= 300) {
        return;
      }
      if (xhr.readyState !== 3 && xhr.readyState !== 4) {
        return;
      }

      const text = xhr.responseText ?? '';
      if (text.length <= consumedLength) {
        return;
      }

      const chunk = text.slice(consumedLength);
      consumedLength = text.length;

      try {
        for (const event of parser.push(chunk)) {
          queue.push(event);
        }
      } catch (error) {
        queue.fail(error);
      }
    }

    const handleAbort = (): void => {
      xhr.abort();
    };

    xhr.open('POST', buildChatCompletionsUrl(config.baseUrl), true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.timeout = config.timeoutMs ?? DEFAULT_STREAM_TIMEOUT_MS;

    xhr.onprogress = () => {
      consume();
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        consume();
        queue.close();
        return;
      }
      queue.fail(toHttpError(xhr.status, xhr.responseText ?? ''));
    };
    xhr.onerror = () => {
      queue.fail(toNetworkError(new Error('network request failed')));
    };
    xhr.ontimeout = () => {
      queue.fail(new AgentError('timeout', '请求超时，请稍后再试。'));
    };
    xhr.onabort = () => {
      queue.fail(createAbortedError());
    };

    request.signal?.addEventListener('abort', handleAbort);

    try {
      xhr.send(
        JSON.stringify(
          buildChatRequest({
            model,
            messages: request.messages,
            tools: request.tools,
          }),
        ),
      );

      for (;;) {
        const result = await queue.next();
        if (result.done) {
          break;
        }
        yield result.value;
      }
    } finally {
      request.signal?.removeEventListener('abort', handleAbort);
      if (xhr.readyState !== 4) {
        xhr.abort();
      }
    }
  };
}
