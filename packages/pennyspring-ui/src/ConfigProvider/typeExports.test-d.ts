import type {
  ComponentConfig,
  ConfigProviderProps,
} from '@pennyspring/ui';

const componentConfig: ComponentConfig = {};

const providerProps: ConfigProviderProps = {
  config: componentConfig,
};

// @ts-expect-error ComponentConfig should reject primitive values.
const invalidComponentConfig: ComponentConfig = 1;

// @ts-expect-error ConfigProviderProps.config should only accept ComponentConfig.
const invalidProviderProps: ConfigProviderProps = {
  config: 'invalid',
};

export {
  componentConfig,
  invalidComponentConfig,
  invalidProviderProps,
  providerProps,
};
