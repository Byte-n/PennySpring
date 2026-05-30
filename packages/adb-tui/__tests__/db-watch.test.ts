import { createDbWatcher } from '../src/features'
import { AdbError } from '../src/core'

describe('db watch', () => {
  function makeDeps() {
    const reads: string[] = []
    return {
      reads,
      readMtime: jest.fn<Promise<string | null>, []>(),
      pull: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
    }
  }

  test('pull throws remote-db-missing when mtime is null', async () => {
    const deps = makeDeps()
    deps.readMtime.mockResolvedValue(null)
    const watcher = createDbWatcher({ readMtime: deps.readMtime, pull: deps.pull })

    await expect(watcher.pullOnce()).rejects.toThrow(AdbError)
    expect(deps.pull).not.toHaveBeenCalled()
  })

  test('pullOnce pulls when the remote file exists', async () => {
    const deps = makeDeps()
    deps.readMtime.mockResolvedValue('111')
    const watcher = createDbWatcher({ readMtime: deps.readMtime, pull: deps.pull })

    await watcher.pullOnce()

    expect(deps.pull).toHaveBeenCalledTimes(1)
  })

  test('tick only pulls when mtime changes', async () => {
    const deps = makeDeps()
    deps.readMtime
      .mockResolvedValueOnce('100')
      .mockResolvedValueOnce('100')
      .mockResolvedValueOnce('200')
    const watcher = createDbWatcher({ readMtime: deps.readMtime, pull: deps.pull })

    expect(await watcher.tick()).toBe(true)
    expect(await watcher.tick()).toBe(false)
    expect(await watcher.tick()).toBe(true)
    expect(deps.pull).toHaveBeenCalledTimes(2)
  })
})
