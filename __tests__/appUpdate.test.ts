import {
  compareUpdateVersion,
  isTrustedApkUrl,
  parseContentRange,
  parseGitHubReleases,
  selectUpdateApk,
} from '../src/features/appUpdate/update';

function createAssets(
  versionName: string,
  digests = {
    universal: 'a'.repeat(64),
    arm64: 'b'.repeat(64),
    armv7: 'c'.repeat(64),
  },
) {
  const createAsset = (suffix: string, size: number, digest: string) => ({
    name: `PennySpring-${versionName}${suffix}.apk`,
    size,
    digest: `sha256:${digest}`,
    browser_download_url: `https://github.com/Byte-n/PennySpring/releases/download/v${versionName}/PennySpring-${versionName}${suffix}.apk`,
  });
  return [
    createAsset('', 300, digests.universal),
    createAsset('-arm64-v8a', 100, digests.arm64),
    createAsset('-armeabi-v7a', 120, digests.armv7),
  ];
}

function createRelease(
  versionName: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    tag_name: `v${versionName}`,
    name: `v${versionName}`,
    published_at: '2026-11-01T00:00:00.000Z',
    body: '修复问题',
    assets: createAssets(versionName),
    ...overrides,
  };
}

describe('app update metadata', () => {
  it('parses a stable release with tag, notes, and all APK assets', () => {
    const releases = parseGitHubReleases([
      createRelease('0.0.5', { name: '任意标题', body: '最新说明' }),
    ]);

    expect(releases).toHaveLength(1);
    expect(releases[0]).toMatchObject({
      versionName: '0.0.5',
      versionCode: 5,
      publishedAt: '2026-11-01T00:00:00.000Z',
      notes: '最新说明',
      apk: {
        url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.5/PennySpring-0.0.5.apk',
        size: 300,
        sha256: 'a'.repeat(64),
      },
    });
    expect(releases[0].apks['arm64-v8a'].sha256).toBe('b'.repeat(64));
    expect(releases[0].apks['armeabi-v7a'].sha256).toBe('c'.repeat(64));
  });

  it('ignores drafts, prereleases, and non-version tags', () => {
    const releases = parseGitHubReleases([
      createRelease('0.0.5'),
      createRelease('0.0.4', { prerelease: true }),
      createRelease('0.0.3', { draft: true }),
      { tag_name: 'nightly', assets: createAssets('0.0.3') },
      { name: 'v0.0.2', assets: createAssets('0.0.2') },
    ]);

    expect(releases.map(release => release.versionName)).toEqual(['0.0.5']);
  });

  it('requires the universal package, both ABI packages, and sha256 digests', () => {
    expect(() =>
      parseGitHubReleases([
        createRelease('0.0.5', {
          assets: createAssets('0.0.5').slice(1),
        }),
      ]),
    ).toThrow('v0.0.5 缺少通用安装包');

    expect(() =>
      parseGitHubReleases([
        createRelease('0.0.5', {
          assets: createAssets('0.0.5').filter(
            asset => !asset.name.includes('arm64-v8a'),
          ),
        }),
      ]),
    ).toThrow('v0.0.5 缺少 arm64-v8a 安装包');

    expect(() =>
      parseGitHubReleases([
        createRelease('0.0.5', {
          assets: createAssets('0.0.5', {
            universal: 'a'.repeat(64),
            arm64: 'not-a-digest',
            armv7: 'c'.repeat(64),
          }),
        }),
      ]),
    ).toThrow('校验值格式不正确');

    expect(() =>
      parseGitHubReleases([createRelease('0.0.5', { assets: undefined })]),
    ).toThrow('Release 附件格式不正确');
  });

  it('rejects an untrusted APK download URL', () => {
    const assets = createAssets('0.0.5');
    expect(() =>
      parseGitHubReleases([
        createRelease('0.0.5', {
          assets: assets.map(asset =>
            asset.name.includes('arm64-v8a')
              ? {
                  ...asset,
                  browser_download_url: 'https://example.com/update.apk',
                }
              : asset,
          ),
        }),
      ]),
    ).toThrow('下载地址不受信任');
  });

  it('selects the first supported ABI package and falls back to the universal package', () => {
    const release = parseGitHubReleases([createRelease('0.0.5')])[0];

    expect(selectUpdateApk(release, ['armeabi-v7a', 'arm64-v8a']).size).toBe(
      120,
    );
    expect(selectUpdateApk(release, ['x86_64']).size).toBe(300);
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
        'https://github.com/Byte-n/PennySpring/releases/download/v0.0.5/PennySpring-0.0.5.apk',
      ),
    ).toBe(true);
    expect(
      isTrustedApkUrl('http://github.com/Byte-n/PennySpring/update.apk'),
    ).toBe(false);
    expect(
      isTrustedApkUrl('https://release-assets.githubusercontent.com/file.apk'),
    ).toBe(false);
  });
});
