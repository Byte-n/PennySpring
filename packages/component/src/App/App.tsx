import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ConfigProvider } from '../ConfigProvider';
import { PortalProvider } from '../Portal';
import type { AppProps } from './types';

export function App({ children, config }: AppProps): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ConfigProvider config={config}>
        <PortalProvider>{children}</PortalProvider>
      </ConfigProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
