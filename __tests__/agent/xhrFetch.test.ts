import { createXhrFetch } from '../../src/agent/runtime/xhrFetch';

interface FakeHandler {
  (): void;
}

class FakeXmlHttpRequest {
  readyState = 0;
  status = 0;
  statusText = '';
  responseText = '';
  responseType = '';
  timeout = 0;
  onreadystatechange: FakeHandler | null = null;
  onprogress: FakeHandler | null = null;
  onload: FakeHandler | null = null;
  onerror: FakeHandler | null = null;
  ontimeout: FakeHandler | null = null;
  onabort: FakeHandler | null = null;
  headers: Record<string, string> = {};
  private aborted = false;

  open(): void {
    this.readyState = 1;
  }

  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  getAllResponseHeaders(): string {
    return 'content-type: text/event-stream\nx-test: ok\n';
  }

  send(): void {
    queueMicrotask(() => {
      if (this.aborted) {
        return;
      }
      this.status = 200;
      this.statusText = 'OK';
      this.readyState = 2;
      this.onreadystatechange?.();
      this.responseText = 'data: {"count":1}\n\n';
      this.onprogress?.();
      this.responseText += 'data: [DONE]\n\n';
      this.onprogress?.();
      this.readyState = 4;
      this.onload?.();
    });
  }

  abort(): void {
    this.aborted = true;
    this.readyState = 4;
    this.onabort?.();
  }
}

describe('createXhrFetch', () => {
  const originalXhr = globalThis.XMLHttpRequest;

  beforeEach(() => {
    (
      globalThis as unknown as { XMLHttpRequest: typeof FakeXmlHttpRequest }
    ).XMLHttpRequest = FakeXmlHttpRequest;
  });

  afterAll(() => {
    (
      globalThis as unknown as { XMLHttpRequest: typeof XMLHttpRequest }
    ).XMLHttpRequest = originalXhr;
  });

  it('把 XHR 增量文本转成可读取的字节流，并保留响应头', async () => {
    const response = await createXhrFetch()('https://host/v1/responses', {
      method: 'POST',
      headers: { Authorization: 'Bearer test' },
      body: '{}',
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-test')).toBe('ok');

    if (!response.body) {
      throw new Error('missing response body');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) {
        break;
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();

    expect(text).toBe('data: {"count":1}\n\ndata: [DONE]\n\n');
    await expect(response.text()).resolves.toBe(text);
  });

  it('请求前已中断时直接拒绝', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      createXhrFetch()('https://host/v1/responses', {
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
