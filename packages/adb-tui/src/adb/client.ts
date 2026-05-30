import { spawn } from 'node:child_process'
import { AdbError, type AdbRunner } from '../core'
import { parseDeviceList, parseMdnsServices } from './parse'
import type { AdbDevice, MdnsScanResult } from './types'

export type MdnsCollector = (adbPath: string, durationMs: number) => Promise<string>

const SCAN_DURATION_MS = 5000

const defaultCollector: MdnsCollector = (adbPath, durationMs) =>
  new Promise(resolve => {
    const child = spawn(adbPath, ['mdns', 'services'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    const onData = (chunk: Buffer) => {
      out += chunk.toString()
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    setTimeout(() => {
      child.kill()
      resolve(out)
    }, durationMs)
  })

export interface AdbClientOptions {
  adbPath: string
  collector?: MdnsCollector
}

export class AdbClient {
  private readonly adbPath: string
  private readonly collector: MdnsCollector

  constructor(private readonly runner: AdbRunner, options: AdbClientOptions) {
    this.adbPath = options.adbPath
    this.collector = options.collector ?? defaultCollector
  }

  async devices(): Promise<AdbDevice[]> {
    const { stdout } = await this.runner.run(['devices', '-l'])
    return parseDeviceList(stdout)
  }

  async shell(serial: string, command: readonly string[]): Promise<string> {
    const { stdout } = await this.runner.run(['-s', serial, 'shell', ...command])
    return stdout
  }

  async scanMdns(durationMs: number = SCAN_DURATION_MS): Promise<MdnsScanResult> {
    const raw = await this.collector(this.adbPath, durationMs)
    return parseMdnsServices(raw)
  }

  async pair(host: string, port: number, code: string): Promise<void> {
    const { stdout, stderr } = await this.runner.run(['pair', `${host}:${port}`, code])
    if (!stdout.includes('Successfully paired')) {
      throw new AdbError('pair-failed', { message: stderr || stdout })
    }
  }

  async connect(host: string, port: number): Promise<void> {
    const { stdout, stderr } = await this.runner.run(['connect', `${host}:${port}`])
    if (!stdout.includes('connected')) {
      throw new AdbError('connect-failed', { message: stderr || stdout })
    }
  }

  async disconnect(host: string, port: number): Promise<void> {
    await this.runner.run(['disconnect', `${host}:${port}`])
  }
}
