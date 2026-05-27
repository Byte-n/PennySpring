import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';

const token = formatToken(derivative(defaultSeedToken, false));

function renderDisplayInput(
  props: Partial<React.ComponentProps<typeof DisplayInput>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<DisplayInput {...props} />);
  });

  return testRenderer!;
}

function findRootStyle(
  testRenderer: renderer.ReactTestRenderer,
): Array<{
  alignSelf?: string;
  maxWidth?: string;
  overflow?: string;
}> {
  const jsonNode = testRenderer.toJSON();
  const rootJson = Array.isArray(jsonNode) ? jsonNode[0] : jsonNode;

  return (rootJson?.props.style ?? []) as Array<{
    alignSelf?: string;
    maxWidth?: string;
    overflow?: string;
  }>;
}

function findFieldStyle(testRenderer: renderer.ReactTestRenderer) {
  const field = testRenderer.root.findAll(
    node => StyleSheet.flatten(node.props.style)?.borderWidth !== undefined,
  )[0];

  return StyleSheet.flatten(field.props.style);
}

describe('DisplayInput', () => {
  it('keeps helper text props string-only so null rendering control uses node slots', () => {
    // @ts-expect-error helperText must use helper={null} to suppress rendering.
    const invalidHelperText: React.ComponentProps<typeof DisplayInput> = { helperText: null };
    // @ts-expect-error errorText must use error={null} to suppress rendering.
    const invalidErrorText: React.ComponentProps<typeof DisplayInput> = { errorText: null };

    expect([
      invalidHelperText,
      invalidErrorText,
    ]).toHaveLength(2);
  });

  it('uses helper and error node slots to control message rendering', () => {
    const helperRenderer = renderDisplayInput({
      helper: <View testID="helper-node" />,
      helperText: 'Helper text',
    });
    const hiddenErrorRenderer = renderDisplayInput({
      error: null,
      errorText: 'Error text',
      helperText: 'Helper text',
      status: 'error',
    });

    const helperTree = JSON.stringify(helperRenderer.toJSON());

    expect(helperTree).toContain('helper-node');
    expect(helperTree).not.toContain('Helper text');
    expect(JSON.stringify(hiddenErrorRenderer.toJSON())).not.toContain('Error text');
    expect(JSON.stringify(hiddenErrorRenderer.toJSON())).not.toContain('Helper text');
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const testRenderer = renderDisplayInput({
      onPress,
      children: '可点击内容',
    });

    const trigger = testRenderer.root.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
    )[0];

    act(() => {
      trigger.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder when value is empty', () => {
    const testRenderer = renderDisplayInput({
      placeholder: '请选择',
      children: '',
    });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('请选择');
  });

  it('shows valueText when value is not provided', () => {
    const testRenderer = renderDisplayInput({
      placeholder: '请选择',
      valueText: '文本值',
    });

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('文本值');
    expect(tree).not.toContain('请选择');
  });

  it('does not render TextInput to avoid cursor', () => {
    const testRenderer = renderDisplayInput({
      children: '展示文本',
    });

    expect(() => testRenderer.root.findByType(TextInput)).toThrow();
  });

  it('uses block display by default and inline display when requested', () => {
    const blockRenderer = renderDisplayInput({
      children: '默认块级',
    });
    const inlineRenderer = renderDisplayInput({
      display: 'inline',
      children: '行内展示',
    });

    const blockStyle = findRootStyle(blockRenderer);
    const inlineStyle = findRootStyle(inlineRenderer);

    expect(blockStyle.some(item => item?.alignSelf === 'stretch')).toBe(true);
    expect(inlineStyle.some(item => item?.alignSelf === 'flex-start')).toBe(true);
    expect(blockStyle.some(item => item?.maxWidth === '100%')).toBe(true);
    expect(blockStyle.some(item => item?.overflow === 'hidden')).toBe(true);
  });

  it('renders custom value node without wrapping it in text', () => {
    const testRenderer = renderDisplayInput({
      children: <View testID="custom-value-node" />,
      placeholder: '请选择',
    });

    expect(() =>
      testRenderer.root.findByProps({ testID: 'custom-value-node' }),
    ).not.toThrow();
    expect(JSON.stringify(testRenderer.toJSON())).not.toContain('请选择');
  });

  it('uses hidden overflow by default and allows visible overflow when configured', () => {
    const defaultRenderer = renderDisplayInput({
      valueText: '默认省略',
    });
    const visibleRenderer = renderDisplayInput({
      overflow: 'visible',
      valueText: '允许换行',
    });

    const defaultText = defaultRenderer.root.findAll(
      node =>
        typeof node.props?.numberOfLines === 'number' ||
        node.props?.ellipsizeMode === 'tail',
    )[0];
    const visibleText = visibleRenderer.root.findAll(
      node =>
        node.props?.children === '允许换行' ||
        node.props?.children?.includes?.('允许换行'),
    )[0];

    expect(defaultText.props.numberOfLines).toBe(1);
    expect(defaultText.props.ellipsizeMode).toBe('tail');
    expect(visibleText.props.numberOfLines).toBeUndefined();
    expect(visibleText.props.ellipsizeMode).toBeUndefined();
  });

  it('uses compact horizontal padding for every size', () => {
    expect(
      findFieldStyle(renderDisplayInput({ size: 'small', valueText: 'Small' }))
        .paddingHorizontal,
    ).toBe(token.paddingXS);
    expect(
      findFieldStyle(renderDisplayInput({ size: 'normal', valueText: 'Normal' }))
        .paddingHorizontal,
    ).toBe(token.controlPaddingHorizontalSM);
    expect(
      findFieldStyle(renderDisplayInput({ size: 'large', valueText: 'Large' }))
        .paddingHorizontal,
    ).toBe(token.padding);
  });

  it('uses half vertical padding compared with horizontal padding for every size', () => {
    const smallFieldStyle = findFieldStyle(
      renderDisplayInput({ size: 'small', valueText: 'Small' }),
    );
    const normalFieldStyle = findFieldStyle(
      renderDisplayInput({ size: 'normal', valueText: 'Normal' }),
    );
    const largeFieldStyle = findFieldStyle(
      renderDisplayInput({ size: 'large', valueText: 'Large' }),
    );

    expect(smallFieldStyle.paddingVertical).toBe(smallFieldStyle.paddingHorizontal / 2);
    expect(normalFieldStyle.paddingVertical).toBe(normalFieldStyle.paddingHorizontal / 2);
    expect(largeFieldStyle.paddingVertical).toBe(largeFieldStyle.paddingHorizontal / 2);
  });
});
