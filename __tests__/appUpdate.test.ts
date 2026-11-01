import {
  compareUpdateVersion,
  isTrustedApkUrl,
  parseContentRange,
  parseUpdateManifest,
  selectUpdateApk,
} from '../src/features/appUpdate/update';

describe('app update metadata', () => {
  it('parses a valid GitHub release manifest', () => {
    const manifest = parseUpdateManifest({
      formatVersion: 1,
      versionName: '0.0.4',
      versionCode: 4,
      publishedAt: '2026-11-01T00:00:00.000Z',
      notes: '修复问题',
      apk: {
        url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.4/PennySpring-0.0.4.apk',
        size: 123,
        sha256: 'a'.repeat(64),
      },
    });

    expect(manifest.versionCode).toBe(4);
    expect(manifest.apk.size).toBe(123);
  });

  it('rejects an invalid or untrusted manifest', () => {
    expect(() =>
      parseUpdateManifest({
        formatVersion: 1,
        versionName: '0.0.4',
        versionCode: 4,
        publishedAt: '2026-11-01T00:00:00.000Z',
        notes: '',
        apk: {
          url: 'https://example.com/update.apk',
          size: 123,
          sha256: 'a'.repeat(64),
        },
      }),
    ).toThrow('APK 下载地址不受信任');
  });

  it('selects the first supported ABI package and falls back to the universal package', () => {
    const manifest = parseUpdateManifest({
      formatVersion: 1,
      versionName: '0.0.4',
      versionCode: 4,
      publishedAt: '2026-11-01T00:00:00.000Z',
      notes: '',
      apk: {
        url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.4/PennySpring-0.0.4-universal.apk',
        size: 300,
        sha256: 'a'.repeat(64),
      },
      apks: {
        'arm64-v8a': {
          url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.4/PennySpring-0.0.4-arm64-v8a.apk',
          size: 100,
          sha256: 'b'.repeat(64),
        },
        'armeabi-v7a': {
          url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.4/PennySpring-0.0.4-armeabi-v7a.apk',
          size: 120,
          sha256: 'c'.repeat(64),
        },
      },
    });

    expect(selectUpdateApk(manifest, ['armeabi-v7a', 'arm64-v8a']).size).toBe(120);
    expect(selectUpdateApk(manifest, ['x86_64']).size).toBe(300);
  });

  it('compares version codes without lexical version mistakes', () => {
    expect(compareUpdateVersion(9, 10)).toBe('available');
    expect(compareUpdateVersion(10, 10)).toBe('current');
    expect(compareUpdateVersion(11, 10)).toBe('current');
  });

  it('parses a partial content range for resume', () => {
    expect(parseContentRange('bytes 123-456/789')).toEqual({
      start: 123,
      end: 456,
      total: 789,
    });
    expect(parseContentRange('bytes */789')).toBeNull();
  });

  it('allows only the PennySpring GitHub release download host', () => {
    expect(
      isTrustedApkUrl(
        'https://github.com/Byte-n/PennySpring/releases/download/v0.0.4/PennySpring-0.0.4.apk',
      ),
    ).toBe(true);
    expect(isTrustedApkUrl('http://github.com/Byte-n/PennySpring/update.apk')).toBe(false);
    expect(isTrustedApkUrl('https://release-assets.githubusercontent.com/file.apk')).toBe(false);
  });
});
