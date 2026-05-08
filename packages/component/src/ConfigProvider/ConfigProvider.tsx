import React from 'react';
import type { ComponentConfig, ConfigProviderProps } from './types';

const DEFAULT_COMPONENT_CONFIG: ComponentConfig = {};

const ConfigContext = React.createContext<ComponentConfig>(DEFAULT_COMPONENT_CONFIG);

export function ConfigProvider({
  children,
  config,
}: ConfigProviderProps): React.JSX.Element {
  const parentConfig = useComponentConfig();
  const value = React.useMemo<ComponentConfig>(
    () => ({
      ...parentConfig,
      ...config,
    }),
    [config, parentConfig],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useComponentConfig(): ComponentConfig {
  return React.useContext(ConfigContext);
}
