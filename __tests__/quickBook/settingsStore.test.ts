jest.mock('../../src/stores/bookStorage', () => ({
  createSqliteStateStorage: () => ({
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  }),
}));

import {
  DEFAULT_QUICK_BOOK_PROMPT,
  DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
  LEGACY_DEFAULT_QUICK_BOOK_PROMPT,
  MAX_SCREENSHOT_FRESH_WINDOW_SECONDS,
  MIN_SCREENSHOT_FRESH_WINDOW_SECONDS,
} from '../../src/features/quickBook/constants';
import {
  clampFreshWindowSeconds,
  migrateQuickBookSettings,
  useQuickBookSettingsStore,
} from '../../src/features/quickBook/settingsStore';

beforeEach(() => {
  useQuickBookSettingsStore.setState({
    freshWindowSeconds: DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
    presetPrompt: DEFAULT_QUICK_BOOK_PROMPT,
    nudgeEnabled: false,
    autoApproveScreenshot: true,
  });
});

describe('clampFreshWindowSeconds', () => {
  it('keeps a value inside the supported range', () => {
    expect(clampFreshWindowSeconds(90)).toBe(90);
  });

  it('clamps values below the minimum and above the maximum', () => {
    expect(clampFreshWindowSeconds(0)).toBe(
      MIN_SCREENSHOT_FRESH_WINDOW_SECONDS,
    );
    expect(clampFreshWindowSeconds(9999)).toBe(
      MAX_SCREENSHOT_FRESH_WINDOW_SECONDS,
    );
  });

  it('falls back to the default for invalid values', () => {
    expect(clampFreshWindowSeconds(Number.NaN)).toBe(
      DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
    );
  });

  it('rounds fractional seconds', () => {
    expect(clampFreshWindowSeconds(60.4)).toBe(60);
    expect(clampFreshWindowSeconds(60.6)).toBe(61);
  });
});

describe('DEFAULT_QUICK_BOOK_PROMPT', () => {
  it('lets the agent choose the most specific type without asking', () => {
    expect(DEFAULT_QUICK_BOOK_PROMPT).not.toContain('先问我');
    expect(DEFAULT_QUICK_BOOK_PROMPT).toContain('最精确的子类型');
  });
});

describe('migrateQuickBookSettings', () => {
  const persisted = {
    freshWindowSeconds: 90,
    presetPrompt: LEGACY_DEFAULT_QUICK_BOOK_PROMPT,
    nudgeEnabled: true,
    autoApproveScreenshot: false,
  };

  it('replaces only the legacy default prompt', () => {
    const migrated = migrateQuickBookSettings(persisted, 2);

    expect(migrated.presetPrompt).toBe(DEFAULT_QUICK_BOOK_PROMPT);
    expect(migrated.freshWindowSeconds).toBe(90);
    expect(migrated.nudgeEnabled).toBe(true);
    expect(migrated.autoApproveScreenshot).toBe(false);
  });

  it('keeps a custom prompt unchanged', () => {
    const migrated = migrateQuickBookSettings(
      { ...persisted, presetPrompt: '自定义提示' },
      2,
    );

    expect(migrated.presetPrompt).toBe('自定义提示');
  });

  it('does not rewrite data that is already on the current version', () => {
    const migrated = migrateQuickBookSettings(persisted, 3);

    expect(migrated.presetPrompt).toBe(LEGACY_DEFAULT_QUICK_BOOK_PROMPT);
  });
});

describe('quick book settings store', () => {
  it('starts with a disabled switch and default device settings', () => {
    const state = useQuickBookSettingsStore.getState();
    expect(state.nudgeEnabled).toBe(false);
    expect(state.autoApproveScreenshot).toBe(true);
    expect(state.freshWindowSeconds).toBe(
      DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
    );
    expect(state.presetPrompt).toBe(DEFAULT_QUICK_BOOK_PROMPT);
  });

  it('clamps the window when written through the store', () => {
    useQuickBookSettingsStore.getState().setFreshWindowSeconds(1);
    expect(useQuickBookSettingsStore.getState().freshWindowSeconds).toBe(
      MIN_SCREENSHOT_FRESH_WINDOW_SECONDS,
    );
  });

  it('updates the preset prompt and nudge switch', () => {
    const state = useQuickBookSettingsStore.getState();
    state.setPresetPrompt('帮我记账');
    state.setNudgeEnabled(true);

    expect(useQuickBookSettingsStore.getState().presetPrompt).toBe('帮我记账');
    expect(useQuickBookSettingsStore.getState().nudgeEnabled).toBe(true);
  });

  it('toggles screenshot auto approval independently', () => {
    const state = useQuickBookSettingsStore.getState();
    state.setAutoApproveScreenshot(false);

    expect(useQuickBookSettingsStore.getState().autoApproveScreenshot).toBe(
      false,
    );
    expect(useQuickBookSettingsStore.getState().nudgeEnabled).toBe(false);
  });

  it('keeps device settings independent from the nudge switch', () => {
    const state = useQuickBookSettingsStore.getState();
    state.setFreshWindowSeconds(120);
    state.setPresetPrompt('自定义提示');
    state.setNudgeEnabled(true);
    state.setNudgeEnabled(false);

    const next = useQuickBookSettingsStore.getState();
    expect(next.nudgeEnabled).toBe(false);
    expect(next.freshWindowSeconds).toBe(120);
    expect(next.presetPrompt).toBe('自定义提示');
  });
});
