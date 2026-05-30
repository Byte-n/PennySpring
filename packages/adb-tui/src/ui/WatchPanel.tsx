import React, { useState } from 'react'
import { Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { listDevices, DEFAULT_LOCAL_DB } from '../features'
import type { DbSyncManager } from './useDbSync'
import { useAsync } from './useAsync'
import { SelectList } from './SelectList'
import { StatusView } from './StatusView'
import { PromptFrame } from './components'
import { SELECT_HINT, UI_COLORS } from './theme'

interface WatchPanelProps {
  client: AdbClient
  sync: DbSyncManager
  onBack: () => void
}

export function WatchPanel({ client, sync, onBack }: WatchPanelProps) {
  const devicesState = useAsync(() => listDevices(client))
  const [serial, setSerial] = useState<string | undefined>()

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onBack()
      return
    }
    if (input === 's' && serial) {
      sync.stop(serial)
      setSerial(undefined)
    }
  })

  const select = (next: string) => {
    sync.start(next)
    setSerial(next)
  }

  if (!serial) {
    return (
      <PromptFrame title="数据库同步 · 选择设备" hint={SELECT_HINT}>
        <StatusView loading={devicesState.loading} loadingText="读取设备…" error={devicesState.error} />
        {devicesState.data ? (
          <SelectList
            items={devicesState.data.map(d => ({ label: `${d.serial} [${d.transport}]`, value: d.serial }))}
            emptyText="暂无可同步设备"
            onSelect={select}
          />
        ) : null}
      </PromptFrame>
    )
  }

  return (
    <PromptFrame title="数据库同步" hint="后台持续同步 · s 停止该设备 · ESC/q 返回">
      <Text>设备：{serial}</Text>
      <Text>输出：{DEFAULT_LOCAL_DB}</Text>
      <Text color={UI_COLORS.success}>已在后台同步，返回后仍保持</Text>
      <StatusView error={sync.errors[serial]} />
    </PromptFrame>
  )
}
