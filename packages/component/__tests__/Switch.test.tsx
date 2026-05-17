import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Switch } from '../src/Switch';
import type { SwitchProps } from '../src/Switch';

const token = formatToken(derivative(defaultSeedToken, false));

function renderSwitch(props: Partial<SwitchProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <Switch {...props} />
      </>,
    );
  });

  return testRenderer!;
}

function pressSwitch(testRenderer: renderer.ReactTestRenderer) {
  const target = testRenderer.root.findByProps({
    testID: 'switch',
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

function getTrackStyle(testRenderer: renderer.ReactTestRenderer) {
  const track = testRenderer.root.findByProps({
    testID: 'switch',
  });

  return Object.assign({}, ...track.props.style({ pressed: false }));
}

describe('Switch', () => {
  it('toggles uncontrolled value and reports next state', () => {
    const onChange = jest.fn();
    const testRenderer = renderSwitch({
      defaultValue: false,
      onChange,
    });

    pressSwitch(testRenderer);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('keeps controlled value while still reporting changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderSwitch({
      value: false,
      onChange,
    });

    pressSwitch(testRenderer);
    const thumb = testRenderer.root.findByProps({
      testID: 'switch-thumb',
    });

    expect(onChange).toHaveBeenCalledWith(true);
    expect(thumb.props.style[2]).toBeNull();
  });

  it('does not change when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledSwitch = renderSwitch({
      disabled: true,
      onChange,
    });
    const readonlySwitch = renderSwitch({
      readonly: true,
      onChange,
    });

    const disabledTarget = pressSwitch(disabledSwitch);
    pressSwitch(readonlySwitch);

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledTarget.props.disabled).toBe(true);
  });

  it('supports small and large sizes', () => {
    const smallSwitch = renderSwitch({
      size: 'small',
    });
    const normalSwitch = renderSwitch({
      size: 'normal',
    });
    const largeSwitch = renderSwitch({
      size: 'large',
    });

    expect(getTrackStyle(smallSwitch).width).toBe(token.controlHeightSM);
    expect(getTrackStyle(normalSwitch).width).toBe(token.controlHeight);
    expect(getTrackStyle(largeSwitch).width).toBe(token.controlHeightLG);
  });
});
