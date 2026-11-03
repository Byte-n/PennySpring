import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_BOOK_CONTENT_OPTIONS } from '../transfer/contentSelection';
import type { BookContentOptions } from '../transfer/types';
import { bookStorage } from '../../stores/bookStorage';
import type { BackupDirectoryTarget } from './directory';

const AUTO_BACKUP_STORE_KEY = 'pennyspring-auto-backup';
export const DEFAULT_AUTO_BACKUP_RETENTION = 5;

export type AutoBackupFrequency =
  'off' | 'everyLaunch' | 'daily' | 'weekly' | 'monthly' | 'customDays';

export type AutoBackupRunStatus = 'success' | 'failed' | 'skipped' | '';

export interface AutoBackupSettings {
  frequency: AutoBackupFrequency;
  customDays: number;
  selectedBookIds: number[] | null;
  defaultBookOptions: BookContentOptions;
  bookOptions: Record<number, BookContentOptions>;
  includeSettings: boolean;
  includeNetworkBooks: boolean;
  directory: BackupDirectoryTarget | null;
  retention: number | null;
  lastRunAt: number;
  lastRunStatus: AutoBackupRunStatus;
  lastRunError: string;
  lastFileName: string;
}

interface AutoBackupStore extends AutoBackupSettings {
  setFrequency: (frequency: AutoBackupFrequency) => void;
  setCustomDays: (days: number) => void;
  setSelectedBookIds: (bookIds: number[] | null) => void;
  setDefaultBookOptions: (options: BookContentOptions) => void;
  setBookOptions: (bookId: number, options: BookContentOptions) => void;
  setIncludeSettings: (includeSettings: boolean) => void;
  setIncludeNetworkBooks: (includeNetworkBooks: boolean) => void;
  setDirectory: (directory: BackupDirectoryTarget | null) => void;
  setRetention: (retention: number | null) => void;
  markRun: (input: {
    status: AutoBackupRunStatus;
    at: number;
    fileName?: string;
    error?: string;
  }) => void;
}

interface LegacyAutoBackupSettings {
  bookIds?: number[] | null;
  includeImages?: boolean;
  includeAgent?: boolean;
  frequency?: AutoBackupFrequency;
  customDays?: number;
  directory?: BackupDirectoryTarget | null;
  retention?: number | null;
  lastRunAt?: number;
  lastRunStatus?: AutoBackupRunStatus;
  lastRunError?: string;
  lastFileName?: string;
}

const DEFAULT_SETTINGS: AutoBackupSettings = {
  frequency: 'off',
  customDays: 7,
  selectedBookIds: null,
  defaultBookOptions: DEFAULT_BOOK_CONTENT_OPTIONS,
  bookOptions: {},
  includeSettings: false,
  includeNetworkBooks: false,
  directory: null,
  retention: DEFAULT_AUTO_BACKUP_RETENTION,
  lastRunAt: 0,
  lastRunStatus: '',
  lastRunError: '',
  lastFileName: '',
};

export function clampRetention(value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.max(1, Math.floor(value));
}

export function clampCustomDays(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.customDays;
  return Math.max(1, Math.min(365, Math.floor(value)));
}

export const useAutoBackupStore = create<AutoBackupStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      setFrequency: frequency => set({ frequency }),
      setCustomDays: customDays =>
        set({ customDays: clampCustomDays(customDays) }),
      setSelectedBookIds: selectedBookIds => set({ selectedBookIds }),
      setDefaultBookOptions: defaultBookOptions => set({ defaultBookOptions }),
      setBookOptions: (bookId, options) =>
        set(state => ({
          bookOptions: { ...state.bookOptions, [bookId]: options },
        })),
      setIncludeSettings: includeSettings => set({ includeSettings }),
      setIncludeNetworkBooks: includeNetworkBooks =>
        set({ includeNetworkBooks }),
      setDirectory: directory => set({ directory }),
      setRetention: retention => set({ retention: clampRetention(retention) }),
      markRun: ({ status, at, fileName, error }) =>
        set({
          lastRunAt: at,
          lastRunStatus: status,
          lastFileName: fileName ?? '',
          lastRunError: error ?? '',
        }),
    }),
    {
      name: AUTO_BACKUP_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): AutoBackupSettings => ({
        frequency: state.frequency,
        customDays: state.customDays,
        selectedBookIds: state.selectedBookIds,
        defaultBookOptions: state.defaultBookOptions,
        bookOptions: state.bookOptions,
        includeSettings: state.includeSettings,
        includeNetworkBooks: state.includeNetworkBooks,
        directory: state.directory,
        retention: state.retention,
        lastRunAt: state.lastRunAt,
        lastRunStatus: state.lastRunStatus,
        lastRunError: state.lastRunError,
        lastFileName: state.lastFileName,
      }),
      migrate: (
        persistedState: unknown,
        version: number,
      ): AutoBackupSettings => {
        if (version < 2) {
          const legacy = (persistedState ?? {}) as LegacyAutoBackupSettings;
          return {
            frequency: legacy.frequency ?? DEFAULT_SETTINGS.frequency,
            customDays: legacy.customDays ?? DEFAULT_SETTINGS.customDays,
            selectedBookIds: legacy.bookIds ?? null,
            defaultBookOptions: {
              includeImages: legacy.includeImages ?? true,
              includeAgent: legacy.includeAgent ?? false,
              includeAiConfig: true,
            },
            bookOptions: {},
            includeSettings: false,
            includeNetworkBooks: false,
            directory: legacy.directory ?? null,
            retention: legacy.retention ?? DEFAULT_SETTINGS.retention,
            lastRunAt: legacy.lastRunAt ?? 0,
            lastRunStatus: legacy.lastRunStatus ?? '',
            lastRunError: legacy.lastRunError ?? '',
            lastFileName: legacy.lastFileName ?? '',
          };
        }
        return persistedState as AutoBackupSettings;
      },
      skipHydration: true,
      version: 2,
    },
  ),
);

export async function rehydrateAutoBackup(): Promise<void> {
  await useAutoBackupStore.persist.rehydrate();
}

export function getBookContentOptions(
  settings: AutoBackupSettings,
  bookId: number,
): BookContentOptions {
  return settings.bookOptions[bookId] ?? settings.defaultBookOptions;
}

export function getAutoBackupSettings(): AutoBackupSettings {
  const state = useAutoBackupStore.getState();
  return {
    frequency: state.frequency,
    customDays: state.customDays,
    selectedBookIds: state.selectedBookIds,
    defaultBookOptions: state.defaultBookOptions,
    bookOptions: state.bookOptions,
    includeSettings: state.includeSettings,
    includeNetworkBooks: state.includeNetworkBooks,
    directory: state.directory,
    retention: state.retention,
    lastRunAt: state.lastRunAt,
    lastRunStatus: state.lastRunStatus,
    lastRunError: state.lastRunError,
    lastFileName: state.lastFileName,
  };
}
