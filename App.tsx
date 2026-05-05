import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ConfigProvider } from '@pennyspring/component';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { rootNavigationRef } from './src/navigation/rootNavigationRef';

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
  const handleBack = React.useCallback(() => {
    if (rootNavigationRef.isReady() && rootNavigationRef.canGoBack()) {
      rootNavigationRef.goBack();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ThemeProvider config={{ algorithm: isDarkMode ? 'dark' : 'default' }}>
        <ConfigProvider page={{ onBack: handleBack }}>
          <AppContent />
        </ConfigProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
