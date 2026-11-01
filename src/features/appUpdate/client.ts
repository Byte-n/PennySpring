import { NativeModules, Platform } from 'react-native';
import { Dirs, FileSystem } from 'react-native-file-access';

import {
  compareUpdateVersion,
  parseContentRange,
  parseGitHubReleases,
  selectUpdateApk,
  type UpdateApk,
  type UpdateCheckResult,
  type UpdateRelease,
} from './update';

export interface InstalledVersion {
  versionCode: number;
  versionName: string;
}

export interface DownloadProgress {
  bytesRead: number;
  totalBytes: number;
  resumed: boolean;
}

const GITHUB_RELEASES_URL =
  'https://api.github.com/repos/Byte-n/PennySpring/releases';
const GITHUB_RELEASES_PAGE_SIZE = 100;

export type ExistingDownload =
  | { status: 'none' }
  | { status: 'partial'; path: string; sizeBytes: number }
  | { status: 'complete'; path: string; sizeBytes: number };

interface NativeUpdateModule {
  getVersion: () => Promise<InstalledVersion>;
  getSupportedAbis: () => Promise<string[]>;
  installApk: (path: string) => Promise<void>;
}

function getNativeUpdateModule(): NativeUpdateModule | null {
  const native = NativeModules.UpdateNative as
    Partial<NativeUpdateModule> | undefined;
  return typeof native?.getVersion === 'function' &&
    typeof native.getSupportedAbis === 'function' &&
    typeof native.installApk === 'function'
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

async function fetchReleases(
  installedVersionCode: number,
  signal?: AbortSignal,
): Promise<UpdateRelease[]> {
  const releasesByVersion = new Map<number, UpdateRelease>();
  let page = 1;
  let reachedInstalledVersion = false;

  while (!reachedInstalledVersion) {
    const response = await fetch(
      `${GITHUB_RELEASES_URL}?per_page=${GITHUB_RELEASES_PAGE_SIZE}&page=${page}`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        signal,
      },
    );
    if (!response.ok) {
      throw new Error(`检查更新失败（HTTP ${response.status}）`);
    }
    const value = (await response.json()) as unknown;
    for (const release of parseGitHubReleases(value)) {
      releasesByVersion.set(release.versionCode, release);
      if (release.versionCode <= installedVersionCode) {
        reachedInstalledVersion = true;
      }
    }
    if (!Array.isArray(value) || value.length < GITHUB_RELEASES_PAGE_SIZE)
      break;
    page += 1;
  }

  return [...releasesByVersion.values()].sort(
    (left, right) => left.versionCode - right.versionCode,
  );
}

export async function checkForUpdate(
  installed: InstalledVersion,
  signal?: AbortSignal,
): Promise<UpdateCheckResult> {
  const releases = await fetchReleases(installed.versionCode, signal);
  const latest = releases[releases.length - 1];
  if (!latest) {
    throw new Error('未找到可用的正式版本');
  }
  if (
    compareUpdateVersion(installed.versionCode, latest.versionCode) ===
    'current'
  ) {
    return { status: 'current' };
  }

  const native = getNativeUpdateModule();
  const supportedAbis = native ? await native.getSupportedAbis() : [];
  return {
    status: 'available',
    release: latest,
    apk: selectUpdateApk(latest, supportedAbis),
    releaseNotes: releases.filter(
      release =>
        release.versionCode > installed.versionCode &&
        release.versionCode <= latest.versionCode,
    ),
  };
}

export function getUpdateApkPath(versionName: string, sha256: string): string {
  return `${Dirs.CacheDir}/pennyspring-update-${versionName}-${sha256.toLowerCase()}.apk`;
}

async function removeFile(path: string): Promise<void> {
  try {
    await FileSystem.unlink(path);
  } catch {
    // 清理失败不应覆盖下载或校验错误。
  }
}

async function verifyApk(path: string, apk: UpdateApk): Promise<number> {
  const stat = await FileSystem.stat(path);
  if (stat.size !== apk.size) {
    throw new Error('下载文件大小不一致，请重新下载');
  }
  const sha256 = await FileSystem.hash(path, 'SHA-256');
  if (sha256.toLowerCase() !== apk.sha256) {
    throw new Error('下载文件校验失败，请重新下载');
  }
  return stat.size;
}

export async function getExistingDownload(
  apk: UpdateApk,
  versionName: string,
): Promise<ExistingDownload> {
  const path = getUpdateApkPath(versionName, apk.sha256);
  let sizeBytes: number;
  try {
    sizeBytes = (await FileSystem.stat(path)).size;
  } catch {
    return { status: 'none' };
  }

  if (sizeBytes <= 0 || sizeBytes > apk.size) {
    if (sizeBytes > apk.size) await removeFile(path);
    return { status: 'none' };
  }
  if (sizeBytes < apk.size) {
    return { status: 'partial', path, sizeBytes };
  }
  return { status: 'complete', path, sizeBytes };
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
  apk: UpdateApk,
  path: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  const response = await FileSystem.fetch(
    apk.url,
    {
      path,
      headers: { 'Accept-Encoding': 'identity' },
    },
    reportProgress(0, apk.size, false, onProgress),
  );
  if (!response.ok || response.status !== 200) {
    throw new Error(`下载更新失败（HTTP ${response.status}）`);
  }
}

export async function downloadUpdate(
  apk: UpdateApk,
  versionName: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<{ path: string; sizeBytes: number; resumed: boolean }> {
  const path = getUpdateApkPath(versionName, apk.sha256);
  let partialBytes = 0;
  try {
    partialBytes = (await FileSystem.stat(path)).size;
  } catch {
    partialBytes = 0;
  }

  if (partialBytes > apk.size) {
    await removeFile(path);
    partialBytes = 0;
  }
  if (partialBytes === apk.size) {
    try {
      return { path, sizeBytes: await verifyApk(path, apk), resumed: true };
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
        apk.url,
        {
          path: rangePath,
          headers: {
            Range: `bytes=${partialBytes}-`,
            'Accept-Encoding': 'identity',
          },
        },
        reportProgress(partialBytes, apk.size, true, onProgress),
      );
      const contentRange = parseContentRange(
        response.getHeader('content-range'),
      );
      if (
        response.status === 206 &&
        contentRange?.start === partialBytes &&
        contentRange.total === apk.size
      ) {
        await FileSystem.concatFiles(rangePath, path);
        resumed = true;
      } else {
        await removeFile(path);
        await downloadFromStart(apk, path, onProgress);
      }
    } finally {
      await removeFile(rangePath);
    }
  } else {
    await downloadFromStart(apk, path, onProgress);
  }

  try {
    const sizeBytes = await verifyApk(path, apk);
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
