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
import type { UpdateManifest } from '../src/features/appUpdate/update';

const mockedFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const originalFetch = global.fetch;

const manifest: UpdateManifest = {
  formatVersion: 1,
  versionName: '0.0.4',
  versionCode: 4,
  publishedAt: '2026-11-01T00:00:00.000Z',
  notes: '',
  apk: {
    url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.4/PennySpring-0.0.4.apk',
    size: 100,
    sha256: 'a'.repeat(64),
  },
};

function response(status: number, contentRange?: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    getHeader: (header: string): string | undefined =>
      header.toLowerCase() === 'content-range' ? contentRange : undefined,
  } as never;
}

describe('app update download', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads and aggregates release notes between the installed and latest versions', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          formatVersion: 1,
          versionName: '0.0.4',
          versionCode: 4,
          publishedAt: '2026-11-01T00:00:00.000Z',
          notes: '最新说明',
          apk: manifest.apk,
        }),
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          { name: 'PennySpring 0.0.4', published_at: '2026-11-01T00:00:00.000Z', body: '最新说明' },
          { name: 'PennySpring 0.0.3', published_at: '2026-10-31T00:00:00.000Z', body: '中间说明' },
          { name: 'PennySpring 0.0.2', published_at: '2026-10-30T00:00:00.000Z', body: '当前版本' },
        ],
      } as never) as typeof fetch;

    const result = await checkForUpdate({ versionCode: 2, versionName: '0.0.2' });

    expect(result.status).toBe('available');
    expect(result.manifest.releaseNotes?.map(release => release.versionName)).toEqual([
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
        json: async () => ({
          formatVersion: 1,
          versionName: '0.0.4',
          versionCode: 4,
          publishedAt: '2026-11-01T00:00:00.000Z',
          notes: '最新说明',
          apk: manifest.apk,
        }),
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => Array.from({ length: 100 }, () => ({ name: '其他发布' })),
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          { name: 'PennySpring 0.0.4', body: '最新说明' },
          { name: 'PennySpring 0.0.3', body: '中间说明' },
          { name: 'PennySpring 0.0.2', body: '当前版本' },
        ],
      } as never) as typeof fetch;

    const result = await checkForUpdate({ versionCode: 2, versionName: '0.0.2' });

    expect(result.manifest.releaseNotes?.map(release => release.versionName)).toEqual([
      '0.0.3',
      '0.0.4',
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(global.fetch).toHaveBeenLastCalledWith(
      'https://api.github.com/repos/Byte-n/PennySpring/releases?per_page=100&page=2',
      expect.objectContaining({ headers: { Accept: 'application/vnd.github+json' } }),
    );
  });

  it('continues a partial file only after receiving a matching 206 range', async () => {
    mockedFileSystem.stat
      .mockResolvedValueOnce({ size: 40 } as never)
      .mockResolvedValueOnce({ size: 100 } as never);
    mockedFileSystem.fetch.mockResolvedValue(response(206, 'bytes 40-99/100'));
    mockedFileSystem.hash.mockResolvedValue('a'.repeat(64));

    const result = await downloadUpdate(manifest);

    expect(mockedFileSystem.fetch).toHaveBeenCalledWith(
      manifest.apk.url,
      expect.objectContaining({
        headers: expect.objectContaining({ Range: 'bytes=40-' }),
      }),
      expect.any(Function),
    );
    expect(mockedFileSystem.concatFiles).toHaveBeenCalledWith(
      `${getUpdateApkPath(manifest.versionName, manifest.apk.sha256)}.range`,
      getUpdateApkPath(manifest.versionName, manifest.apk.sha256),
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

    const result = await downloadUpdate(manifest);

    expect(mockedFileSystem.unlink).toHaveBeenCalledWith(
      getUpdateApkPath(manifest.versionName, manifest.apk.sha256),
    );
    expect(mockedFileSystem.fetch).toHaveBeenCalledTimes(2);
    expect(result.resumed).toBe(false);
  });

  it('recognizes a verified complete file instead of treating it as partial', async () => {
    mockedFileSystem.stat.mockResolvedValueOnce({ size: 100 } as never);

    await expect(getExistingDownload(manifest)).resolves.toEqual({
      status: 'complete',
      path: getUpdateApkPath(manifest.versionName, manifest.apk.sha256),
      sizeBytes: 100,
    });
  });

  it('does not treat an oversized file as a completed download', async () => {
    mockedFileSystem.stat.mockResolvedValueOnce({ size: 101 } as never);

    await expect(getExistingDownload(manifest)).resolves.toEqual({ status: 'none' });
    expect(mockedFileSystem.unlink).toHaveBeenCalledWith(
      getUpdateApkPath(manifest.versionName, manifest.apk.sha256),
    );
  });

  it('does not reuse a cached APK when the artifact changes under the same version name', async () => {
    const previousArtifactPath = getUpdateApkPath(manifest.versionName, manifest.apk.sha256);
    const updatedManifest: UpdateManifest = {
      ...manifest,
      apk: {
        ...manifest.apk,
        size: 120,
        sha256: 'b'.repeat(64),
      },
    };
    mockedFileSystem.stat.mockImplementation(async path => {
      if (path === previousArtifactPath) return { size: 100 } as never;
      throw new Error('File does not exist');
    });

    await expect(getExistingDownload(updatedManifest)).resolves.toEqual({ status: 'none' });
  });
});
