import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Tabs } from '../src/Tabs';
import type { TabsProps } from '../src/Tabs';
function renderTabs(props: Partial<TabsProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Tabs items={[{
        value: 'overview',
        label: 'Overview'
      }, {
        value: 'records',
        label: 'Records'
      }, {
        value: 'trend',
        label: 'Trend'
      }]} {...props} /></>);
  });
  return testRenderer!;
}
function pressByValue(testRenderer: renderer.ReactTestRenderer, value: string | number) {
  const target = testRenderer.root.findByProps({
    testID: `tabs-item-${String(value)}`
  });
  act(() => {
    target.props.onPress();
  });
  return target;
}
describe('Tabs', () => {
  it('renders tab labels from items', () => {
    const testRenderer = renderTabs();
    const content = JSON.stringify(testRenderer.toJSON());
    expect(content).toContain('Overview');
    expect(content).toContain('Records');
    expect(content).toContain('Trend');
  });
  it('updates uncontrolled value and calls onChange', () => {
    const onChange = jest.fn();
    const testRenderer = renderTabs({
      defaultValue: 'overview',
      onChange
    });
    pressByValue(testRenderer, 'records');
    expect(onChange).toHaveBeenCalledWith('records');
  });
  it('keeps selection controlled by value prop', () => {
    const onChange = jest.fn();
    const renderContent = jest.fn((item: {
      value: string | number;
    }) => <RNText>{`panel-${String(item.value)}`}</RNText>);
    const testRenderer = renderTabs({
      value: 'overview',
      onChange,
      renderContent
    });
    pressByValue(testRenderer, 'records');
    const content = JSON.stringify(testRenderer.toJSON());
    expect(onChange).toHaveBeenCalledWith('records');
    expect(renderContent).toHaveBeenLastCalledWith(expect.objectContaining({
      value: 'overview'
    }), 0);
    expect(content).toContain('panel-overview');
  });
  it('blocks interaction when disabled at root or item level', () => {
    const onChange = jest.fn();
    const disabledTabs = renderTabs({
      disabled: true,
      onChange
    });
    const itemDisabledTabs = renderTabs({
      onChange,
      items: [{
        value: 'overview',
        label: 'Overview'
      }, {
        value: 'records',
        label: 'Records',
        disabled: true
      }]
    });
    pressByValue(disabledTabs, 'records');
    const disabledItem = pressByValue(itemDisabledTabs, 'records');
    expect(onChange).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });
  it('renders panel with active item content', () => {
    const renderContent = jest.fn((item: {
      value: string | number;
    }) => <RNText>{`panel-${String(item.value)}`}</RNText>);
    const testRenderer = renderTabs({
      defaultValue: 'overview',
      renderContent
    });
    const content = JSON.stringify(testRenderer.toJSON());
    expect(renderContent).toHaveBeenCalledWith(expect.objectContaining({
      value: 'overview'
    }), 0);
    expect(content).toContain('panel-overview');
  });
});
