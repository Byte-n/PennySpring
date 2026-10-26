import React from 'react';
import { Text as RNText, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';
import { Button } from '../src/Button';
import { Icon } from '../src/Icon';
import { Input } from '../src/Input';
import { Popup } from '../src/Popup';
import { ListPicker } from '../src/ListPicker';

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

function renderListPicker(
  props: Partial<React.ComponentProps<typeof ListPicker>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ListPicker options={options} {...props} />,
    );
  });

  return testRenderer!;
}

function treeText(testRenderer: renderer.ReactTestRenderer): string {
  return JSON.stringify(testRenderer.toJSON());
}

describe('ListPicker', () => {
  it('passes helper and error node slots to the trigger display input', () => {
    const helperRenderer = renderListPicker({
      helper: <>Helper node</>,
      helperText: 'Helper text',
    });
    const hiddenErrorRenderer = renderListPicker({
      error: null,
      errorText: 'Error text',
      helperText: 'Helper text',
      status: 'error',
    });

    expect(treeText(helperRenderer)).toContain('Helper node');
    expect(treeText(helperRenderer)).not.toContain('Helper text');
    expect(treeText(hiddenErrorRenderer)).not.toContain('Error text');
    expect(treeText(hiddenErrorRenderer)).not.toContain('Helper text');
  });

  it('opens in uncontrolled mode and renders text/custom option nodes', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderListPicker({
      labelText: 'Payment method',
      onOpenChange,
    });

    act(() => {
      const displayInput = testRenderer.root.findByType(DisplayInput);
      displayInput.props.onPress();
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
    const testRenderer = renderListPicker({
      defaultOpen: true,
      onChange,
      value: 'cash',
    });

    // Find option Pressables inside the popup (second option is 'card')
    const popup = testRenderer.root.findByProps({ testID: 'list-picker-popup' });
    const optionButtons = popup.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
    );
    act(() => {
      optionButtons[1].props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith('card');
    expect(treeText(testRenderer)).toContain('Cash');
  });

  it('renders the popup through Popup.FloatingPanel', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
    });

    const floatingPanel = testRenderer.root.findByType(Popup.FloatingPanel);

    expect(floatingPanel.props.open).toBe(true);
    expect(testRenderer.root.findByProps({ testID: 'floating-panel-root' })).toBeDefined();
  });

  it('filters searchable options by text props and custom node text', () => {
    const testRenderer = renderListPicker({
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
    const testRenderer = renderListPicker({
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
    const testRenderer = renderListPicker({
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

  it('allows overriding non-style display input props without flattening trigger internals', () => {
    const prefix = <RNText>Prefix node</RNText>;
    const suffix = <RNText>Suffix node</RNText>;
    const testRenderer = renderListPicker({
      labelText: 'Payment method',
      displayInputProps: {
        display: 'block',
        prefix,
        required: true,
        suffix,
      },
    });

    const triggerInput = testRenderer.root.findByType(DisplayInput);

    expect(triggerInput.props.display).toBe('block');
    expect(triggerInput.props.label).toBe('Payment method');
    expect(triggerInput.props.prefix).toBe(prefix);
    expect(triggerInput.props.required).toBe(true);
    expect(triggerInput.props.suffix).toBe(suffix);
  });

  it('keeps root style and popup style on separate props', () => {
    const rootStyle = { opacity: 0.5 };
    const popupBodyStyle = { maxHeight: '50%' as const };
    const testRenderer = renderListPicker({
      defaultOpen: true,
      style: rootStyle,
      popupProps: {
        style: popupBodyStyle,
      },
    });

    const root = testRenderer.root.findByType(DisplayInput);
    const floatingPanel = testRenderer.root.findByType(Popup.FloatingPanel);

    expect(root.props.style).toBe(rootStyle);
    expect(JSON.stringify(floatingPanel.props.style)).toContain('50%');
    expect(JSON.stringify(root.props.style)).not.toContain('50%');
  });

  it('forwards popup floating panel props to the internal panel', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
      popupProps: {
        floatingPanelProps: {
          closeOnMaskClick: false,
          height: '60%',
          keyboardAvoiding: true,
          mask: false,
        },
      },
    });

    const floatingPanel = testRenderer.root.findByType(Popup.FloatingPanel);

    expect(floatingPanel.props.closeOnMaskClick).toBe(false);
    expect(floatingPanel.props.height).toBe('60%');
    expect(floatingPanel.props.keyboardAvoiding).toBe(true);
    expect(floatingPanel.props.mask).toBe(false);
  });

  it('forwards direct popup floating panel props to the internal panel', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
      height: '55%',
      keyboardAvoiding: false,
      mask: false,
      position: 'top',
    });

    const floatingPanel = testRenderer.root.findByType(Popup.FloatingPanel);

    expect(floatingPanel.props.height).toBe('55%');
    expect(floatingPanel.props.keyboardAvoiding).toBe(false);
    expect(floatingPanel.props.mask).toBe(false);
    expect(floatingPanel.props.position).toBe('top');
  });

  it('renders search with Input and forwards search input props', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
      searchable: true,
      popupProps: {
        searchInputProps: {
          autoFocus: true,
          returnKeyType: 'search',
          testID: 'selection-search-input',
        },
      },
    });

    const searchInput = testRenderer.root.findByProps({
      testID: 'selection-search-input',
    });
    const input = testRenderer.root.findByType(Input);

    expect(input.props.value).toBe('');
    expect(searchInput.props.autoFocus).toBe(true);
    expect(searchInput.props.returnKeyType).toBe('search');
  });

  it('renders search input label text from texts', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
      searchable: true,
      texts: {
        searchLabelText: 'Search options',
        searchPlaceholder: 'Keyword',
      },
    });

    const input = testRenderer.root.findByType(Input);

    expect(input.props.labelText).toBe('Search options');
    expect(input.props.placeholder).toBe('Keyword');
    expect(treeText(testRenderer)).toContain('Search options');
  });

  it('propagates size to popup controls and option typography', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
      searchable: true,
      size: 'large',
      texts: {
        closeText: 'Close',
        confirmText: 'Done',
        headerText: 'Header',
      },
      mode: 'multiple',
      groups: [
        {
          key: 'wallets',
          titleText: 'Wallets',
          options,
        },
      ],
    });

    const floatingPanel = testRenderer.root.findByType(Popup.FloatingPanel);
    const input = testRenderer.root.findByType(Input);
    const buttons = testRenderer.root.findAllByType(Button);
    const descriptionText = testRenderer.root.findByProps({
      children: 'Primary wallet',
    });
    const groupTitleText = testRenderer.root.findByProps({
      children: 'Wallets',
    });

    expect(floatingPanel.props.size).toBe('large');
    expect(input.props.size).toBe('large');
    expect(buttons.every(button => button.props.size === 'large')).toBe(true);
    expect(descriptionText.props.size).toBe('lg');
    expect(groupTitleText.props.size).toBe('lg');
  });

  it('renders selected and unselected option markers with Icon components', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
      value: 'cash',
    });

    const markerIcons = testRenderer.root.findAllByType(Icon).filter(
      iconNode =>
        iconNode.props.testID === 'list-picker-option-marker-selected' ||
        iconNode.props.testID === 'list-picker-option-marker-unselected',
    );

    expect(markerIcons).toHaveLength(2);
    expect(markerIcons[0].props.testID).toBe('list-picker-option-marker-selected');
    expect(markerIcons[1].props.testID).toBe('list-picker-option-marker-unselected');
  });

  it('keeps readonly semantic on trigger input without converting to disabled', () => {
    const readonlyRenderer = renderListPicker({
      readonly: true,
    });
    const loadingRenderer = renderListPicker({
      loading: true,
    });
    const readonlyInput = readonlyRenderer.root.findByType(DisplayInput);
    const loadingInput = loadingRenderer.root.findByType(DisplayInput);

    expect(readonlyInput.props.readonly).toBe(true);
    expect(readonlyInput.props.disabled).toBe(false);
    expect(loadingInput.props.readonly).toBeUndefined();
    expect(loadingInput.props.disabled).toBe(true);
  });

  it('renders option label typography through Text props first', () => {
    const testRenderer = renderListPicker({
      defaultOpen: true,
      disabled: true,
      size: 'large',
    });
    const optionLabel = testRenderer.root.findByProps({ children: 'Cash' });

    expect(optionLabel.props.size).toBe('lg');
    expect(optionLabel.props.color).toBe('disabled');
  });
});
