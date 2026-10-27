import React from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
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

  it('renders helper nodes in the footer view instead of a text container', () => {
    const testRenderer = renderTextarea({
      helper: <View testID="custom-textarea-helper-node" />,
      helperText: 'Helper text',
    });

    const helperNode = testRenderer.root.findByProps({
      testID: 'custom-textarea-helper-node',
    });

    expect(helperNode.parent?.type).toBe('View');
    expect(JSON.stringify(testRenderer.toJSON())).not.toContain('Helper text');
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

  it('stretches the text input to fill the field so the whole field can be tapped to focus', () => {
    const testRenderer = renderTextarea({});
    const input = testRenderer.root.findByType(TextInput);

    expect(StyleSheet.flatten(input.props.style)).toMatchObject({ flex: 1 });
  });

  it('keeps the underline width constant between focused and unfocused states', () => {
    const testRenderer = renderTextarea({});
    const input = testRenderer.root.findByType(TextInput);
    const fieldStyle = StyleSheet.flatten(input.parent?.props.style);

    expect(fieldStyle.borderBottomWidth).toBe(1);
    expect(fieldStyle.borderWidth).toBeUndefined();

    act(() => {
      input.props.onFocus({ nativeEvent: {} });
    });

    const focusedFieldStyle = StyleSheet.flatten(
      testRenderer.root.findByType(TextInput).parent?.props.style,
    );

    expect(focusedFieldStyle.borderBottomWidth).toBe(1);
  });
});

const TOKENS = {
  colorBorder: 'borderToken',
  colorError: 'errorToken',
  colorPrimary: 'primaryToken',
  colorSplit: 'splitToken',
  colorTextQuaternary: 'quaternaryToken',
  colorTextSecondary: 'secondaryToken',
  colorWarning: 'warningToken',
  lineHeight: 26,
  lineHeightLG: 28,
  lineHeightSM: 24,
  lineWidth: 1,
  marginSM: 12,
  marginXS: 8,
  marginXXS: 4,
} as const;

function renderThemedTextarea(props: Partial<React.ComponentProps<typeof Textarea>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider config={{ token: TOKENS }}>
        <Textarea {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function getFieldStyle(testRenderer: renderer.ReactTestRenderer) {
  return StyleSheet.flatten(testRenderer.root.findByType(TextInput).parent?.props.style);
}

function getIndicatorStyle(testRenderer: renderer.ReactTestRenderer) {
  const indicator = testRenderer.root.findAllByType(View).find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return style?.position === 'absolute' && style?.height === 2;
  });

  return StyleSheet.flatten(indicator?.props.style);
}

describe('Textarea underline field', () => {
  it('renders a transparent underline field without box padding', () => {
    const fieldStyle = getFieldStyle(renderThemedTextarea());

    expect(fieldStyle.backgroundColor).toBe('transparent');
    expect(fieldStyle.borderBottomWidth).toBe(TOKENS.lineWidth);
    expect(fieldStyle.borderBottomColor).toBe(TOKENS.colorBorder);
    expect(fieldStyle.borderRadius).toBe(0);
    expect(fieldStyle.paddingHorizontal).toBe(0);
    expect(fieldStyle.paddingVertical).toBe(TOKENS.marginXS);
    expect(fieldStyle.minHeight).toBe(TOKENS.lineHeight * 3 + TOKENS.marginXS * 2);
  });

  it.each([
    ['default', 'primaryToken'],
    ['error', 'errorToken'],
    ['warning', 'warningToken'],
  ] as const)('paints the %s indicator from its token', (status, expectedColor) => {
    const indicatorStyle = getIndicatorStyle(renderThemedTextarea({ status }));

    expect(indicatorStyle.backgroundColor).toBe(expectedColor);
    expect(indicatorStyle.bottom).toBe(-TOKENS.lineWidth);
  });

  it('weakens the underline and text when disabled', () => {
    const testRenderer = renderThemedTextarea({ disabled: true });
    const fieldStyle = getFieldStyle(testRenderer);
    const inputStyle = StyleSheet.flatten(testRenderer.root.findByType(TextInput).props.style);

    expect(fieldStyle.borderBottomColor).toBe(TOKENS.colorSplit);
    expect(inputStyle.color).toBe(TOKENS.colorTextQuaternary);
  });

  it('uses secondary text for readonly without a fill', () => {
    const testRenderer = renderThemedTextarea({ readonly: true });
    const inputStyle = StyleSheet.flatten(testRenderer.root.findByType(TextInput).props.style);

    expect(inputStyle.color).toBe(TOKENS.colorTextSecondary);
    expect(getFieldStyle(testRenderer).backgroundColor).toBe('transparent');
  });

  it.each([
    ['default', 'tertiary'],
    ['error', 'errorText'],
    ['warning', 'warningText'],
    ['success', 'successText'],
  ] as const)('colors %s helper text with %s', (status, expectedColor) => {
    const testRenderer = renderThemedTextarea({ helperText: '说明文案', status });
    const helperNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '说明文案');

    expect(helperNode?.props.size).toBe('xs');
    expect(helperNode?.props.color).toBe(expectedColor);
  });

  it('turns the counter warning color above 84% of maxLength', () => {
    const normalRenderer = renderThemedTextarea({ maxLength: 10, showCount: true, value: '1234' });
    const warningRenderer = renderThemedTextarea({ maxLength: 10, showCount: true, value: '123456789' });
    const countNode = (testRenderer: renderer.ReactTestRenderer) =>
      testRenderer.root.findAllByType(Text).find(node => String(node.props.children).includes('/'));

    expect(countNode(normalRenderer)?.props.color).toBe('tertiary');
    expect(countNode(warningRenderer)?.props.color).toBe('warningText');
  });

  it('moves the loading spinner into the footer and keeps it without helper or count', () => {
    const testRenderer = renderThemedTextarea({ loading: true });
    const spinner = testRenderer.root.findByType(ActivityIndicator);

    expect(StyleSheet.flatten(spinner.props.style).position).toBeUndefined();
    expect(spinner.props.size).toBe(14);
  });

  it.each([
    ['small', 'xs', 24],
    ['normal', 'sm', 26],
    ['large', 'sm', 28],
  ] as const)('maps %s label and row height', (size, expectedLabelSize, expectedRowHeight) => {
    const testRenderer = renderThemedTextarea({ labelText: '备注', size });
    const labelNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '备注');

    expect(labelNode?.props.size).toBe(expectedLabelSize);
    expect(labelNode?.props.weight).toBe('semibold');
    expect(getFieldStyle(testRenderer).minHeight).toBe(expectedRowHeight * 3 + TOKENS.marginXS * 2);
  });
});
