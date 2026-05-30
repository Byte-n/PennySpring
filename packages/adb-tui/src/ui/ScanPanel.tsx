import React from 'react'
import { Box, Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { scanWireless } from '../features'
import { useAsync } from './useAsync'
import { StatusView } from './StatusView'
import { PromptFrame } from './components'
import { RESCAN_HINT, UI_COLORS } from './theme'

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
    <PromptFrame title="无线调试服务扫描" hint={RESCAN_HINT}>
      <StatusView loading={loading} loadingText="扫描中（约 5 秒）…" error={error} />
      {data ? (
        <Box flexDirection="column">
          <Text color={UI_COLORS.success}>配对服务（pairing）</Text>
          {data.pairing.map(s => (
            <Text key={`p-${s.host}:${s.port}`}>
              {'  '}
              {s.host}:{s.port}
            </Text>
          ))}
          {data.pairing.length === 0 ? <Text color={UI_COLORS.muted}>  未发现配对服务</Text> : null}
          <Text color={UI_COLORS.success}>连接服务（connect）</Text>
          {data.connect.map(s => (
            <Text key={`c-${s.host}:${s.port}`}>
              {'  '}
              {s.host}:{s.port}
            </Text>
          ))}
          {data.connect.length === 0 ? <Text color={UI_COLORS.muted}>  未发现连接服务</Text> : null}
        </Box>
      ) : null}
    </PromptFrame>
  )
}
