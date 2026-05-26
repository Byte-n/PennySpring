import React from 'react';
import { StyleSheet } from 'react-native';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import renderer, { act } from 'react-test-renderer';
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

function findTextStyle(testRenderer: renderer.ReactTestRenderer) {
  const text = testRenderer.root.findByProps({
    testID: 'switch-text',
  });

  return StyleSheet.flatten(text.props.style);
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

  it('renders the text for the current boolean state', () => {
    const testRenderer = renderSwitch({
      checkedText: 'true',
      defaultValue: true,
      uncheckedText: 'false',
    });

    let text = testRenderer.root.findByProps({
      testID: 'switch-text',
    });

    expect(text.props.children).toBe('true');

    pressSwitch(testRenderer);
    text = testRenderer.root.findByProps({
      testID: 'switch-text',
    });

    expect(text.props.children).toBe('false');
  });

  it('reserves space on the thumb side so text is not covered', () => {
    const checkedRenderer = renderSwitch({
      checkedText: 'enabled',
      defaultValue: true,
      uncheckedText: 'disabled',
    });
    const uncheckedRenderer = renderSwitch({
      checkedText: 'enabled',
      defaultValue: false,
      uncheckedText: 'disabled',
    });
    const reservedSpace = token.fontSizeXL + token.lineWidth + token.lineWidth;

    expect(findTextStyle(checkedRenderer).right).toBe(reservedSpace);
    expect(findTextStyle(uncheckedRenderer).left).toBe(reservedSpace);
  });
});
