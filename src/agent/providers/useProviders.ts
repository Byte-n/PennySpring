import { useRequest } from 'ahooks';
import type { AgentSelection } from '@pennyspring/api';

import { useGlobalApi } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';

export const EMPTY_AGENT_SELECTION: AgentSelection = {
  providerId: 0,
  modelId: '',
};

/** 服务器级提供商列表；切换服务器时按 api 实例重新拉取。 */
export function useProviders() {
  const api = useGlobalApi();
  const version = useSyncVersionStore(state => state.providerVersion);
  return useRequest(() => api.provider.getAll(), {
    refreshDeps: [api, version],
  });
}

/** Agent 新会话默认模型选择。 */
export function useProviderSelection() {
  const api = useGlobalApi();
  const version = useSyncVersionStore(state => state.providerVersion);
  return useRequest(() => api.provider.getSelection(), {
    refreshDeps: [api, version],
  });
}

/** 快捷记账独立模型选择。 */
export function useQuickBookSelection() {
  const api = useGlobalApi();
  const version = useSyncVersionStore(state => state.providerVersion);
  return useRequest(() => api.quickBook.getSelection(), {
    refreshDeps: [api, version],
  });
}

/** 账本级 API Key 是否存在；providerId 为 0 时直接返回 false。 */
export function useProviderKeyStatus(
  booksId: number | null,
  providerId: number | null,
) {
  const api = useGlobalApi();
  const version = useSyncVersionStore(state => state.providerVersion);
  return useRequest(
    () =>
      booksId !== null && providerId !== null && providerId > 0
        ? api.credential.hasKey(booksId, providerId)
        : Promise.resolve(false),
    { refreshDeps: [api, booksId, providerId, version] },
  );
}
