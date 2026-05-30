import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { scanWireless } from '../features'
import { useAsync } from './useAsync'
import { SelectList } from './SelectList'
import { StatusView } from './StatusView'

interface ConnectPanelProps {
  client: AdbClient
  onBack: () => void
}

type Step = 'select' | 'running' | 'done'

export function ConnectPanel({ client, onBack }: ConnectPanelProps) {
  const scan = useAsync(() => scanWireless(client))
  const [step, setStep] = useState<Step>('select')
  const [error, setError] = useState<unknown>()

  useInput((input, key) => {
    if ((key.escape || input === 'q') && step !== 'running') {
      onBack()
    }
  })

  if (scan.loading || scan.error || !scan.data) {
    return (
      <Box flexDirection="column">
        <Text bold>无线连接</Text>
        <StatusView loading={scan.loading} loadingText="扫描中（约 5 秒）…" error={scan.error} />
        <Text color="gray">esc/q 返回</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text bold>无线连接</Text>
      {step === 'select' ? (
        <SelectList
          items={scan.data.connect.map(s => ({ label: `${s.host}:${s.port}`, value: s }))}
          onSelect={async value => {
            setStep('running')
            try {
              await client.connect(value.host, value.port)
              setStep('done')
            } catch (e) {
              setError(e)
              setStep('select')
            }
          }}
        />
      ) : null}
      {step === 'running' ? <Text color="yellow">连接中…</Text> : null}
      {step === 'done' ? <Text color="green">连接成功。</Text> : null}
      <StatusView error={error} />
      <Text color="gray">esc/q 返回</Text>
    </Box>
  )
}
