require('./src/agent/runtime/polyfills');

/* eslint-env jest */
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const ReactNative = require('react-native');

  const createGesture = () => {
    const gesture = {};
    const chainableMethods = [
      'runOnJS',
      'enabled',
      'minDistance',
      'minPointers',
      'maxPointers',
      'activeOffsetX',
      'activeOffsetY',
      'failOffsetX',
      'failOffsetY',
      'numberOfTaps',
      'maxDuration',
      'maxDistance',
      'requireExternalGestureToFail',
      'simultaneousWithExternalGesture',
      'blocksExternalGesture',
      'shouldCancelWhenOutside',
      'onBegin',
      'onStart',
      'onUpdate',
      'onEnd',
      'onChange',
      'onFinalize',
    ];

    chainableMethods.forEach(method => {
      gesture[method] = () => gesture;
    });

    return gesture;
  };

  const compose = (...gestures) => gestures[0] ?? createGesture();

  return {
    __esModule: true,
    Gesture: {
      Pan: createGesture,
      Pinch: createGesture,
      Tap: createGesture,
      LongPress: createGesture,
      Native: createGesture,
      Simultaneous: compose,
      Race: compose,
      Exclusive: compose,
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
    withRepeat: animation => animation,
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

// 文件访问是原生模块，单元测试统一用内存桩，避免加载 ESM 产物。
jest.mock('react-native-file-access', () => ({
  __esModule: true,
  Dirs: {
    CacheDir: '/mock/cache',
    DocumentDir: '/mock/documents',
    LibraryDir: '/mock/library',
    MainBundleDir: '/mock/bundle',
  },
  FileSystem: {
    exists: jest.fn(async () => false),
    mkdir: jest.fn(async path => path),
    writeFile: jest.fn(async () => undefined),
    readFile: jest.fn(async () => ''),
    statDir: jest.fn(async () => []),
    unlink: jest.fn(async () => undefined),
    fetch: jest.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {},
      getHeader: () => undefined,
      redirected: false,
      url: '',
    })),
    fetchManaged: jest.fn(),
  },
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
