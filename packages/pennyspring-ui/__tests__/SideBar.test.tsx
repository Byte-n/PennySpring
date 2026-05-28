import React from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { SideBar } from '../src/SideBar';
import { Text } from '../src/Text';
import type { SideBarProps } from '../src/SideBar';

function renderSideBar(props: Partial<SideBarProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <SideBar
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

function pressByValue(testRenderer: renderer.ReactTestRenderer, value: string | number) {
  const target = testRenderer.root.findByProps({
    testID: `sidebar-item-${String(value)}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

describe('SideBar', () => {
  it('renders sidebar labels from items', () => {
    const testRenderer = renderSideBar();
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('Overview');
    expect(content).toContain('Records');
    expect(content).toContain('Trend');
  });

  it('updates uncontrolled value and calls onChange', () => {
    const onChange = jest.fn();
    const testRenderer = renderSideBar({
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
    const testRenderer = renderSideBar({
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
    const disabledSideBar = renderSideBar({
      disabled: true,
      onChange,
    });
    const itemDisabledSideBar = renderSideBar({
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

    pressByValue(disabledSideBar, 'records');
    const disabledItem = pressByValue(itemDisabledSideBar, 'records');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledItem.props.disabled).toBe(true);
  });

  it('renders panel with active item content', () => {
    const renderContent = jest.fn((item: { value: string | number }) => (
      <RNText>{`panel-${String(item.value)}`}</RNText>
    ));
    const testRenderer = renderSideBar({
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

  it.each([
    ['small', 3],
    ['normal', 5],
    ['large', 7],
  ] as const)('maps %s size to layout gap token', (size, expectedGap) => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              marginXXS: 3,
              marginXS: 5,
              marginSM: 7,
            },
          }}
        >
          <SideBar
            size={size}
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'records', label: 'Records' },
            ]}
          />
        </ThemeProvider>,
      );
    });
    const sideBarList = testRenderer!.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.borderBottomWidth !== undefined && style?.gap !== undefined;
    });
    const sideBarListStyle = StyleSheet.flatten(sideBarList?.props.style);

    expect(sideBarListStyle.gap).toBe(expectedGap);
  });

  it('renders labelText as internal Text content', () => {
    const testRenderer = renderSideBar({
      items: [
        { value: 'a', labelText: 'Alpha' },
        { value: 'b', labelText: 'Beta' },
      ],
    });
    const textInstances = testRenderer.root.findAll(
      node => node.type === Text,
    );
    const textContents = textInstances.map(t => t.props.children);

    expect(textContents).toContain('Alpha');
    expect(textContents).toContain('Beta');
  });

  it('renders custom label node when label is a ReactNode', () => {
    const CustomTag = () => <RNText>custom-node</RNText>;
    const testRenderer = renderSideBar({
      items: [
        { value: 'a', label: <CustomTag /> },
      ],
    });
    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('custom-node');
  });

  it('prefers label over labelText when both are provided', () => {
    const CustomTag = () => <RNText>node-wins</RNText>;
    const testRenderer = renderSideBar({
      items: [
        { value: 'a', labelText: 'text-loses', label: <CustomTag /> },
      ],
    });
    const textInstances = testRenderer.root.findAll(
      node => node.type === Text,
    );
    const textContents = textInstances.map(t => t.props.children);

    expect(textContents).not.toContain('text-loses');
  });

  it('passes size-appropriate Text props for each SideBar size', () => {
    const sizeCases: Array<{
      sideBarSize: 'small' | 'normal' | 'large';
      expectedTextSize: string;
    }> = [
      { sideBarSize: 'small', expectedTextSize: 'sm' },
      { sideBarSize: 'normal', expectedTextSize: 'md' },
      { sideBarSize: 'large', expectedTextSize: 'lg' },
    ];

    for (const { sideBarSize, expectedTextSize } of sizeCases) {
      let testRenderer: renderer.ReactTestRenderer;
      act(() => {
        testRenderer = renderer.create(
          <SideBar
            size={sideBarSize}
            items={[
              { value: 'a', label: 'Alpha' },
            ]}
          />,
        );
      });
      const textInstances = testRenderer!.root.findAll(
        node => node.type === Text,
      );
      const label = textInstances.find(t => t.props.children === 'Alpha');

      expect(label).toBeDefined();
      expect(label!.props.size).toBe(expectedTextSize);
    }
  });

  it('applies selected color via Text props when item is selected', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <SideBar
          defaultValue="a"
          items={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ]}
        />,
      );
    });
    const textInstances = testRenderer!.root.findAll(
      node => node.type === Text,
    );
    const selectedText = textInstances.find(t => t.props.children === 'Alpha');
    const normalText = textInstances.find(t => t.props.children === 'Beta');

    expect(selectedText!.props.weight).toBe('regular');
    expect(selectedText!.props.color).toBe('default');
    expect(normalText!.props.weight).toBe('regular');
    expect(normalText!.props.color).toBe('secondary');
  });

  it('applies disabled color via Text props when item is disabled', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <SideBar
          items={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta', disabled: true },
          ]}
        />,
      );
    });
    const textInstances = testRenderer!.root.findAll(
      node => node.type === Text,
    );
    const disabledText = textInstances.find(t => t.props.children === 'Beta');

    expect(disabledText).toBeDefined();
    expect(disabledText!.props.color).toBe('disabled');
  });

  it('allows external styles.sideBar to override selected state borderBottomColor', () => {
    const customStyle = { borderBottomColor: 'purple' };
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <SideBar
          defaultValue="a"
          styles={{ sideBar: customStyle }}
          items={[
            { value: 'a', label: 'Alpha' },
          ]}
        />,
      );
    });
    const item = testRenderer!.root.findByProps({
      testID: 'sidebar-item-a',
    });
    const flatStyle = StyleSheet.flatten(item.props.style({ pressed: false }));

    expect(flatStyle.borderBottomColor).toBe('purple');
  });

  it('allows external styles.label to override selected state text color', () => {
    const customLabel = { color: 'red' };
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <SideBar
          defaultValue="a"
          styles={{ label: customLabel }}
          items={[
            { value: 'a', label: 'Alpha' },
          ]}
        />,
      );
    });
    const textInstances = testRenderer!.root.findAll(
      node => node.type === Text,
    );
    const label = textInstances.find(t => t.props.children === 'Alpha');
    const flatStyle = StyleSheet.flatten(label!.props.style);

    expect(flatStyle.color).toBe('red');
  });

  it('does not change fontWeight between selected and non-selected states', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <SideBar
          defaultValue="a"
          items={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ]}
        />,
      );
    });
    const rnTexts = testRenderer!.root.findAllByType(RNText);
    const selectedRNText = rnTexts.find(t => t.props.children === 'Alpha');
    const normalRNText = rnTexts.find(t => t.props.children === 'Beta');
    const selectedStyle = StyleSheet.flatten(selectedRNText!.props.style);
    const normalStyle = StyleSheet.flatten(normalRNText!.props.style);

    expect(selectedStyle.fontWeight).toBe(normalStyle.fontWeight);
  });
});
