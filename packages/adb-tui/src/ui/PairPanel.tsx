import React, { useState } from 'react'
import { Text, useInput } from 'ink'
import type { AdbClient, MdnsService } from '../adb'
import { scanWireless, pairAndConnect, validatePairingCode } from '../features'
import { useAsync } from './useAsync'
import { SelectList } from './SelectList'
import { StatusView } from './StatusView'
import { PromptFrame, TextField } from './components'
import { SELECT_HINT, TEXT_HINT, UI_COLORS } from './theme'

interface PairPanelProps {
  client: AdbClient
  onBack: () => void
}

type Step = 'select' | 'code' | 'running' | 'done'

export function PairPanel({ client, onBack }: PairPanelProps) {
  const scan = useAsync(() => scanWireless(client))
  const [step, setStep] = useState<Step>('select')
  const [target, setTarget] = useState<MdnsService | undefined>()
  const [error, setError] = useState<unknown>()

  useInput((input, key) => {
    if ((key.escape || input === 'q') && step !== 'running' && step !== 'code') {
      onBack()
    }
  })

  if (scan.loading || scan.error || !scan.data) {
    return (
      <PromptFrame title="无线配对" hint="操作：ESC/q 返回">
        <StatusView loading={scan.loading} loadingText="扫描中（约 5 秒）…" error={scan.error} />
      </PromptFrame>
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

  if (step === 'code') {
    return (
      <TextField
        title="无线配对 · 输入配对码"
        hint={TEXT_HINT}
        error={error instanceof Error ? error.message : error ? '未知错误' : null}
        validate={value => {
          try {
            validatePairingCode(value)
            return undefined
          } catch {
            return '配对码必须是 6 位数字'
          }
        }}
        onSubmit={runPair}
        onCancel={onBack}
      />
    )
  }

  return (
    <PromptFrame title="无线配对" hint={SELECT_HINT}>
      {step === 'select' ? (
        <SelectList
          items={services.map(s => ({ label: `${s.host}:${s.port}`, value: s }))}
          emptyText="未发现可配对服务"
          onSelect={value => {
            setTarget(value)
            setStep('code')
          }}
        />
      ) : null}
      {step === 'running' ? <Text color={UI_COLORS.warning}>配对中…</Text> : null}
      {step === 'done' ? <Text color={UI_COLORS.success}>配对完成。</Text> : null}
      <StatusView error={error} />
    </PromptFrame>
  )
}
