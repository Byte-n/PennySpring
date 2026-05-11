import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
    withRepeat: (value: number) => value,
  };
});

import { Skeleton } from '../src/Skeleton';

const token = formatToken(derivative(defaultSeedToken, false));

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function renderSkeleton(props: React.ComponentProps<typeof Skeleton> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Skeleton {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

describe('Skeleton', () => {
  it('renders line shape by default', () => {
    const testRenderer = renderSkeleton();
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);

    expect(rootStyle.borderRadius).toBe(token.borderRadiusSM);
    expect(rootStyle.height).toBe(token.fontSize);
    expect(rootStyle.width).toBe('100%');
  });

  it('renders circle shape with full rounding', () => {
    const testRenderer = renderSkeleton({ shape: 'circle' });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);
    const expectedSize = token.controlHeightSM;

    expect(rootStyle.width).toBe(expectedSize);
    expect(rootStyle.height).toBe(expectedSize);
    expect(rootStyle.borderRadius).toBe(expectedSize / 2);
  });

  it('renders rect shape with default borderRadius', () => {
    const testRenderer = renderSkeleton({ shape: 'rect' });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);

    expect(rootStyle.borderRadius).toBe(token.borderRadius);
  });

  it('renders children instead of skeleton when loading is false', () => {
    const testRenderer = renderSkeleton({
      loading: false,
      children: <View testID="content" />,
    });

    const content = testRenderer.root.findByProps({ testID: 'content' });

    expect(content).toBeTruthy();

    const views = testRenderer.root.findAllByType(View);
    const hasSkeletonBg = views.some(node => {
      const flat = flattenStyle(node.props.style);

      return flat.backgroundColor === token.colorFillContent;
    });

    expect(hasSkeletonBg).toBe(false);
  });

  it('renders skeleton when loading is true even with children', () => {
    const testRenderer = renderSkeleton({
      loading: true,
      children: <View testID="content" />,
    });

    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);

    expect(rootStyle.backgroundColor).toBe(token.colorFillContent);
    expect(() => testRenderer.root.findByProps({ testID: 'content' })).toThrow();
  });

  it('applies custom width and height', () => {
    const testRenderer = renderSkeleton({ width: 200, height: 50 });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);

    expect(rootStyle.width).toBe(200);
    expect(rootStyle.height).toBe(50);
  });

  it('applies custom borderRadius', () => {
    const testRenderer = renderSkeleton({ borderRadius: 12 });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);

    expect(rootStyle.borderRadius).toBe(12);
  });

  it('merges external style overrides', () => {
    const externalStyle = { opacity: 0.5 };
    const testRenderer = renderSkeleton({ style: externalStyle });
    const root = testRenderer.root.findByType(View);

    expect(root.props.style).toContain(externalStyle);
  });
});
