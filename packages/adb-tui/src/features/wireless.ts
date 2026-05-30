import { AdbError } from '../core'
import type { AdbClient, MdnsScanResult, MdnsService } from '../adb'

const PAIRING_CODE_RE = /^\d{6}$/

export function validatePairingCode(code: string): void {
  if (!PAIRING_CODE_RE.test(code)) {
    throw new AdbError('invalid-pairing-code')
  }
}

export function findConnectService(
  connect: readonly MdnsService[],
  host: string,
): MdnsService | undefined {
  return connect.find(service => service.host === host)
}

export async function scanWireless(client: AdbClient): Promise<MdnsScanResult> {
  const result = await client.scanMdns()
  if (result.pairing.length === 0 && result.connect.length === 0) {
    throw new AdbError('scan-empty')
  }
  return result
}

export interface PairAndConnectInput {
  host: string
  pairPort: number
  code: string
  connectServices: readonly MdnsService[]
}

export async function pairAndConnect(client: AdbClient, input: PairAndConnectInput): Promise<void> {
  validatePairingCode(input.code)
  await client.pair(input.host, input.pairPort, input.code)
  const connectService = findConnectService(input.connectServices, input.host)
  if (connectService) {
    await client.connect(connectService.host, connectService.port)
  }
}
