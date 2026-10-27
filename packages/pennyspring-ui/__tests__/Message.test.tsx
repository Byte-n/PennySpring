import React from 'react';
import { StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Icon } from '../src/Icon';
import { Message } from '../src/Message';
import { PortalProvider } from '../src/Portal';
import { Text } from '../src/Text';

const TOKENS = {
  borderRadius: 12,
  colorBgContainer: 'containerToken',
  colorError: 'errorToken',
  colorErrorBg: 'errorBgToken',
  colorInfo: 'infoToken',
  colorInfoBg: 'infoBgToken',
  colorPrimaryText: 'primaryTextToken',
  colorSplit: 'splitToken',
  colorSuccess: 'successToken',
  colorSuccessBg: 'successBgToken',
  colorWarning: 'warningToken',
  colorWarningBg: 'warningBgToken',
  lineWidth: 1,
  marginSM: 12,
  marginXS: 8,
  marginXXS: 4,
  padding: 16,
  paddingLG: 24,
  paddingSM: 12,
} as const;

function renderMessage(props: Partial<React.ComponentProps<typeof Message>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider config={{ token: TOKENS }}>
        <PortalProvider>
          <Message messageText="已保存这笔记录" open duration={0} {...props} />
        </PortalProvider>
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function getContentStyle(testRenderer: renderer.ReactTestRenderer) {
  const content = testRenderer.root.findAllByType(View).find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return style?.position === 'absolute' && style?.zIndex !== undefined;
  });

  return StyleSheet.flatten(content?.props.style);
}

function getHeaderIcon(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAllByType(Icon).find(node => node.props.icon !== 'close');
}

describe('Message', () => {
  it.each([
    ['success', 'successBgToken'],
    ['warning', 'warningBgToken'],
    ['error', 'errorBgToken'],
    ['info', 'infoBgToken'],
    ['default', 'containerToken'],
  ] as const)('paints %s on its semantic background', (type, expectedBackground) => {
    const testRenderer = renderMessage({ type });
    const contentStyle = getContentStyle(testRenderer);

    expect(contentStyle.backgroundColor).toBe(expectedBackground);
  });

  it('keeps a hairline border only on the default type', () => {
    const defaultStyle = getContentStyle(renderMessage());
    const successStyle = getContentStyle(renderMessage({ type: 'success' }));

    expect(defaultStyle.borderWidth).toBe(TOKENS.lineWidth);
    expect(defaultStyle.borderColor).toBe(TOKENS.colorSplit);
    expect(successStyle.borderWidth).toBeUndefined();
  });

  it.each([
    ['default', 'info', 'textSecondary'],
    ['success', 'check-circle', 'success'],
    ['warning', 'warning', 'warning'],
    ['error', 'close-circle', 'error'],
    ['info', 'info', 'info'],
  ] as const)('maps %s to its icon', (type, expectedIcon, expectedColor) => {
    const testRenderer = renderMessage({ type });
    const icon = getHeaderIcon(testRenderer);

    expect(icon?.props.icon).toBe(expectedIcon);
    expect(icon?.props.color).toBe(expectedColor);
    expect(icon?.props.size).toBe(16);
  });

  it('renders the body as 14 / two lines of colorText', () => {
    const testRenderer = renderMessage();
    const textNode = testRenderer.root
      .findAllByType(Text)
      .find(node => typeof node.props.children !== 'string' && node.props.children !== undefined)
      ?? testRenderer.root.findAllByType(Text)[0];

    expect(textNode.props.size).toBe('sm');
    expect(textNode.props.numberOfLines).toBe(2);
    expect(textNode.props.color).toBe('default');
  });

  it('attaches a single action inline and prevents auto close', () => {
    jest.useFakeTimers();
    const onPress = jest.fn();
    const onCancel = jest.fn();
    const testRenderer = renderMessage({ action: { onPress, text: '撤销' }, onCancel, type: 'success' });
    const actionNode = testRenderer.root.findAllByType(Text).find(node => {
      return typeof node.props.onPress === 'function';
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(actionNode?.props.weight).toBe('semibold');
    expect(actionNode?.props.color).toBe('successText');
    expect(onCancel).not.toHaveBeenCalled();

    act(() => {
      actionNode?.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('shows a close button by default and hides it when closable is false', () => {
    const closableRenderer = renderMessage();
    const lockedRenderer = renderMessage({ closable: false });
    const findCloseIcon = (testRenderer: renderer.ReactTestRenderer) =>
      testRenderer.root.findAllByType(Icon).filter(node => node.props.icon === 'close');

    expect(findCloseIcon(closableRenderer)).toHaveLength(1);
    expect(findCloseIcon(lockedRenderer)).toHaveLength(0);
  });

  it('drops the icon when icon is null', () => {
    const testRenderer = renderMessage({ icon: null });

    expect(getHeaderIcon(testRenderer)).toBeUndefined();
  });

  it('pads 16 from the screen edge and 12 inside the message', () => {
    const contentStyle = getContentStyle(renderMessage());

    expect(contentStyle.left).toBe(TOKENS.padding);
    expect(contentStyle.right).toBe(TOKENS.padding);
    expect(contentStyle.paddingHorizontal).toBe(TOKENS.paddingSM);
    expect(contentStyle.paddingVertical).toBe(TOKENS.paddingSM);
    expect(contentStyle.borderRadius).toBe(TOKENS.borderRadius);
    expect(contentStyle.top).toBe(TOKENS.marginXS);
  });
});
