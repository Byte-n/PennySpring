import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ReactNative.View
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({
      value
    }),
    withTiming: (value: number) => value,
    withRepeat: (value: number) => value
  };
});
import { Skeleton } from '../src/Skeleton';
function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}
function renderSkeleton(props: React.ComponentProps<typeof Skeleton> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Skeleton {...props} /></>);
  });
  return testRenderer!;
}
describe('Skeleton', () => {
  it('applies custom width and height', () => {
    const testRenderer = renderSkeleton({
      width: 200,
      height: 50
    });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);
    expect(rootStyle.width).toBe(200);
    expect(rootStyle.height).toBe(50);
  });
  it('applies custom borderRadius', () => {
    const testRenderer = renderSkeleton({
      borderRadius: 12
    });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);
    expect(rootStyle.borderRadius).toBe(12);
  });
  it('merges external style overrides', () => {
    const externalStyle = {
      opacity: 0.5
    };
    const testRenderer = renderSkeleton({
      style: externalStyle
    });
    const root = testRenderer.root.findByType(View);
    expect(root.props.style).toContain(externalStyle);
  });
});
