import { NativeModules } from 'react-native';

import {
  buildPeerMessageUrl,
  createSessionToken,
  isValidPeerHost,
  parseLanPeer,
  type LanMessage,
  type LanPeer,
  type LanPlatform,
} from './lanProtocol';

const MESSAGE_TIMEOUT_MS = 8000;

export interface LanSessionInfo {
  id: string;
  name: string;
  platform: LanPlatform;
  nonce: string;
  host: string;
  port: number;
  urls: string[];
}

export interface LanMessageEnvelope {
  id: string;
  body: string;
  receivedAt: number;
}

export type LanServerState = 'idle' | 'serving' | 'error';

export interface LanServerStatus {
  state: LanServerState;
  error: string;
  servedAt: number;
}

interface NativeLanTransfer {
  startSession: (timeoutMs: number) => Promise<LanSessionInfo>;
  stopSession: () => Promise<void>;
  getNearby: () => Promise<LanPeer[]>;
  getMessages: () => Promise<LanMessageEnvelope[]>;
  clearMessages: (ids: string[]) => Promise<void>;
  setPackage: (
    fileUri: string,
    fileName: string,
    token: string,
  ) => Promise<void>;
  getStatus: () => Promise<LanServerStatus>;
  randomToken: () => Promise<string>;
}

function getNativeLan(): NativeLanTransfer | null {
  const module = NativeModules.LanTransfer as
    Partial<NativeLanTransfer> | undefined;
  const methods = [
    'startSession',
    'stopSession',
    'getNearby',
    'getMessages',
    'clearMessages',
    'setPackage',
    'getStatus',
    'randomToken',
  ] as const;

  if (!module) return null;
  if (methods.some(method => typeof module[method] !== 'function')) return null;
  return module as NativeLanTransfer;
}

export function isLanTransferSupported(): boolean {
  return getNativeLan() !== null;
}

function requireNative(): NativeLanTransfer {
  const native = getNativeLan();
  if (!native) {
    throw new Error('当前安装包不支持局域网发现，请重新构建应用');
  }
  return native;
}

function isSessionInfo(value: unknown): value is LanSessionInfo {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    (record.platform === 'ios' || record.platform === 'android') &&
    typeof record.nonce === 'string' &&
    typeof record.host === 'string' &&
    typeof record.port === 'number' &&
    Array.isArray(record.urls)
  );
}

function isMessageEnvelope(value: unknown): value is LanMessageEnvelope {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.body === 'string' &&
    typeof record.receivedAt === 'number'
  );
}

export function toLanPeer(info: LanSessionInfo): LanPeer {
  return {
    id: info.id,
    name: info.name,
    platform: info.platform,
    nonce: info.nonce,
    host: info.host,
    port: info.port,
  };
}

export async function startLanSession(
  timeoutMs: number,
): Promise<LanSessionInfo> {
  const result = await requireNative().startSession(timeoutMs);
  if (!isSessionInfo(result)) {
    throw new Error('局域网服务返回了无效的会话信息');
  }
  return result;
}

export async function stopLanSession(): Promise<void> {
  const native = getNativeLan();
  if (!native) return;
  await native.stopSession();
}

export async function getLanNearby(): Promise<LanPeer[]> {
  const native = getNativeLan();
  if (!native) return [];
  const peers = await native.getNearby();
  const result: LanPeer[] = [];
  const seen = new Set<string>();

  for (const value of peers) {
    const peer = parseLanPeer(value);
    if (!peer) continue;
    if (!isValidPeerHost(peer.host)) continue;
    if (seen.has(peer.id)) continue;
    seen.add(peer.id);
    result.push(peer);
  }
  return result;
}

export async function getLanMessages(): Promise<LanMessageEnvelope[]> {
  const native = getNativeLan();
  if (!native) return [];
  const messages = await native.getMessages();
  return messages.filter(isMessageEnvelope);
}

export async function clearLanMessages(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const native = getNativeLan();
  if (!native) return;
  await native.clearMessages(ids);
}

export async function setLanPackage(
  fileUri: string,
  fileName: string,
  token: string,
): Promise<void> {
  await requireNative().setPackage(fileUri, fileName, token);
}

export async function getLanServerStatus(): Promise<LanServerStatus> {
  const native = getNativeLan();
  if (!native) {
    return { state: 'idle', error: '', servedAt: 0 };
  }
  return native.getStatus();
}

export async function createLanSessionToken(): Promise<string> {
  const native = getNativeLan();
  if (!native) return createSessionToken();
  const token = await native.randomToken();
  if (!/^[0-9a-f]{32}$/.test(token)) {
    return createSessionToken();
  }
  return token;
}

export async function sendLanMessage(
  peer: LanPeer,
  message: LanMessage,
): Promise<void> {
  if (!isValidPeerHost(peer.host)) {
    throw new Error('对方设备地址不正确');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MESSAGE_TIMEOUT_MS);

  try {
    const response = await fetch(buildPeerMessageUrl(peer), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`发送消息失败（HTTP ${response.status}）`);
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('连接对方超时，请确认两台设备仍在同一 Wi-Fi');
    }
    if (error instanceof Error && error.message.startsWith('发送消息失败')) {
      throw error;
    }
    throw new Error('无法连接对方设备，请确认两台设备仍在同一 Wi-Fi');
  } finally {
    clearTimeout(timer);
  }
}
