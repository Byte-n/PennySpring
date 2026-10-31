import React, { type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Button, Popup } from '@pennyspring/ui';

export interface FormFloatingPanelProps {
  open: boolean;
  titleText: string;
  submitText: string;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  keyboardAvoiding?: boolean;
  scrollEnabled?: boolean;
  panelBodyStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  onOk: () => void | boolean | Promise<void | boolean>;
}

/**
 * 表单类底部浮层统一规范：
 * - 主提交动作放在头部右侧，关闭按钮保持最右；
 * - 不渲染默认底部取消/确定按钮；
 * - 提交失败时由调用方返回 false，浮层保持打开。
 */
export function FormFloatingPanel({
  open,
  titleText,
  submitText,
  submitDisabled = false,
  submitLoading = false,
  keyboardAvoiding = true,
  scrollEnabled = false,
  panelBodyStyle,
  children,
  onOpenChange,
  onOk,
}: FormFloatingPanelProps) {
  return (
    <Popup.FloatingPanel
      bodyScrollable
      keyboardAvoiding={keyboardAvoiding}
      scrollEnabled={scrollEnabled}
      okDisabled={submitDisabled}
      okLoading={submitLoading}
      onOk={onOk}
      onOpenChange={onOpenChange}
      open={open}
      renderFooter={null}
      renderHeaderRight={({ confirm }) => (
        <Button
          color="primary"
          disabled={submitDisabled}
          loading={submitLoading}
          onPress={confirm}
          size="small"
          type="text"
        >
          {submitText}
        </Button>
      )}
      styles={{ panelBody: panelBodyStyle }}
      titleText={titleText}
    >
      {children}
    </Popup.FloatingPanel>
  );
}
