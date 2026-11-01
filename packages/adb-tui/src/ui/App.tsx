import React, { useEffect, useState } from 'react';
import { useApp, useInput } from 'ink';
import { createAdbClient } from '../index';
import { createDbSyncThread } from '../features/db-sync-thread';
import { SelectList } from './SelectList';
import { DeviceListPanel } from './DeviceListPanel';
import { ScanPanel } from './ScanPanel';
import { PairPanel } from './PairPanel';
import { ConnectPanel } from './ConnectPanel';
import { WatchPanel } from './WatchPanel';
import { PromptFrame } from './components';
import { SELECT_HINT } from './theme';
import { useDbSync } from './useDbSync';
import { formatSyncTitle } from './sync-title';
import { SyncStatusProvider } from './SyncStatusContext';

const SYNC_TICK_MS = 1_000;

type View = 'menu' | 'devices' | 'scan' | 'pair' | 'connect' | 'watch';

const MENU: ReadonlyArray<{ label: string; value: View | 'quit' }> = [
  { label: '设备列表', value: 'devices' },
  { label: '无线扫描', value: 'scan' },
  { label: '无线配对', value: 'pair' },
  { label: '无线连接', value: 'connect' },
  { label: '数据库同步', value: 'watch' },
  { label: '退出', value: 'quit' },
];

export function App() {
  const { exit } = useApp();
  const [view, setView] = useState<View>('menu');
  const { client, adbPath } = createAdbClient();
  const sync = useDbSync({ adbPath, createThread: createDbSyncThread });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (sync.summary.length === 0) {
      return undefined;
    }
    const timer = setInterval(() => setNow(Date.now()), SYNC_TICK_MS);
    return () => clearInterval(timer);
  }, [sync.summary.length]);

  const syncStatus = formatSyncTitle(sync.summary, now);

  useInput((_input, key) => {
    if (key.escape && view === 'menu') {
      exit();
    }
  });

  const back = () => setView('menu');

  const renderView = () => {
    if (view === 'menu') {
      return (
        <PromptFrame title="主菜单" hint={SELECT_HINT}>
          <SelectList
            items={MENU.map(item => ({
              ...item,
              color: item.value === 'quit' ? 'gray' : 'cyan',
            }))}
            onSelect={value => (value === 'quit' ? exit() : setView(value))}
          />
        </PromptFrame>
      );
    }
    if (view === 'devices') {
      return <DeviceListPanel client={client} onBack={back} />;
    }
    if (view === 'scan') {
      return <ScanPanel client={client} onBack={back} />;
    }
    if (view === 'pair') {
      return <PairPanel client={client} onBack={back} />;
    }
    if (view === 'connect') {
      return <ConnectPanel client={client} onBack={back} />;
    }
    return <WatchPanel client={client} sync={sync} onBack={back} />;
  };

  return (
    <SyncStatusProvider status={syncStatus}>{renderView()}</SyncStatusProvider>
  );
}
