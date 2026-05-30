import React, { useEffect, useState } from 'react'
import { Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { listDevices, createDbSyncThread, DEFAULT_LOCAL_DB } from '../features'
import { useAsync } from './useAsync'
import { SelectList } from './SelectList'
import { StatusView } from './StatusView'
import { PromptFrame } from './components'
import { SELECT_HINT, UI_COLORS } from './theme'

interface WatchPanelProps {
  client: AdbClient
  adbPath: string
  onBack: () => void
}

export function WatchPanel({ client, adbPath, onBack }: WatchPanelProps) {
  const devicesState = useAsync(() => listDevices(client))
  const [serial, setSerial] = useState<string | undefined>()
  const [pulls, setPulls] = useState(0)
  const [lastAt, setLastAt] = useState<string | undefined>()
  const [error, setError] = useState<unknown>()

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onBack()
    }
  })

  useEffect(() => {
    if (!serial) {
      return
    }
    setPulls(0)
    setLastAt(undefined)
    setError(undefined)
  }, [serial])

  useEffect(() => {
    if (!serial) {
      return
    }
    const thread = createDbSyncThread(
      { serial, adbPath },
      {
        onPull: () => {
          setPulls(prev => prev + 1)
          setLastAt(new Date().toLocaleTimeString('zh-CN'))
        },
        onError: setError,
      },
    )
    thread.start()
    return () => thread.stop()
  }, [serial, adbPath])

  if (!serial) {
    return (
      <PromptFrame title="数据库同步 · 选择设备" hint={SELECT_HINT}>
        <StatusView loading={devicesState.loading} loadingText="读取设备…" error={devicesState.error} />
        {devicesState.data ? (
          <SelectList
            items={devicesState.data.map(d => ({ label: `${d.serial} [${d.transport}]`, value: d.serial }))}
            emptyText="暂无可同步设备"
            onSelect={setSerial}
          />
        ) : null}
      </PromptFrame>
    )
  }

  return (
    <PromptFrame title="数据库同步" hint="持续监控中 · ESC/q 返回">
      <Text>设备：{serial}</Text>
      <Text>输出：{DEFAULT_LOCAL_DB}</Text>
      <Text color={UI_COLORS.success}>已同步 {pulls} 次{lastAt ? ` · 最近 ${lastAt}` : ''}</Text>
      <StatusView error={error} />
    </PromptFrame>
  )
}
