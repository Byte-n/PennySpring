import {
  compareUpdateVersion,
  getUpdateReleaseNotes,
  isTrustedApkUrl,
  parseGitHubReleasePage,
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

  it('returns release notes between the installed and target versions in order', () => {
    const manifest = parseUpdateManifest({
      formatVersion: 1,
      versionName: '0.0.5',
      versionCode: 5,
      publishedAt: '2026-11-03T00:00:00.000Z',
      notes: '最终修复',
      apk: {
        url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.5/PennySpring-0.0.5.apk',
        size: 123,
        sha256: 'a'.repeat(64),
      },
      releaseNotes: [
        {
          versionName: '0.0.5',
          versionCode: 5,
          publishedAt: '2026-11-03T00:00:00.000Z',
          notes: '最终修复',
        },
        {
          versionName: '0.0.3',
          versionCode: 3,
          publishedAt: '2026-11-01T00:00:00.000Z',
          notes: '中间版本',
        },
        {
          versionName: '0.0.2',
          versionCode: 2,
          publishedAt: '2026-10-31T00:00:00.000Z',
          notes: '已安装版本',
        },
      ],
    });

    expect(getUpdateReleaseNotes(manifest, 1).map(release => release.versionName)).toEqual([
      '0.0.2',
      '0.0.3',
      '0.0.5',
    ]);
    expect(getUpdateReleaseNotes(manifest, 3).map(release => release.versionName)).toEqual([
      '0.0.5',
    ]);
  });

  it('parses only stable PennySpring releases between the installed and target versions', () => {
    expect(parseGitHubReleasePage([
      { name: 'PennySpring 0.0.5', published_at: '2026-11-03T00:00:00.000Z', body: '最新版' },
      { name: 'PennySpring 0.0.3', published_at: '2026-11-01T00:00:00.000Z', body: '中间版本' },
      { name: 'PennySpring 0.0.2', published_at: '2026-10-31T00:00:00.000Z', body: '已安装' },
      { name: 'PennySpring 0.0.6', published_at: '2026-11-04T00:00:00.000Z', body: '未来版本' },
      { name: 'PennySpring 0.0.4', prerelease: true, body: '预发布' },
      { name: '其他标题', body: '不符合命名约定' },
    ], 2, 5).map(release => release.versionName)).toEqual(['0.0.3', '0.0.5']);
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
