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
