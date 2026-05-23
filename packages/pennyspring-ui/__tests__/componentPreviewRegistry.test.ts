import { getComponentDemoPreviewsByComponentId } from '../examples/previews/registry';

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    Easing: {
      bezier: (...args: unknown[]) => args,
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({
      value,
    }),
    runOnJS: (fn: (...args: unknown[]) => void) => fn,
    withTiming: (value: number) => value,
    createAnimatedComponent: (component: unknown) => component,
  };
});

jest.mock('@react-navigation/material-top-tabs', () => ({
  __esModule: true,
  createMaterialTopTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children?: React.ReactNode }) => children ?? null,
  }),
}));

describe('component preview registry', () => {
  it('returns demo previews for a component in registry order', () => {
    const previews = getComponentDemoPreviewsByComponentId('button');

    expect(previews.map(preview => preview.id)).toEqual([
      'button/block',
      'button/color-and-variant',
      'button/icon-and-state',
      'button/size-and-shape',
      'button/type',
    ]);
    expect(previews.map(preview => preview.description)).toEqual([
      'Block',
      'Color and variant',
      'Icon and state',
      'Size and shape',
      'Type',
    ]);
  });

  it('returns an empty array when no demo previews match the component id', () => {
    expect(getComponentDemoPreviewsByComponentId('missing')).toEqual([]);
  });
});
