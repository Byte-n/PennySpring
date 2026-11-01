import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type AdbErrorKind =
  | 'adb-not-found'
  | 'no-devices'
  | 'unauthorized'
  | 'scan-empty'
  | 'invalid-pairing-code'
  | 'pair-failed'
  | 'connect-failed'
  | 'remote-db-missing'
  | 'run-as-denied'
  | 'command-failed';

const SUGGESTIONS: Record<AdbErrorKind, string> = {
  'adb-not-found':
    '请确认 adb 已安装并加入 PATH，或设置 ANDROID_HOME / ADB_PATH。',
  'no-devices': '当前没有可用设备，请先通过 USB 或无线连接设备。',
  unauthorized: '设备未授权，请在设备上确认调试授权弹窗。',
  'scan-empty': '未扫描到无线调试服务，请在设备上打开“无线调试”。',
  'invalid-pairing-code': '配对码必须是 6 位数字。',
  'pair-failed': '配对失败，请检查配对码与配对端口是否正确。',
  'connect-failed': '连接失败，请检查目标地址与端口，或重新配对。',
  'remote-db-missing': '远端数据库文件不存在，请确认包名与数据库路径。',
  'run-as-denied': 'run-as 权限不足，请确认应用为 debuggable 构建。',
  'command-failed': 'adb 命令执行失败，请检查设备状态后重试。',
};

export interface AdbErrorOptions {
  message?: string;
  suggestion?: string;
  cause?: unknown;
}

export class AdbError extends Error {
  readonly kind: AdbErrorKind;
  readonly suggestion: string;
  readonly cause?: unknown;

  constructor(kind: AdbErrorKind, options: AdbErrorOptions = {}) {
    super(options.message ?? kind);
    this.name = 'AdbError';
    this.kind = kind;
    this.suggestion = options.suggestion ?? SUGGESTIONS[kind];
    this.cause = options.cause;
  }
}

export interface ResolveAdbEnv {
  ADB_PATH?: string;
  ANDROID_HOME?: string;
  HOME?: string;
}

export function resolveAdbPath(
  env: ResolveAdbEnv,
  fileExists: (path: string) => boolean = existsSync,
): string {
  if (env.ADB_PATH && fileExists(env.ADB_PATH)) {
    return env.ADB_PATH;
  }

  const sdkRoot =
    env.ANDROID_HOME ??
    (env.HOME ? join(env.HOME, 'Library/Android/sdk') : undefined);
  if (sdkRoot) {
    const candidate = join(sdkRoot, 'platform-tools', 'adb');
    if (fileExists(candidate)) {
      return candidate;
    }
  }

  return 'adb';
}
