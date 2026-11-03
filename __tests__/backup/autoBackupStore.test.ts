const mockStorageState = new Map<string, string>();

jest.mock('../../src/stores/bookStorage', () => ({
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

import {
  getBookContentOptions,
  rehydrateAutoBackup,
  useAutoBackupStore,
} from '../../src/features/backup/autoBackupStore';

const STORE_KEY = 'pennyspring-auto-backup';

describe('autoBackupStore', () => {
  beforeEach(async () => {
    mockStorageState.clear();
    await useAutoBackupStore.persist.clearStorage();
  });

  it('migrates legacy book and content settings to per-book options', async () => {
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({
        state: {
          frequency: 'daily',
          customDays: 7,
          includeImages: false,
          includeAgent: true,
          bookIds: [2],
          directory: null,
          retention: 3,
          lastRunAt: 0,
          lastRunStatus: '',
          lastRunError: '',
          lastFileName: '',
        },
        version: 1,
      }),
    );

    await rehydrateAutoBackup();

    const state = useAutoBackupStore.getState();
    expect(state.frequency).toBe('daily');
    expect(state.selectedBookIds).toEqual([2]);
    expect(state.defaultBookOptions).toEqual({
      includeImages: false,
      includeAgent: true,
      includeAiConfig: true,
    });
    expect(state.includeSettings).toBe(false);
    expect(state.includeNetworkBooks).toBe(false);
  });

  it('uses per-book overrides before the default content options', () => {
    const state = useAutoBackupStore.getState();
    const settings = {
      ...state,
      defaultBookOptions: {
        includeImages: true,
        includeAgent: false,
        includeAiConfig: true,
      },
      bookOptions: {
        3: {
          includeImages: false,
          includeAgent: true,
          includeAiConfig: false,
        },
      },
    };

    expect(getBookContentOptions(settings, 3)).toEqual({
      includeImages: false,
      includeAgent: true,
      includeAiConfig: false,
    });
    expect(getBookContentOptions(settings, 4)).toEqual(
      settings.defaultBookOptions,
    );
  });
});
