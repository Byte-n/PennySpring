import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('../../src/stores/bookStore', () => {
  const api = {
    provider: {
      getAll: jest.fn(async () => []),
      getSelection: jest.fn(async () => ({ providerId: 0, modelId: '' })),
    },
    quickBook: {
      getSelection: jest.fn(async () => ({ providerId: 0, modelId: '' })),
    },
    credential: {
      hasKey: jest.fn(async () => false),
    },
    quickTemplate: {
      list: jest.fn(async () => []),
    },
  };
  const state = { currentBook: { id: 1 } };
  return {
    useGlobalApi: () => api,
    useBookKey: () => 'local:1',
    useBookStore: (selector: (value: typeof state) => unknown) =>
      selector(state),
    __api: api,
  };
});

import {
  useProviders,
  useQuickBookSelection,
} from '../../src/agent/providers/useProviders';
import { useQuickTemplates } from '../../src/screens/quickTemplate/useQuickTemplates';
import { useSyncVersionStore } from '../../src/stores/syncVersionStore';

interface MockApi {
  provider: { getAll: jest.Mock; getSelection: jest.Mock };
  quickBook: { getSelection: jest.Mock };
  credential: { hasKey: jest.Mock };
  quickTemplate: { list: jest.Mock };
}

const api = (
  jest.requireMock('../../src/stores/bookStore') as { __api: MockApi }
).__api;

function Probe(): null {
  useProviders();
  useQuickBookSelection();
  useQuickTemplates();
  return null;
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('同步版本刷新', () => {
  let renderer: TestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useSyncVersionStore.setState({ providerVersion: 0, templateVersion: 0 });
    });
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    renderer = null;
  });

  it('provider 版本变化后重新拉取 provider 与快捷记账选择', async () => {
    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
    });
    await flush();

    expect(api.provider.getAll).toHaveBeenCalledTimes(1);
    expect(api.quickBook.getSelection).toHaveBeenCalledTimes(1);
    expect(api.quickTemplate.list).toHaveBeenCalledTimes(1);

    await act(async () => {
      useSyncVersionStore.getState().bumpProviderVersion();
    });
    await flush();

    expect(api.provider.getAll).toHaveBeenCalledTimes(2);
    expect(api.quickBook.getSelection).toHaveBeenCalledTimes(2);
    expect(api.quickTemplate.list).toHaveBeenCalledTimes(1);
  });

  it('模板版本变化后只重新拉取模板', async () => {
    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
    });
    await flush();

    await act(async () => {
      useSyncVersionStore.getState().bumpTemplateVersion();
    });
    await flush();

    expect(api.quickTemplate.list).toHaveBeenCalledTimes(2);
    expect(api.provider.getAll).toHaveBeenCalledTimes(1);
    expect(api.quickBook.getSelection).toHaveBeenCalledTimes(1);
  });
});
