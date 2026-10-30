import React from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Skeleton } from '../src/Skeleton';

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    Easing: {
      bezier: (..._args: number[]) => (_t: number) => _t,
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withRepeat: (value: number) => value,
    withTiming: (value: number) => value,
  };
});

function renderSkeleton(props: React.ComponentProps<typeof Skeleton> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<Skeleton {...props} />);
  });
  return testRenderer!;
}

describe('Skeleton', () => {
  describe('loading state', () => {
    it('renders children when loading is false', () => {
      const testRenderer = renderSkeleton({
        loading: false,
        children: <RNText testID="child">Content</RNText>,
      });
      const child = testRenderer.root.findByProps({ testID: 'child' });
      expect(child).toBeTruthy();
      expect(child.props.children).toBe('Content');
    });

    it('renders placeholder when loading is true', () => {
      const testRenderer = renderSkeleton({ loading: true });
      const tree = JSON.stringify(testRenderer.toJSON());
      expect(tree).not.toContain('Content');
    });
  });

  describe('animated state', () => {
    it('renders shimmer layer when animated is true', () => {
      const testRenderer = renderSkeleton({ animated: true });
      const root = testRenderer.root;
      const views = root.findAllByType(View);
      // root View + shimmer Animated.View (mocked as View)
      expect(views.length).toBeGreaterThanOrEqual(2);
    });

    it('does not render shimmer layer when animated is false', () => {
      const testRenderer = renderSkeleton({ animated: false });
      const root = testRenderer.root;
      const views = root.findAllByType(View);
      // only root View, no shimmer
      expect(views.length).toBe(1);
    });
  });

  describe('shape variants', () => {
    it('renders with line shape by default', () => {
      const testRenderer = renderSkeleton();
      expect(testRenderer.toJSON()).toBeTruthy();
    });

    it('renders with circle shape', () => {
      const testRenderer = renderSkeleton({ shape: 'circle' });
      expect(testRenderer.toJSON()).toBeTruthy();
    });

    it('renders with rect shape', () => {
      const testRenderer = renderSkeleton({ shape: 'rect' });
      expect(testRenderer.toJSON()).toBeTruthy();
    });
  });

  describe('size variants', () => {
    it('renders with small size', () => {
      const testRenderer = renderSkeleton({ size: 'small' });
      expect(testRenderer.toJSON()).toBeTruthy();
    });

    it('renders with normal size by default', () => {
      const testRenderer = renderSkeleton();
      expect(testRenderer.toJSON()).toBeTruthy();
    });

    it('renders with large size', () => {
      const testRenderer = renderSkeleton({ size: 'large' });
      expect(testRenderer.toJSON()).toBeTruthy();
    });
  });

  describe('external styles', () => {
    it('applies root style slot from styles prop', () => {
      const customStyle = { opacity: 0.5 };
      const testRenderer = renderSkeleton({
        styles: { root: customStyle },
      });
      const root = testRenderer.root.findAllByType(View)[0];
      const appliedStyle = Array.isArray(root.props.style)
        ? root.props.style
        : [root.props.style];
      expect(appliedStyle).toEqual(
        expect.arrayContaining([expect.objectContaining(customStyle)]),
      );
    });
  });

  describe('dimension overrides', () => {
    it('applies width, height and borderRadius overrides', () => {
      const testRenderer = renderSkeleton({
        width: 120,
        height: 16,
        borderRadius: 8,
        animated: false,
      });
      const root = testRenderer.root.findAllByType(View)[0];
      const rootStyle = StyleSheet.flatten(root.props.style);

      expect(rootStyle.width).toBe(120);
      expect(rootStyle.height).toBe(16);
      expect(rootStyle.borderRadius).toBe(8);
    });

    it('accepts percentage width overrides', () => {
      const testRenderer = renderSkeleton({
        width: '58%',
        animated: false,
      });
      const root = testRenderer.root.findAllByType(View)[0];

      expect(StyleSheet.flatten(root.props.style).width).toBe('58%');
    });
  });
});
