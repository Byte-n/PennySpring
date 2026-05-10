jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    interpolate: (value: number) => value,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const ReactNative = require('react-native');

  return {
    GestureHandlerRootView: ReactNative.View,
  };
});

describe('TopTabNavigator exports', () => {
  it('exports TopTabNavigator from the package entry point', () => {
    const { TopTabNavigator } = require('../src/index');

    expect(typeof TopTabNavigator).toBe('function');
  });

  it('exports ConfigProvider APIs from the package entry point', () => {
    const { ConfigProvider, useComponentConfig } = require('../src/index');

    expect(typeof ConfigProvider).toBe('function');
    expect(typeof useComponentConfig).toBe('function');
  });

  it('exports App from the package entry point', () => {
    const { App } = require('../src/index');

    expect(typeof App).toBe('function');
  });

  it('exports Progress from the package entry point', () => {
    const { Progress } = require('../src/index');

    expect(typeof Progress).toBe('function');
    expect(typeof Progress.Bar).toBe('function');
    expect(typeof Progress.Circle).toBe('function');
  });
});
