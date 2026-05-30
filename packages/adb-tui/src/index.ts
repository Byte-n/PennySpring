import { resolveAdbPath, createAdbRunner, type ResolveAdbEnv } from './core'
import { AdbClient } from './adb'

export * from './core'
export * from './adb'
export * from './features'

export function createAdbClient(env: ResolveAdbEnv = process.env): { client: AdbClient; adbPath: string } {
  const adbPath = resolveAdbPath(env)
  const client = new AdbClient(createAdbRunner(adbPath), { adbPath })
  return { client, adbPath }
}
