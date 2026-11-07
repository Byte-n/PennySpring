import type { SettingsSnapshot } from '../../src/features/transfer/settings';
import {
  applySettingsPackage,
  buildSettingsSnapshot,
} from '../../src/features/transfer/settingsOperations';
import { useQuickBookSettingsStore } from '../../src/features/quickBook/settingsStore';

const BASE_SNAPSHOT: SettingsSnapshot = {
  quickBook: {
    freshWindowSeconds: 60,
    presetPrompt: '请识别截图中的消费信息',
    nudgeEnabled: false,
    autoApproveScreenshot: true,
    excludedPackages: ['com.example.game'],
  },
  theme: { themeMode: 'dark', themePreset: 'kaori' },
};

beforeEach(() => {
  useQuickBookSettingsStore.setState({
    excludedPackages: ['com.example.keep'],
  });
});

describe('settings operations', () => {
  it('exports the current excluded app list in the settings snapshot', () => {
    useQuickBookSettingsStore
      .getState()
      .setExcludedPackages(['com.example.game', 'com.example.video']);

    expect(buildSettingsSnapshot().quickBook.excludedPackages).toEqual([
      'com.example.game',
      'com.example.video',
    ]);
  });

  it('applies an imported excluded app list', () => {
    applySettingsPackage(BASE_SNAPSHOT);

    expect(useQuickBookSettingsStore.getState().excludedPackages).toEqual([
      'com.example.game',
    ]);
  });

  it('keeps existing exclusions when an older package has no list', () => {
    applySettingsPackage({
      ...BASE_SNAPSHOT,
      quickBook: {
        freshWindowSeconds: BASE_SNAPSHOT.quickBook.freshWindowSeconds,
        presetPrompt: BASE_SNAPSHOT.quickBook.presetPrompt,
        nudgeEnabled: BASE_SNAPSHOT.quickBook.nudgeEnabled,
        autoApproveScreenshot: BASE_SNAPSHOT.quickBook.autoApproveScreenshot,
      },
    });

    expect(useQuickBookSettingsStore.getState().excludedPackages).toEqual([
      'com.example.keep',
    ]);
  });
});
