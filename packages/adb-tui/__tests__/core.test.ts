import { resolveAdbPath, AdbError } from '../src/core'

describe('resolveAdbPath', () => {
  test('returns ADB_PATH when the file exists', () => {
    const path = resolveAdbPath({ ADB_PATH: '/custom/adb' }, p => p === '/custom/adb')

    expect(path).toBe('/custom/adb')
  })

  test('falls back to ANDROID_HOME platform-tools when ADB_PATH is unset', () => {
    const path = resolveAdbPath(
      { ANDROID_HOME: '/sdk' },
      p => p === '/sdk/platform-tools/adb',
    )

    expect(path).toBe('/sdk/platform-tools/adb')
  })

  test('falls back to the bare "adb" command when no SDK path resolves', () => {
    const path = resolveAdbPath({ HOME: '/home/me' }, () => false)

    expect(path).toBe('adb')
  })
})

describe('AdbError', () => {
  test('attaches a default suggestion for the given kind', () => {
    const error = new AdbError('unauthorized')

    expect(error.kind).toBe('unauthorized')
    expect(error.suggestion).toContain('未授权')
  })

  test('uses a custom suggestion when provided', () => {
    const error = new AdbError('pair-failed', { suggestion: '换个端口' })

    expect(error.suggestion).toBe('换个端口')
  })
})
