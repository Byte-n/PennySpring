import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Tabs } from '../src/Tabs';
import { Text } from '../src/Text';
import type { TabsProps } from '../src/Tabs';
function renderTabs(props: Partial<TabsProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <>
        <Tabs
          items={[
            {
              value: 'overview',
              label: 'Overview',
            },
            {
              value: 'records',
              label: 'Records',
            },
            {
              value: 'trend',
              label: 'Trend',
            },
          ]}
          {...props}
        />
      </>,
    );
  });
  return testRenderer!;
}
function pressByValue(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  const target = testRenderer.root.findByProps({
    testID: `tabs-item-${String(value)}`,
  });
  act(() => {
    target.props.onPress();
  });
  return target;
}
function getTabStyle(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  const host = testRenderer.root
    .findAllByProps({ testID: `tabs-item-${String(value)}` })
    .find(instance => typeof instance.type === 'string');
  const style = host?.props.style;
  return StyleSheet.flatten(
    typeof style === 'function' ? style({ pressed: false }) : style,
  );
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
      onChange,
    });
    pressByValue(testRenderer, 'records');
    expect(onChange).toHaveBeenCalledWith('records');
  });
  it('keeps selection controlled by value prop', () => {
    const onChange = jest.fn();
    const renderContent = jest.fn((item: { value: string | number }) => (
      <RNText>{`panel-${String(item.value)}`}</RNText>
    ));
    const testRenderer = renderTabs({
      value: 'overview',
      onChange,
      renderContent,
    });
    pressByValue(testRenderer, 'records');
    const content = JSON.stringify(testRenderer.toJSON());
    expect(onChange).toHaveBeenCalledWith('records');
    expect(renderContent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 'overview',
      }),
      0,
    );
    expect(content).toContain('panel-overview');
  });
  it('blocks interaction when disabled at root or item level', () => {
    const onChange = jest.fn();
    const disabledTabs = renderTabs({
      disabled: true,
      onChange,
    });
    const itemDisabledTabs = renderTabs({
      onChange,
      items: [
        {
          value: 'overview',
          label: 'Overview',
        },
        {
          value: 'records',
          label: 'Records',
          disabled: true,
        },
      ],
    });
    pressByValue(disabledTabs, 'records');
    const disabledItem = pressByValue(itemDisabledTabs, 'records');
    expect(onChange).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });
  it('calls onPress before reporting the change', () => {
    const calls: string[] = [];
    const testRenderer = renderTabs({
      defaultValue: 'overview',
      onChange: () => {
        calls.push('change');
      },
      onPress: () => {
        calls.push('press');
      },
    });

    pressByValue(testRenderer, 'records');

    expect(calls).toEqual(['press', 'change']);
  });

  it('renders panel with active item content', () => {
    const renderContent = jest.fn((item: { value: string | number }) => (
      <RNText>{`panel-${String(item.value)}`}</RNText>
    ));
    const testRenderer = renderTabs({
      defaultValue: 'overview',
      renderContent,
    });
    const content = JSON.stringify(testRenderer.toJSON());
    expect(renderContent).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'overview',
      }),
      0,
    );
    expect(content).toContain('panel-overview');
  });
  describe('labelText and label props', () => {
    it('renders labelText as text content when label is not provided', () => {
      const testRenderer = renderTabs({
        items: [
          { value: 'a', labelText: 'Alpha' },
          { value: 'b', labelText: 'Beta' },
        ],
      });
      const content = JSON.stringify(testRenderer.toJSON());

      expect(content).toContain('Alpha');
      expect(content).toContain('Beta');
    });

    it('renders label ReactNode and ignores labelText when both are provided', () => {
      const testRenderer = renderTabs({
        items: [
          {
            value: 'a',
            labelText: 'Alpha',
            label: <RNText>CustomLabel</RNText>,
          },
        ],
      });
      const content = JSON.stringify(testRenderer.toJSON());

      expect(content).toContain('CustomLabel');
      expect(content).not.toContain('Alpha');
    });

    it('renders nothing when label is null', () => {
      const testRenderer = renderTabs({
        items: [
          { value: 'a', label: null },
          { value: 'b', label: 'Visible' },
        ],
      });
      const textNodes = testRenderer.root.findAllByType(Text);
      const visibleText = textNodes.find(
        node => node.props.children === 'Visible',
      );

      expect(visibleText).toBeDefined();
      expect(textNodes.length).toBe(1);
    });

    it('falls back to labelText when label is undefined', () => {
      const testRenderer = renderTabs({
        items: [{ value: 'a', labelText: 'Fallback' }],
      });
      const content = JSON.stringify(testRenderer.toJSON());

      expect(content).toContain('Fallback');
    });
  });

  describe('Text props for size, weight, and color', () => {
    it('maps Tabs size to Text size prop', () => {
      const sizeMap: Array<[string, string]> = [
        ['small', 'sm'],
        ['normal', 'sm'],
        ['large', 'md'],
      ];

      for (const [tabsSize, expectedTextSize] of sizeMap) {
        let testRenderer: renderer.ReactTestRenderer;
        act(() => {
          testRenderer = renderer.create(
            <Tabs
              size={tabsSize as 'small' | 'normal' | 'large'}
              items={[{ value: 'a', labelText: 'Tab' }]}
            />,
          );
        });
        const textNodes = testRenderer!.root.findAllByType(Text);
        const labelText = textNodes.find(node => node.props.children === 'Tab');

        expect(labelText).toBeDefined();
        expect(labelText!.props.size).toBe(expectedTextSize);
      }
    });

    it('uses strong weight and primary color for selected tab', () => {
      let testRenderer: renderer.ReactTestRenderer;
      act(() => {
        testRenderer = renderer.create(
          <Tabs
            defaultValue="a"
            items={[
              { value: 'a', labelText: 'Selected' },
              { value: 'b', labelText: 'Other' },
            ]}
          />,
        );
      });
      const textNodes = testRenderer!.root.findAllByType(Text);
      const selectedText = textNodes.find(
        node => node.props.children === 'Selected',
      );
      const otherText = textNodes.find(node => node.props.children === 'Other');

      expect(selectedText!.props.weight).toBe('strong');
      expect(selectedText!.props.color).toBe('primary');
      expect(otherText!.props.weight).toBe('regular');
      expect(otherText!.props.color).toBe('tertiary');
    });

    it('uses disabled color for disabled tab label', () => {
      let testRenderer: renderer.ReactTestRenderer;
      act(() => {
        testRenderer = renderer.create(
          <Tabs
            items={[{ value: 'a', labelText: 'Disabled', disabled: true }]}
          />,
        );
      });
      const textNodes = testRenderer!.root.findAllByType(Text);
      const disabledText = textNodes.find(
        node => node.props.children === 'Disabled',
      );

      expect(disabledText!.props.color).toBe('quaternary');
    });

    it('uses disabled color when root disabled is true', () => {
      let testRenderer: renderer.ReactTestRenderer;
      act(() => {
        testRenderer = renderer.create(
          <Tabs disabled items={[{ value: 'a', labelText: 'Tab' }]} />,
        );
      });
      const textNodes = testRenderer!.root.findAllByType(Text);
      const labelText = textNodes.find(node => node.props.children === 'Tab');

      expect(labelText!.props.color).toBe('quaternary');
    });
  });

  describe('block layout', () => {
    it('sizes block tabs from label content instead of splitting the row evenly', () => {
      const testRenderer = renderTabs({ block: true });
      const tabStyle = getTabStyle(testRenderer, 'records');

      expect(tabStyle!.flexGrow).toBe(1);
      expect(tabStyle!.flexBasis).toBe('auto');
      expect(tabStyle!.flexShrink).toBe(0);
      expect(tabStyle!.flex).toBeUndefined();
    });
  });
});
