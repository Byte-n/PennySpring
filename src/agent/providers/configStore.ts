import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';
import { normalizeBaseUrl } from '../core/url';
import { getProviderDescriptor, requireProviderDescriptor } from './catalog';
import { normalizeModelDraft } from './models';
import type {
  AgentModelConfig,
  AgentModelDraft,
  AgentProviderConfig,
  AgentProviderDraft,
} from './types';

const PROVIDER_STORE_KEY = 'pennyspring-agent-providers-v2';
const PROVIDER_ID_PREFIX = 'provider';

interface NormalizedProviderDraft {
  descriptorId: string;
  name: string;
  baseUrl: string;
  defaultModelId: string;
  models: AgentModelConfig[];
  storeResponses: boolean;
}

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

function normalizeModels(
  drafts: readonly AgentModelDraft[],
): AgentModelConfig[] {
  const models: AgentModelConfig[] = [];
  const seen = new Set<string>();
  for (const draft of drafts) {
    const model = normalizeModelDraft(draft);
    if (!model.modelId || seen.has(model.modelId)) {
      continue;
    }
    seen.add(model.modelId);
    models.push(model);
  }
  return models;
}

function normalizeDraft(draft: AgentProviderDraft): NormalizedProviderDraft {
  const descriptor = requireProviderDescriptor(draft.descriptorId);
  const models = normalizeModels(draft.models);
  const requestedDefaultId = draft.defaultModelId?.trim() ?? '';
  const defaultModelId = models.some(
    model => model.modelId === requestedDefaultId,
  )
    ? requestedDefaultId
    : (models[0]?.modelId ?? '');

  return {
    descriptorId: descriptor.id,
    name: draft.name.trim() || descriptor.name,
    baseUrl: normalizeBaseUrl(draft.baseUrl || descriptor.defaultBaseUrl),
    defaultModelId,
    models,
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
      skipHydration: true,
      version: 1,
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
