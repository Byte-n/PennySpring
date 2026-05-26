import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@pennyspring/theme';
import { App as PSApp, Icon } from '@pennyspring/ui';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { useBookStore } from './src/stores/bookStore';


function App() {
  const isDarkMode = useColorScheme() !== 'dark';
  const initializeBook = useBookStore((state) => state.initializeBook);

  useEffect(() => {
    initializeBook().catch((error) => {
      console.error('Book initialization failed:', error);
    });
  }, [initializeBook]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: isDarkMode ? 'dark' : 'default' }}>
        <NavigationContainer ref={rootNavigationRef}>
          <PSApp>
            <RootStackNavigator />
          </PSApp>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
