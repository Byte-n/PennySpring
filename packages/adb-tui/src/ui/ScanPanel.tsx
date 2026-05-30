import React from 'react'
import { Box, Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { scanWireless } from '../features'
import { useAsync } from './useAsync'
import { StatusView } from './StatusView'

interface ScanPanelProps {
  client: AdbClient
  onBack: () => void
}

export function ScanPanel({ client, onBack }: ScanPanelProps) {
  const { loading, data, error, reload } = useAsync(() => scanWireless(client))

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onBack()
    } else if (input === 'r') {
      reload()
    }
  })

  return (
    <Box flexDirection="column">
      <Text bold>无线调试服务扫描</Text>
      <StatusView loading={loading} loadingText="扫描中（约 5 秒）…" error={error} />
      {data ? (
        <Box flexDirection="column">
          <Text color="green">配对服务（pairing）</Text>
          {data.pairing.map(s => (
            <Text key={`p-${s.host}:${s.port}`}>
              {'  '}
              {s.host}:{s.port}
            </Text>
          ))}
          <Text color="green">连接服务（connect）</Text>
          {data.connect.map(s => (
            <Text key={`c-${s.host}:${s.port}`}>
              {'  '}
              {s.host}:{s.port}
            </Text>
          ))}
        </Box>
      ) : null}
      <Text color="gray">r 重新扫描 · esc/q 返回</Text>
    </Box>
  )
}
