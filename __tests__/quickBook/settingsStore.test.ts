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
  MAX_SCREENSHOT_FRESH_WINDOW_SECONDS,
  MIN_SCREENSHOT_FRESH_WINDOW_SECONDS,
} from '../../src/features/quickBook/constants';
import {
  clampFreshWindowSeconds,
  useQuickBookSettingsStore,
} from '../../src/features/quickBook/settingsStore';

beforeEach(() => {
  useQuickBookSettingsStore.setState({
    freshWindowSeconds: DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
    presetPrompt: DEFAULT_QUICK_BOOK_PROMPT,
    nudgeEnabled: false,
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

describe('quick book settings store', () => {
  it('starts with a disabled switch and default device settings', () => {
    const state = useQuickBookSettingsStore.getState();
    expect(state.nudgeEnabled).toBe(false);
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
