import type { HeaderBarProps, SegmentedControlProps } from '../src/TopTabNavigator/types';

describe('TopTabNavigator types module', () => {
  it('exports HeaderBarProps from types.ts', () => {
    const props: HeaderBarProps = {
      descriptors: {},
      navigation: { navigate: jest.fn() },
      state: { index: 0, routes: [] },
    };
    expect(props).toBeDefined();
  });

  it('exports SegmentedControlProps from types.ts', () => {
    const props: SegmentedControlProps = {
      descriptors: {},
      navigation: { navigate: jest.fn() },
      state: { index: 0, routes: [] },
    };
    expect(props).toBeDefined();
  });
});
