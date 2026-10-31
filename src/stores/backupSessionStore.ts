import { create } from 'zustand'

/**
 * 会话内备份摘要；不落盘，避免在存储位置未定案前新增持久化数据。
 */
export interface BackupSessionSummary {
  bookNames: string[]
  createdAt: number
  fileName: string
  recordCount: number
  sizeBytes: number
}

interface BackupSessionState {
  lastExport: BackupSessionSummary | null
  setLastExport: (summary: BackupSessionSummary) => void
}

export const useBackupSessionStore = create<BackupSessionState>(set => ({
  lastExport: null,
  setLastExport: summary => set({ lastExport: summary }),
}))
