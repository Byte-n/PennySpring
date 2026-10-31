import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';

const QUICK_BOOK_RUNTIME_STORE_KEY = 'pennyspring-quick-book-runtime-v1';

interface QuickBookRuntimeStore {
  lastHandledAssetId: string | null;
  markAssetHandled: (assetId: string) => void;
}

export const useQuickBookRuntimeStore = create<QuickBookRuntimeStore>()(
  persist(
    set => ({
      lastHandledAssetId: null,
      markAssetHandled: assetId => {
        set({ lastHandledAssetId: assetId });
      },
    }),
    {
      name: QUICK_BOOK_RUNTIME_STORE_KEY,
      storage: createJSONStorage(() => createSqliteStateStorage()),
      partialize: state => ({
        lastHandledAssetId: state.lastHandledAssetId,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
);

export async function rehydrateQuickBookRuntime(): Promise<void> {
  await useQuickBookRuntimeStore.persist.rehydrate();
}

export function getLastHandledAssetId(): string | null {
  return useQuickBookRuntimeStore.getState().lastHandledAssetId;
}
