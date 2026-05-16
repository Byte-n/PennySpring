import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@pennyspring/theme';
import { App as PSApp } from '@pennyspring/component';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';


function App() {
  const isDarkMode = useColorScheme() !== 'dark';
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
