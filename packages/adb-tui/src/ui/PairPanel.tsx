import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { AdbClient, MdnsService } from '../adb';
import { AdbError } from '../core';
import { scanWireless, pairAndConnect, validatePairingCode } from '../features';
import { useAsync } from './useAsync';
import { SelectList } from './SelectList';
import { StatusView } from './StatusView';
import { PromptFrame, TextField } from './components';
import { RESCAN_HINT, SELECT_HINT, TEXT_HINT, UI_COLORS } from './theme';

interface PairPanelProps {
  client: AdbClient;
  onBack: () => void;
}

type Step = 'select' | 'code' | 'running' | 'done';

const NO_PAIRING_HINT =
  '请在手机上打开「无线调试 → 使用配对码配对设备」，然后按 r 重新扫描。';
const SELECT_WITH_RESCAN_HINT = `${SELECT_HINT}，r 重新扫描`;

export function PairPanel({ client, onBack }: PairPanelProps) {
  const scan = useAsync(() => scanWireless(client));
  const [step, setStep] = useState<Step>('select');
  const [target, setTarget] = useState<MdnsService | undefined>();
  const [error, setError] = useState<unknown>();

  const rescan = (failure?: unknown) => {
    setError(failure);
    setTarget(undefined);
    setStep('select');
    scan.reload();
  };

  useInput((input, key) => {
    if (step === 'running' || step === 'code') {
      return;
    }
    if (input === 'r') {
      rescan();
      return;
    }
    if (key.escape || input === 'q') {
      onBack();
    }
  });

  if (scan.loading || scan.error || !scan.data) {
    return (
      <PromptFrame title="无线配对" hint={RESCAN_HINT}>
        <StatusView
          loading={scan.loading}
          loadingText="扫描中…"
          error={scan.error}
        />
      </PromptFrame>
    );
  }

  const runPair = async (value: string) => {
    if (!target) {
      return;
    }
    setStep('running');
    try {
      await pairAndConnect(client, {
        host: target.host,
        pairPort: target.port,
        code: value,
        connectServices: scan.data!.connect,
      });
      setError(undefined);
      setStep('done');
    } catch (failure) {
      rescan(failure);
    }
  };

  if (step === 'code') {
    return (
      <TextField
        title="无线配对 · 输入配对码"
        hint={TEXT_HINT}
        error={
          error instanceof Error ? error.message : error ? '未知错误' : null
        }
        errorSuggestion={
          error instanceof AdbError ? error.suggestion : undefined
        }
        validate={value => {
          try {
            validatePairingCode(value);
            return undefined;
          } catch {
            return '配对码必须是 6 位数字';
          }
        }}
        onSubmit={runPair}
        onCancel={onBack}
      />
    );
  }

  const services = scan.data.pairing;

  return (
    <PromptFrame
      title="无线配对"
      hint={services.length > 0 ? SELECT_WITH_RESCAN_HINT : RESCAN_HINT}
    >
      {step === 'select' ? (
        services.length > 0 ? (
          <SelectList
            items={services.map(s => ({
              label: `${s.host}:${s.port}`,
              value: s,
            }))}
            emptyText="未发现可配对服务"
            onSelect={value => {
              setTarget(value);
              setError(undefined);
              setStep('code');
            }}
          />
        ) : (
          <Box flexDirection="column">
            <Text color={UI_COLORS.warning}>未发现配对服务</Text>
            <Text color={UI_COLORS.muted}>{NO_PAIRING_HINT}</Text>
          </Box>
        )
      ) : null}
      {step === 'running' ? (
        <Text color={UI_COLORS.warning}>配对中…</Text>
      ) : null}
      {step === 'done' ? (
        <Text color={UI_COLORS.success}>配对完成。</Text>
      ) : null}
      <StatusView error={error} />
    </PromptFrame>
  );
}
