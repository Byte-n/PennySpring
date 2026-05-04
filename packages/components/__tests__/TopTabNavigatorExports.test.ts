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

describe('TopTabNavigator exports', () => {
  it('exports TopTabNavigator from the package entry point', () => {
    const { TopTabNavigator } = require('../src/index');

    expect(typeof TopTabNavigator).toBe('function');
  });
});
