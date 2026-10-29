import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';
import { resolveProviderModel } from './models';
import type { AgentModelConfig, AgentProviderConfig } from './types';

const THREAD_MODEL_STORE_KEY = 'pennyspring-agent-thread-models';

export interface ThreadModelSelection {
  providerId: string;
  modelId: string;
}

interface ThreadModelStore {
  selections: Record<string, ThreadModelSelection>;
  selectThreadModel: (
    threadId: number,
    selection: ThreadModelSelection,
  ) => void;
  clearThreadModel: (threadId: number) => void;
}

function threadKey(threadId: number): string {
  return String(threadId);
}

export const useThreadModelStore = create<ThreadModelStore>()(
  persist(
    set => ({
      selections: {},
      selectThreadModel: (threadId, selection) => {
        set(state => ({
          selections: {
            ...state.selections,
            [threadKey(threadId)]: selection,
          },
        }));
      },
      clearThreadModel: threadId => {
        set(state => {
          const selections = { ...state.selections };
          delete selections[threadKey(threadId)];
          return { selections };
        });
      },
    }),
    {
      name: THREAD_MODEL_STORE_KEY,
      storage: createJSONStorage(() => createSqliteStateStorage()),
      partialize: state => ({ selections: state.selections }),
      skipHydration: true,
      version: 1,
    },
  ),
);

export async function rehydrateThreadModelSelections(): Promise<void> {
  await useThreadModelStore.persist.rehydrate();
}

export function getThreadModelSelection(
  threadId: number,
): ThreadModelSelection | null {
  return useThreadModelStore.getState().selections[threadKey(threadId)] ?? null;
}

export function rememberThreadModel(
  threadId: number,
  providerId: string,
  modelId: string,
): void {
  useThreadModelStore
    .getState()
    .selectThreadModel(threadId, { providerId, modelId });
}

export function clearThreadModel(threadId: number): void {
  useThreadModelStore.getState().clearThreadModel(threadId);
}

export function resolveThreadModel(
  provider: AgentProviderConfig,
  threadId: number,
): AgentModelConfig | null {
  const selection = getThreadModelSelection(threadId);
  const rememberedModelId =
    selection && selection.providerId === provider.id
      ? selection.modelId
      : null;
  return resolveProviderModel(provider, rememberedModelId);
}
