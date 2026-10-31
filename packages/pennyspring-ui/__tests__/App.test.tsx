import React from 'react';
import { Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { App } from '../src/App';
import { Portal } from '../src/Portal';
import { useComponentConfig } from '../src/ConfigProvider';
import { useTheme } from '@pennyspring/theme';

jest.mock('react-native-gesture-handler', () => {
  const ReactLocal = require('react');

  return {
    GestureHandlerRootView: ({
      children,
      style,
    }: {
      children: React.ReactNode;
      style?: unknown;
    }) =>
      ReactLocal.createElement(
        'mock-gesture-handler-root-view',
        {
          style,
        },
        children,
      ),
  };
});

interface AppProbeProps {
  onRead: (config: ReturnType<typeof useComponentConfig>) => void;
}

function AppProbe({ onRead }: AppProbeProps) {
  const config = useComponentConfig();

  onRead(config);

  return (
    <View>
      <Text>App content</Text>
      <Portal>
        <Text>Portal content</Text>
      </Portal>
    </View>
  );
}

function ThemeProbe({ onRead }: { onRead: (color: string) => void }) {
  const { token } = useTheme();
  onRead(token.colorPrimary);
  return null;
}

describe('App', () => {
  it('provides component config and a portal host to children', () => {
    const onRead = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <App config={{}}>
          <AppProbe onRead={onRead} />
        </App>,
      );
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(onRead).toHaveBeenCalledWith({});
    expect(treeString).toContain('App content');
    expect(treeString).toContain('Portal content');
  });

  it('provides the configured theme to children', () => {
    const onRead = jest.fn();

    act(() => {
      renderer.create(
        <App themeConfig={{ token: { colorPrimary: '#ff0000' } }}>
          <ThemeProbe onRead={onRead} />
        </App>,
      );
    });

    expect(onRead).toHaveBeenCalledWith('#ff0000');
  });
});
