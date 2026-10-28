import type { ReadableStream } from 'web-streams-polyfill';

const DEFAULT_TIMEOUT_MS = 120_000;
const BODY_EXCERPT_LIMIT = 200;

interface StreamController<T> {
  enqueue(chunk: T): void;
  close(): void;
  error(reason?: unknown): void;
}

interface ReadableStreamConstructor {
  new <T>(source: {
    start(controller: StreamController<T>): void;
    cancel?(reason?: unknown): void;
  }): ReadableStream<T>;
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createAbortError(): Error {
  const error = new Error('请求已取消');
  error.name = 'AbortError';
  return error;
}

function createTimeoutError(): Error {
  const error = new Error('请求超时，请稍后再试。');
  error.name = 'TimeoutError';
  return error;
}

function errorExcerpt(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, BODY_EXCERPT_LIMIT);
  }
  return String(error).slice(0, BODY_EXCERPT_LIMIT);
}

function toHeaderRecord(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator <= 0) {
      continue;
    }
    const name = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (name) {
      headers[name] = value;
    }
  }
  return headers;
}

function readRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

function readRequestBody(body: BodyInit | null | undefined): string | null {
  if (body === null || body === undefined) {
    return null;
  }
  if (typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

function createHeaders(init?: HeadersInit): Headers {
  return new Headers(init);
}

interface ResponseLike {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly headers: Headers;
  readonly body: ReadableStream<Uint8Array>;
  text(): Promise<string>;
  json(): Promise<unknown>;
  clone(): Response;
}

export function createXhrFetch(timeoutMs: number = DEFAULT_TIMEOUT_MS): typeof fetch {
  return async function xhrFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = readRequestUrl(input);
    const method = init?.method ?? 'GET';
    const body = readRequestBody(init?.body);
    const signal = init?.signal ?? undefined;

    if (signal?.aborted) {
      throw createAbortError();
    }

    const ReadableStreamCtor = (
      globalThis as unknown as { ReadableStream: ReadableStreamConstructor }
    ).ReadableStream;
    const xhr = new XMLHttpRequest();
    const completion = createDeferred<void>();
    completion.promise.catch(() => undefined);
    const encoder = new TextEncoder();
    let controller: StreamController<Uint8Array> | null = null;
    let consumedLength = 0;
    let isClosed = false;
    let responseResolved = false;

    const stream = new ReadableStreamCtor<Uint8Array>({
      start(streamController) {
        controller = streamController;
      },
      cancel() {
        if (xhr.readyState !== 4) {
          xhr.abort();
        }
      },
    });

    function enqueueIncrementalText(): void {
      if (controller === null || isClosed) {
        return;
      }
      const text = xhr.responseText ?? '';
      if (text.length <= consumedLength) {
        return;
      }
      const chunk = text.slice(consumedLength);
      consumedLength = text.length;
      controller.enqueue(encoder.encode(chunk));
    }

    function closeStream(): void {
      if (isClosed) {
        return;
      }
      isClosed = true;
      enqueueIncrementalText();
      controller?.close();
    }

    function failStream(error: unknown): void {
      if (isClosed) {
        return;
      }
      isClosed = true;
      controller?.error(error);
      completion.reject(error);
    }

    function buildResponse(): Response {
      const status = xhr.status;
      const headers = new Headers(toHeaderRecord(xhr.getAllResponseHeaders()));
      const response: ResponseLike = {
        ok: status >= 200 && status < 300,
        status,
        statusText: xhr.statusText,
        url,
        headers,
        body: stream,
        text: async () => {
          await completion.promise;
          return xhr.responseText ?? '';
        },
        json: async () => {
          await completion.promise;
          return JSON.parse(xhr.responseText ?? '') as unknown;
        },
        clone: () => response as unknown as Response,
      };
      return response as unknown as Response;
    }

    const resolveResponse = createDeferred<Response>();

    const handleAbort = (): void => {
      if (xhr.readyState !== 4) {
        xhr.abort();
      }
    };

    xhr.open(method, url, true);
    xhr.timeout = timeoutMs;
    xhr.responseType = 'text';

    const headers = createHeaders(init?.headers);
    headers.forEach((value, key) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onreadystatechange = () => {
      if (responseResolved || xhr.readyState < 2) {
        return;
      }
      responseResolved = true;
      resolveResponse.resolve(buildResponse());
    };

    xhr.onprogress = () => {
      enqueueIncrementalText();
    };

    xhr.onload = () => {
      if (!responseResolved && xhr.status > 0) {
        responseResolved = true;
        resolveResponse.resolve(buildResponse());
      }
      closeStream();
      completion.resolve();
    };

    xhr.onerror = () => {
      const error = new Error(`网络请求失败：${errorExcerpt(xhr.statusText)}`);
      if (!responseResolved) {
        resolveResponse.reject(error);
      }
      failStream(error);
    };

    xhr.ontimeout = () => {
      const error = createTimeoutError();
      if (!responseResolved) {
        resolveResponse.reject(error);
      }
      failStream(error);
    };

    xhr.onabort = () => {
      const error = createAbortError();
      if (!responseResolved) {
        resolveResponse.reject(error);
      }
      failStream(error);
    };

    signal?.addEventListener('abort', handleAbort);

    try {
      xhr.send(body);
    } catch (error) {
      signal?.removeEventListener('abort', handleAbort);
      const wrapped = new Error(`网络请求失败：${errorExcerpt(error)}`);
      if (!responseResolved) {
        resolveResponse.reject(wrapped);
      }
      failStream(wrapped);
    }

    const cleanup = (): void => {
      signal?.removeEventListener('abort', handleAbort);
    };
    completion.promise.then(cleanup, cleanup);

    return resolveResponse.promise;
  };
}
