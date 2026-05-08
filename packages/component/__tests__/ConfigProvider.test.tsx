import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ConfigProvider, useComponentConfig } from '../src/ConfigProvider';

interface ConfigProbeProps {
  onRead: (config: ReturnType<typeof useComponentConfig>) => void;
}

function ConfigProbe({ onRead }: ConfigProbeProps) {
  const config = useComponentConfig();

  onRead(config);

  return <Text>config probe</Text>;
}

describe('ConfigProvider', () => {
  it('returns empty config when rendered without a provider', () => {
    const onRead = jest.fn();

    act(() => {
      renderer.create(<ConfigProbe onRead={onRead} />);
    });

    expect(onRead).toHaveBeenCalledWith({});
  });

  it('provides config from the config prop', () => {
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <ConfigProvider config={{}}>
          <ConfigProbe onRead={onRead} />
        </ConfigProvider>,
      );
    });

    expect(onRead).toHaveBeenCalledWith({});
  });

  it('inherits outer config when nested providers have no config', () => {
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <ConfigProvider config={{}}>
          <ConfigProvider>
            <ConfigProbe onRead={onRead} />
          </ConfigProvider>
        </ConfigProvider>,
      );
    });

    expect(onRead).toHaveBeenCalledWith({});
  });
});
