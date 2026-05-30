import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import type { AdbClient, MdnsService } from '../adb'
import { scanWireless, pairAndConnect } from '../features'
import { useAsync } from './useAsync'
import { SelectList } from './SelectList'
import { StatusView } from './StatusView'

interface PairPanelProps {
  client: AdbClient
  onBack: () => void
}

type Step = 'select' | 'code' | 'running' | 'done'

export function PairPanel({ client, onBack }: PairPanelProps) {
  const scan = useAsync(() => scanWireless(client))
  const [step, setStep] = useState<Step>('select')
  const [target, setTarget] = useState<MdnsService | undefined>()
  const [code, setCode] = useState('')
  const [error, setError] = useState<unknown>()

  useInput((input, key) => {
    if ((key.escape || input === 'q') && step !== 'running') {
      onBack()
    }
  })

  if (scan.loading || scan.error || !scan.data) {
    return (
      <Box flexDirection="column">
        <Text bold>无线配对</Text>
        <StatusView loading={scan.loading} loadingText="扫描中（约 5 秒）…" error={scan.error} />
        <Text color="gray">esc/q 返回</Text>
      </Box>
    )
  }

  const services = scan.data.pairing.length > 0 ? scan.data.pairing : scan.data.connect

  const runPair = async (value: string) => {
    if (!target) {
      return
    }
    setStep('running')
    try {
      await pairAndConnect(client, {
        host: target.host,
        pairPort: target.port,
        code: value,
        connectServices: scan.data!.connect,
      })
      setStep('done')
    } catch (e) {
      setError(e)
      setStep('code')
    }
  }

  return (
    <Box flexDirection="column">
      <Text bold>无线配对</Text>
      {step === 'select' ? (
        <SelectList
          items={services.map(s => ({ label: `${s.host}:${s.port}`, value: s }))}
          onSelect={value => {
            setTarget(value)
            setStep('code')
          }}
        />
      ) : null}
      {step === 'code' || step === 'running' ? (
        <Box>
          <Text>配对码（6 位）：</Text>
          {step === 'code' ? (
            <TextInput value={code} onChange={setCode} onSubmit={runPair} />
          ) : (
            <Text color="yellow">配对中…</Text>
          )}
        </Box>
      ) : null}
      {step === 'done' ? <Text color="green">配对完成。</Text> : null}
      <StatusView error={error} />
      <Text color="gray">esc/q 返回</Text>
    </Box>
  )
}
