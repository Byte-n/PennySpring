import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';
import { App as PSApp } from '@pennyspring/component';
import { rootNavigationRef, RootStackNavigator } from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';

const useStyles = createUseSheetStyle(token => ({
  safeArea: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
}));

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = useStyles();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: isDarkMode ? 'dark' : 'default' }}>
        <SafeAreaView
          edges={['top', 'right', 'bottom', 'left']}
          style={[styles.safeArea]}
        >
          <NavigationContainer ref={rootNavigationRef}>
            <PSApp>
              <RootStackNavigator />
            </PSApp>
          </NavigationContainer>
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
