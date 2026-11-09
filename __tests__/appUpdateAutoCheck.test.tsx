const mockStorageState = new Map<string, string>();

jest.mock('../src/stores/bookStorage', () => ({
  bookStorage: {
    getItem: jest.fn((key: string) =>
      Promise.resolve(mockStorageState.get(key) ?? null),
    ),
    setItem: jest.fn((key: string, value: string) => {
      mockStorageState.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      mockStorageState.delete(key);
      return Promise.resolve();
    }),
  },
}));

jest.mock('../src/navigation', () => ({
  ROOT_ROUTES: { About: 'About' },
  rootNavigationRef: {
    isReady: jest.fn(() => true),
    navigate: jest.fn(),
  },
}));

jest.mock('@pennyspring/ui', () => ({
  useNotification: jest.fn(),
}));

jest.mock('../src/features/appUpdate/client', () => ({
  getInstalledVersion: jest.fn(),
  checkForUpdate: jest.fn(),
}));

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useNotification } from '@pennyspring/ui';

import { rootNavigationRef } from '../src/navigation';
import { AutoUpdateChecker } from '../src/features/appUpdate/AutoUpdateChecker';
import {
  getAutoUpdateSettings,
  rehydrateAutoUpdate,
  useAutoUpdateStore,
} from '../src/features/appUpdate/autoUpdateStore';
import {
  checkForUpdate,
  getInstalledVersion,
} from '../src/features/appUpdate/client';
import type { UpdateRelease } from '../src/features/appUpdate/update';

const AUTO_UPDATE_STORE_KEY = 'pennyspring-auto-update';

const mockedUseNotification = useNotification as jest.Mock;
const mockedGetInstalledVersion = getInstalledVersion as jest.Mock;
const mockedCheckForUpdate = checkForUpdate as jest.Mock;
const mockedNavigationRef = rootNavigationRef as unknown as {
  isReady: jest.Mock;
  navigate: jest.Mock;
};

const release: UpdateRelease = {
  versionName: '0.0.6',
  versionCode: 6,
  publishedAt: '2026-11-01T00:00:00.000Z',
  notes: '',
  apk: {
    url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.6/PennySpring-0.0.6-arm64-v8a.apk',
    size: 100,
    sha256: 'a'.repeat(64),
  },
  apks: {
    'arm64-v8a': {
      url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.6/PennySpring-0.0.6-arm64-v8a.apk',
      size: 100,
      sha256: 'a'.repeat(64),
    },
    'armeabi-v7a': {
      url: 'https://github.com/Byte-n/PennySpring/releases/download/v0.0.6/PennySpring-0.0.6-armeabi-v7a.apk',
      size: 100,
      sha256: 'b'.repeat(64),
    },
  },
};

function availableResult() {
  return {
    status: 'available',
    release,
    apk: release.apk,
    releaseNotes: [release],
  } as const;
}

async function renderChecker(): Promise<TestRenderer.ReactTestRenderer> {
  let renderer: TestRenderer.ReactTestRenderer | undefined;
  await act(async () => {
    renderer = TestRenderer.create(<AutoUpdateChecker />);
  });
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  return renderer as TestRenderer.ReactTestRenderer;
}

describe('auto update check', () => {
  const show = jest.fn();
  const hide = jest.fn();
  const clear = jest.fn();

  beforeEach(() => {
    mockStorageState.clear();
    useAutoUpdateStore.setState({ autoCheckEnabled: true });
    mockedUseNotification.mockReturnValue({ show, hide, clear });
    mockedNavigationRef.isReady.mockReturnValue(true);
    mockedNavigationRef.navigate.mockClear();
    mockedGetInstalledVersion.mockResolvedValue({
      versionCode: 5,
      versionName: '0.0.5',
    });
    mockedCheckForUpdate.mockResolvedValue({ status: 'current' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to enabled before hydration', () => {
    expect(getAutoUpdateSettings().autoCheckEnabled).toBe(true);
  });

  it('rehydrates a disabled switch from device storage', async () => {
    mockStorageState.set(
      AUTO_UPDATE_STORE_KEY,
      JSON.stringify({ state: { autoCheckEnabled: false }, version: 1 }),
    );

    await rehydrateAutoUpdate();

    expect(getAutoUpdateSettings().autoCheckEnabled).toBe(false);
  });

  it('persists the auto check switch to device storage', async () => {
    useAutoUpdateStore.getState().setAutoCheckEnabled(false);
    await Promise.resolve();

    const raw = mockStorageState.get(AUTO_UPDATE_STORE_KEY);
    expect(raw).toBeDefined();
    expect(JSON.parse(raw as string).state).toEqual({
      autoCheckEnabled: false,
    });
  });

  it('checks once on launch and shows a notification when an update is available', async () => {
    mockedCheckForUpdate.mockResolvedValue(availableResult());

    await renderChecker();

    expect(mockedGetInstalledVersion).toHaveBeenCalledWith();
    expect(mockedCheckForUpdate).toHaveBeenCalledWith(
      { versionCode: 5, versionName: '0.0.5' },
      expect.any(AbortSignal),
    );
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'info',
        titleText: '发现新版本 v0.0.6',
        actions: [
          expect.objectContaining({ text: '稍后' }),
          expect.objectContaining({ text: '查看更新' }),
        ],
      }),
    );
  });

  it('opens the about screen from the update notification', async () => {
    mockedCheckForUpdate.mockResolvedValue(availableResult());

    await renderChecker();
    const openAction = show.mock.calls[0][0].actions.find(
      (action: { text: string }) => action.text === '查看更新',
    );
    openAction.onPress();

    expect(clear).toHaveBeenCalled();
    expect(mockedNavigationRef.navigate).toHaveBeenCalledWith('About');
  });

  it('does not check when the switch is off', async () => {
    useAutoUpdateStore.setState({ autoCheckEnabled: false });

    await renderChecker();

    expect(mockedGetInstalledVersion).not.toHaveBeenCalled();
    expect(mockedCheckForUpdate).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('does not notify when the installed version is current', async () => {
    await renderChecker();

    expect(mockedCheckForUpdate).toHaveBeenCalledTimes(1);
    expect(show).not.toHaveBeenCalled();
  });

  it('ignores platforms that cannot read the installed version', async () => {
    mockedGetInstalledVersion.mockRejectedValue(
      new Error('当前平台不支持读取应用版本'),
    );

    await renderChecker();

    expect(mockedCheckForUpdate).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });
});
