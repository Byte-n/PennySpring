import React, { useEffect, useMemo } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { ThemeProvider, useTheme } from '@pennyspring/theme';
import { App as PSApp } from '@pennyspring/ui';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { AgentRoot } from './src/agent/ui/AgentRoot';
import { BookSelectNavigator } from './src/navigation/BookSelectNavigator';
import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { useBookStore } from './src/stores/bookStore';
import { rehydrateNetworkBooks } from './src/stores/networkBookStore';
import { ThemeModeProvider, useThemeMode } from './src/contexts/ThemeModeContext';
import { BookLoadingScreen } from './src/screens/bookLoading';

interface NavigationShellProps {
  children: React.ReactNode;
  isDark: boolean;
  onReady?: () => void;
}

/**
 * 将应用主题注入 React Navigation：原生栈/标签页的默认内容背景、卡片与文本色
 * 统一由导航根提供，屏幕无需各自兜底。
 */
function NavigationShell({ children, isDark, onReady }: NavigationShellProps) {
  const { token } = useTheme();
  const navigationTheme = useMemo<Theme>(
    () => ({
      ...DefaultTheme,
      dark: isDark,
      colors: {
        ...DefaultTheme.colors,
        primary: token.colorPrimary,
        background: token.colorBgLayout,
        card: token.colorBgContainer,
        text: token.colorText,
        border: token.colorBorderSecondary,
        notification: token.colorError,
      },
    }),
    [isDark, token],
  );

  return (
    <NavigationContainer
      ref={rootNavigationRef}
      onReady={onReady}
      theme={navigationTheme}
    >
      {children}
    </NavigationContainer>
  );
}

function AppContent() {
  const initializeBook = useBookStore((state) => state.initializeBook);
  const initStatus = useBookStore((state) => state.initStatus);
  const { themeMode, themeToken } = useThemeMode();

  useEffect(() => {
    rehydrateNetworkBooks();
    initializeBook().catch((error) => {
      console.error('Book initialization failed:', error);
    });
  }, [initializeBook]);

  const isDark = themeMode === 'dark';

  if (initStatus === 'loading' || initStatus === 'idle') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ThemeProvider config={{ algorithm: themeMode, token: themeToken }}>
          <PSApp>
            <BookLoadingScreen />
          </PSApp>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (initStatus === 'error') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ThemeProvider config={{ algorithm: themeMode, token: themeToken }}>
          <NavigationShell isDark={isDark}>
            <PSApp>
              <BookSelectNavigator />
            </PSApp>
          </NavigationShell>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: themeMode, token: themeToken }}>
        <NavigationShell
          isDark={isDark}
          onReady={() => {
            BootSplash.hide({ fade: true }).catch(error => {
              console.error('Boot splash dismissal failed:', error);
            });
          }}
        >
          <PSApp>
            <RootStackNavigator />
            <AgentRoot />
          </PSApp>
        </NavigationShell>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function App() {
  const systemColorScheme = useColorScheme();
  const initialMode = systemColorScheme === 'dark' ? 'dark' : 'default';

  return (
    <ThemeModeProvider initialMode={initialMode}>
      <AppContent />
    </ThemeModeProvider>
  );
}

export default App;
