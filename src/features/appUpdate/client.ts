import { NativeModules, Platform } from 'react-native';
import { Dirs, FileSystem } from 'react-native-file-access';

import {
  compareUpdateVersion,
  parseContentRange,
  parseUpdateManifest,
  selectUpdateApk,
  UPDATE_MANIFEST_URL,
  type UpdateManifest,
} from './update';

export interface InstalledVersion {
  versionCode: number;
  versionName: string;
}

export interface UpdateCheckResult {
  manifest: UpdateManifest;
  status: 'available' | 'current';
}

export interface DownloadProgress {
  bytesRead: number;
  totalBytes: number;
  resumed: boolean;
}

interface NativeUpdateModule {
  getVersion: () => Promise<InstalledVersion>;
  getSupportedAbis?: () => Promise<string[]>;
  installApk: (path: string) => Promise<void>;
}

function getNativeUpdateModule(): NativeUpdateModule | null {
  const native = NativeModules.UpdateNative as Partial<NativeUpdateModule> | undefined;
  return typeof native?.getVersion === 'function' && typeof native.installApk === 'function'
    ? (native as NativeUpdateModule)
    : null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '更新操作失败';
}

export async function getInstalledVersion(): Promise<InstalledVersion> {
  const native = getNativeUpdateModule();
  if (!native) {
    throw new Error('当前平台不支持读取应用版本');
  }
  return native.getVersion();
}

export async function checkForUpdate(
  installed: InstalledVersion,
  signal?: AbortSignal,
): Promise<UpdateCheckResult> {
  const response = await fetch(UPDATE_MANIFEST_URL, {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`检查更新失败（HTTP ${response.status}）`);
  }
  const parsedManifest = parseUpdateManifest((await response.json()) as unknown);
  const native = getNativeUpdateModule();
  const supportedAbis = native?.getSupportedAbis
    ? await native.getSupportedAbis()
    : [];
  const manifest: UpdateManifest = {
    ...parsedManifest,
    apk: selectUpdateApk(parsedManifest, supportedAbis),
  };
  return {
    manifest,
    status: compareUpdateVersion(installed.versionCode, manifest.versionCode),
  };
}

export function getUpdateApkPath(versionName: string): string {
  return `${Dirs.CacheDir}/pennyspring-update-${versionName}.apk`;
}

export async function getPartialDownloadSize(versionName: string): Promise<number> {
  try {
    return (await FileSystem.stat(getUpdateApkPath(versionName))).size;
  } catch {
    return 0;
  }
}

async function removeFile(path: string): Promise<void> {
  try {
    await FileSystem.unlink(path);
  } catch {
    // 清理失败不应覆盖下载或校验错误。
  }
}

async function verifyApk(path: string, manifest: UpdateManifest): Promise<number> {
  const stat = await FileSystem.stat(path);
  if (stat.size !== manifest.apk.size) {
    throw new Error('下载文件大小不一致，请重新下载');
  }
  const sha256 = await FileSystem.hash(path, 'SHA-256');
  if (sha256.toLowerCase() !== manifest.apk.sha256) {
    throw new Error('下载文件校验失败，请重新下载');
  }
  return stat.size;
}

function reportProgress(
  offset: number,
  totalBytes: number,
  resumed: boolean,
  onProgress: ((progress: DownloadProgress) => void) | undefined,
) {
  return (bytesRead: number): void => {
    onProgress?.({ bytesRead: offset + bytesRead, totalBytes, resumed });
  };
}

async function downloadFromStart(
  manifest: UpdateManifest,
  path: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  const response = await FileSystem.fetch(
    manifest.apk.url,
    {
      path,
      headers: { 'Accept-Encoding': 'identity' },
    },
    reportProgress(0, manifest.apk.size, false, onProgress),
  );
  if (!response.ok || response.status !== 200) {
    throw new Error(`下载更新失败（HTTP ${response.status}）`);
  }
}

export async function downloadUpdate(
  manifest: UpdateManifest,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<{ path: string; sizeBytes: number; resumed: boolean }> {
  const path = getUpdateApkPath(manifest.versionName);
  let partialBytes = 0;
  try {
    partialBytes = (await FileSystem.stat(path)).size;
  } catch {
    partialBytes = 0;
  }

  if (partialBytes > manifest.apk.size) {
    await removeFile(path);
    partialBytes = 0;
  }
  if (partialBytes === manifest.apk.size) {
    try {
      return { path, sizeBytes: await verifyApk(path, manifest), resumed: true };
    } catch (error: unknown) {
      await removeFile(path);
      throw new Error(getErrorMessage(error));
    }
  }

  let resumed = false;
  if (partialBytes > 0) {
    const rangePath = `${path}.range`;
    await removeFile(rangePath);
    try {
      const response = await FileSystem.fetch(
        manifest.apk.url,
        {
          path: rangePath,
          headers: {
            Range: `bytes=${partialBytes}-`,
            'Accept-Encoding': 'identity',
          },
        },
        reportProgress(partialBytes, manifest.apk.size, true, onProgress),
      );
      const contentRange = parseContentRange(response.getHeader('content-range'));
      if (
        response.status === 206 &&
        contentRange?.start === partialBytes &&
        contentRange.total === manifest.apk.size
      ) {
        await FileSystem.concatFiles(rangePath, path);
        resumed = true;
      } else {
        await removeFile(path);
        await downloadFromStart(manifest, path, onProgress);
      }
    } finally {
      await removeFile(rangePath);
    }
  } else {
    await downloadFromStart(manifest, path, onProgress);
  }

  try {
    const sizeBytes = await verifyApk(path, manifest);
    onProgress?.({ bytesRead: sizeBytes, totalBytes: sizeBytes, resumed });
    return { path, sizeBytes, resumed };
  } catch (error: unknown) {
    await removeFile(path);
    throw new Error(getErrorMessage(error));
  }
}

export async function installUpdate(path: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('当前仅支持 Android 安装更新');
  }
  const native = getNativeUpdateModule();
  if (!native) {
    throw new Error('当前安装包不支持安装更新，请重新构建应用');
  }
  await native.installApk(path);
}
