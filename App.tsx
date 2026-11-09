import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { App as PSApp, useTheme } from '@pennyspring/ui';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { linking } from './src/navigation/linking';
import { AgentRoot } from './src/agent/ui/AgentRoot';
import { BookSelectNavigator } from './src/navigation/BookSelectNavigator';
import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { useBookStore } from './src/stores/bookStore';
import { rehydrateNetworkBooks } from './src/stores/networkBookStore';
import { useAutoBackup } from './src/features/backup/useAutoBackup';
import { reconcileInterruptedQuickBookDrafts } from './src/features/quickBookDraft/reconcileInterruptedDrafts';
import { cleanupQuickBookDraftsOnStartup } from './src/features/quickBookDraft/startupCleanup';
import { useQuickTemplateWidgetSync } from './src/features/quickTemplateWidget/useQuickTemplateWidgetSync';
import { AutoUpdateChecker } from './src/features/appUpdate/AutoUpdateChecker';
import {
  ThemeModeProvider,
  useThemeMode,
} from './src/contexts/ThemeModeContext';
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
      linking={linking}
      onReady={onReady}
      theme={navigationTheme}
    >
      {children}
    </NavigationContainer>
  );
}

function AppContent() {
  const initializeBook = useBookStore(state => state.initializeBook);
  const initStatus = useBookStore(state => state.initStatus);
  const { themeMode, themeToken } = useThemeMode();
  const splashHiddenRef = useRef(false);

  useAutoBackup();
  useQuickTemplateWidgetSync();

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
    const bootstrap = async (): Promise<void> => {
      try {
        await rehydrateNetworkBooks();
      } catch (error) {
        console.error('Network book rehydration failed:', error);
      }
      await initializeBook();
      try {
        await reconcileInterruptedQuickBookDrafts();
      } catch (error) {
        console.error('Quick book draft reconciliation failed:', error);
      }
      try {
        await cleanupQuickBookDraftsOnStartup();
      } catch (error) {
        console.error('Quick book draft cleanup failed:', error);
      }
    };
    bootstrap().catch(error => {
      console.error('Book initialization failed:', error);
    });
  }, [initializeBook]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        return;
      }
      reconcileInterruptedQuickBookDrafts().catch(error => {
        console.error('Quick book draft reconciliation failed:', error);
      });
    });
    return () => subscription.remove();
  }, []);

  // 启动页/失败页已经上屏，原生 splash 就该退场，否则会盖住品牌页与文案。
  // 成功分支推迟到导航 onReady，避免导航容器首帧还是空白时提前露出白屏。
  useEffect(() => {
    if (initStatus !== 'success') {
      hideBootSplash();
    }
  }, [initStatus, hideBootSplash]);

  const isDark = themeMode === 'dark';
  const content =
    initStatus === 'loading' || initStatus === 'idle' ? (
      <BookLoadingScreen />
    ) : initStatus === 'error' ? (
      <NavigationShell isDark={isDark}>
        <BookSelectNavigator />
      </NavigationShell>
    ) : (
      <NavigationShell isDark={isDark} onReady={hideBootSplash}>
        <AgentRoot>
          <RootStackNavigator />
        </AgentRoot>
      </NavigationShell>
    );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <PSApp themeConfig={{ algorithm: themeMode, token: themeToken }}>
        <AutoUpdateChecker />
        {content}
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
