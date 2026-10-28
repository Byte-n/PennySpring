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
});
