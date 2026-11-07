import type { Api } from '@pennyspring/api';

import { loadBookAgentRules } from '../../src/agent/core/agentRules';

function createApi(get: jest.Mock): Api {
  return { agentRules: { get } } as unknown as Api;
}

describe('loadBookAgentRules', () => {
  it('returns the rules stored for the current book', async () => {
    const rules = {
      booksId: 1,
      agentRules: '金额先追问',
      quickBookRules: '日期留空',
      createdTime: 0,
      updatedTime: 0,
    };
    const get = jest.fn(() => Promise.resolve(rules));

    await expect(loadBookAgentRules(createApi(get), 1)).resolves.toEqual(rules);
    expect(get).toHaveBeenCalledWith(1);
  });

  it('falls back to null when the server has no agentRules route', async () => {
    const get = jest.fn(() => Promise.reject(new Error('未知路由')));

    await expect(loadBookAgentRules(createApi(get), 1)).resolves.toBeNull();
  });
});
