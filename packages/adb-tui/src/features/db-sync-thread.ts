import { Worker } from 'node:worker_threads'
import { join } from 'node:path'
import {
  DEFAULT_INTERVAL_MS,
  DEFAULT_LOCAL_DB,
  DEFAULT_PACKAGE,
  DEFAULT_REMOTE_DB,
  type DbWatchConfig,
} from './db-watch'

interface DbSyncWorkerData {
  serial: string
  adbPath: string
  packageName: string
  remoteDb: string
  localDb: string
  intervalMs: number
}

type DbSyncWorkerMessage =
  | { type: 'pull' }
  | { type: 'error'; message: string }

interface DbSyncWorker {
  on(event: 'message', listener: (message: unknown) => void): DbSyncWorker
  on(event: 'error', listener: (error: unknown) => void): DbSyncWorker
  terminate(): Promise<number>
}

interface DbSyncThreadOptions {
  onPull: () => void
  onError: (error: unknown) => void
  createWorker?: (workerData: DbSyncWorkerData) => DbSyncWorker
}

export interface DbSyncThread {
  start(): void
  stop(): void
}

export function createDbSyncThread(config: DbWatchConfig, options: DbSyncThreadOptions): DbSyncThread {
  let worker: DbSyncWorker | undefined

  function createWorkerData(): DbSyncWorkerData {
    return {
      serial: config.serial,
      adbPath: config.adbPath,
      packageName: config.packageName ?? DEFAULT_PACKAGE,
      remoteDb: config.remoteDb ?? DEFAULT_REMOTE_DB,
      localDb: config.localDb ?? DEFAULT_LOCAL_DB,
      intervalMs: DEFAULT_INTERVAL_MS,
    }
  }

  return {
    start() {
      if (worker) {
        return
      }
      worker = (options.createWorker ?? createDefaultWorker)(createWorkerData())
      worker.on('message', message => {
        if (!isDbSyncWorkerMessage(message)) {
          options.onError(new Error('收到未知同步线程消息'))
          return
        }
        if (message.type === 'pull') {
          options.onPull()
          return
        }
        options.onError(new Error(message.message))
      })
      worker.on('error', options.onError)
    },
    stop() {
      if (!worker) {
        return
      }
      worker.terminate().catch(options.onError)
      worker = undefined
    },
  }
}

function createDefaultWorker(workerData: DbSyncWorkerData): DbSyncWorker {
  return new Worker(join(__dirname, 'db-sync-worker.cjs'), { workerData })
}

function isDbSyncWorkerMessage(message: unknown): message is DbSyncWorkerMessage {
  if (!message || typeof message !== 'object' || !('type' in message)) {
    return false
  }
  if (message.type === 'pull') {
    return true
  }
  return message.type === 'error' && 'message' in message && typeof message.message === 'string'
}
