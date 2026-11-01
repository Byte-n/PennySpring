export const UPDATE_MANIFEST_URL =
  'https://github.com/Byte-n/PennySpring/releases/latest/download/latest.json';

const RELEASE_DOWNLOAD_PREFIX =
  'https://github.com/Byte-n/PennySpring/releases/download/';
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const RELEASE_TITLE_PATTERN = /^PennySpring (\d+\.\d+\.\d+)$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

export const UPDATE_APK_ABIS = ['arm64-v8a', 'armeabi-v7a'] as const;
export type UpdateApkAbi = (typeof UPDATE_APK_ABIS)[number];

export interface UpdateApk {
  url: string;
  size: number;
  sha256: string;
}

export interface UpdateReleaseNotes {
  versionName: string;
  versionCode: number;
  publishedAt: string;
  notes: string;
}

interface GitHubRelease {
  name?: unknown;
  published_at?: unknown;
  body?: unknown;
  draft?: unknown;
  prerelease?: unknown;
}

export interface UpdateManifest {
  formatVersion: number;
  versionName: string;
  versionCode: number;
  publishedAt: string;
  notes: string;
  apk: UpdateApk;
  apks?: Partial<Record<UpdateApkAbi, UpdateApk>>;
  releaseNotes?: UpdateReleaseNotes[];
}

export type UpdateVersionStatus = 'available' | 'current';

export interface ContentRange {
  start: number;
  end: number;
  total: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requireString(value: unknown, message: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(message);
  }
  return value;
}

function requirePositiveInteger(value: unknown, message: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(message);
  }
  return value;
}

export function isTrustedApkUrl(value: string): boolean {
  if (!value.startsWith(RELEASE_DOWNLOAD_PREFIX)) {
    return false;
  }
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'github.com' &&
      url.pathname.startsWith('/Byte-n/PennySpring/releases/download/') &&
      url.pathname.toLowerCase().endsWith('.apk')
    );
  } catch {
    return false;
  }
}

function parseApk(value: unknown): UpdateApk {
  if (!isRecord(value)) {
    throw new Error('更新安装包信息缺失');
  }
  const url = requireString(value.url, 'APK 下载地址缺失');
  if (!isTrustedApkUrl(url)) {
    throw new Error('APK 下载地址不受信任');
  }
  const size = requirePositiveInteger(value.size, 'APK 文件大小不正确');
  const sha256 = requireString(value.sha256, 'APK 校验值缺失');
  if (!SHA256_PATTERN.test(sha256)) {
    throw new Error('APK SHA-256 校验值不正确');
  }
  return { url, size, sha256: sha256.toLowerCase() };
}

function isUpdateApkAbi(value: string): value is UpdateApkAbi {
  return (UPDATE_APK_ABIS as readonly string[]).includes(value);
}

function parseApkVariants(value: unknown): Partial<Record<UpdateApkAbi, UpdateApk>> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new Error('分架构 APK 信息格式不正确');
  }
  const entries = Object.entries(value);
  if (entries.length === 0) {
    throw new Error('分架构 APK 信息不能为空');
  }
  return Object.fromEntries(
    entries.map(([abi, apk]) => {
      if (!isUpdateApkAbi(abi)) {
        throw new Error(`不支持的 APK 架构：${abi}`);
      }
      return [abi, parseApk(apk)];
    }),
  ) as Partial<Record<UpdateApkAbi, UpdateApk>>;
}

function parseReleaseNotes(value: unknown): UpdateReleaseNotes[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error('版本更新说明格式不正确');
  }
  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`第 ${index + 1} 条版本更新说明格式不正确`);
    }
    const versionName = requireString(entry.versionName, '版本更新说明版本号缺失');
    if (!VERSION_PATTERN.test(versionName)) {
      throw new Error('版本更新说明版本号格式不正确');
    }
    return {
      versionName,
      versionCode: requirePositiveInteger(entry.versionCode, '版本更新说明版本编码不正确'),
      publishedAt: requireString(entry.publishedAt, '版本更新时间缺失'),
      notes: typeof entry.notes === 'string' ? entry.notes : '',
    };
  });
}

function getVersionCode(versionName: string): number {
  const [major, minor, patch] = versionName.split('.').map(Number);
  return major * 10000 + minor * 100 + patch;
}

export function parseGitHubReleasePage(
  value: unknown,
  installedVersionCode: number,
  targetVersionCode: number,
): UpdateReleaseNotes[] {
  if (!Array.isArray(value)) {
    throw new Error('GitHub Release 列表格式不正确');
  }
  return (value as GitHubRelease[])
    .flatMap(release => {
      if (!isRecord(release) || release.draft === true || release.prerelease === true) return [];
      const title = typeof release.name === 'string' ? release.name : '';
      const match = RELEASE_TITLE_PATTERN.exec(title);
      const versionName = match?.[1];
      if (!versionName) return [];
      const versionCode = getVersionCode(versionName);
      if (versionCode <= installedVersionCode || versionCode > targetVersionCode) return [];
      return [{
        versionName,
        versionCode,
        publishedAt: typeof release.published_at === 'string' ? release.published_at : '',
        notes: typeof release.body === 'string' ? release.body.trim() : '',
      }];
    })
    .sort((left, right) => left.versionCode - right.versionCode);
}

export function parseUpdateManifest(value: unknown): UpdateManifest {
  if (!isRecord(value)) {
    throw new Error('更新清单格式不正确');
  }
  const formatVersion = requirePositiveInteger(value.formatVersion, '更新清单版本不正确');
  if (formatVersion !== 1) {
    throw new Error(`不支持的更新清单版本：${formatVersion}`);
  }
  const versionName = requireString(value.versionName, '更新版本号缺失');
  if (!VERSION_PATTERN.test(versionName)) {
    throw new Error('更新版本号格式不正确');
  }
  const versionCode = requirePositiveInteger(value.versionCode, '更新版本编码不正确');
  const publishedAt = requireString(value.publishedAt, '更新时间缺失');
  const notes = typeof value.notes === 'string' ? value.notes : '';
  const apk = parseApk(value.apk);
  const apks = parseApkVariants(value.apks);
  const releaseNotes = parseReleaseNotes(value.releaseNotes);
  return {
    formatVersion,
    versionName,
    versionCode,
    publishedAt,
    notes,
    apk,
    ...(apks ? { apks } : {}),
    ...(releaseNotes ? { releaseNotes } : {}),
  };
}

export function getUpdateReleaseNotes(
  manifest: UpdateManifest,
  installedVersionCode: number,
): UpdateReleaseNotes[] {
  const releases = manifest.releaseNotes?.length
    ? manifest.releaseNotes
    : [{
        versionName: manifest.versionName,
        versionCode: manifest.versionCode,
        publishedAt: manifest.publishedAt,
        notes: manifest.notes,
      }];
  const hasTargetRelease = releases.some(release => release.versionCode === manifest.versionCode);
  const allReleases = hasTargetRelease
    ? releases
    : [...releases, {
        versionName: manifest.versionName,
        versionCode: manifest.versionCode,
        publishedAt: manifest.publishedAt,
        notes: manifest.notes,
      }];
  return [...allReleases]
    .filter(
      release =>
        release.versionCode > installedVersionCode &&
        release.versionCode <= manifest.versionCode,
    )
    .sort((left, right) => left.versionCode - right.versionCode);
}

export function selectUpdateApk(
  manifest: UpdateManifest,
  supportedAbis: readonly string[],
): UpdateApk {
  for (const abi of supportedAbis) {
    if (!isUpdateApkAbi(abi)) continue;
    const apk = manifest.apks?.[abi];
    if (apk) return apk;
  }
  return manifest.apk;
}

export function compareUpdateVersion(
  localVersionCode: number,
  remoteVersionCode: number,
): UpdateVersionStatus {
  return remoteVersionCode > localVersionCode ? 'available' : 'current';
}

export function parseContentRange(value: string | undefined): ContentRange | null {
  if (!value) return null;
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+)$/.exec(value.trim());
  if (!match) return null;
  const [, start, end, total] = match;
  const parsed = {
    start: Number(start),
    end: Number(end),
    total: Number(total),
  };
  if (
    !Object.values(parsed).every(Number.isSafeInteger) ||
    parsed.start < 0 ||
    parsed.end < parsed.start ||
    parsed.total <= parsed.end
  ) {
    return null;
  }
  return parsed;
}
