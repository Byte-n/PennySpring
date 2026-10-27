import React from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Empty } from '../src/Empty';
import { Icon } from '../src/Icon';
import { Text } from '../src/Text';

const TOKENS = {
  borderRadius: 12,
  colorBorderSecondary: 'borderSecondaryToken',
  colorFillTertiary: 'fillTertiaryToken',
  controlHeight: 44,
  lineWidth: 1,
  marginSM: 12,
  marginXXS: 4,
  marginXS: 8,
  padding: 16,
  paddingLG: 24,
  paddingMD: 20,
  paddingXL: 32,
} as const;

function renderEmpty(props: Partial<React.ComponentProps<typeof Empty>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider config={{ token: TOKENS }}>
        <Empty {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function getRootStyle(testRenderer: renderer.ReactTestRenderer) {
  return StyleSheet.flatten(testRenderer.root.findAllByType(View)[0].props.style);
}

function toTreeText(testRenderer: renderer.ReactTestRenderer): string {
  return JSON.stringify(testRenderer.toJSON());
}

describe('Empty', () => {
  it('renders the default icon inside a filled plate without fallback text', () => {
    const testRenderer = renderEmpty();
    const plate = testRenderer.root
      .findAllByType(View)
      .find(node => StyleSheet.flatten(node.props.style)?.backgroundColor === TOKENS.colorFillTertiary);

    expect(testRenderer.root.findAllByType(Icon)).toHaveLength(1);
    expect(testRenderer.root.findAllByType(Text)).toHaveLength(0);
    expect(plate).toBeTruthy();
  });

  it('renders title and description as primary and tertiary lines', () => {
    const testRenderer = renderEmpty({
      titleText: '十月还没有记录',
      descriptionText: '点右下角记一笔。',
    });
    const textNodes = testRenderer.root.findAllByType(Text);
    const titleNode = textNodes.find(node => node.props.children === '十月还没有记录');
    const descriptionNode = textNodes.find(node => node.props.children === '点右下角记一笔。');

    expect(titleNode?.props.size).toBe('sm');
    expect(titleNode?.props.weight).toBe('semibold');
    expect(titleNode?.props.color).toBe('default');
    expect(descriptionNode?.props.size).toBe('xs');
    expect(descriptionNode?.props.color).toBe('tertiary');
  });

  it('promotes description to the primary line when title is absent', () => {
    const testRenderer = renderEmpty({ descriptionText: '本月暂无收入' });
    const textNode = testRenderer.root.findByType(Text);

    expect(textNode.props.weight).toBe('semibold');
    expect(textNode.props.color).toBe('default');
  });

  it('renders a single action below the text block', () => {
    const testRenderer = renderEmpty({
      titleText: '还没有快捷模板',
      action: <RNText>新建模板</RNText>,
    });
    const tree = toTreeText(testRenderer);

    expect(tree).toContain('新建模板');
    expect(tree.indexOf('还没有快捷模板')).toBeLessThan(tree.indexOf('新建模板'));
  });

  it('drops the plate when icon is null and keeps custom icons unwrapped', () => {
    const nullIconRenderer = renderEmpty({ icon: null, titleText: '无图标' });
    const customIconRenderer = renderEmpty({
      icon: <RNText testID="custom-icon">Custom icon</RNText>,
      titleText: '自定义图标',
    });
    const plates = customIconRenderer.root
      .findAllByType(View)
      .filter(node => StyleSheet.flatten(node.props.style)?.backgroundColor === TOKENS.colorFillTertiary);

    expect(nullIconRenderer.root.findAllByType(Icon)).toHaveLength(0);
    expect(customIconRenderer.root.findByProps({ testID: 'custom-icon' })).toBeTruthy();
    expect(plates).toHaveLength(0);
  });

  it('uses dashed border and 24/16 padding for boxed variant', () => {
    const testRenderer = renderEmpty({ variant: 'boxed' });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.borderStyle).toBe('dashed');
    expect(rootStyle.borderWidth).toBe(TOKENS.lineWidth);
    expect(rootStyle.borderColor).toBe(TOKENS.colorBorderSecondary);
    expect(rootStyle.borderRadius).toBe(TOKENS.borderRadius);
    expect(rootStyle.paddingVertical).toBe(TOKENS.paddingLG);
    expect(rootStyle.paddingHorizontal).toBe(TOKENS.padding);
  });

  it.each([
    ['small', 24],
    ['normal', 32],
    ['large', 40],
  ] as const)('uses %s inline vertical padding of %s', (size, expectedPadding) => {
    const testRenderer = renderEmpty({ size });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.paddingVertical).toBe(expectedPadding);
    expect(rootStyle.borderWidth).toBeUndefined();
  });

  it.each([
    ['small', 36, 18],
    ['normal', 44, 20],
    ['large', 52, 24],
  ] as const)('maps %s to plate %s and icon %s', (size, expectedPlate, expectedIcon) => {
    const testRenderer = renderEmpty({ size });
    const plate = testRenderer.root
      .findAllByType(View)
      .find(node => StyleSheet.flatten(node.props.style)?.backgroundColor === TOKENS.colorFillTertiary);
    const plateStyle = StyleSheet.flatten(plate?.props.style);

    expect(plateStyle?.width).toBe(expectedPlate);
    expect(plateStyle?.height).toBe(expectedPlate);
    expect(plateStyle?.borderRadius).toBe(999);
    expect(testRenderer.root.findByType(Icon).props.size).toBe(expectedIcon);
  });

  it('renders compact as a single row with a 32 plate and no action', () => {
    const testRenderer = renderEmpty({
      compact: true,
      descriptionText: '当天没有更多记录',
      action: <RNText>不该出现</RNText>,
    });
    const plate = testRenderer.root
      .findAllByType(View)
      .find(node => StyleSheet.flatten(node.props.style)?.backgroundColor === TOKENS.colorFillTertiary);
    const plateStyle = StyleSheet.flatten(plate?.props.style);
    const rootStyle = getRootStyle(testRenderer);

    expect(testRenderer.root.findAllByProps({ testID: 'row' }).length).toBeGreaterThan(0);
    expect(rootStyle.paddingVertical).toBe(TOKENS.paddingMD);
    expect(rootStyle.borderWidth).toBeUndefined();
    expect(plateStyle?.width).toBe(32);
    expect(testRenderer.root.findByType(Icon).props.size).toBe(16);
    expect(toTreeText(testRenderer)).not.toContain('不该出现');
    expect(toTreeText(testRenderer)).toContain('当天没有更多记录');
  });
});
