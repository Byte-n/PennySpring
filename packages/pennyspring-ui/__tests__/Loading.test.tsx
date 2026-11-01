import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Column } from '../src/Column';
import { Loading } from '../src/Loading';
import { Row } from '../src/Row';
import { Text } from '../src/Text';
import type { LoadingProps } from '../src/Loading';

const TOKENS = {
  borderRadiusLG: 16,
  boxShadowTertiary: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  colorBgElevated: 'elevatedToken',
  colorBgMask: 'maskToken',
  colorPrimary: 'primaryToken',
  colorTextLightSolid: 'lightSolidToken',
  colorTextTertiary: 'tertiaryToken',
  marginSM: 12,
  marginXS: 8,
  marginXXS: 4,
  paddingLG: 24,
  paddingMD: 20,
  paddingSM: 12,
} as const;

function renderLoading(props: Partial<LoadingProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider config={{ token: TOKENS }}>
        <Loading {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function getFirstRowStyle(testRenderer: renderer.ReactTestRenderer) {
  const row = testRenderer.root.findAllByProps({ testID: 'row' })[0];

  return StyleSheet.flatten(row.props.style);
}

function getFirstColumnStyle(testRenderer: renderer.ReactTestRenderer) {
  const column = testRenderer.root.findAllByProps({ testID: 'column' })[0];

  return StyleSheet.flatten(column.props.style);
}

describe('Loading', () => {
  it('renders the default activity indicator with the inline small size', () => {
    const testRenderer = renderLoading();

    expect(testRenderer.root.findByType(ActivityIndicator).props.size).toBe(16);
    expect(() => testRenderer.root.findByType(Row)).not.toThrow();
  });

  it.each([
    ['small', 16],
    ['normal', 20],
    ['large', 28],
  ] as const)('maps %s to a %s indicator', (size, expectedSize) => {
    const testRenderer = renderLoading({ size });

    expect(testRenderer.root.findByType(ActivityIndicator).props.size).toBe(
      expectedSize,
    );
  });

  it('keeps inline text at 12 with an 8 gap and 20 min height', () => {
    const testRenderer = renderLoading({ text: '正在读取本月账单' });
    const textNode = testRenderer.root.findByType(Text);
    const rowStyle = getFirstRowStyle(testRenderer);

    expect(rowStyle.gap).toBe(TOKENS.marginXS);
    expect(rowStyle.minHeight).toBe(20);
    expect(textNode.props.size).toBe('xs');
    expect(textNode.props.color).toBe('secondary');
  });

  it('renders block as a 120 min-height column with description', () => {
    const testRenderer = renderLoading({
      variant: 'block',
      text: '正在同步账单',
      description: '128 笔记录 · 约 2 秒',
    });
    const columnStyle = getFirstColumnStyle(testRenderer);
    const textNodes = testRenderer.root.findAllByType(Text);

    expect(() => testRenderer.root.findByType(Column)).not.toThrow();
    expect(columnStyle.minHeight).toBe(120);
    expect(textNodes[0].props.size).toBe('sm');
    expect(textNodes[1].props.size).toBe('xs');
    expect(textNodes[1].props.color).toBe('tertiary');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('128 笔记录');
  });

  it('renders more as a compact row with tertiary 12 text', () => {
    const testRenderer = renderLoading({
      variant: 'more',
      text: '加载更早的记录',
    });
    const rowStyle = getFirstRowStyle(testRenderer);
    const textNode = testRenderer.root.findByType(Text);

    expect(rowStyle.paddingVertical).toBe(TOKENS.paddingSM);
    expect(textNode.props.size).toBe('xs');
    expect(textNode.props.color).toBe('tertiary');
  });

  it('renders overlay as a masked centered card', () => {
    const testRenderer = renderLoading({
      variant: 'overlay',
      text: '正在写入云端',
    });
    const views = testRenderer.root.findAllByType(View);
    const maskStyle = StyleSheet.flatten(views[0].props.style);
    const cardStyle = StyleSheet.flatten(views[1].props.style);

    expect(maskStyle.position).toBe('absolute');
    expect(maskStyle.backgroundColor).toBe(TOKENS.colorBgMask);
    expect(cardStyle.backgroundColor).toBe(TOKENS.colorBgElevated);
    expect(cardStyle.borderRadius).toBe(TOKENS.borderRadiusLG);
    expect(cardStyle.paddingHorizontal).toBe(TOKENS.paddingLG);
    expect(cardStyle.paddingVertical).toBe(TOKENS.paddingMD);
    expect(testRenderer.root.findByType(ActivityIndicator).props.size).toBe(28);
  });

  it('maps tone to primary, tertiary and light solid colors', () => {
    const primaryRenderer = renderLoading();
    const mutedRenderer = renderLoading({ tone: 'muted' });
    const inverseRenderer = renderLoading({ tone: 'inverse' });

    expect(primaryRenderer.root.findByType(ActivityIndicator).props.color).toBe(
      TOKENS.colorPrimary,
    );
    expect(mutedRenderer.root.findByType(ActivityIndicator).props.color).toBe(
      TOKENS.colorTextTertiary,
    );
    expect(inverseRenderer.root.findByType(ActivityIndicator).props.color).toBe(
      TOKENS.colorTextLightSolid,
    );
  });

  it('renders nothing when stopped without text', () => {
    const testRenderer = renderLoading({ animating: false });

    expect(testRenderer.toJSON()).toBeNull();
  });

  it('keeps text but drops the indicator when stopped with text', () => {
    const testRenderer = renderLoading({
      animating: false,
      text: '已停止加载',
    });

    expect(() => testRenderer.root.findByType(ActivityIndicator)).toThrow();
    expect(JSON.stringify(testRenderer.toJSON())).toContain('已停止加载');
  });

  it('renders a custom indicator instead of the activity indicator', () => {
    const CustomIndicator = () => <RNText>自定义</RNText>;
    const testRenderer = renderLoading({ indicator: <CustomIndicator /> });

    expect(() => testRenderer.root.findByType(CustomIndicator)).not.toThrow();
    expect(() => testRenderer.root.findByType(ActivityIndicator)).toThrow();
  });

  it('forwards animating and hidesWhenStopped to the indicator', () => {
    const testRenderer = renderLoading({ hidesWhenStopped: false });
    const indicator = testRenderer.root.findByType(ActivityIndicator);

    expect(indicator.props.animating).toBe(true);
    expect(indicator.props.hidesWhenStopped).toBe(false);
  });
});
