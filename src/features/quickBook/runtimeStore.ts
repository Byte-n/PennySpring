import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';
import { QUICK_BOOK_MAX_THREAD_IMAGE_ENTRIES } from './constants';

const QUICK_BOOK_RUNTIME_STORE_KEY = 'pennyspring-quick-book-runtime-v1';

interface QuickBookRuntimeStore {
  lastHandledAssetId: string | null;
  threadImagePaths: Record<string, string>;
  markAssetHandled: (assetId: string) => void;
  rememberThreadImage: (threadId: number, imagePath: string) => void;
  clearThreadImage: (threadId: number) => void;
}

function threadKey(threadId: number): string {
  return String(threadId);
}

function trimThreadImagePaths(
  paths: Record<string, string>,
): Record<string, string> {
  const keys = Object.keys(paths);
  if (keys.length <= QUICK_BOOK_MAX_THREAD_IMAGE_ENTRIES) {
    return paths;
  }
  const sorted = [...keys].sort((left, right) => Number(left) - Number(right));
  const staleCount = sorted.length - QUICK_BOOK_MAX_THREAD_IMAGE_ENTRIES;
  const next = { ...paths };
  for (const key of sorted.slice(0, staleCount)) {
    delete next[key];
  }
  return next;
}

export const useQuickBookRuntimeStore = create<QuickBookRuntimeStore>()(
  persist(
    set => ({
      lastHandledAssetId: null,
      threadImagePaths: {},
      markAssetHandled: assetId => {
        set({ lastHandledAssetId: assetId });
      },
      rememberThreadImage: (threadId, imagePath) => {
        set(state => ({
          threadImagePaths: trimThreadImagePaths({
            ...state.threadImagePaths,
            [threadKey(threadId)]: imagePath,
          }),
        }));
      },
      clearThreadImage: threadId => {
        set(state => {
          const next = { ...state.threadImagePaths };
          delete next[threadKey(threadId)];
          return { threadImagePaths: next };
        });
      },
    }),
    {
      name: QUICK_BOOK_RUNTIME_STORE_KEY,
      storage: createJSONStorage(() => createSqliteStateStorage()),
      partialize: state => ({
        lastHandledAssetId: state.lastHandledAssetId,
        threadImagePaths: state.threadImagePaths,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
);

export async function rehydrateQuickBookRuntime(): Promise<void> {
  await useQuickBookRuntimeStore.persist.rehydrate();
}

export function getThreadImagePath(threadId: number): string | undefined {
  return useQuickBookRuntimeStore.getState().threadImagePaths[threadKey(threadId)];
}

export function getLastHandledAssetId(): string | null {
  return useQuickBookRuntimeStore.getState().lastHandledAssetId;
}
