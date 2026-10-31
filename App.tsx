import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { App as PSApp, useTheme } from '@pennyspring/ui';
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
  const splashHiddenRef = useRef(false);

  const hideBootSplash = useCallback(() => {
    if (splashHiddenRef.current) {
      return;
    }
    splashHiddenRef.current = true;
    BootSplash.hide({ fade: true }).catch(error => {
      console.error('Boot splash dismissal failed:', error);
    });
  }, []);

  useEffect(() => {
    rehydrateNetworkBooks();
    initializeBook().catch((error) => {
      console.error('Book initialization failed:', error);
    });
  }, [initializeBook]);

  // 启动页/失败页已经上屏，原生 splash 就该退场，否则会盖住品牌页与文案。
  // 成功分支推迟到导航 onReady，避免导航容器首帧还是空白时提前露出白屏。
  useEffect(() => {
    if (initStatus !== 'success') {
      hideBootSplash();
    }
  }, [initStatus, hideBootSplash]);

  const isDark = themeMode === 'dark';

  if (initStatus === 'loading' || initStatus === 'idle') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <PSApp themeConfig={{ algorithm: themeMode, token: themeToken }}>
          <BookLoadingScreen />
        </PSApp>
      </SafeAreaProvider>
    );
  }

  if (initStatus === 'error') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <PSApp themeConfig={{ algorithm: themeMode, token: themeToken }}>
          <NavigationShell isDark={isDark}>
            <BookSelectNavigator />
          </NavigationShell>
        </PSApp>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <PSApp themeConfig={{ algorithm: themeMode, token: themeToken }}>
        <NavigationShell
          isDark={isDark}
          onReady={hideBootSplash}
        >
          <AgentRoot>
            <RootStackNavigator />
          </AgentRoot>
        </NavigationShell>
      </PSApp>
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
