import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';
import { ConfigProvider } from '../ConfigProvider';
import { PortalProvider } from '../Portal';
import type { AppProps } from './types';

const useStyles = createUseSheetStyle(() => ({
  root: {
    flex: 1,
  },
}));

export function App({
  children,
  config,
  themeConfig,
  style,
}: AppProps): React.JSX.Element {
  const styles = useStyles();

  return (
    <GestureHandlerRootView style={[styles.root, style]}>
      <ThemeProvider config={themeConfig}>
        <ConfigProvider config={config}>
          <PortalProvider>{children}</PortalProvider>
        </ConfigProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
