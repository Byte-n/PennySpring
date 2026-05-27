import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import renderer, { act } from 'react-test-renderer';
import { Input } from '../src/Input';

const token = formatToken(derivative(defaultSeedToken, false));

function renderInput(props: Partial<React.ComponentProps<typeof Input>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Input {...props} /></>);
  });
  return testRenderer!;
}
function renderInputSearch(props: Partial<React.ComponentProps<typeof Input.Search>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Input.Search {...props} /></>);
  });
  return testRenderer!;
}
function findInput(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(TextInput);
}
function findFieldStyle(testRenderer: renderer.ReactTestRenderer) {
  const field = testRenderer.root.findAll(
    node => StyleSheet.flatten(node.props.style)?.borderWidth !== undefined,
  )[0];

  return StyleSheet.flatten(field.props.style);
}
function findClearButton(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll(node => node.props.testID === 'input-clear-button');
}
function findSearchButton(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll(node => node.props.testID === 'input-search-button')[0];
}
describe('Input', () => {
  it('uses onChange as the only primary value change callback', () => {
    const onChange = jest.fn();
    const testRenderer = renderInput({
      defaultValue: 'Cash',
      onChange,
    });

    act(() => {
      findInput(testRenderer).props.onChangeText('Wallet');
    });

    expect(findInput(testRenderer).props.value).toBe('Wallet');
    expect(onChange).toHaveBeenCalledWith('Wallet');
  });

  it('keeps controlled value from props while notifying value changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderInput({
      value: 'Cash',
      onChange,
    });

    act(() => {
      findInput(testRenderer).props.onChangeText('Wallet');
    });

    expect(findInput(testRenderer).props.value).toBe('Cash');
    expect(onChange).toHaveBeenCalledWith('Wallet');
  });

  it('does not expose onChangeText as the public value change API', () => {
    // @ts-expect-error Input uses onChange for primary value changes.
    const invalidInputProps: React.ComponentProps<typeof Input> = { onChangeText: jest.fn() };
    // @ts-expect-error Input.Search uses onChange for primary value changes.
    const invalidSearchProps: React.ComponentProps<typeof Input.Search> = { onChangeText: jest.fn() };

    expect([
      invalidInputProps,
      invalidSearchProps,
    ]).toHaveLength(2);
  });

  it('renders label text from labelText when label node is absent', () => {
    const testRenderer = renderInput({ labelText: 'Account name' });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('Account name');
  });

  it('prefers label node and skips labelText when both are provided', () => {
    const testRenderer = renderInput({
      label: <>Custom label</>,
      labelText: 'Text label',
    });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('Custom label');
    expect(JSON.stringify(testRenderer.toJSON())).not.toContain('Text label');
  });

  it('suppresses the label row when label is null', () => {
    const testRenderer = renderInput({
      label: null,
      labelText: 'Text label',
      required: true,
    });

    expect(JSON.stringify(testRenderer.toJSON())).not.toContain('Text label');
    expect(JSON.stringify(testRenderer.toJSON())).not.toContain('*');
  });

  it('keeps helper text props string-only so null rendering control uses node slots', () => {
    // @ts-expect-error helperText must use helper={null} to suppress rendering.
    const invalidHelperText: React.ComponentProps<typeof Input> = { helperText: null };
    // @ts-expect-error errorText must use error={null} to suppress rendering.
    const invalidErrorText: React.ComponentProps<typeof Input> = { errorText: null };

    expect([
      invalidHelperText,
      invalidErrorText,
    ]).toHaveLength(2);
  });

  it('uses helper and error node slots to control message rendering', () => {
    const helperRenderer = renderInput({
      helper: <>Helper node</>,
      helperText: 'Helper text',
    });
    const hiddenErrorRenderer = renderInput({
      error: null,
      errorText: 'Error text',
      helperText: 'Helper text',
      status: 'error',
    });

    expect(JSON.stringify(helperRenderer.toJSON())).toContain('Helper node');
    expect(JSON.stringify(helperRenderer.toJSON())).not.toContain('Helper text');
    expect(JSON.stringify(hiddenErrorRenderer.toJSON())).not.toContain('Error text');
    expect(JSON.stringify(hiddenErrorRenderer.toJSON())).not.toContain('Helper text');
  });

  it('updates uncontrolled text and notifies changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderInput({
      defaultValue: 'Cash',
      onChange
    });
    act(() => {
      findInput(testRenderer).props.onChangeText('Wallet');
    });
    expect(findInput(testRenderer).props.value).toBe('Wallet');
    expect(onChange).toHaveBeenCalledWith('Wallet');
  });
  it('keeps controlled value from props while notifying text changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderInput({
      value: 'Cash',
      onChange
    });
    act(() => {
      findInput(testRenderer).props.onChangeText('Wallet');
    });
    expect(findInput(testRenderer).props.value).toBe('Cash');
    expect(onChange).toHaveBeenCalledWith('Wallet');
  });
  it('clears uncontrolled text and calls onClear when provided', () => {
    const onClear = jest.fn();
    const testRenderer = renderInput({
      clearable: true,
      defaultValue: 'Cash',
      onClear
    });
    act(() => {
      findClearButton(testRenderer)[0].props.onPress();
    });
    expect(findInput(testRenderer).props.value).toBe('');
    expect(onClear).toHaveBeenCalledTimes(1);
  });
  it('falls back to onChange when clearing without onClear', () => {
    const onChange = jest.fn();
    const testRenderer = renderInput({
      clearable: true,
      defaultValue: 'Cash',
      onChange
    });
    act(() => {
      findClearButton(testRenderer)[0].props.onPress();
    });
    expect(findInput(testRenderer).props.value).toBe('');
    expect(onChange).toHaveBeenCalledWith('');
  });
  it('hides the clear button when disabled, readonly, loading, or empty', () => {
    expect(findClearButton(renderInput({
      clearable: true,
      defaultValue: 'Cash',
      disabled: true
    }))).toHaveLength(0);
    expect(findClearButton(renderInput({
      clearable: true,
      defaultValue: 'Cash',
      readonly: true
    }))).toHaveLength(0);
    expect(findClearButton(renderInput({
      clearable: true,
      defaultValue: 'Cash',
      loading: true
    }))).toHaveLength(0);
    expect(findClearButton(renderInput({
      clearable: true
    }))).toHaveLength(0);
  });
  it('shows error text instead of helper text only in error status', () => {
    const errorRenderer = renderInput({
      status: 'error',
      helperText: 'Helper',
      errorText: 'Error'
    });
    const warningRenderer = renderInput({
      status: 'warning',
      helperText: 'Helper',
      errorText: 'Error'
    });
    expect(JSON.stringify(errorRenderer.toJSON())).toContain('Error');
    expect(JSON.stringify(errorRenderer.toJSON())).not.toContain('Helper');
    expect(JSON.stringify(warningRenderer.toJSON())).toContain('Helper');
    expect(JSON.stringify(warningRenderer.toJSON())).not.toContain('Error');
  });
  it('makes disabled and readonly inputs non-editable', () => {
    expect(findInput(renderInput({
      disabled: true
    })).props.editable).toBe(false);
    expect(findInput(renderInput({
      readonly: true
    })).props.editable).toBe(false);
    expect(findInput(renderInput()).props.editable).toBe(true);
  });
  it('uses compact horizontal padding for every size', () => {
    expect(findFieldStyle(renderInput({ size: 'small' })).paddingHorizontal).toBe(
      token.paddingXS,
    );
    expect(findFieldStyle(renderInput({ size: 'normal' })).paddingHorizontal).toBe(
      token.controlPaddingHorizontalSM,
    );
    expect(findFieldStyle(renderInput({ size: 'large' })).paddingHorizontal).toBe(
      token.padding,
    );
  });

  it('uses half vertical padding compared with horizontal padding for every size', () => {
    const smallFieldStyle = findFieldStyle(renderInput({ size: 'small' }));
    const normalFieldStyle = findFieldStyle(renderInput({ size: 'normal' }));
    const largeFieldStyle = findFieldStyle(renderInput({ size: 'large' }));

    expect(smallFieldStyle.paddingVertical).toBe(smallFieldStyle.paddingHorizontal / 2);
    expect(normalFieldStyle.paddingVertical).toBe(normalFieldStyle.paddingHorizontal / 2);
    expect(largeFieldStyle.paddingVertical).toBe(largeFieldStyle.paddingHorizontal / 2);
  });
  describe('Search', () => {
    it('submits the current uncontrolled text from the keyboard', () => {
      const onSearch = jest.fn();
      const testRenderer = renderInputSearch({
        defaultValue: 'Coffee',
        onSearch
      });
      act(() => {
        findInput(testRenderer).props.onChangeText('Tea');
      });
      act(() => {
        findInput(testRenderer).props.onSubmitEditing();
      });
      expect(onSearch).toHaveBeenCalledWith('Tea');
    });
    it('submits the current controlled text from the search button', () => {
      const onSearch = jest.fn();
      const testRenderer = renderInputSearch({
        value: 'Budget',
        onSearch
      });
      act(() => {
        findSearchButton(testRenderer)?.props.onPress();
      });
      expect(onSearch).toHaveBeenCalledWith('Budget');
    });
    it('does not submit when disabled, readonly, or loading', () => {
      const onSearch = jest.fn();
      const disabledRenderer = renderInputSearch({
        defaultValue: 'Cash',
        disabled: true,
        onSearch
      });
      const readonlyRenderer = renderInputSearch({
        defaultValue: 'Cash',
        onSearch,
        readonly: true
      });
      const loadingRenderer = renderInputSearch({
        defaultValue: 'Cash',
        loading: true,
        onSearch
      });
      act(() => {
        findSearchButton(disabledRenderer)?.props.onPress();
      });
      act(() => {
        findSearchButton(readonlyRenderer)?.props.onPress();
      });
      act(() => {
        findInput(loadingRenderer).props.onSubmitEditing();
      });
      expect(onSearch).not.toHaveBeenCalled();
    });
    it('clears uncontrolled search text and calls onClear when provided', () => {
      const onClear = jest.fn();
      const testRenderer = renderInputSearch({
        clearable: true,
        defaultValue: 'Cash',
        onClear
      });
      act(() => {
        findClearButton(testRenderer)[0].props.onPress();
      });
      expect(findInput(testRenderer).props.value).toBe('');
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('gives the search icon button a touch hitSlop', () => {
      const testRenderer = renderInputSearch();

      expect(findSearchButton(testRenderer).props.hitSlop).toBeDefined();
    });
  });
});
