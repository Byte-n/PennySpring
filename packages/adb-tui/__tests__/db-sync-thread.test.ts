import { createDbSyncThread } from '../src/features/db-sync-thread'

describe('db sync thread', () => {
  class FakeWorker {
    readonly workerData: unknown
    readonly listeners = new Map<string, Array<(payload: unknown) => void>>()
    readonly terminate = jest.fn<Promise<number>, []>().mockResolvedValue(0)

    constructor(workerData: unknown) {
      this.workerData = workerData
    }

    on(event: string, listener: (payload: unknown) => void): this {
      const listeners = this.listeners.get(event) ?? []
      this.listeners.set(event, [...listeners, listener])
      return this
    }

    emit(event: string, payload: unknown): void {
      this.listeners.get(event)?.forEach(listener => listener(payload))
    }
  }

  test('starts a worker thread and forwards pull messages', () => {
    const workers: FakeWorker[] = []
    const onPull = jest.fn()
    const onError = jest.fn()

    const thread = createDbSyncThread(
      {
        serial: 'emulator-5554',
        adbPath: '/sdk/adb',
      },
      {
        onPull,
        onError,
        createWorker: workerData => {
          const worker = new FakeWorker(workerData)
          workers.push(worker)
          return worker
        },
      },
    )

    thread.start()
    workers[0].emit('message', { type: 'pull' })

    expect(workers).toHaveLength(1)
    expect(workers[0].workerData).toMatchObject({
      serial: 'emulator-5554',
      adbPath: '/sdk/adb',
    })
    expect(onPull).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('terminates the worker thread when stopped', () => {
    const workers: FakeWorker[] = []
    const thread = createDbSyncThread(
      {
        serial: 'emulator-5554',
        adbPath: '/sdk/adb',
      },
      {
        onPull: jest.fn(),
        onError: jest.fn(),
        createWorker: workerData => {
          const worker = new FakeWorker(workerData)
          workers.push(worker)
          return worker
        },
      },
    )

    thread.start()
    thread.stop()

    expect(workers[0].terminate).toHaveBeenCalledTimes(1)
  })
})
