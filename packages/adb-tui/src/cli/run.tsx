import React from 'react'
import { render } from 'ink'
import { AdbError } from '../core'
import { createAdbClient } from '../index'
import {
  listDevices,
  scanWireless,
  pairAndConnect,
  createAdbDbWatcher,
  validatePairingCode,
  DEFAULT_INTERVAL_MS,
} from '../features'
import { App } from '../ui/App'
import { parseArgs } from './parseArgs'
import { prompt } from './prompt'

export async function run(argv: readonly string[]): Promise<void> {
  const parsed = parseArgs(argv)

  if (parsed.command === 'tui') {
    render(<App />)
    return
  }

  try {
    await dispatch(parsed)
  } catch (error) {
    reportError(error)
    process.exitCode = 1
  }
}

async function dispatch(parsed: Exclude<ReturnType<typeof parseArgs>, { command: 'tui' }>): Promise<void> {
  const { client, adbPath } = createAdbClient()

  switch (parsed.command) {
    case 'devices': {
      const devices = await listDevices(client)
      for (const d of devices) {
        process.stdout.write(`${d.serial}\t${d.transport}\t${d.state}\t${d.model ?? ''}\n`)
      }
      return
    }
    case 'wifi:scan': {
      const result = await scanWireless(client)
      process.stdout.write('pairing:\n')
      result.pairing.forEach(s => process.stdout.write(`  ${s.host}:${s.port}\n`))
      process.stdout.write('connect:\n')
      result.connect.forEach(s => process.stdout.write(`  ${s.host}:${s.port}\n`))
      return
    }
    case 'wifi:pair': {
      const result = await scanWireless(client)
      const services = result.pairing.length > 0 ? result.pairing : result.connect
      const target = services[0]
      if (!target) {
        throw new AdbError('scan-empty')
      }
      const code = await prompt(`配对码（6 位，目标 ${target.host}:${target.port}）：`)
      validatePairingCode(code)
      await pairAndConnect(client, {
        host: target.host,
        pairPort: target.port,
        code,
        connectServices: result.connect,
      })
      process.stdout.write('配对完成。\n')
      return
    }
    case 'wifi:connect': {
      const result = await scanWireless(client)
      const target = result.connect[0]
      if (!target) {
        throw new AdbError('scan-empty')
      }
      await client.connect(target.host, target.port)
      process.stdout.write(`已连接 ${target.host}:${target.port}\n`)
      return
    }
    case 'db:watch': {
      const serial = parsed.serial ?? (await firstSerial(client))
      const watcher = createAdbDbWatcher(client, { serial, adbPath })
      if (parsed.once) {
        await watcher.pullOnce()
        process.stdout.write('已拉取一次。\n')
        return
      }
      const controller = new AbortController()
      process.on('SIGINT', () => controller.abort())
      process.stdout.write(`持续同步 ${serial}（Ctrl+C 退出）…\n`)
      await watcher.watch(DEFAULT_INTERVAL_MS, controller.signal, () => {
        process.stdout.write(`[${new Date().toLocaleTimeString('zh-CN')}] 已更新\n`)
      })
      return
    }
    case 'unknown':
      process.stderr.write(`未知命令：${parsed.raw}\n`)
      process.exitCode = 1
  }
}

async function firstSerial(client: ReturnType<typeof createAdbClient>['client']): Promise<string> {
  const devices = await listDevices(client)
  return devices[0].serial
}

function reportError(error: unknown): void {
  if (error instanceof AdbError) {
    process.stderr.write(`错误：${error.message === error.kind ? error.suggestion : error.message}\n`)
    process.stderr.write(`建议：${error.suggestion}\n`)
    return
  }
  process.stderr.write(`错误：${error instanceof Error ? error.message : '未知错误'}\n`)
}
