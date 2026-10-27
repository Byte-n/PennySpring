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

function findSwitch(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByProps({ testID: 'switch' });
}

function pressSwitch(testRenderer: renderer.ReactTestRenderer) {
  const target = findSwitch(testRenderer);

  act(() => {
    target.props.onPress();
  });

  return target;
}

describe('Switch', () => {
  it('toggles uncontrolled value and reports the next state', () => {
    const onChange = jest.fn();
    const testRenderer = renderSwitch({ defaultValue: false, onChange });

    pressSwitch(testRenderer);
    expect(onChange).toHaveBeenLastCalledWith(true);

    pressSwitch(testRenderer);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps a controlled value derived from props while reporting presses', () => {
    const onChange = jest.fn();
    const testRenderer = renderSwitch({ onChange, value: false });

    pressSwitch(testRenderer);
    pressSwitch(testRenderer);

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, true);
  });

  it('does not change when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledSwitch = renderSwitch({ disabled: true, onChange });
    const readonlySwitch = renderSwitch({ onChange, readonly: true });

    const disabledTarget = pressSwitch(disabledSwitch);
    pressSwitch(readonlySwitch);

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledTarget.props.disabled).toBe(true);
  });

  it('forwards press in and press out handlers', () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const testRenderer = renderSwitch({ onPressIn, onPressOut });
    const target = findSwitch(testRenderer);

    act(() => {
      target.props.onPressIn({});
      target.props.onPressOut({});
    });

    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it('renders the text for the current boolean state', () => {
    const testRenderer = renderSwitch({
      checkedText: '已开启',
      defaultValue: true,
      uncheckedText: '未开启',
    });

    let text = testRenderer.root.findByProps({ testID: 'switch-text' });
    expect(text.props.children).toBe('已开启');

    pressSwitch(testRenderer);
    text = testRenderer.root.findByProps({ testID: 'switch-text' });
    expect(text.props.children).toBe('未开启');
  });

  it('hides the text until both checked and unchecked texts are provided', () => {
    const onlyUnchecked = renderSwitch({ uncheckedText: '未开启' });
    const bothTexts = renderSwitch({
      checkedText: '已开启',
      uncheckedText: '未开启',
    });

    expect(
      onlyUnchecked.root.findAllByProps({ testID: 'switch-text' }),
    ).toHaveLength(0);
    expect(
      bothTexts.root.findAllByProps({ testID: 'switch-text' }).length,
    ).toBeGreaterThan(0);
  });
});
