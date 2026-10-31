import { NativeModules } from 'react-native'

export type LanServerState = 'idle' | 'waiting' | 'served' | 'error'

export interface LanServerStatus {
  state: LanServerState
  error: string
  servedAt: number
}

export interface LanServerInfo {
  port: number
  urls: string[]
}

interface NativeLanTransfer {
  startServer: (
    token: string,
    fileUri: string,
    fileName: string,
    timeoutMs: number,
  ) => Promise<LanServerInfo>
  stopServer: () => Promise<void>
  getStatus: () => Promise<LanServerStatus>
}

function getNativeLan(): NativeLanTransfer | null {
  const module = NativeModules.LanTransfer as
    | Partial<NativeLanTransfer>
    | undefined
  return typeof module?.startServer === 'function' &&
    typeof module?.stopServer === 'function' &&
    typeof module?.getStatus === 'function'
    ? (module as NativeLanTransfer)
    : null
}

export function isLanTransferSupported(): boolean {
  return getNativeLan() !== null
}

export function createLanToken(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function isValidLanToken(token: string): boolean {
  return /^\d{6}$/.test(token)
}

export async function startLanServer(
  token: string,
  fileUri: string,
  fileName: string,
  timeoutMs: number,
): Promise<LanServerInfo> {
  const native = getNativeLan()
  if (!native) {
    throw new Error('当前安装包不支持局域网传输，请重新构建应用')
  }
  if (!isValidLanToken(token)) {
    throw new Error('传输口令必须是 6 位数字')
  }
  return native.startServer(token, fileUri, fileName, timeoutMs)
}

export async function stopLanServer(): Promise<void> {
  const native = getNativeLan()
  if (!native) return
  await native.stopServer()
}

export async function getLanServerStatus(): Promise<LanServerStatus> {
  const native = getNativeLan()
  if (!native) {
    return { state: 'idle', error: '', servedAt: 0 }
  }
  return native.getStatus()
}

export function normalizeLanAddress(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) {
    throw new Error('请输入接收地址')
  }
  if (/^https:\/\//i.test(trimmed)) {
    throw new Error('局域网传输只支持 http 地址')
  }

  const withoutScheme = trimmed.replace(/^http:\/\//i, '')
  const pathIndex = withoutScheme.search(/[/?#]/)
  if (pathIndex !== -1) {
    const suffix = withoutScheme.slice(pathIndex)
    if (suffix !== '/') {
      throw new Error('接收地址格式不正确')
    }
  }
  const host = pathIndex === -1
    ? withoutScheme
    : withoutScheme.slice(0, pathIndex)
  if (!host || !/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) {
    throw new Error('接收地址格式不正确')
  }
  return `http://${host}`
}
