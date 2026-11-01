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

import { downloadUpdate } from '../src/features/appUpdate/client';
import type { UpdateManifest } from '../src/features/appUpdate/update';

const mockedFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

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
      '/cache/pennyspring-update-0.0.4.apk.range',
      '/cache/pennyspring-update-0.0.4.apk',
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
      '/cache/pennyspring-update-0.0.4.apk',
    );
    expect(mockedFileSystem.fetch).toHaveBeenCalledTimes(2);
    expect(result.resumed).toBe(false);
  });
});
