import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Text } from '../src/Text';
import { ProgressBar, ProgressCircle, clampPercent, resolveCircleRotation } from '../src/Progress/Progress';
function renderProgressBar(props: React.ComponentProps<typeof ProgressBar>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><ProgressBar {...props} /></>);
  });
  return testRenderer!;
}
function renderProgressCircle(props: React.ComponentProps<typeof ProgressCircle>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><ProgressCircle {...props} /></>);
  });
  return testRenderer!;
}
describe('Progress', () => {
  it('clamps percent into 0..100 range', () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(35)).toBe(35);
    expect(clampPercent(180)).toBe(100);
    expect(clampPercent(undefined)).toBe(0);
    expect(clampPercent(Number.NaN)).toBe(0);
  });
  it('hides info text when showInfo is false', () => {
    const testRenderer = renderProgressBar({
      percent: 60,
      showInfo: false
    });
    expect(testRenderer.root.findAllByType(Text)).toHaveLength(0);
  });
  it('supports custom info formatter', () => {
    const testRenderer = renderProgressBar({
      format: value => `done ${value}`,
      percent: 88
    });
    expect(JSON.stringify(testRenderer.toJSON())).toContain('done 88');
  });
  it('resolves circle rotations for both halves', () => {
    expect(resolveCircleRotation(25)).toEqual({
      left: 'rotate(0deg)',
      right: 'rotate(90deg)'
    });
    expect(resolveCircleRotation(75)).toEqual({
      left: 'rotate(90deg)',
      right: 'rotate(180deg)'
    });
  });
  it('renders circle info content', () => {
    const testRenderer = renderProgressCircle({
      percent: 66,
      format: value => <View testID={`circle-${value}`} />
    });
    expect(testRenderer.root.findByProps({
      testID: 'circle-66'
    })).toBeTruthy();
  });
});
