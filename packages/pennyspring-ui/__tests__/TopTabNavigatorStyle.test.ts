import { useTopTabNavigatorStyles } from '../src/TopTabNavigator/style';
import { useHeaderBarStyles } from '../src/TopTabNavigator/style';
import { useSegmentedControlStyles } from '../src/TopTabNavigator/style';

describe('TopTabNavigator style module', () => {
  it('exports useTopTabNavigatorStyles hook from style/index.ts', () => {
    expect(useTopTabNavigatorStyles).toBeDefined();
    expect(typeof useTopTabNavigatorStyles).toBe('function');
  });

  it('exports useHeaderBarStyles hook from style/index.ts', () => {
    expect(useHeaderBarStyles).toBeDefined();
    expect(typeof useHeaderBarStyles).toBe('function');
  });

  it('exports useSegmentedControlStyles hook from style/index.ts', () => {
    expect(useSegmentedControlStyles).toBeDefined();
    expect(typeof useSegmentedControlStyles).toBe('function');
  });
});
