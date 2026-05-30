import { validatePairingCode, findConnectService } from '../src/features'
import { AdbError } from '../src/core'
import type { MdnsService } from '../src/adb'

describe('validatePairingCode', () => {
  test('accepts exactly 6 digits', () => {
    expect(() => validatePairingCode('123456')).not.toThrow()
  })

  test('rejects non 6-digit input with an invalid-pairing-code error', () => {
    expect(() => validatePairingCode('12ab')).toThrow(AdbError)
    try {
      validatePairingCode('12345')
    } catch (error) {
      expect((error as AdbError).kind).toBe('invalid-pairing-code')
    }
  })
})

describe('findConnectService', () => {
  const connect: MdnsService[] = [
    { host: '192.168.1.7', port: 5555, type: 'connect' },
    { host: '192.168.1.9', port: 5556, type: 'connect' },
  ]

  test('returns the connect service matching the paired host', () => {
    expect(findConnectService(connect, '192.168.1.9')).toEqual(connect[1])
  })

  test('returns undefined when no host matches', () => {
    expect(findConnectService(connect, '10.0.0.1')).toBeUndefined()
  })
})
