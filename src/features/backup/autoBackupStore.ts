import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { bookStorage } from '../../stores/bookStorage'
import type { BackupDirectoryTarget } from './directory'

const AUTO_BACKUP_STORE_KEY = 'pennyspring-auto-backup'
export const DEFAULT_AUTO_BACKUP_RETENTION = 5

export type AutoBackupFrequency =
  | 'off'
  | 'everyLaunch'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'customDays'

export type AutoBackupRunStatus = 'success' | 'failed' | 'skipped' | ''

export interface AutoBackupSettings {
  frequency: AutoBackupFrequency
  customDays: number
  includeImages: boolean
  includeAgent: boolean
  bookIds: number[] | null
  directory: BackupDirectoryTarget | null
  retention: number | null
  lastRunAt: number
  lastRunStatus: AutoBackupRunStatus
  lastRunError: string
  lastFileName: string
}

interface AutoBackupStore extends AutoBackupSettings {
  setFrequency: (frequency: AutoBackupFrequency) => void
  setCustomDays: (days: number) => void
  setIncludeImages: (includeImages: boolean) => void
  setIncludeAgent: (includeAgent: boolean) => void
  setBookIds: (bookIds: number[] | null) => void
  setDirectory: (directory: BackupDirectoryTarget | null) => void
  setRetention: (retention: number | null) => void
  markRun: (input: {
    status: AutoBackupRunStatus
    at: number
    fileName?: string
    error?: string
  }) => void
}

const DEFAULT_SETTINGS: AutoBackupSettings = {
  frequency: 'daily',
  customDays: 7,
  includeImages: true,
  includeAgent: false,
  bookIds: null,
  directory: null,
  retention: DEFAULT_AUTO_BACKUP_RETENTION,
  lastRunAt: 0,
  lastRunStatus: '',
  lastRunError: '',
  lastFileName: '',
}

export function clampRetention(value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return null
  }
  return Math.max(1, Math.floor(value))
}

export function clampCustomDays(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.customDays
  return Math.max(1, Math.min(365, Math.floor(value)))
}

export const useAutoBackupStore = create<AutoBackupStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      setFrequency: frequency => set({ frequency }),
      setCustomDays: customDays => set({ customDays: clampCustomDays(customDays) }),
      setIncludeImages: includeImages => set({ includeImages }),
      setIncludeAgent: includeAgent => set({ includeAgent }),
      setBookIds: bookIds => set({ bookIds }),
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
        includeImages: state.includeImages,
        includeAgent: state.includeAgent,
        bookIds: state.bookIds,
        directory: state.directory,
        retention: state.retention,
        lastRunAt: state.lastRunAt,
        lastRunStatus: state.lastRunStatus,
        lastRunError: state.lastRunError,
        lastFileName: state.lastFileName,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
)

export async function rehydrateAutoBackup(): Promise<void> {
  await useAutoBackupStore.persist.rehydrate()
}

export function getAutoBackupSettings(): AutoBackupSettings {
  const state = useAutoBackupStore.getState()
  return {
    frequency: state.frequency,
    customDays: state.customDays,
    includeImages: state.includeImages,
    includeAgent: state.includeAgent,
    bookIds: state.bookIds,
    directory: state.directory,
    retention: state.retention,
    lastRunAt: state.lastRunAt,
    lastRunStatus: state.lastRunStatus,
    lastRunError: state.lastRunError,
    lastFileName: state.lastFileName,
  }
}
