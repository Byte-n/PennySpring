import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import BootSplash from 'react-native-bootsplash';
import App from '../App';

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => ({
  StatusBar: 'StatusBar',
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@pennyspring/theme', () => ({
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
  RootStackNavigator: () => null,
}));

jest.mock('../src/agent/ui/AgentRoot', () => ({
  AgentRoot: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/navigation/BookSelectNavigator', () => ({
  BookSelectNavigator: () => null,
}));

jest.mock('../src/stores/bookStore', () => ({
  useBookStore: (
    selector: (state: {
      initializeBook: () => Promise<void>;
      initStatus: string;
    }) => unknown,
  ) =>
    selector({
      initializeBook: jest.fn(() => Promise.resolve()),
      initStatus: 'ready',
    }),
}));

jest.mock('../src/stores/networkBookStore', () => ({
  rehydrateNetworkBooks: jest.fn(),
}));

jest.mock('../src/contexts/ThemeModeContext', () => ({
  ThemeModeProvider: ({ children }: { children: React.ReactNode }) => children,
  useThemeMode: () => ({ themeMode: 'default' }),
}));

jest.mock('../src/screens/bookLoading', () => ({
  BookLoadingScreen: () => null,
}));

describe('App launch', () => {
  test('hides the native launch screen after navigation is ready', async () => {
    await act(async () => {
      TestRenderer.create(<App />);
    });

    expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
  });
});
