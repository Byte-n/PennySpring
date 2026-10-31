import { createRemoteApi } from '../packages/api/src/remote';

const SERVER_URL = 'http://example.com';
const originalFetch = global.fetch;

describe('createRemoteApi request timeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new Error('Aborted'));
          });
        }),
    ) as jest.MockedFunction<typeof fetch>;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('aborts API calls after ten seconds by default', async () => {
    const request = createRemoteApi(SERVER_URL).book.getAll();
    const result = request.then(
      () => null,
      (error: unknown) => error,
    );
    const requestSignal = jest.mocked(global.fetch).mock.calls[0][1]?.signal;

    expect(requestSignal).toBeDefined();

    await jest.advanceTimersByTimeAsync(10_000);

    expect(requestSignal?.aborted).toBe(true);
    expect(await result).toEqual(new Error('服务器请求超时'));
  });

  it('uses a shorter timeout when configured for server book discovery', async () => {
    const request = createRemoteApi(SERVER_URL, {
      timeoutMs: 3_000,
      timeoutMessage: '连接服务器超时',
    }).book.getAll();
    const result = request.then(
      () => null,
      (error: unknown) => error,
    );
    const requestSignal = jest.mocked(global.fetch).mock.calls[0][1]?.signal;

    expect(requestSignal).toBeDefined();

    await jest.advanceTimersByTimeAsync(3_000);

    expect(requestSignal?.aborted).toBe(true);
    expect(await result).toEqual(new Error('连接服务器超时'));
  });
});
