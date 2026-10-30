require('./src/agent/runtime/polyfills');

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
    withTiming: jest.fn((value, _config, callback) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    }),
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
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// op-sqlite 是原生模块，单元测试中统一 mock，避免 bookStorage 初始化时加载其 ESM 产物报错。
jest.mock('@op-engineering/op-sqlite', () => ({
  __esModule: true,
  open: jest.fn(),
  Storage: jest.fn().mockImplementation(() => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  })),
}));

// 语音识别依赖原生模块，单元测试只验证会话编排，统一替换为可注入的桩。
jest.mock('react-native-sherpa-onnx/stt', () => ({
  __esModule: true,
  createStreamingSTT: jest.fn(),
}));

jest.mock('react-native-sherpa-onnx/audio', () => ({
  __esModule: true,
  createPcmLiveStream: jest.fn(),
}));
