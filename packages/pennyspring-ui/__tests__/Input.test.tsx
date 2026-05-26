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
  it('updates uncontrolled text and notifies changes', () => {
    const onChangeText = jest.fn();
    const testRenderer = renderInput({
      defaultValue: 'Cash',
      onChangeText
    });
    act(() => {
      findInput(testRenderer).props.onChangeText('Wallet');
    });
    expect(findInput(testRenderer).props.value).toBe('Wallet');
    expect(onChangeText).toHaveBeenCalledWith('Wallet');
  });
  it('keeps controlled value from props while notifying text changes', () => {
    const onChangeText = jest.fn();
    const testRenderer = renderInput({
      value: 'Cash',
      onChangeText
    });
    act(() => {
      findInput(testRenderer).props.onChangeText('Wallet');
    });
    expect(findInput(testRenderer).props.value).toBe('Cash');
    expect(onChangeText).toHaveBeenCalledWith('Wallet');
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
  it('falls back to onChangeText when clearing without onClear', () => {
    const onChangeText = jest.fn();
    const testRenderer = renderInput({
      clearable: true,
      defaultValue: 'Cash',
      onChangeText
    });
    act(() => {
      findClearButton(testRenderer)[0].props.onPress();
    });
    expect(findInput(testRenderer).props.value).toBe('');
    expect(onChangeText).toHaveBeenCalledWith('');
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
  });
});
