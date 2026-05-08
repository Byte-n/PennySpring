import type {
  ComponentConfig,
  ConfigProviderProps,
} from '@pennyspring/component';

const componentConfig: ComponentConfig = {};

const providerProps: ConfigProviderProps = {
  config: componentConfig,
};

export { componentConfig, providerProps };
