import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Text } from '../src/Text';
import {
  Progress,
  ProgressBar,
  ProgressCircle,
  clampPercent,
  resolveCircleRotation,
} from '../src/Progress/Progress';

const token = formatToken(derivative(defaultSeedToken, false));

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function renderProgressBar(props: React.ComponentProps<typeof ProgressBar>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <ProgressBar {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function renderProgressCircle(props: React.ComponentProps<typeof ProgressCircle>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <ProgressCircle {...props} />
      </ThemeProvider>,
    );
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

  it('maps bar percent to indicator width', () => {
    const testRenderer = renderProgressBar({ percent: 35 });
    const indicator = testRenderer.root.find((node) => {
      const style = flattenStyle(node.props.style);

      return style.width === '35%' && style.height === '100%';
    });

    expect(flattenStyle(indicator.props.style).width).toBe('35%');
  });

  it('uses success and exception status colors', () => {
    const successRenderer = renderProgressBar({ percent: 20, status: 'success' });
    const errorRenderer = renderProgressBar({ percent: 20, status: 'exception' });

    const successIndicator = successRenderer.root.find((node) => {
      const style = flattenStyle(node.props.style);

      return style.width === '20%';
    });
    const errorIndicator = errorRenderer.root.find((node) => {
      const style = flattenStyle(node.props.style);

      return style.width === '20%';
    });

    expect(flattenStyle(successIndicator.props.style).backgroundColor)
      .toBe(token.colorSuccess);
    expect(flattenStyle(errorIndicator.props.style).backgroundColor)
      .toBe(token.colorError);
  });

  it('hides info text when showInfo is false', () => {
    const testRenderer = renderProgressBar({
      percent: 60,
      showInfo: false,
    });

    expect(testRenderer.root.findAllByType(Text)).toHaveLength(0);
  });

  it('supports custom info formatter', () => {
    const testRenderer = renderProgressBar({
      format: value => `done ${value}`,
      percent: 88,
    });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('done 88');
  });

  it('resolves circle rotations for both halves', () => {
    expect(resolveCircleRotation(25)).toEqual({
      left: 'rotate(0deg)',
      right: 'rotate(90deg)',
    });
    expect(resolveCircleRotation(75)).toEqual({
      left: 'rotate(90deg)',
      right: 'rotate(180deg)',
    });
  });

  it('renders circle info content', () => {
    const testRenderer = renderProgressCircle({
      percent: 66,
      format: value => <View testID={`circle-${value}`} />,
    });

    expect(testRenderer.root.findByProps({ testID: 'circle-66' })).toBeTruthy();
  });
});
