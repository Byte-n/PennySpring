import React from 'react';
import type {
  ComponentConfig,
  ConfigProviderProps,
  PageConfig,
} from './types';

const DEFAULT_COMPONENT_CONFIG: ComponentConfig = {};

const ConfigContext = React.createContext<ComponentConfig>(DEFAULT_COMPONENT_CONFIG);

function mergePageConfig(
  parentPageConfig: PageConfig | undefined,
  configPageConfig: PageConfig | undefined,
  shortcutPageConfig: PageConfig | undefined,
): PageConfig | undefined {
  if (
    parentPageConfig === undefined &&
    configPageConfig === undefined &&
    shortcutPageConfig === undefined
  ) {
    return undefined;
  }

  return {
    ...parentPageConfig,
    ...configPageConfig,
    ...shortcutPageConfig,
  };
}

export function ConfigProvider({
  children,
  config,
  page,
}: ConfigProviderProps): React.JSX.Element {
  const parentConfig = useComponentConfig();
  const value = React.useMemo<ComponentConfig>(
    () => ({
      ...parentConfig,
      ...config,
      page: mergePageConfig(parentConfig.page, config?.page, page),
    }),
    [config, page, parentConfig],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useComponentConfig(): ComponentConfig {
  return React.useContext(ConfigContext);
}
