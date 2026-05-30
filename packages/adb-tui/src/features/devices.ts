import { AdbError } from '../core'
import type { AdbClient, AdbDevice } from '../adb'

export async function listDevices(client: AdbClient): Promise<AdbDevice[]> {
  const devices = await client.devices()
  if (devices.length === 0) {
    throw new AdbError('no-devices')
  }
  return devices
}
