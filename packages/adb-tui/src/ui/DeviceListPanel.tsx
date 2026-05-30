import React from 'react'
import { Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { listDevices } from '../features'
import { useAsync } from './useAsync'
import { StatusView } from './StatusView'
import { PromptFrame } from './components'
import { REFRESH_HINT, UI_COLORS } from './theme'

interface DeviceListPanelProps {
  client: AdbClient
  onBack: () => void
}

export function DeviceListPanel({ client, onBack }: DeviceListPanelProps) {
  const { loading, data, error, reload } = useAsync(() => listDevices(client))

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onBack()
    } else if (input === 'r') {
      reload()
    }
  })

  return (
    <PromptFrame title="已连接设备" hint={REFRESH_HINT}>
      <StatusView loading={loading} loadingText="正在读取设备…" error={error} />
      {data?.map(device => (
        <Text key={device.serial}>
          {device.serial} [{device.transport}] {device.state}
          {device.model ? ` · ${device.model}` : ''}
        </Text>
      ))}
      {data?.length === 0 ? <Text color={UI_COLORS.muted}>暂无已连接设备</Text> : null}
    </PromptFrame>
  )
}
