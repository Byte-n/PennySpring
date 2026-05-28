import React from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Textarea } from '../src/Textarea';
import { Text } from '../src/Text';
function renderTextarea(props: Partial<React.ComponentProps<typeof Textarea>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Textarea {...props} /></>);
  });
  return testRenderer!;
}
describe('Textarea', () => {
  it('keeps helper text props string-only so null rendering control uses node slots', () => {
    // @ts-expect-error helperText must use helper={null} to suppress rendering.
    const invalidHelperText: React.ComponentProps<typeof Textarea> = { helperText: null };
    // @ts-expect-error errorText must use error={null} to suppress rendering.
    const invalidErrorText: React.ComponentProps<typeof Textarea> = { errorText: null };

    expect([
      invalidHelperText,
      invalidErrorText,
    ]).toHaveLength(2);
  });

  it('uses helper and error node slots to control message rendering', () => {
    const helperRenderer = renderTextarea({
      helper: <>Helper node</>,
      helperText: 'Helper text',
    });
    const hiddenErrorRenderer = renderTextarea({
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

  it('renders labelText as a plain string label', () => {
    const testRenderer = renderTextarea({ labelText: 'Description' });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Description');
  });

  it('renders label as a custom ReactNode', () => {
    const testRenderer = renderTextarea({
      label: <Text testID="custom-label">Custom Label</Text>,
    });
    const customLabel = testRenderer.root.findByProps({ testID: 'custom-label' });
    expect(customLabel.props.children).toBe('Custom Label');
  });

  it('hides label area when label is null even if labelText is set', () => {
    const testRenderer = renderTextarea({
      labelText: 'Hidden',
      label: null,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).not.toContain('Hidden');
  });

  it('falls back to labelText when label is undefined', () => {
    const testRenderer = renderTextarea({ labelText: 'Fallback Label' });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Fallback Label');
  });

  it('label node overrides labelText when both are provided', () => {
    const testRenderer = renderTextarea({
      labelText: 'Text Label',
      label: <Text testID="override-label">Node Label</Text>,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).not.toContain('Text Label');
    const overrideLabel = testRenderer.root.findByProps({ testID: 'override-label' });
    expect(overrideLabel.props.children).toBe('Node Label');
  });

  it('keeps field border width constant between focused and unfocused states', () => {
    function getMaxBorderWidth(styleProp: unknown): number | undefined {
      if (!Array.isArray(styleProp)) {
        return typeof styleProp === 'object' && styleProp !== null && 'borderWidth' in styleProp
          ? (styleProp as Record<string, number>).borderWidth
          : undefined;
      }
      let max: number | undefined;
      for (const s of styleProp) {
        if (s && typeof s === 'object' && 'borderWidth' in s) {
          const bw = (s as Record<string, number>).borderWidth;
          max = max === undefined ? bw : Math.max(max, bw);
        }
      }
      return max;
    }

    function findFieldNode(testR: renderer.ReactTestRenderer) {
      // Find the node that is a parent of TextInput and has borderWidth in its style
      const input = testR.root.findByType(TextInput);
      let node: renderer.ReactTestInstance = input.parent!;
      while (node) {
        if (
          node.props.style &&
          Array.isArray(node.props.style) &&
          node.props.style.some(
            (s: Record<string, unknown>) => s && typeof s === 'object' && 'borderWidth' in s,
          )
        ) {
          return node;
        }
        node = node.parent!;
      }
      throw new Error('Field node not found');
    }

    const testRenderer = renderTextarea({});
    const input = testRenderer.root.findByType(TextInput);
    const fieldBefore = findFieldNode(testRenderer);
    const borderWidthBefore = getMaxBorderWidth(fieldBefore.props.style);

    act(() => {
      input.props.onFocus({ nativeEvent: {} });
    });

    const fieldAfter = findFieldNode(testRenderer);
    const borderWidthAfter = getMaxBorderWidth(fieldAfter.props.style);

    expect(borderWidthBefore).toBe(borderWidthAfter);
  });
});
