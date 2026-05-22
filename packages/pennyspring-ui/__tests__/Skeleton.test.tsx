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
  it('applies custom width via style and semantic size height', () => {
    const testRenderer = renderSkeleton({
      style: { width: 200 },
      size: 'large',
    });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);
    expect(rootStyle.width).toBe(200);
    expect(rootStyle.height).toBeGreaterThan(0);
  });
  it('applies shape border radius from token defaults', () => {
    const testRenderer = renderSkeleton({
      shape: 'rect'
    });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);
    expect(rootStyle.borderRadius).toBeGreaterThan(0);
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
