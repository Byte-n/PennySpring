import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

const useStyles = createUseSheetStyle((token) => ({
  safeArea: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
}));

function AppContent() {
  const styles = useStyles();

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[styles.safeArea]}>
      <AppNavigator />
    </SafeAreaView>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: isDarkMode ? 'dark' : 'default' }}>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
