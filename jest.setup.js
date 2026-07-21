/* eslint-env jest */
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const ReactNative = require('react-native');

  const createPanGesture = () => {
    const gesture = {
      runOnJS: () => gesture,
      enabled: () => gesture,
      minDistance: () => gesture,
      activeOffsetX: () => gesture,
      activeOffsetY: () => gesture,
      failOffsetX: () => gesture,
      failOffsetY: () => gesture,
      onBegin: () => gesture,
      onUpdate: () => gesture,
      onEnd: () => gesture,
      onFinalize: () => gesture,
    };

    return gesture;
  };

  return {
    __esModule: true,
    Gesture: {
      Pan: createPanGesture,
    },
    GestureDetector: ({ children }) => React.createElement(React.Fragment, null, children),
    GestureHandlerRootView: ({ children }) =>
      React.createElement(ReactNative.View, null, children),
  };
});

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
      Text: ReactNative.Text,
      createAnimatedComponent: component => component,
    },
    createAnimatedComponent: component => component,
    Easing: {
      bezier: jest.fn(() => value => value),
    },
    interpolate: (value, inputRange, outputRange) => {
      if (value <= inputRange[0]) {
        return outputRange[0];
      }

      if (value >= inputRange[inputRange.length - 1]) {
        return outputRange[outputRange.length - 1];
      }

      return outputRange[0];
    },
    useAnimatedStyle: updater => updater(),
    useSharedValue: value => ({ value }),
    cancelAnimation: jest.fn(),
    runOnJS: jest.fn(fn => fn),
    withDelay: (_delay, value) => value,
    withTiming: jest.fn(value => value),
  };
});

jest.mock('@react-native-documents/picker', () => ({
  __esModule: true,
  errorCodes: {
    OPERATION_CANCELED: 'OPERATION_CANCELED',
  },
  isErrorWithCode: error => error && typeof error.code === 'string',
  pick: jest.fn(),
  types: {
    images: 'image/*',
  },
}));

jest.mock('react-native-image-picker', () => ({
  __esModule: true,
  launchImageLibrary: jest.fn(),
}));
