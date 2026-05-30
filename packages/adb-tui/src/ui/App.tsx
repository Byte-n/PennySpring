import React, { useState } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import { createAdbClient } from '../index'
import { SelectList } from './SelectList'
import { DeviceListPanel } from './DeviceListPanel'
import { ScanPanel } from './ScanPanel'
import { PairPanel } from './PairPanel'
import { ConnectPanel } from './ConnectPanel'
import { WatchPanel } from './WatchPanel'

type View = 'menu' | 'devices' | 'scan' | 'pair' | 'connect' | 'watch'

const MENU: ReadonlyArray<{ label: string; value: View | 'quit' }> = [
  { label: '设备列表', value: 'devices' },
  { label: '无线扫描', value: 'scan' },
  { label: '无线配对', value: 'pair' },
  { label: '无线连接', value: 'connect' },
  { label: '数据库同步', value: 'watch' },
  { label: '退出', value: 'quit' },
]

export function App() {
  const { exit } = useApp()
  const [view, setView] = useState<View>('menu')
  const { client, adbPath } = createAdbClient()

  useInput((_input, key) => {
    if (key.escape && view === 'menu') {
      exit()
    }
  })

  const back = () => setView('menu')

  if (view === 'menu') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">adb-tui</Text>
        <SelectList items={MENU} onSelect={value => (value === 'quit' ? exit() : setView(value))} />
      </Box>
    )
  }

  if (view === 'devices') {
    return <DeviceListPanel client={client} onBack={back} />
  }
  if (view === 'scan') {
    return <ScanPanel client={client} onBack={back} />
  }
  if (view === 'pair') {
    return <PairPanel client={client} onBack={back} />
  }
  if (view === 'connect') {
    return <ConnectPanel client={client} onBack={back} />
  }
  return <WatchPanel client={client} adbPath={adbPath} onBack={back} />
}
