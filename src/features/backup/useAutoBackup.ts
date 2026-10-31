import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

import { rehydrateBackupHistory } from '../../stores/backupHistoryStore'
import { useBookStore } from '../../stores/bookStore'
import { runAutoBackup } from './autoBackupRunner'
import { getAutoBackupSettings, rehydrateAutoBackup } from './autoBackupStore'
import { isAutoBackupDue } from './schedule'

export function useAutoBackup(): void {
  const initStatus = useBookStore(state => state.initStatus)
  const didRunThisSession = useRef(false)
  const isChecking = useRef(false)
  const isHydrated = useRef(false)

  useEffect(() => {
    if (initStatus !== 'success') return

    let cancelled = false

    const check = async (): Promise<void> => {
      if (cancelled || isChecking.current) return
      isChecking.current = true
      try {
        if (!isHydrated.current) {
          await Promise.all([rehydrateAutoBackup(), rehydrateBackupHistory()])
          isHydrated.current = true
        }
        if (cancelled) return

        const settings = getAutoBackupSettings()
        if (
          !isAutoBackupDue(
            settings,
            new Date(),
            didRunThisSession.current,
          )
        ) {
          return
        }
        didRunThisSession.current = true
        await runAutoBackup()
      } catch {
        // 备份失败会写入备份历史，由界面展示。
      } finally {
        isChecking.current = false
      }
    }

    check().catch(() => undefined)
    const subscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          check().catch(() => undefined)
          return
        }
        didRunThisSession.current = false
      },
    )

    return () => {
      cancelled = true
      subscription.remove()
    }
  }, [initStatus])
}
