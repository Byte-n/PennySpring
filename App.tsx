import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { App as PSApp, useTheme } from '@pennyspring/ui';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { linking } from './src/navigation/linking';
import { AgentRoot } from './src/agent/ui/AgentRoot';
import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { useAutoBackup } from './src/features/backup/useAutoBackup';
import { reconcileInterruptedQuickBookDrafts } from './src/features/quickBookDraft/reconcileInterruptedDrafts';
import { cleanupQuickBookDraftsOnStartup } from './src/features/quickBookDraft/startupCleanup';
import { AutoUpdateChecker } from './src/features/appUpdate/AutoUpdateChecker';
import { BootScreen } from './src/screens/boot';
import {
  ThemeModeProvider,
  useThemeMode,
} from './src/contexts/ThemeModeContext';

interface NavigationShellProps {
  children: React.ReactNode;
  isDark: boolean;
}

/**
 * 将应用主题注入 React Navigation：原生栈/标签页的默认内容背景、卡片与文本色
 * 统一由导航根提供，屏幕无需各自兜底。
 */
function NavigationShell({ children, isDark }: NavigationShellProps) {
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
      theme={navigationTheme}
    >
      {children}
    </NavigationContainer>
  );
}

function AppContent() {
  const { themeMode, themeToken } = useThemeMode();
  const [isBooted, setIsBooted] = useState(false);

  useAutoBackup();

  const handleBootReady = useCallback(() => {
    setIsBooted(true);
  }, []);

  useEffect(() => {
    if (!isBooted) {
      return;
    }
    reconcileInterruptedQuickBookDrafts().catch(error => {
      console.error('Quick book draft reconciliation failed:', error);
    });
    cleanupQuickBookDraftsOnStartup().catch(error => {
      console.error('Quick book draft cleanup failed:', error);
    });
  }, [isBooted]);

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

  const isDark = themeMode === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <PSApp themeConfig={{ algorithm: themeMode, token: themeToken }}>
        <AutoUpdateChecker />
        {isBooted ? (
          <NavigationShell isDark={isDark}>
            <AgentRoot>
              <RootStackNavigator />
            </AgentRoot>
          </NavigationShell>
        ) : (
          <BootScreen onReady={handleBootReady} />
        )}
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
