import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';
import { normalizeBaseUrl } from '../core/url';
import {
  getProviderDescriptor,
  requireProviderDescriptor,
} from './catalog';
import type { AgentProviderConfig, AgentProviderDraft } from './types';

const PROVIDER_STORE_KEY = 'pennyspring-agent-providers';
const PROVIDER_ID_PREFIX = 'provider';

interface AgentProviderStore {
  providers: AgentProviderConfig[];
  activeProviderId: string | null;
  addProvider: (draft: AgentProviderDraft) => AgentProviderConfig;
  updateProvider: (id: string, draft: AgentProviderDraft) => void;
  removeProvider: (id: string) => void;
  setActiveProvider: (id: string) => void;
}

interface PersistedAgentProviderState {
  providers: AgentProviderConfig[];
  activeProviderId: string | null;
}

function createProviderId(): string {
  return `${PROVIDER_ID_PREFIX}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizeDraft(draft: AgentProviderDraft): Required<AgentProviderDraft> {
  const descriptor = requireProviderDescriptor(draft.descriptorId);
  return {
    descriptorId: descriptor.id,
    name: draft.name.trim() || descriptor.name,
    baseUrl: normalizeBaseUrl(draft.baseUrl || descriptor.defaultBaseUrl),
    model: draft.model.trim(),
    storeResponses: draft.storeResponses ?? true,
  };
}

function createProviderConfig(draft: AgentProviderDraft): AgentProviderConfig {
  const normalized = normalizeDraft(draft);
  const now = Date.now();
  return {
    id: createProviderId(),
    ...normalized,
    createdAt: now,
    updatedAt: now,
  };
}

export const useAgentProviderStore = create<AgentProviderStore>()(
  persist(
    (set, get) => ({
      providers: [],
      activeProviderId: null,
      addProvider: draft => {
        const provider = createProviderConfig(draft);
        set(state => ({
          providers: [...state.providers, provider],
          activeProviderId: provider.id,
        }));
        return provider;
      },
      updateProvider: (id, draft) => {
        const normalized = normalizeDraft(draft);
        set(state => ({
          providers: state.providers.map(provider =>
            provider.id === id
              ? { ...provider, ...normalized, updatedAt: Date.now() }
              : provider,
          ),
        }));
      },
      removeProvider: id => {
        set(state => {
          const providers = state.providers.filter(
            provider => provider.id !== id,
          );
          const activeProviderId =
            state.activeProviderId === id
              ? (providers[0]?.id ?? null)
              : state.activeProviderId;
          return { providers, activeProviderId };
        });
      },
      setActiveProvider: id => {
        const exists = get().providers.some(provider => provider.id === id);
        if (exists) {
          set({ activeProviderId: id });
        }
      },
    }),
    {
      name: PROVIDER_STORE_KEY,
      storage: createJSONStorage(() => createSqliteStateStorage()),
      partialize: (state): PersistedAgentProviderState => ({
        providers: state.providers,
        activeProviderId: state.activeProviderId,
      }),
      // 旧版本没有 storeResponses 字段，缺失时按开启处理，避免误改成无状态请求
      migrate: (
        persistedState: unknown,
        version: number,
      ): PersistedAgentProviderState => {
        const state = persistedState as PersistedAgentProviderState;
        if (version < 2) {
          return {
            ...state,
            providers: state.providers.map(provider => ({
              ...provider,
              storeResponses: provider.storeResponses ?? true,
            })),
          };
        }
        return state;
      },
      skipHydration: true,
      version: 2,
    },
  ),
);

export async function rehydrateAgentProviders(): Promise<void> {
  await useAgentProviderStore.persist.rehydrate();
}

export function getActiveAgentProvider(): AgentProviderConfig | null {
  const { providers, activeProviderId } = useAgentProviderStore.getState();
  return (
    providers.find(provider => provider.id === activeProviderId) ??
    providers[0] ??
    null
  );
}

export function getAgentProvider(
  providerId: string,
): AgentProviderConfig | null {
  return (
    useAgentProviderStore
      .getState()
      .providers.find(provider => provider.id === providerId) ?? null
  );
}

export function getProviderDisplayName(
  provider: AgentProviderConfig,
): string {
  return (
    provider.name.trim() ||
    getProviderDescriptor(provider.descriptorId)?.name ||
    '未命名提供商'
  );
}
