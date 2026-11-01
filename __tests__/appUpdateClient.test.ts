jest.mock('react-native-file-access', () => ({
  Dirs: { CacheDir: '/cache' },
  FileSystem: {
    stat: jest.fn(),
    fetch: jest.fn(),
    concatFiles: jest.fn(),
    unlink: jest.fn(),
    hash: jest.fn(),
  },
}));

import { FileSystem } from 'react-native-file-access';

import {
  checkForUpdate,
  downloadUpdate,
  getExistingDownload,
  getUpdateApkPath,
} from '../src/features/appUpdate/client';
import type { UpdateApk } from '../src/features/appUpdate/update';

const mockedFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const originalFetch = global.fetch;

const apk: UpdateApk = {
  url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.4/PennySpring-0.0.4.apk',
  size: 100,
  sha256: 'a'.repeat(64),
};

function createAssets(versionName: string) {
  const createAsset = (suffix: string, size: number, sha256: string) => ({
    name: `PennySpring-${versionName}${suffix}.apk`,
    size,
    digest: `sha256:${sha256}`,
    browser_download_url: `https://github.com/Byte-n/PennySpring/releases/download/v${versionName}/PennySpring-${versionName}${suffix}.apk`,
  });
  return [
    createAsset('', 100, 'a'.repeat(64)),
    createAsset('-arm64-v8a', 90, 'b'.repeat(64)),
    createAsset('-armeabi-v7a', 80, 'c'.repeat(64)),
  ];
}

function createRelease(
  versionName: string,
  body: string,
  publishedAt = '2026-11-01T00:00:00.000Z',
) {
  return {
    tag_name: `v${versionName}`,
    name: `v${versionName}`,
    published_at: publishedAt,
    body,
    assets: createAssets(versionName),
  };
}

function response(status: number, contentRange?: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    getHeader: (header: string): string | undefined =>
      header.toLowerCase() === 'content-range' ? contentRange : undefined,
  } as never;
}

describe('app update check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads releases once and aggregates notes between the installed and latest versions', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        createRelease('0.0.4', '最新说明', '2026-11-01T00:00:00.000Z'),
        createRelease('0.0.3', '中间说明', '2026-10-31T00:00:00.000Z'),
        createRelease('0.0.2', '当前版本', '2026-10-30T00:00:00.000Z'),
      ],
    } as never) as typeof fetch;

    const result = await checkForUpdate({ versionCode: 2, versionName: '0.0.2' });

    expect(result.status).toBe('available');
    if (result.status !== 'available') throw new Error('expected an update');
    expect(result.release.versionName).toBe('0.0.4');
    expect(result.apk.url).toBe(apk.url);
    expect(result.releaseNotes.map(release => release.versionName)).toEqual([
      '0.0.3',
      '0.0.4',
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/Byte-n/PennySpring/releases?per_page=100&page=1',
      expect.objectContaining({ headers: { Accept: 'application/vnd.github+json' } }),
    );
  });

  it('continues through release pages until it reaches the installed version', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => Array.from({ length: 100 }, () => ({ tag_name: 'nightly' })),
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          createRelease('0.0.4', '最新说明'),
          createRelease('0.0.3', '中间说明'),
          createRelease('0.0.2', '当前版本'),
        ],
      } as never) as typeof fetch;

    const result = await checkForUpdate({ versionCode: 2, versionName: '0.0.2' });

    expect(result.status).toBe('available');
    if (result.status !== 'available') throw new Error('expected an update');
    expect(result.releaseNotes.map(release => release.versionName)).toEqual([
      '0.0.3',
      '0.0.4',
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      'https://api.github.com/repos/Byte-n/PennySpring/releases?per_page=100&page=2',
      expect.objectContaining({ headers: { Accept: 'application/vnd.github+json' } }),
    );
  });

  it('stops paginating once the installed version is reached', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        createRelease('0.0.4', '最新说明'),
        createRelease('0.0.3', '中间说明'),
        createRelease('0.0.2', '当前版本'),
        ...Array.from({ length: 97 }, () => ({ tag_name: 'nightly' })),
      ],
    } as never) as typeof fetch;

    await checkForUpdate({ versionCode: 2, versionName: '0.0.2' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('reports the current version without selecting an APK', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [createRelease('0.0.2', '当前版本')],
    } as never) as typeof fetch;

    await expect(
      checkForUpdate({ versionCode: 2, versionName: '0.0.2' }),
    ).resolves.toEqual({ status: 'current' });
  });

  it('fails when no stable release exists', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ tag_name: 'nightly' }],
    } as never) as typeof fetch;

    await expect(
      checkForUpdate({ versionCode: 2, versionName: '0.0.2' }),
    ).rejects.toThrow('未找到可用的正式版本');
  });
});

describe('app update download', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('continues a partial file only after receiving a matching 206 range', async () => {
    mockedFileSystem.stat
      .mockResolvedValueOnce({ size: 40 } as never)
      .mockResolvedValueOnce({ size: 100 } as never);
    mockedFileSystem.fetch.mockResolvedValue(response(206, 'bytes 40-99/100'));
    mockedFileSystem.hash.mockResolvedValue('a'.repeat(64));

    const result = await downloadUpdate(apk, '0.0.4');

    expect(mockedFileSystem.fetch).toHaveBeenCalledWith(
      apk.url,
      expect.objectContaining({
        headers: expect.objectContaining({ Range: 'bytes=40-' }),
      }),
      expect.any(Function),
    );
    expect(mockedFileSystem.concatFiles).toHaveBeenCalledWith(
      `${getUpdateApkPath('0.0.4', apk.sha256)}.range`,
      getUpdateApkPath('0.0.4', apk.sha256),
    );
    expect(result.resumed).toBe(true);
  });

  it('restarts from zero when a resume request returns a full response', async () => {
    mockedFileSystem.stat
      .mockResolvedValueOnce({ size: 40 } as never)
      .mockResolvedValueOnce({ size: 100 } as never);
    mockedFileSystem.fetch
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(response(200));
    mockedFileSystem.hash.mockResolvedValue('a'.repeat(64));

    const result = await downloadUpdate(apk, '0.0.4');

    expect(mockedFileSystem.unlink).toHaveBeenCalledWith(
      getUpdateApkPath('0.0.4', apk.sha256),
    );
    expect(mockedFileSystem.fetch).toHaveBeenCalledTimes(2);
    expect(result.resumed).toBe(false);
  });

  it('recognizes a verified complete file instead of treating it as partial', async () => {
    mockedFileSystem.stat.mockResolvedValueOnce({ size: 100 } as never);

    await expect(getExistingDownload(apk, '0.0.4')).resolves.toEqual({
      status: 'complete',
      path: getUpdateApkPath('0.0.4', apk.sha256),
      sizeBytes: 100,
    });
  });

  it('does not treat an oversized file as a completed download', async () => {
    mockedFileSystem.stat.mockResolvedValueOnce({ size: 101 } as never);

    await expect(getExistingDownload(apk, '0.0.4')).resolves.toEqual({ status: 'none' });
    expect(mockedFileSystem.unlink).toHaveBeenCalledWith(
      getUpdateApkPath('0.0.4', apk.sha256),
    );
  });

  it('does not reuse a cached APK when the artifact changes under the same version name', async () => {
    const previousArtifactPath = getUpdateApkPath('0.0.4', apk.sha256);
    const updatedApk: UpdateApk = { ...apk, sha256: 'b'.repeat(64) };
    mockedFileSystem.stat.mockImplementation(async path => {
      if (path === previousArtifactPath) return { size: 100 } as never;
      throw new Error('File does not exist');
    });

    await expect(getExistingDownload(updatedApk, '0.0.4')).resolves.toEqual({
      status: 'none',
    });
  });
});
