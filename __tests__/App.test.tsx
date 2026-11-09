import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import BootSplash from 'react-native-bootsplash';
import App from '../App';
import { RootStackNavigator } from '../src/navigation';

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: { OS: 'ios' },
  StatusBar: 'StatusBar',
  View: 'View',
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@pennyspring/theme', () => ({
  themePresets: [
    'default',
    'april',
    'kaori',
    'penny',
    'spring',
    'yonder',
    'mauve',
    'cocoa',
    'slate',
    'mono',
  ].map(value => ({ label: value, value, data: {} })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    token: {
      colorPrimary: '#1677ff',
      colorBgLayout: '#f5f5f5',
      colorBgContainer: '#ffffff',
      colorText: 'rgba(0, 0, 0, 0.88)',
      colorBorderSecondary: '#f0f0f0',
      colorError: '#ff4d4f',
    },
  }),
}));

jest.mock('@pennyspring/ui', () => ({
  App: ({ children }: { children: React.ReactNode }) => children,
  Column: ({ children }: { children: React.ReactNode }) => children,
  Loading: () => null,
  Text: 'Text',
  createUseSheetStyle: () => () => ({}),
  useTheme: () => ({
    token: {
      colorPrimary: '#1677ff',
      colorBgLayout: '#f5f5f5',
      colorBgContainer: '#ffffff',
      colorText: 'rgba(0, 0, 0, 0.88)',
      colorBorderSecondary: '#f0f0f0',
      colorError: '#ff4d4f',
    },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  DefaultTheme: {
    dark: false,
    colors: {
      primary: '#1677ff',
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#000000',
      border: '#f0f0f0',
      notification: '#ff4d4f',
    },
    fonts: {},
  },
  NavigationContainer: ({
    children,
    onReady,
  }: {
    children: React.ReactNode;
    onReady?: () => void;
  }) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');

    useEffect(() => {
      onReady?.();
    }, [onReady]);

    return children;
  },
}));

jest.mock('../src/navigation', () => ({
  rootNavigationRef: {},
  RootStackNavigator: jest.fn(() => null),
}));

jest.mock('../src/agent/ui/AgentRoot', () => ({
  AgentRoot: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/features/appUpdate/AutoUpdateChecker', () => ({
  AutoUpdateChecker: () => null,
}));

jest.mock('../src/features/quickBookDraft/reconcileInterruptedDrafts', () => ({
  reconcileInterruptedQuickBookDrafts: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/features/quickBookDraft/startupCleanup', () => ({
  cleanupQuickBookDraftsOnStartup: jest.fn(() => Promise.resolve()),
}));

type MockBookHydration = {
  ref:
    | { kind: 'local'; id: number }
    | { kind: 'remote'; serverUrl: string; bookId: number }
    | null;
  needsMetadata: boolean;
};

let mockHydrateBookSession = jest.fn(async (): Promise<MockBookHydration> => ({
  ref: { kind: 'remote', serverUrl: 'http://example.com', bookId: 1 },
  needsMetadata: true,
}));
let mockLoadCurrentBook = jest.fn(() => Promise.resolve());

jest.mock('../src/stores/bookStore', () => ({
  useBookStore: (
    selector: (state: {
      hydrateBookSession: typeof mockHydrateBookSession;
      loadCurrentBook: typeof mockLoadCurrentBook;
    }) => unknown,
  ) =>
    selector({
      hydrateBookSession: mockHydrateBookSession,
      loadCurrentBook: mockLoadCurrentBook,
    }),
}));

jest.mock('../src/stores/networkBookStore', () => ({
  rehydrateNetworkBooks: jest.fn(),
}));

jest.mock('../src/contexts/ThemeModeContext', () => ({
  ThemeModeProvider: ({ children }: { children: React.ReactNode }) => children,
  useThemeMode: () => ({ themeMode: 'default' }),
}));

describe('App launch', () => {
  let renderer: TestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    mockHydrateBookSession = jest.fn(async (): Promise<MockBookHydration> => ({
      ref: { kind: 'remote', serverUrl: 'http://example.com', bookId: 1 },
      needsMetadata: true,
    }));
    mockLoadCurrentBook = jest.fn(() => Promise.resolve());
    jest.mocked(RootStackNavigator).mockClear();
    jest.mocked(BootSplash.hide).mockClear();
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    renderer = null;
  });

  test('enters the app after hydration without waiting for remote metadata', async () => {
    let resolveHydration: (value: MockBookHydration) => void = () => undefined;
    mockHydrateBookSession = jest.fn(
      () =>
        new Promise<MockBookHydration>(resolve => {
          resolveHydration = resolve;
        }),
    );
    mockLoadCurrentBook = jest.fn(() => new Promise<void>(() => undefined));

    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });

    expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
    expect(RootStackNavigator).not.toHaveBeenCalled();

    await act(async () => {
      resolveHydration({
        ref: { kind: 'remote', serverUrl: 'http://example.com', bookId: 1 },
        needsMetadata: true,
      });
    });

    expect(mockLoadCurrentBook).toHaveBeenCalledTimes(1);
    expect(RootStackNavigator).toHaveBeenCalled();
  });

  test('waits for local metadata before entering the app', async () => {
    mockHydrateBookSession = jest.fn(async (): Promise<MockBookHydration> => ({
      ref: { kind: 'local', id: 1 },
      needsMetadata: true,
    }));
    let resolveLoad: () => void = () => undefined;
    mockLoadCurrentBook = jest.fn(
      () =>
        new Promise<void>(resolve => {
          resolveLoad = resolve;
        }),
    );

    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });

    expect(RootStackNavigator).not.toHaveBeenCalled();

    await act(async () => {
      resolveLoad();
    });

    expect(RootStackNavigator).toHaveBeenCalled();
  });

  test('enters the app when book hydration fails', async () => {
    mockHydrateBookSession = jest.fn(() =>
      Promise.reject(new Error('存储不可用')),
    );
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      await act(async () => {
        renderer = TestRenderer.create(<App />);
      });

      expect(RootStackNavigator).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  test('enters the app when book hydration stalls', async () => {
    mockHydrateBookSession = jest.fn(
      () => new Promise<MockBookHydration>(() => undefined),
    );
    jest.useFakeTimers();
    try {
      await act(async () => {
        renderer = TestRenderer.create(<App />);
      });
      expect(RootStackNavigator).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(2_000);
      });

      expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
      expect(RootStackNavigator).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
