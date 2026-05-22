import React from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Textarea } from '../src/Textarea';
function renderTextarea(props: Partial<React.ComponentProps<typeof Textarea>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Textarea {...props} /></>);
  });
  return testRenderer!;
}
function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}
function findNodeWithStyle(testRenderer: renderer.ReactTestRenderer, markerStyle: Record<string, unknown>) {
  return testRenderer.root.find(node => {
    const style = node.props.style;
    return node.type === View && Array.isArray(style) && style.includes(markerStyle);
  });
}
describe('Textarea', () => {
  it('uses controlled value for display and count while forwarding text changes', () => {
    const handleChangeText = jest.fn();
    const testRenderer = renderTextarea({
      value: 'Lunch notes',
      onChangeText: handleChangeText,
      showCount: true,
      maxLength: 20
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
      showCount: true
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
      errorText: 'Required copy'
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Required copy');
    expect(treeString).not.toContain('Helper copy');
  });
  it('renders required marker next to the label without validating input', () => {
    const testRenderer = renderTextarea({
      label: 'Description',
      required: true
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Description');
    expect(treeString).toContain('*');
  });
  it('makes disabled input non-editable', () => {
    const testRenderer = renderTextarea({
      disabled: true,
      loading: true
    });
    const input = testRenderer.root.findByType(TextInput);
    expect(input.props.editable).toBe(false);
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });
  it('makes readonly input non-editable', () => {
    const testRenderer = renderTextarea({
      readonly: true
    });
    const input = testRenderer.root.findByType(TextInput);
    expect(input.props.editable).toBe(false);
  });
  it('updates focus state and forwards focus and blur callbacks', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    const testRenderer = renderTextarea({
      onFocus: handleFocus,
      onBlur: handleBlur
    });
    const input = testRenderer.root.findByType(TextInput);
    act(() => {
      input.props.onFocus({
        nativeEvent: {}
      });
    });
    expect(handleFocus).toHaveBeenCalledTimes(1);
    act(() => {
      testRenderer.root.findByType(TextInput).props.onBlur({
        nativeEvent: {}
      });
    });
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
  it('clamps content size changes between minRows and maxRows derived heights', () => {
    const fieldStyle = {
      opacity: 0.82
    };
    const testRenderer = renderTextarea({
      minRows: 2,
      maxRows: 3,
      styles: {
        field: fieldStyle
      }
    });
    const input = testRenderer.root.findByType(TextInput);
    const initialFieldStyle = flattenStyle(findNodeWithStyle(testRenderer, fieldStyle).props.style);
    act(() => {
      input.props.onContentSizeChange({
        nativeEvent: {
          contentSize: {
            width: 100,
            height: 9999
          }
        }
      });
    });
    const updatedFieldStyle = flattenStyle(findNodeWithStyle(testRenderer, fieldStyle).props.style);
    expect(updatedFieldStyle.height).toBeGreaterThan(initialFieldStyle.minHeight);
    expect(updatedFieldStyle.height).toBe(initialFieldStyle.maxHeight);
  });
});
