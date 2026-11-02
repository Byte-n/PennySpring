import { strToU8 } from 'fflate';

import {
  buildSettingsPackage,
  createSettingsFileName,
  parseSettingsPackage,
  SETTINGS_FORMAT,
  SETTINGS_FORMAT_VERSION,
  zipSettingsPackage,
  type SettingsSnapshot,
} from '../../src/features/transfer/settings';
import { zipFiles, type PackageFiles } from '../../src/features/transfer/zip';

const SNAPSHOT: SettingsSnapshot = {
  quickBook: {
    freshWindowSeconds: 90,
    presetPrompt: '请识别截图中的消费信息',
    nudgeEnabled: true,
    autoApproveScreenshot: false,
  },
  theme: {
    themeMode: 'dark',
    themePreset: 'kaori',
  },
};

function createPackageFiles(
  settings: unknown,
  formatVersion = SETTINGS_FORMAT_VERSION,
): PackageFiles {
  return {
    'manifest.json': strToU8(
      JSON.stringify({
        format: SETTINGS_FORMAT,
        formatVersion,
        appVersion: '0.0.1',
        createdAt: 1_800_000_000_000,
      }),
    ),
    'settings.json': strToU8(JSON.stringify(settings)),
  };
}

describe('settings package', () => {
  it('round-trips quick book and theme settings through a zip package', async () => {
    const built = buildSettingsPackage(SNAPSHOT, {
      createdAt: 1_800_000_000_000,
    });

    const parsed = await parseSettingsPackage(
      await zipSettingsPackage(built.files),
    );

    expect(parsed.manifest.formatVersion).toBe(SETTINGS_FORMAT_VERSION);
    expect(parsed.settings).toEqual(SNAPSHOT);
    expect(createSettingsFileName(built.manifest.createdAt)).toBe(
      'PennySpring_设置_2027-01-15.pss',
    );
  });

  it('rejects a package from a newer format version', async () => {
    const data = await zipFiles(
      createPackageFiles(SNAPSHOT, SETTINGS_FORMAT_VERSION + 1),
    );

    await expect(parseSettingsPackage(data)).rejects.toThrow(
      '设置包版本过高，请升级 PennySpring 后再导入',
    );
  });

  it('rejects an unknown theme preset', async () => {
    const data = await zipFiles(
      createPackageFiles({
        ...SNAPSHOT,
        theme: { themeMode: 'dark', themePreset: 'unknown' },
      }),
    );

    await expect(parseSettingsPackage(data)).rejects.toThrow(
      '设置包内容格式不正确',
    );
  });
});
