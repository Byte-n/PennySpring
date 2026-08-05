import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { ThemeProvider } from '@pennyspring/theme';
import { App as PSApp } from '@pennyspring/ui';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { BookSelectNavigator } from './src/navigation/BookSelectNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { useBookStore } from './src/stores/bookStore';
import { rehydrateNetworkBooks } from './src/stores/networkBookStore';
import { ThemeModeProvider, useThemeMode } from './src/contexts/ThemeModeContext';
import { BookLoadingScreen } from './src/screens/bookLoading';

function AppContent() {
  const initializeBook = useBookStore((state) => state.initializeBook);
  const initStatus = useBookStore((state) => state.initStatus);
  const { themeMode } = useThemeMode();

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
        <ThemeProvider config={{ algorithm: themeMode }}>
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
        <ThemeProvider config={{ algorithm: themeMode }}>
          <NavigationContainer>
            <PSApp>
              <BookSelectNavigator />
            </PSApp>
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: themeMode }}>
        <NavigationContainer
          ref={rootNavigationRef}
          onReady={() => {
            BootSplash.hide({ fade: true }).catch(error => {
              console.error('Boot splash dismissal failed:', error);
            });
          }}
        >
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
