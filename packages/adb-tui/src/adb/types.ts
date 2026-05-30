export type DeviceTransport = 'usb' | 'wifi' | 'emulator'

export type DeviceState = 'device' | 'unauthorized' | 'offline' | 'unknown'

export interface AdbDevice {
  serial: string
  state: DeviceState
  transport: DeviceTransport
  product?: string
  model?: string
}

export type MdnsServiceType = 'pairing' | 'connect'

export interface MdnsService {
  host: string
  port: number
  type: MdnsServiceType
}

export interface MdnsScanResult {
  pairing: MdnsService[]
  connect: MdnsService[]
}
