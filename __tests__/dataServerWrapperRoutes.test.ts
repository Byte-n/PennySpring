import type { Api } from '@pennyspring/data';

import { createServer } from '../packages/data-server-wrapper/src/server';

describe('data-server 路由分组', () => {
  it('exposes agent routes so remote books can persist assistant threads', async () => {
    const thread = { id: 7, booksId: 1, title: '' };
    const createThread = jest.fn(async () => thread);
    const api = { agent: { createThread } } as unknown as Api;
    const app = createServer(api);

    const response = await app.request('/api/agent/createThread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([1]),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: thread });
    expect(createThread).toHaveBeenCalledWith(1);
  });

  it('exposes server-scoped provider routes', async () => {
    const providers = [{ id: 1, name: '测试提供商' }];
    const getAll = jest.fn(async () => providers);
    const api = { provider: { getAll } } as unknown as Api;
    const app = createServer(api);

    const response = await app.request('/api/provider/getAll', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([]),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: providers });
    expect(getAll).toHaveBeenCalledWith();
  });

  it('exposes book-scoped credential and quick template routes', async () => {
    const hasKey = jest.fn(async () => true);
    const list = jest.fn(async () => []);
    const api = {
      credential: { hasKey },
      quickTemplate: { list },
    } as unknown as Api;
    const app = createServer(api);

    const credentialResponse = await app.request('/api/credential/hasKey', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([1, 2]),
    });
    const templateResponse = await app.request('/api/quickTemplate/list', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([1]),
    });

    expect(await credentialResponse.json()).toEqual({ result: true });
    expect(await templateResponse.json()).toEqual({ result: [] });
    expect(hasKey).toHaveBeenCalledWith(1, 2);
    expect(list).toHaveBeenCalledWith(1);
  });

  it('rejects malformed JSON request bodies', async () => {
    const api = { book: { getAll: jest.fn() } } as unknown as Api
    const app = createServer(api)

    const response = await app.request('/api/book/getAll', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: '请求体格式不正确' })
  })

  it('rejects the database accessor group', async () => {
    const api = {} as unknown as Api;
    const app = createServer(api);

    const response = await app.request('/api/get', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([]),
    });

    expect(response.status).toBe(404);
  });
});
