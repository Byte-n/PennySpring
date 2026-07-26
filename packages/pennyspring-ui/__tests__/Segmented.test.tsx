import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Segmented } from '../src/Segmented';
import type { SegmentedProps } from '../src/Segmented';
function renderSegmented(props: Partial<SegmentedProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Segmented options={['day', 'month', 'year']} {...props} /></>);
  });
  return testRenderer!;
}
function textContent(testRenderer: renderer.ReactTestRenderer) {
  return JSON.stringify(testRenderer.toJSON());
}
function pressByValue(testRenderer: renderer.ReactTestRenderer, value: string | number) {
  const target = testRenderer.root.findByProps({
    testID: `segmented-item-${String(value)}`
  });
  act(() => {
    target.props.onPress();
  });
  return target;
}
describe('Segmented', () => {
  it('renders raw options using each option as value and label', () => {
    const testRenderer = renderSegmented({
      options: ['day', 'month', 2026]
    });
    const content = textContent(testRenderer);
    expect(content).toContain('day');
    expect(content).toContain('month');
    expect(content).toContain('2026');
  });
  it('renders labeled options with icon and optional label', () => {
    const testRenderer = renderSegmented({
      options: [{
        value: 'chart',
        icon: <RNText>Icon</RNText>,
        label: 'Chart'
      }, {
        value: 'icon-only',
        icon: <RNText>Only</RNText>
      }]
    });
    const content = textContent(testRenderer);
    expect(content).toContain('Icon');
    expect(content).toContain('Chart');
    expect(content).toContain('Only');
  });
  it('updates uncontrolled value and reports changed value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      onChange
    });
    pressByValue(testRenderer, 'month');
    expect(onChange).toHaveBeenCalledWith('month');
  });
  it('keeps selected state derived from controlled value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({
      value: 'day',
      onChange
    });
    pressByValue(testRenderer, 'month');
    const content = textContent(testRenderer);
    expect(onChange).toHaveBeenCalledWith('month');
    expect(content).toContain('day');
    expect(content).toContain('month');
  });
  it('does not report duplicate changes for the selected value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      onChange
    });
    pressByValue(testRenderer, 'day');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('blocks selection when disabled at component or option level', () => {
    const onChange = jest.fn();
    const disabledRoot = renderSegmented({
      disabled: true,
      onChange
    });
    const disabledOption = renderSegmented({
      defaultValue: 'day',
      onChange,
      options: [{
        value: 'day',
        label: 'Day'
      }, {
        value: 'month',
        label: 'Month',
        disabled: true
      }]
    });
    pressByValue(disabledRoot, 'month');
    const option = pressByValue(disabledOption, 'month');
    expect(onChange).not.toHaveBeenCalled();
    expect(option.props.disabled).toBe(true);
  });
});

describe('Segmented - labelText and label separation', () => {
  it('renders labelText as text content', () => {
    const testRenderer = renderSegmented({
      options: [{ value: 'a', labelText: 'Alpha' }],
    });
    const content = textContent(testRenderer);
    expect(content).toContain('Alpha');
  });
  it('renders label ReactNode as custom content', () => {
    const testRenderer = renderSegmented({
      options: [{ value: 'a', label: <RNText>CustomLabel</RNText> }],
    });
    const content = textContent(testRenderer);
    expect(content).toContain('CustomLabel');
  });
  it('renders nothing when label is null', () => {
    const testRenderer = renderSegmented({
      options: [
        { value: 'a', labelText: 'Alpha' },
        { value: 'b', label: null },
      ],
    });
    const content = textContent(testRenderer);
    expect(content).toContain('Alpha');
    const itemB = testRenderer.root.findByProps({ testID: 'segmented-item-b' });
    const rnTexts = itemB.findAllByType(RNText);
    const hasBLabel = rnTexts.some(
      (node: { props: { children?: unknown } }) => node.props.children === 'b',
    );
    expect(hasBLabel).toBe(false);
  });
  it('uses labelText over raw value for labeled options', () => {
    const testRenderer = renderSegmented({
      options: [{ value: 'a', labelText: 'Display' }],
    });
    const content = textContent(testRenderer);
    expect(content).toContain('Display');
  });
});

describe('Segmented - Text semantic props', () => {
  it('uses correct Text size for each Segmented size', () => {
    const smallRenderer = renderSegmented({
      size: 'small',
      options: ['a'],
    });
    const normalRenderer = renderSegmented({
      size: 'normal',
      options: ['a'],
    });
    const largeRenderer = renderSegmented({
      size: 'large',
      options: ['a'],
    });
    const smallText = smallRenderer.root.findByProps({ children: 'a' });
    const normalText = normalRenderer.root.findByProps({ children: 'a' });
    const largeText = largeRenderer.root.findByProps({ children: 'a' });
    expect(smallText.props.size).toBe('sm');
    expect(normalText.props.size).toBe('md');
    expect(largeText.props.size).toBe('lg');
  });
  it('applies heading color to selected label', () => {
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      options: ['day', 'month'],
    });
    const selectedText = testRenderer.root.findByProps({ children: 'day' });
    const unselectedText = testRenderer.root.findByProps({ children: 'month' });
    expect(selectedText.props.color).toBe('primary');
    expect(unselectedText.props.color).toBe('secondary');
  });
  it('applies disabled color to disabled label', () => {
    const testRenderer = renderSegmented({
      options: [
        { value: 'a', labelText: 'Active' },
        { value: 'b', labelText: 'Off', disabled: true },
      ],
      defaultValue: 'a',
    });
    const disabledText = testRenderer.root.findByProps({ children: 'Off' });
    expect(disabledText.props.color).toBe('disabled');
  });
});

describe('Segmented - style merge order', () => {
  it('allows external styles.item to override selected state background', () => {
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      styles: { item: { backgroundColor: 'purple' } },
    });
    const selectedItem = testRenderer.root.findByProps({
      testID: 'segmented-item-day',
    });
    const styleResult = selectedItem.props.style({ pressed: false });
    const flatStyle = Object.assign(
      {},
      ...styleResult.filter(Boolean),
    );
    expect(flatStyle.backgroundColor).toBe('purple');
  });
  it('allows external styles.icon to override selected state opacity', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Segmented
          options={[
            { value: 'a', icon: <RNText>I</RNText>, labelText: 'A' },
            { value: 'b', icon: <RNText>I</RNText>, labelText: 'B' },
          ]}
          defaultValue="a"
          styles={{ icon: { opacity: 0.5 } }}
        />,
      );
    });
    const selectedItem = testRenderer!.root.findByProps({
      testID: 'segmented-item-a',
    });
    const iconViews = selectedItem.findAll(
      (node: { props: { style?: unknown } }) =>
        Array.isArray(node.props.style) &&
        node.props.style.length === 4,
    );
    expect(iconViews.length).toBeGreaterThan(0);
    const iconStyle = iconViews[0].props.style;
    const flatStyle = Object.assign(
      {},
      ...iconStyle.filter(Boolean),
    );
    expect(flatStyle.opacity).toBe(0.5);
  });
});

describe('Segmented - selected state does not change fontWeight', () => {
  it('does not change fontWeight between selected and unselected labels', () => {
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      options: ['day', 'month'],
    });
    const selectedText = testRenderer.root.findByProps({ children: 'day' });
    const unselectedText = testRenderer.root.findByProps({ children: 'month' });
    const selectedWeight = Array.isArray(selectedText.props.style)
      ? Object.assign({}, ...selectedText.props.style.filter(Boolean)).fontWeight
      : selectedText.props.style?.fontWeight;
    const unselectedWeight = Array.isArray(unselectedText.props.style)
      ? Object.assign({}, ...unselectedText.props.style.filter(Boolean)).fontWeight
      : unselectedText.props.style?.fontWeight;
    expect(selectedWeight).toBe(unselectedWeight);
  });
});
