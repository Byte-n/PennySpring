import React, { useState } from 'react'
import { Text, useInput } from 'ink'
import type { AdbClient } from '../adb'
import { scanWireless } from '../features'
import { useAsync } from './useAsync'
import { SelectList } from './SelectList'
import { StatusView } from './StatusView'
import { PromptFrame } from './components'
import { SELECT_HINT, UI_COLORS } from './theme'

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
      <PromptFrame title="无线连接" hint="操作：ESC/q 返回">
        <StatusView loading={scan.loading} loadingText="扫描中（约 5 秒）…" error={scan.error} />
      </PromptFrame>
    )
  }

  return (
    <PromptFrame title="无线连接" hint={SELECT_HINT}>
      {step === 'select' ? (
        <SelectList
          items={scan.data.connect.map(s => ({ label: `${s.host}:${s.port}`, value: s }))}
          emptyText="未发现可连接服务"
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
      {step === 'running' ? <Text color={UI_COLORS.warning}>连接中…</Text> : null}
      {step === 'done' ? <Text color={UI_COLORS.success}>连接成功。</Text> : null}
      <StatusView error={error} />
    </PromptFrame>
  )
}
