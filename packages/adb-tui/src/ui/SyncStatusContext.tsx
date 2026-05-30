import React, { createContext, useContext } from 'react'

const SyncStatusContext = createContext<string>('')

interface SyncStatusProviderProps {
  status: string
  children: React.ReactNode
}

export function SyncStatusProvider({ status, children }: SyncStatusProviderProps): React.ReactElement {
  return <SyncStatusContext.Provider value={status}>{children}</SyncStatusContext.Provider>
}

export function useSyncStatus(): string {
  return useContext(SyncStatusContext)
}
