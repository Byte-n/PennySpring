import React from 'react'
import { Box, Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { listDevices } from '../features'
import { useAsync } from './useAsync'
import { StatusView } from './StatusView'

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
    <Box flexDirection="column">
      <Text bold>已连接设备</Text>
      <StatusView loading={loading} loadingText="正在读取设备…" error={error} />
      {data?.map(device => (
        <Text key={device.serial}>
          {device.serial} [{device.transport}] {device.state}
          {device.model ? ` · ${device.model}` : ''}
        </Text>
      ))}
      <Text color="gray">r 刷新 · esc/q 返回</Text>
    </Box>
  )
}
