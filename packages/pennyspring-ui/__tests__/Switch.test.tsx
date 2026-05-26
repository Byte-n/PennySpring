import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Switch } from '../src/Switch';
import type { SwitchProps } from '../src/Switch';

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

});
