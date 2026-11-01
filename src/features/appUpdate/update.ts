const RELEASE_DOWNLOAD_PREFIX =
  'https://github.com/Byte-n/PennySpring/releases/download/';
const RELEASE_TAG_PATTERN = /^v(\d+\.\d+\.\d+)$/;
const APK_NAME_PATTERN =
  /^PennySpring-(\d+\.\d+\.\d+)(?:-(arm64-v8a|armeabi-v7a))?\.apk$/;
const DIGEST_PATTERN = /^sha256:([a-f0-9]{64})$/i;

export const UPDATE_APK_ABIS = ['arm64-v8a', 'armeabi-v7a'] as const;
export type UpdateApkAbi = (typeof UPDATE_APK_ABIS)[number];

export interface UpdateApk {
  url: string;
  size: number;
  sha256: string;
}

export interface UpdateRelease {
  versionName: string;
  versionCode: number;
  publishedAt: string;
  notes: string;
  apk: UpdateApk;
  apks: Record<UpdateApkAbi, UpdateApk>;
}

export interface UpdateTarget {
  release: UpdateRelease;
  apk: UpdateApk;
  releaseNotes: UpdateRelease[];
}

export type UpdateCheckResult =
  ({ status: 'available' } & UpdateTarget) | { status: 'current' };

export type UpdateVersionStatus = 'available' | 'current';

export interface ContentRange {
  start: number;
  end: number;
  total: number;
}

interface GitHubReleaseAsset {
  name?: unknown;
  size?: unknown;
  digest?: unknown;
  browser_download_url?: unknown;
}

interface GitHubRelease {
  tag_name?: unknown;
  published_at?: unknown;
  body?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  assets?: unknown;
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

function parseAsset(
  value: unknown,
  versionName: string,
): [UpdateApkAbi | 'universal', UpdateApk] | null {
  if (!isRecord(value)) {
    throw new Error('Release 附件格式不正确');
  }
  const name = requireString(value.name, 'Release 附件名称缺失');
  const match = APK_NAME_PATTERN.exec(name);
  if (!match) return null;
  const [, assetVersion, abi] = match;
  if (assetVersion !== versionName) return null;
  if (abi !== undefined && !isUpdateApkAbi(abi)) return null;

  const url = requireString(value.browser_download_url, `${name} 下载地址缺失`);
  if (!isTrustedApkUrl(url)) {
    throw new Error(`${name} 下载地址不受信任`);
  }
  const size = requirePositiveInteger(value.size, `${name} 文件大小不正确`);
  const digest = requireString(value.digest, `${name} 校验值缺失`);
  const digestMatch = DIGEST_PATTERN.exec(digest);
  if (!digestMatch) {
    throw new Error(`${name} 校验值格式不正确`);
  }
  return [
    abi ?? 'universal',
    { url, size, sha256: digestMatch[1].toLowerCase() },
  ];
}

function parseReleaseAssets(
  value: unknown,
  versionName: string,
): Pick<UpdateRelease, 'apk' | 'apks'> {
  if (!Array.isArray(value)) {
    throw new Error('Release 附件格式不正确');
  }
  const assets = new Map<string, UpdateApk>();
  for (const asset of value as GitHubReleaseAsset[]) {
    const parsed = parseAsset(asset, versionName);
    if (parsed) assets.set(parsed[0], parsed[1]);
  }

  const apk = assets.get('universal');
  if (!apk) {
    throw new Error(`v${versionName} 缺少通用安装包`);
  }
  const apks = Object.fromEntries(
    UPDATE_APK_ABIS.map(abi => {
      const variant = assets.get(abi);
      if (!variant) {
        throw new Error(`v${versionName} 缺少 ${abi} 安装包`);
      }
      return [abi, variant];
    }),
  ) as Record<UpdateApkAbi, UpdateApk>;
  return { apk, apks };
}

function getVersionCode(versionName: string): number {
  const [major, minor, patch] = versionName.split('.').map(Number);
  return major * 10000 + minor * 100 + patch;
}

export function parseGitHubReleases(value: unknown): UpdateRelease[] {
  if (!Array.isArray(value)) {
    throw new Error('GitHub Release 列表格式不正确');
  }
  return (value as GitHubRelease[]).flatMap(release => {
    if (
      !isRecord(release) ||
      release.draft === true ||
      release.prerelease === true
    )
      return [];
    const tag = typeof release.tag_name === 'string' ? release.tag_name : '';
    const match = RELEASE_TAG_PATTERN.exec(tag);
    const versionName = match?.[1];
    if (!versionName) return [];
    return [
      {
        versionName,
        versionCode: getVersionCode(versionName),
        publishedAt:
          typeof release.published_at === 'string' ? release.published_at : '',
        notes: typeof release.body === 'string' ? release.body.trim() : '',
        ...parseReleaseAssets(release.assets, versionName),
      },
    ];
  });
}

export function selectUpdateApk(
  release: UpdateRelease,
  supportedAbis: readonly string[],
): UpdateApk {
  for (const abi of supportedAbis) {
    if (!isUpdateApkAbi(abi)) continue;
    const apk = release.apks[abi];
    if (apk) return apk;
  }
  return release.apk;
}

function isUpdateApkAbi(value: string): value is UpdateApkAbi {
  return (UPDATE_APK_ABIS as readonly string[]).includes(value);
}

export function compareUpdateVersion(
  localVersionCode: number,
  remoteVersionCode: number,
): UpdateVersionStatus {
  return remoteVersionCode > localVersionCode ? 'available' : 'current';
}

export function parseContentRange(
  value: string | undefined,
): ContentRange | null {
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
