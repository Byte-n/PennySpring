import { createWriteStream } from 'node:fs'
import { spawn } from 'node:child_process'
import { AdbError } from '../core'
import type { AdbClient } from '../adb'

export const DEFAULT_PACKAGE = 'com.pennyspring'
export const DEFAULT_REMOTE_DB = '/data/data/com.pennyspring/databases/pennyspring.db'
export const DEFAULT_LOCAL_DB = './pennyspring.db'
export const DEFAULT_INTERVAL_MS = 2000

export interface DbWatcherDeps {
  readMtime: () => Promise<string | null>
  pull: () => Promise<void>
}

export interface DbWatcher {
  pullOnce(): Promise<void>
  tick(): Promise<boolean>
  watch(intervalMs: number, signal: AbortSignal, onPull?: () => void): Promise<void>
}

export function createDbWatcher(deps: DbWatcherDeps): DbWatcher {
  let last: string | null = null

  async function requireMtime(): Promise<string> {
    const mtime = await deps.readMtime()
    if (!mtime) {
      throw new AdbError('remote-db-missing')
    }
    return mtime
  }

  return {
    async pullOnce() {
      await requireMtime()
      await deps.pull()
    },
    async tick() {
      const mtime = await deps.readMtime()
      if (!mtime || mtime === last) {
        return false
      }
      await deps.pull()
      last = mtime
      return true
    },
    async watch(intervalMs, signal, onPull) {
      while (!signal.aborted) {
        if (await this.tick()) {
          onPull?.()
        }
        await delay(intervalMs, signal)
      }
    },
  }
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

export interface DbWatchConfig {
  serial: string
  adbPath: string
  packageName?: string
  remoteDb?: string
  localDb?: string
}

export function createAdbDbWatcher(client: AdbClient, config: DbWatchConfig): DbWatcher {
  const packageName = config.packageName ?? DEFAULT_PACKAGE
  const remoteDb = config.remoteDb ?? DEFAULT_REMOTE_DB
  const localDb = config.localDb ?? DEFAULT_LOCAL_DB

  return createDbWatcher({
    async readMtime() {
      const out = await client.shell(config.serial, [
        'run-as',
        packageName,
        'stat',
        '-c',
        '%Y',
        remoteDb,
      ])
      return out.trim() || null
    },
    pull() {
      return pullViaRunAs(config.adbPath, config.serial, packageName, remoteDb, localDb)
    },
  })
}

function pullViaRunAs(
  adbPath: string,
  serial: string,
  packageName: string,
  remoteDb: string,
  localDb: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(adbPath, ['-s', serial, 'shell', 'run-as', packageName, 'cat', remoteDb], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stderr = ''
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.stdout.pipe(createWriteStream(localDb))
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new AdbError('run-as-denied', { message: stderr.trim() }))
      }
    })
  })
}
