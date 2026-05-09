import React from 'react';
import { TextInput, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Textarea } from '../src/Textarea';

const token = formatToken(derivative(defaultSeedToken, false));

function renderTextarea(props: Partial<React.ComponentProps<typeof Textarea>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Textarea {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function findNodeWithStyle(
  testRenderer: renderer.ReactTestRenderer,
  markerStyle: Record<string, unknown>,
) {
  return testRenderer.root.find((node) => {
    const style = node.props.style;

    return node.type === View && Array.isArray(style) && style.includes(markerStyle);
  });
}

describe('Textarea', () => {
  it('renders label, multiline input, placeholder, helper text, and theme placeholder color', () => {
    const testRenderer = renderTextarea({
      label: 'Notes',
      placeholder: 'Add details',
      helperText: 'Visible to you only',
    });
    const input = testRenderer.root.findByType(TextInput);
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Notes');
    expect(treeString).toContain('Visible to you only');
    expect(input.props.multiline).toBe(true);
    expect(input.props.placeholder).toBe('Add details');
    expect(input.props.placeholderTextColor).toBe(token.colorTextPlaceholder);
    expect(input.props.accessibilityLabel).toBe('Notes');
  });

  it('uses controlled value for display and count while forwarding text changes', () => {
    const handleChangeText = jest.fn();
    const testRenderer = renderTextarea({
      value: 'Lunch notes',
      onChangeText: handleChangeText,
      showCount: true,
      maxLength: 20,
    });
    const input = testRenderer.root.findByType(TextInput);

    act(() => {
      input.props.onChangeText('Dinner notes');
    });

    expect(input.props.value).toBe('Lunch notes');
    expect(handleChangeText).toHaveBeenCalledWith('Dinner notes');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('11 / 20');
  });

  it('updates internal value and count in uncontrolled mode', () => {
    const testRenderer = renderTextarea({
      defaultValue: 'Memo',
      showCount: true,
    });
    const input = testRenderer.root.findByType(TextInput);

    act(() => {
      input.props.onChangeText('Memo updated');
    });

    expect(testRenderer.root.findByType(TextInput).props.value).toBe('Memo updated');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('12');
  });

  it('prioritizes error text over helper text only when status is error', () => {
    const testRenderer = renderTextarea({
      status: 'error',
      helperText: 'Helper copy',
      errorText: 'Required copy',
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    const input = testRenderer.root.findByType(TextInput);

    expect(treeString).toContain('Required copy');
    expect(treeString).not.toContain('Helper copy');
    expect(input.props.accessibilityState.invalid).toBe(true);
  });

  it('renders required marker next to the label without validating input', () => {
    const testRenderer = renderTextarea({
      label: 'Description',
      required: true,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Description');
    expect(treeString).toContain('*');
  });

  it('makes disabled input non-editable and exposes disabled state', () => {
    const testRenderer = renderTextarea({
      disabled: true,
      loading: true,
    });
    const input = testRenderer.root.findByType(TextInput);

    expect(input.props.editable).toBe(false);
    expect(input.props.accessibilityState.disabled).toBe(true);
    expect(input.props.accessibilityState.busy).toBe(true);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Loading');
  });

  it('makes readonly input non-editable without disabled accessibility state', () => {
    const testRenderer = renderTextarea({
      readonly: true,
    });
    const input = testRenderer.root.findByType(TextInput);

    expect(input.props.editable).toBe(false);
    expect(input.props.accessibilityState.disabled).toBeUndefined();
  });

  it('updates focus state and forwards focus and blur callbacks', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    const testRenderer = renderTextarea({
      onFocus: handleFocus,
      onBlur: handleBlur,
    });
    const input = testRenderer.root.findByType(TextInput);

    act(() => {
      input.props.onFocus({ nativeEvent: {} });
    });

    expect(handleFocus).toHaveBeenCalledTimes(1);

    act(() => {
      testRenderer.root.findByType(TextInput).props.onBlur({ nativeEvent: {} });
    });

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('clamps content size changes between minRows and maxRows derived heights', () => {
    const fieldStyle = { opacity: 0.82 };
    const testRenderer = renderTextarea({
      minRows: 2,
      maxRows: 3,
      styles: { field: fieldStyle },
    });
    const input = testRenderer.root.findByType(TextInput);
    const initialFieldStyle = flattenStyle(findNodeWithStyle(testRenderer, fieldStyle).props.style);

    act(() => {
      input.props.onContentSizeChange({
        nativeEvent: { contentSize: { width: 100, height: 9999 } },
      });
    });

    const updatedFieldStyle = flattenStyle(findNodeWithStyle(testRenderer, fieldStyle).props.style);

    expect(updatedFieldStyle.height).toBeGreaterThan(initialFieldStyle.minHeight);
    expect(updatedFieldStyle.height).toBe(initialFieldStyle.maxHeight);
  });
});
