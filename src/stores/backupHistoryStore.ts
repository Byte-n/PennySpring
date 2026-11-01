import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { bookStorage } from './bookStorage';

const BACKUP_HISTORY_STORE_KEY = 'pennyspring-backup-history';
const HISTORY_LIMIT = 100;

export type BackupHistoryKind =
  | 'export'
  | 'import'
  | 'auto'
  | 'settings-export'
  | 'settings-import'
  | 'ai-config-export'
  | 'ai-config-import'
  | 'lan-send'
  | 'lan-receive';

export interface BackupHistoryEntry {
  id: string;
  kind: BackupHistoryKind;
  fileName: string;
  sizeBytes: number;
  createdAt: number;
  bookNames: string[];
  recordCount: number;
  uri: string;
  status: 'success' | 'failed';
  errorText: string;
}

interface BackupHistoryStore {
  entries: BackupHistoryEntry[];
  addEntry: (entry: BackupHistoryEntry) => void;
  removeEntry: (id: string) => void;
  clear: () => void;
}

export function createBackupHistoryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useBackupHistoryStore = create<BackupHistoryStore>()(
  persist(
    set => ({
      entries: [],
      addEntry: entry =>
        set(state => ({
          entries: [entry, ...state.entries].slice(0, HISTORY_LIMIT),
        })),
      removeEntry: id =>
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id),
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: BACKUP_HISTORY_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): { entries: BackupHistoryEntry[] } => ({
        entries: state.entries,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
);

export async function rehydrateBackupHistory(): Promise<void> {
  await useBackupHistoryStore.persist.rehydrate();
}
