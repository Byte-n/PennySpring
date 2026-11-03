import { toByteArray } from 'base64-js';
import { Dirs, FileSystem } from 'react-native-file-access';

import { buildPackageUrl, isValidPeerHost, type LanPeer } from './lanProtocol';

export interface LanDownloadProgress {
  bytesRead: number;
  contentLength: number;
  done: boolean;
}

export interface LanDownloadResult {
  bytes: Uint8Array;
  sizeBytes: number;
  cleanup: () => Promise<void>;
}

function createProgressHandler(
  onProgress?: (progress: LanDownloadProgress) => void,
) {
  return (bytesRead: number, contentLength: number, done: boolean): void => {
    onProgress?.({ bytesRead, contentLength, done });
  };
}

export async function downloadLanPackage(
  peer: LanPeer,
  sessionToken: string,
  onProgress?: (progress: LanDownloadProgress) => void,
): Promise<LanDownloadResult> {
  if (!sessionToken) {
    throw new Error('传输会话已失效，请重新配对');
  }
  if (!isValidPeerHost(peer.host)) {
    throw new Error('对方设备地址不正确');
  }

  const path = `${Dirs.CacheDir}/lan-${Date.now()}.psb`;
  const url = buildPackageUrl(peer, sessionToken);

  const cleanup = async (): Promise<void> => {
    try {
      await FileSystem.unlink(path);
    } catch {
      // 临时文件清理失败不影响导入。
    }
  };

  try {
    const result = await FileSystem.fetch(
      url,
      { path },
      createProgressHandler(onProgress),
    );
    if (result.status === 403) {
      throw new Error('传输会话已失效，请重新配对');
    }
    if (!result.ok) {
      throw new Error(`接收失败（HTTP ${result.status}）`);
    }
    const base64 = await FileSystem.readFile(path, 'base64');
    const bytes = toByteArray(base64);
    return { bytes, sizeBytes: bytes.byteLength, cleanup };
  } catch (error: unknown) {
    await cleanup();
    throw error;
  }
}
