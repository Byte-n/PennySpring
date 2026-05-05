import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ConfigProvider, useComponentConfig } from '../src/ConfigProvider';
import type { PageConfig } from '../src/ConfigProvider';

interface ConfigProbeProps {
  onRead: (pageConfig: PageConfig | undefined) => void;
}

function ConfigProbe({ onRead }: ConfigProbeProps) {
  const config = useComponentConfig();

  onRead(config.page);

  return <Text>config probe</Text>;
}

describe('ConfigProvider', () => {
  it('returns empty config when rendered without a provider', () => {
    const onRead = jest.fn();

    act(() => {
      renderer.create(<ConfigProbe onRead={onRead} />);
    });

    expect(onRead).toHaveBeenCalledWith(undefined);
  });

  it('provides page config from top-level shortcut props', () => {
    const onBack = jest.fn();
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <ConfigProvider page={{ onBack }}>
          <ConfigProbe onRead={onRead} />
        </ConfigProvider>,
      );
    });

    expect(onRead).toHaveBeenCalledWith({ onBack });
  });

  it('provides page config from the config prop', () => {
    const onBack = jest.fn();
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <ConfigProvider config={{ page: { onBack } }}>
          <ConfigProbe onRead={onRead} />
        </ConfigProvider>,
      );
    });

    expect(onRead).toHaveBeenCalledWith({ onBack });
  });

  it('uses inner provider values over outer provider values', () => {
    const outerBack = jest.fn();
    const innerBack = jest.fn();
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <ConfigProvider page={{ onBack: outerBack }}>
          <ConfigProvider page={{ onBack: innerBack }}>
            <ConfigProbe onRead={onRead} />
          </ConfigProvider>
        </ConfigProvider>,
      );
    });

    expect(onRead).toHaveBeenCalledWith({ onBack: innerBack });
  });

  it('shallow merges nested provider component groups', () => {
    const outerBack = jest.fn();
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <ConfigProvider page={{ onBack: outerBack }}>
          <ConfigProvider config={{ page: {} }}>
            <ConfigProbe onRead={onRead} />
          </ConfigProvider>
        </ConfigProvider>,
      );
    });

    expect(onRead).toHaveBeenCalledWith({ onBack: outerBack });
  });

  it('uses top-level shortcut props over config prop values on the same provider', () => {
    const configBack = jest.fn();
    const shortcutBack = jest.fn();
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <ConfigProvider
          config={{ page: { onBack: configBack } }}
          page={{ onBack: shortcutBack }}
        >
          <ConfigProbe onRead={onRead} />
        </ConfigProvider>,
      );
    });

    expect(onRead).toHaveBeenCalledWith({ onBack: shortcutBack });
  });
});
