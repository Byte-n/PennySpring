import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@pennyspring/theme';
import { App as PSApp } from '@pennyspring/ui';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { useBookStore } from './src/stores/bookStore';
import { rehydrateNetworkBooks } from './src/stores/networkBookStore';
import { ThemeModeProvider, useThemeMode } from './src/contexts/ThemeModeContext';

function AppContent() {
  const initializeBook = useBookStore((state) => state.initializeBook);
  const { themeMode } = useThemeMode();

  useEffect(() => {
    rehydrateNetworkBooks();
    initializeBook().catch((error) => {
      console.error('Book initialization failed:', error);
    });
  }, [initializeBook]);

  const isDark = themeMode === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: themeMode }}>
        <NavigationContainer ref={rootNavigationRef}>
          <PSApp>
            <RootStackNavigator />
          </PSApp>
        </NavigationContainer>
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
