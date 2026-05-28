import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Radio } from '../src/Radio';
import { Text } from '../src/Text';
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
  it('renders labelText as plain text and label as custom node', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Radio.Group
          defaultValue="a"
          options={[
            { value: 'a', labelText: 'Plain text' },
            { value: 'b', label: <Text>Custom node</Text> },
          ]}
        />,
      );
    });
    const texts = testRenderer!.root.findAllByType(Text);
    const plainTexts = texts.filter(
      t => typeof t.props.children === 'string' && t.props.children === 'Plain text',
    );
    const customTexts = texts.filter(
      t => typeof t.props.children === 'string' && t.props.children === 'Custom node',
    );
    expect(plainTexts.length).toBeGreaterThanOrEqual(1);
    expect(customTexts.length).toBeGreaterThanOrEqual(1);
  });
  it('renders labelText with correct Text props based on size', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Radio.Group
          defaultValue="a"
          size="small"
          options={[{ value: 'a', labelText: 'Small option' }]}
        />,
      );
    });
    const texts = testRenderer!.root.findAllByType(Text);
    const target = texts.find(t => t.props.children === 'Small option');
    expect(target).toBeDefined();
    expect(target!.props.size).toBe('sm');
    expect(target!.props.color).toBe('default');
  });
  it('renders disabled label text with disabled color prop', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Radio.Group
          defaultValue="a"
          options={[
            { value: 'a', labelText: 'Active' },
            { value: 'b', labelText: 'Disabled', disabled: true },
          ]}
        />,
      );
    });
    const texts = testRenderer!.root.findAllByType(Text);
    const disabledText = texts.find(t => t.props.children === 'Disabled');
    expect(disabledText).toBeDefined();
    expect(disabledText!.props.color).toBe('disabled');
  });
  it('allows external styles.label to override state styles', () => {
    const customLabelStyle = { color: '#ff0000' };
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Radio defaultValue styles={{ label: customLabelStyle }}>
          Label
        </Radio>,
      );
    });
    const texts = testRenderer!.root.findAllByType(Text);
    const label = texts.find(t => t.props.children === 'Label');
    expect(label).toBeDefined();
    const flatStyle = Array.isArray(label!.props.style)
      ? Object.assign({}, ...label!.props.style.filter(Boolean))
      : label!.props.style;
    expect(flatStyle.color).toBe('#ff0000');
  });
});
