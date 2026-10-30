import React from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Icon } from '../src/Icon';
import { Notification } from '../src/Notification';
import { PortalProvider } from '../src/Portal';
import { Text } from '../src/Text';

const TOKENS = {
  borderRadiusLG: 16,
  colorBgElevated: 'elevatedToken',
  colorErrorBg: 'errorBgToken',
  colorFillTertiary: 'fillTertiaryToken',
  colorInfoBg: 'infoBgToken',
  colorSuccessBg: 'successBgToken',
  colorWarningBg: 'warningBgToken',
  marginSM: 12,
  marginXS: 8,
  marginXXS: 4,
  padding: 16,
  paddingLG: 24,
  paddingSM: 12,
} as const;

function renderNotification(props: Partial<React.ComponentProps<typeof Notification>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider config={{ token: TOKENS }}>
        <PortalProvider>
          <Notification
            open
            duration={0}
            titleText="已导入 128 笔记录"
            descriptionText="96 笔已匹配分类，32 笔待分类。"
            {...props}
          />
        </PortalProvider>
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function getCardStyle(testRenderer: renderer.ReactTestRenderer) {
  const card = testRenderer.root.findAllByType(View).find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return style?.position === 'absolute' && style?.zIndex !== undefined;
  });

  return StyleSheet.flatten(card?.props.style);
}

function getPlate(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAllByType(View).find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return typeof style?.width === 'number' && style.width === style.height && style.backgroundColor !== undefined;
  });
}

describe('Notification', () => {
  it('renders a borderless elevated card with 16 radius and 16 padding', () => {
    const cardStyle = getCardStyle(renderNotification({ size: 'normal' }));

    expect(cardStyle.backgroundColor).toBe(TOKENS.colorBgElevated);
    expect(cardStyle.borderRadius).toBe(TOKENS.borderRadiusLG);
    expect(cardStyle.borderWidth).toBeUndefined();
    expect(cardStyle.padding).toBe(TOKENS.padding);
    expect(cardStyle.left).toBe(TOKENS.padding);
    expect(cardStyle.right).toBe(TOKENS.padding);
    expect(cardStyle.top).toBe(TOKENS.marginXS);
  });

  it.each([
    ['small', 12],
    ['normal', 16],
    ['large', 16],
  ] as const)('pads %s with %s', (size, expectedPadding) => {
    const cardStyle = getCardStyle(renderNotification({ size }));

    expect(cardStyle.padding).toBe(expectedPadding);
  });

  it.each([
    ['default', 'fillTertiaryToken', 'info'],
    ['success', 'successBgToken', 'check-circle'],
    ['warning', 'warningBgToken', 'warning'],
    ['error', 'errorBgToken', 'close-circle'],
    ['info', 'infoBgToken', 'info'],
  ] as const)('paints %s plate with its semantic background', (status, expectedBackground, expectedIcon) => {
    const testRenderer = renderNotification({ status });
    const plateStyle = StyleSheet.flatten(getPlate(testRenderer)?.props.style);
    const headerIcon = testRenderer.root
      .findAllByType(Icon)
      .find(node => node.props.icon !== 'close');

    expect(plateStyle.backgroundColor).toBe(expectedBackground);
    expect(headerIcon?.props.icon).toBe(expectedIcon);
  });

  it.each([
    ['small', 'xs'],
    ['normal', 'sm'],
    ['large', 'md'],
  ] as const)('maps %s title to %s', (size, expectedSize) => {
    const testRenderer = renderNotification({ size });
    const titleNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '已导入 128 笔记录');

    expect(titleNode?.props.size).toBe(expectedSize);
    expect(titleNode?.props.weight).toBe('semibold');
    expect(titleNode?.props.color).toBe('default');
  });

  it('keeps description at secondary color and two lines', () => {
    const testRenderer = renderNotification();
    const descriptionNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '96 笔已匹配分类，32 笔待分类。');

    expect(descriptionNode?.props.color).toBe('secondary');
    expect(descriptionNode?.props.numberOfLines).toBe(2);
  });

  it('renders at most two actions and keeps the card open', () => {
    jest.useFakeTimers();
    const onFirst = jest.fn();
    const onCancel = jest.fn();
    const testRenderer = renderNotification({
      actions: [
        { text: '查看', onPress: onFirst },
        { text: '撤销', onPress: jest.fn() },
        { text: '忽略', onPress: jest.fn() },
      ],
      onCancel,
      status: 'success',
    });
    const actionNodes = testRenderer.root
      .findAllByType(Text)
      .filter(node => typeof node.props.onPress === 'function');

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(actionNodes).toHaveLength(2);
    expect(actionNodes[0].props.color).toBe('successText');
    expect(onCancel).not.toHaveBeenCalled();

    act(() => {
      actionNodes[0].props.onPress();
    });

    expect(onFirst).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('shows the close icon by default and hides it when closable is false', () => {
    const findCloseIcon = (testRenderer: renderer.ReactTestRenderer) =>
      testRenderer.root.findAllByType(Icon).filter(node => node.props.icon === 'close');

    expect(findCloseIcon(renderNotification())).toHaveLength(1);
    expect(findCloseIcon(renderNotification({ closable: false }))).toHaveLength(0);
  });

  it('drops the plate when icon is null', () => {
    const testRenderer = renderNotification({ icon: null });

    expect(getPlate(testRenderer)).toBeUndefined();
  });

  it('renders nothing when both title and description are empty', () => {
    const testRenderer = renderNotification({ descriptionText: undefined, titleText: undefined });

    expect(getCardStyle(testRenderer)).toBeUndefined();
  });

  it('sits above the safe area bottom when placed at the bottom', () => {
    const cardStyle = getCardStyle(renderNotification({ placement: 'bottom' }));

    expect(cardStyle.bottom).toBe(TOKENS.paddingLG);
    expect(cardStyle.top).toBeUndefined();
  });

  it('supports a custom description node', () => {
    const testRenderer = renderNotification({
      description: <RNText>自定义说明</RNText>,
      descriptionText: '不应出现',
    });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('自定义说明');
    expect(JSON.stringify(testRenderer.toJSON())).not.toContain('不应出现');
  });
});
