import React, { useEffect, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { listDevices, createAdbDbWatcher, DEFAULT_INTERVAL_MS, DEFAULT_LOCAL_DB } from '../features'
import { useAsync } from './useAsync'
import { SelectList } from './SelectList'
import { StatusView } from './StatusView'

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
    const controller = new AbortController()
    const watcher = createAdbDbWatcher(client, { serial, adbPath })
    watcher
      .watch(DEFAULT_INTERVAL_MS, controller.signal, () => {
        setPulls(prev => prev + 1)
        setLastAt(new Date().toLocaleTimeString('zh-CN'))
      })
      .catch(setError)
    return () => controller.abort()
  }, [serial, client, adbPath])

  if (!serial) {
    return (
      <Box flexDirection="column">
        <Text bold>数据库同步 · 选择设备</Text>
        <StatusView loading={devicesState.loading} loadingText="读取设备…" error={devicesState.error} />
        {devicesState.data ? (
          <SelectList
            items={devicesState.data.map(d => ({ label: `${d.serial} [${d.transport}]`, value: d.serial }))}
            onSelect={setSerial}
          />
        ) : null}
        <Text color="gray">esc/q 返回</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text bold>数据库同步</Text>
      <Text>设备：{serial}</Text>
      <Text>输出：{DEFAULT_LOCAL_DB}</Text>
      <Text color="green">已同步 {pulls} 次{lastAt ? ` · 最近 ${lastAt}` : ''}</Text>
      <StatusView error={error} />
      <Text color="gray">持续监控中 · esc/q 返回</Text>
    </Box>
  )
}
