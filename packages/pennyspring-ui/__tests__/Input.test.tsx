import React from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import renderer, { act } from 'react-test-renderer';
import { Input } from '../src/Input';
import { Icon } from '../src/Icon';

const token = formatToken(derivative(defaultSeedToken, false));

function renderInput(props: Partial<React.ComponentProps<typeof Input>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<Input {...props} />);
  });

  return testRenderer!;
}

function renderSearchInput(
  props: Partial<React.ComponentProps<typeof Input.Search>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<Input.Search {...props} />);
  });

  return testRenderer!;
}

function findNativeInput(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(TextInput);
}

function findFieldStyle(testRenderer: renderer.ReactTestRenderer) {
  const field = testRenderer.root.findByProps({ testID: 'input-field' });

  return StyleSheet.flatten(field.props.style);
}

describe('Input', () => {
  it('renders labelText as a floating label and keeps placeholder hidden until focus', () => {
    const testRenderer = renderInput({
      labelText: 'Email',
      placeholder: 'name@example.com',
    });

    const input = findNativeInput(testRenderer);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Email');
    expect(input.props.placeholder).toBe('name@example.com');
    expect(input.props.placeholderTextColor).toBe('transparent');

    act(() => {
      input.props.onFocus({ nativeEvent: {} });
    });

    expect(findNativeInput(testRenderer).props.placeholderTextColor).not.toBe('transparent');
  });

  it('keeps floating label constrained to the input width', () => {
    const testRenderer = renderInput({
      labelText: '账本名称',
    });

    const label = testRenderer.root.findByProps({ testID: 'input-floating-label' });

    expect(JSON.stringify(label.props.style)).toContain('"right":0');
  });

  it('renders custom label nodes in a view floating label container', () => {
    const testRenderer = renderInput({
      label: <View testID="custom-input-label-node" />,
    });

    const label = testRenderer.root.findByProps({ testID: 'input-floating-label' });

    expect(label.type).toBe(View);
    expect(() =>
      testRenderer.root.findByProps({ testID: 'custom-input-label-node' }),
    ).not.toThrow();
  });

  it('reserves bottom clearance between the input text and the underline', () => {
    const testRenderer = renderInput({
      defaultValue: '现金账户',
      labelText: '账户名称',
    });

    const inputStyle = StyleSheet.flatten(findNativeInput(testRenderer).props.style);

    expect(inputStyle.paddingBottom).toBeGreaterThan(0);
    expect(inputStyle.paddingTop).toBeGreaterThan(inputStyle.paddingBottom);
  });

  it('uses an independent underline layer for flat active and error states', () => {
    const testRenderer = renderInput({
      status: 'error',
    });

    const underline = testRenderer.root.findByProps({ testID: 'input-underline' });
    const underlineStyle = StyleSheet.flatten(underline.props.style);
    expect(underline.type).toBe(View);
    expect(underlineStyle.height).toBe(token.lineWidth);
    expect(underlineStyle.backgroundColor).toBe(token.colorError);
  });

  it('updates uncontrolled value and forwards changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderInput({ defaultValue: 'Memo', onChange });

    act(() => {
      findNativeInput(testRenderer).props.onChangeText('Memo updated');
    });

    expect(findNativeInput(testRenderer).props.value).toBe('Memo updated');
    expect(onChange).toHaveBeenCalledWith('Memo updated');
  });

  it('keeps controlled value while notifying changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderInput({ value: 'Controlled', onChange });

    act(() => {
      findNativeInput(testRenderer).props.onChangeText('Next');
    });

    expect(findNativeInput(testRenderer).props.value).toBe('Controlled');
    expect(onChange).toHaveBeenCalledWith('Next');
  });

  it('clears editable non-empty values through the clear button', () => {
    const onClear = jest.fn();
    const testRenderer = renderInput({
      clearable: true,
      defaultValue: 'Draft',
      onClear,
    });

    act(() => {
      testRenderer.root.findByProps({ testID: 'input-clear-button' }).props.onPress();
    });

    expect(findNativeInput(testRenderer).props.value).toBe('');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('makes disabled and readonly fields non-editable', () => {
    expect(findNativeInput(renderInput({ disabled: true })).props.editable).toBe(false);
    expect(findNativeInput(renderInput({ readonly: true })).props.editable).toBe(false);
  });

  it('renders loading before suffix content', () => {
    const testRenderer = renderInput({
      loading: true,
      suffix: <Icon icon="search" />,
    });

    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });

  it('renders as a multiline field when multiline is requested', () => {
    const testRenderer = renderInput({
      defaultValue: 'Line one\nLine two\nLine three',
      multiline: true,
      numberOfLines: 4,
    });

    expect(findNativeInput(testRenderer).props.multiline).toBe(true);
  });

  it('aligns multiline text to the top to avoid vertical gaps', () => {
    const testRenderer = renderInput({
      defaultValue: 'Line one\nLine two',
      multiline: true,
    });

    const inputStyle = StyleSheet.flatten(findNativeInput(testRenderer).props.style);

    expect(inputStyle.textAlignVertical).toBe('top');
  });

  it('keeps single-line behavior when multiline is not requested', () => {
    expect(findNativeInput(renderInput()).props.multiline).toBe(false);
  });

  it('uses the same size ladder as DisplayInput for field height', () => {
    // Arrange & Act
    const smallFieldStyle = findFieldStyle(renderInput({ size: 'small' }));
    const normalFieldStyle = findFieldStyle(renderInput({ size: 'normal' }));
    const largeFieldStyle = findFieldStyle(renderInput({ size: 'large' }));

    // Assert
    expect(smallFieldStyle.minHeight).toBe(token.controlHeightSM);
    expect(normalFieldStyle.minHeight).toBe(token.controlHeight);
    expect(largeFieldStyle.minHeight).toBe(token.controlHeightLG);
  });

  it('keeps text and padding filling the field height for every size', () => {
    // Arrange
    const sizes = [
      { height: token.controlHeightSM, size: 'small' },
      { height: token.controlHeight, size: 'normal' },
      { height: token.controlHeightLG, size: 'large' },
    ] as const;

    // Act & Assert
    sizes.forEach(({ height, size }) => {
      const inputStyle = StyleSheet.flatten(
        findNativeInput(renderInput({ defaultValue: '值', size })).props.style,
      );

      expect(
        inputStyle.paddingTop + inputStyle.paddingBottom + inputStyle.lineHeight,
      ).toBeCloseTo(height);
    });
  });
});

describe('Input.Search', () => {
  it('submits search from return key and search button', () => {
    const onSearch = jest.fn();
    const testRenderer = renderSearchInput({
      defaultValue: 'food',
      onSearch,
    });

    act(() => {
      findNativeInput(testRenderer).props.onSubmitEditing({ nativeEvent: {} });
    });
    act(() => {
      testRenderer.root.findByProps({ testID: 'input-search-button' }).props.onPress();
    });

    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(onSearch).toHaveBeenCalledWith('food');
  });

  it('uses search return key by default', () => {
    const testRenderer = renderSearchInput();

    expect(findNativeInput(testRenderer).props.returnKeyType).toBe('search');
  });

  it('does not search while disabled', () => {
    const onSearch = jest.fn();
    const testRenderer = renderSearchInput({
      defaultValue: 'food',
      disabled: true,
      onSearch,
    });
    const button = testRenderer.root.findByProps({ testID: 'input-search-button' });

    act(() => {
      button.props.onPress();
    });

    expect(onSearch).not.toHaveBeenCalled();
  });
});
