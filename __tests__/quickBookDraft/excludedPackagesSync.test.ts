jest.mock('../../src/stores/bookStorage', () => ({
  createSqliteStateStorage: () => ({
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  }),
}));

jest.mock('../../src/features/quickBookDraft/quickBookEntry', () => ({
  isQuickBookEntrySupported: () => true,
}));

const mockGetQuickBookDraftStatus = jest.fn();

jest.mock('../../src/features/quickBookDraft/native', () => ({
  getQuickBookDraftStatus: () => mockGetQuickBookDraftStatus(),
}));

import { DeviceEventEmitter } from 'react-native';

import {
  mergeNativeExcludedPackages,
  subscribeExcludedPackageAdded,
} from '../../src/features/quickBookDraft/excludedPackagesSync';
import {
  DEFAULT_QUICK_BOOK_PROMPT,
  DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
} from '../../src/features/quickBook/constants';
import { useQuickBookSettingsStore } from '../../src/features/quickBook/settingsStore';

const EVENT_NAME = 'QuickBookDraftExcludedPackageAdded';

beforeEach(() => {
  useQuickBookSettingsStore.setState({
    freshWindowSeconds: DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
    presetPrompt: DEFAULT_QUICK_BOOK_PROMPT,
    nudgeEnabled: false,
    autoApproveScreenshot: true,
    floatingBallEnabled: true,
    triggerMode: 'floatingBall',
    excludedPackages: [],
  });
  mockGetQuickBookDraftStatus.mockReset();
});

describe('subscribeExcludedPackageAdded', () => {
  it('adds the package reported by the native long-press menu', () => {
    const unsubscribe = subscribeExcludedPackageAdded();

    DeviceEventEmitter.emit(EVENT_NAME, 'com.example.game');

    expect(useQuickBookSettingsStore.getState().excludedPackages).toEqual([
      'com.example.game',
    ]);
    unsubscribe();
  });

  it('stops updating after unsubscribe', () => {
    const unsubscribe = subscribeExcludedPackageAdded();
    unsubscribe();

    DeviceEventEmitter.emit(EVENT_NAME, 'com.example.game');

    expect(useQuickBookSettingsStore.getState().excludedPackages).toEqual([]);
  });

  it('ignores duplicate and non-string payloads', () => {
    const unsubscribe = subscribeExcludedPackageAdded();
    useQuickBookSettingsStore.setState({
      excludedPackages: ['com.example.game'],
    });

    DeviceEventEmitter.emit(EVENT_NAME, 'com.example.game');
    DeviceEventEmitter.emit(EVENT_NAME, 42);

    expect(useQuickBookSettingsStore.getState().excludedPackages).toEqual([
      'com.example.game',
    ]);
    unsubscribe();
  });
});

describe('mergeNativeExcludedPackages', () => {
  it('appends native packages that are missing from the local settings', async () => {
    useQuickBookSettingsStore.setState({
      excludedPackages: ['com.example.game'],
    });
    mockGetQuickBookDraftStatus.mockResolvedValue({
      excludedPackages: ['com.example.video'],
    });

    await mergeNativeExcludedPackages();

    expect(useQuickBookSettingsStore.getState().excludedPackages).toEqual([
      'com.example.game',
      'com.example.video',
    ]);
  });

  it('keeps the local settings when native has no exclusions', async () => {
    useQuickBookSettingsStore.setState({
      excludedPackages: ['com.example.game'],
    });
    mockGetQuickBookDraftStatus.mockResolvedValue({ excludedPackages: [] });

    await mergeNativeExcludedPackages();

    expect(useQuickBookSettingsStore.getState().excludedPackages).toEqual([
      'com.example.game',
    ]);
  });
});
