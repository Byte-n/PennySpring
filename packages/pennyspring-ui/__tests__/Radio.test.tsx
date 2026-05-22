import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Radio } from '../src/Radio';
import type { RadioGroupProps, RadioProps } from '../src/Radio';
function renderRadio(props: Partial<RadioProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Radio {...props}>Remember me</Radio></>);
  });
  return testRenderer!;
}
function renderRadioGroup(props: Partial<RadioGroupProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Radio.Group options={[{
        value: 'daily',
        label: 'Daily'
      }, {
        value: 'weekly',
        label: 'Weekly'
      }, {
        value: 30,
        label: 'Monthly'
      }]} {...props} /></>);
  });
  return testRenderer!;
}
function pressRadio(testRenderer: renderer.ReactTestRenderer) {
  const target = testRenderer.root.findByProps({
    testID: 'radio'
  });
  act(() => {
    target.props.onPress();
  });
  return target;
}
function pressGroupOption(testRenderer: renderer.ReactTestRenderer, value: string | number) {
  const target = testRenderer.root.findByProps({
    testID: `radio-group-option-${String(value)}`
  });
  act(() => {
    target.props.onPress();
  });
  return target;
}
describe('Radio', () => {
  it('sets uncontrolled value to true and reports the change on press', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadio({
      onChange
    });
    pressRadio(testRenderer);
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it('does not report duplicate changes when already selected', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadio({
      defaultValue: true,
      onChange
    });
    pressRadio(testRenderer);
    expect(onChange).not.toHaveBeenCalled();
  });
  it('does not change when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledRadio = renderRadio({
      disabled: true,
      onChange
    });
    const readonlyRadio = renderRadio({
      readonly: true,
      onChange
    });
    pressRadio(disabledRadio);
    pressRadio(readonlyRadio);
    expect(onChange).not.toHaveBeenCalled();
  });
});
describe('Radio.Group', () => {
  it('selects an option and reports the changed value', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadioGroup({
      defaultValue: 'daily',
      onChange
    });
    pressGroupOption(testRenderer, 'weekly');
    expect(onChange).toHaveBeenCalledWith('weekly');
  });
  it('does not report duplicate changes for the selected option', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadioGroup({
      defaultValue: 'daily',
      onChange
    });
    pressGroupOption(testRenderer, 'daily');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('blocks selection when disabled, readonly, or option disabled', () => {
    const onChange = jest.fn();
    const disabledGroup = renderRadioGroup({
      disabled: true,
      onChange
    });
    const readonlyGroup = renderRadioGroup({
      readonly: true,
      onChange
    });
    const disabledOptionGroup = renderRadioGroup({
      defaultValue: 'daily',
      onChange,
      options: [{
        value: 'daily',
        label: 'Daily'
      }, {
        value: 'weekly',
        label: 'Weekly',
        disabled: true
      }]
    });
    pressGroupOption(disabledGroup, 'weekly');
    pressGroupOption(readonlyGroup, 'weekly');
    const option = pressGroupOption(disabledOptionGroup, 'weekly');
    expect(onChange).not.toHaveBeenCalled();
    expect(option.props.disabled).toBe(true);
  });
  it('keeps button display behavior consistent with default display', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadioGroup({
      displayType: 'button',
      onChange
    });
    pressGroupOption(testRenderer, 30);
    expect(onChange).toHaveBeenCalledWith(30);
  });
  it('makes button options fill available width when block is enabled', () => {
    const testRenderer = renderRadioGroup({
      block: true,
      displayType: 'button'
    });
    const root = testRenderer.root.findByProps({
      testID: 'radio-group'
    });
    const option = testRenderer.root.findByProps({
      testID: 'radio-group-option-daily'
    });
    expect(root.props.style).toEqual(expect.arrayContaining([expect.objectContaining({
      width: '100%'
    })]));
    expect(option.props.style({
      pressed: false
    })).toEqual(expect.arrayContaining([expect.objectContaining({
      flex: 1
    })]));
  });
});
