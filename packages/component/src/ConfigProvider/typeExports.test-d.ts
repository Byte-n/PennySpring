import type {
  ComponentConfig,
  ConfigProviderProps,
  PageConfig,
} from '@pennyspring/component';

const pageConfig: PageConfig = {
  onBack: () => {},
};

const componentConfig: ComponentConfig = {
  page: pageConfig,
};

const providerProps: ConfigProviderProps = {
  config: componentConfig,
  page: pageConfig,
};

export { componentConfig, pageConfig, providerProps };
