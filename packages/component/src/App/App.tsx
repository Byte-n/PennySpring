import React from 'react';
import { ConfigProvider } from '../ConfigProvider';
import { PortalProvider } from '../Portal';
import type { AppProps } from './types';

export function App({ children, config }: AppProps): React.JSX.Element {
  return (
    <ConfigProvider config={config}>
      <PortalProvider>{children}</PortalProvider>
    </ConfigProvider>
  );
}
