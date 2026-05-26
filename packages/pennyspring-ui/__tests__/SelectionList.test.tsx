import React from 'react';
import { Text as RNText, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';
import { Button } from '../src/Button';
import { Icon } from '../src/Icon';
import { Input } from '../src/Input';
import { Popup } from '../src/Popup';
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

function flattenStyle(style: unknown) {
  const flatten = (input: unknown): Record<string, unknown>[] => {
    if (input === null || input === undefined || input === false) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.flatMap(flatten);
    }

    return [input as Record<string, unknown>];
  };

  return Object.assign({}, ...flatten(style));
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

  it('renders the popup through Popup.FloatingPanel', () => {
    const testRenderer = renderSelectionList({
      defaultOpen: true,
    });

    const floatingPanel = testRenderer.root.findByType(Popup.FloatingPanel);

    expect(floatingPanel.props.open).toBe(true);
    expect(testRenderer.root.findByProps({ testID: 'floating-panel-root' })).toBeDefined();
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

  it('allows overriding non-style display input props without flattening trigger internals', () => {
    const prefix = <RNText>Prefix node</RNText>;
    const suffix = <RNText>Suffix node</RNText>;
    const testRenderer = renderSelectionList({
      labelText: 'Payment method',
      placeholder: 'Please select',
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
    expect(triggerInput.props.placeholder).toBe('Please select');
    expect(triggerInput.props.prefix).toBe(prefix);
    expect(triggerInput.props.required).toBe(true);
    expect(triggerInput.props.suffix).toBe(suffix);
  });

  it('keeps root style and popup style on separate props', () => {
    const rootStyle = { opacity: 0.5 };
    const popupBodyStyle = { maxHeight: '50%' as const };
    const testRenderer = renderSelectionList({
      defaultOpen: true,
      style: rootStyle,
      popupProps: {
        style: popupBodyStyle,
      },
    });

    const root = testRenderer.root.findByProps({ testID: 'selection-list-root' });
    const floatingPanel = testRenderer.root.findByType(Popup.FloatingPanel);

    expect(root.props.style).toBe(rootStyle);
    expect(JSON.stringify(floatingPanel.props.style)).toContain('50%');
    expect(JSON.stringify(root.props.style)).not.toContain('50%');
  });

  it('forwards popup floating panel props to the internal panel', () => {
    const testRenderer = renderSelectionList({
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
    const testRenderer = renderSelectionList({
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
    const testRenderer = renderSelectionList({
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

  it('propagates size to popup controls and option typography', () => {
    const testRenderer = renderSelectionList({
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

  it('scales popup option layout with size', () => {
    const smallRenderer = renderSelectionList({
      defaultOpen: true,
      size: 'small',
    });
    const largeRenderer = renderSelectionList({
      defaultOpen: true,
      size: 'large',
    });

    const smallOption = smallRenderer.root.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function',
    )[0];
    const largeOption = largeRenderer.root.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function',
    )[0];
    const smallOptionStyle = flattenStyle(smallOption.props.style({ pressed: false }));
    const largeOptionStyle = flattenStyle(largeOption.props.style({ pressed: false }));

    expect(largeOptionStyle.minHeight as number).toBeGreaterThan(
      smallOptionStyle.minHeight as number,
    );
    expect(largeOptionStyle.paddingVertical as number).toBeGreaterThan(
      smallOptionStyle.paddingVertical as number,
    );
  });

  it('renders selected and unselected option markers with Icon components', () => {
    const testRenderer = renderSelectionList({
      defaultOpen: true,
      value: 'cash',
    });

    const markerIcons = testRenderer.root.findAllByType(Icon).filter(
      iconNode =>
        iconNode.props.testID === 'selection-list-option-marker-selected' ||
        iconNode.props.testID === 'selection-list-option-marker-unselected',
    );

    expect(markerIcons).toHaveLength(2);
    expect(markerIcons[0].props.testID).toBe('selection-list-option-marker-selected');
    expect(markerIcons[1].props.testID).toBe('selection-list-option-marker-unselected');
  });
});
