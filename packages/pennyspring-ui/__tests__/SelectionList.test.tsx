import React from 'react';
import { Text as RNText, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SelectionList } from '../src/SelectionList';

const options = [
  {
    labelText: 'Cash',
    descriptionText: 'Primary wallet',
    value: 'cash',
  },
  {
    label: <RNText>Card node</RNText>,
    description: <RNText>Credit node</RNText>,
    value: 'card',
  },
];

function renderSelectionList(
  props: Partial<React.ComponentProps<typeof SelectionList>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <SelectionList options={options} {...props} />,
    );
  });

  return testRenderer!;
}

function treeText(testRenderer: renderer.ReactTestRenderer): string {
  return JSON.stringify(testRenderer.toJSON());
}

describe('SelectionList', () => {
  it('opens in uncontrolled mode and renders text/custom option nodes', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderSelectionList({
      labelText: 'Payment method',
      onOpenChange,
    });

    act(() => {
      const root = testRenderer.root.findByProps({ testID: 'selection-list-root' });
      root.findAll(node =>
        typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
      )[0].props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(treeText(testRenderer)).toContain('Payment method');
    expect(treeText(testRenderer)).toContain('Cash');
    expect(treeText(testRenderer)).toContain('Primary wallet');
    expect(treeText(testRenderer)).toContain('Card node');
    expect(treeText(testRenderer)).toContain('Credit node');
  });

  it('keeps controlled value visible while reporting selection changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderSelectionList({
      defaultOpen: true,
      onChange,
      value: 'cash',
    });

    // Find option Pressables inside the popup (second option is 'card')
    const popup = testRenderer.root.findByProps({ testID: 'selection-list-popup' });
    const optionButtons = popup.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
    );
    act(() => {
      optionButtons[1].props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith('card');
    expect(treeText(testRenderer)).toContain('Cash');
  });

  it('filters searchable options by text props and custom node text', () => {
    const testRenderer = renderSelectionList({
      defaultOpen: true,
      searchable: true,
    });

    act(() => {
      testRenderer.root.findByType(TextInput).props.onChangeText('credit');
    });

    expect(treeText(testRenderer)).not.toContain('Cash');
    expect(treeText(testRenderer)).toContain('Card node');
  });

  it('renders tags when displayMode is tag', () => {
    const testRenderer = renderSelectionList({
      mode: 'multiple',
      displayMode: 'tag',
      value: ['cash', 'card'],
    });
    const container = testRenderer.root.findByProps({ testID: 'tag-value-container' });
    expect(container).toBeDefined();
    const json = JSON.stringify(testRenderer.toJSON());
    expect(json).toContain('Cash');
  });

  it('removes tag on close press in tag mode', () => {
    const onChange = jest.fn();
    const testRenderer = renderSelectionList({
      mode: 'multiple',
      displayMode: 'tag',
      value: ['cash', 'card'],
      onChange,
    });
    const closeButtons = testRenderer.root.findAll(
      node => node.props.testID === 'tag-close' && typeof node.props.onPress === 'function',
    );
    act(() => { closeButtons[0].props.onPress(); });
    expect(onChange).toHaveBeenCalledWith(['card']);
  });
});
