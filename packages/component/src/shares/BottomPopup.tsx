import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

const BOTTOM_POPUP_MAX_HEIGHT = '85%';

interface BottomPopupProps {
  children: ReactNode;
  visible: boolean;
  accessibilityLabel: string;
  contentTestID?: string;
  contentStyle?: StyleProp<ViewStyle>;
  onClose: () => void;
}

const useBottomPopupStyles = createUseSheetStyle(token => ({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: token.colorBgMask,
  },
  layout: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: BOTTOM_POPUP_MAX_HEIGHT,
    padding: token.paddingSM,
    borderTopLeftRadius: token.borderRadiusLG,
    borderTopRightRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgElevated,
    ...toShadowStyle(token.boxShadow),
  },
}));

export function BottomPopup({
  accessibilityLabel,
  children,
  contentTestID,
  contentStyle,
  onClose,
  visible,
}: BottomPopupProps) {
  const styles = useBottomPopupStyles();
  const contentStyles = Array.isArray(contentStyle)
    ? contentStyle
    : [contentStyle];

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View
        accessibilityLabel={accessibilityLabel}
        style={styles.layout}
        testID="bottom-popup"
      >
        <Pressable
          accessibilityLabel="Close popup backdrop"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View testID={contentTestID} style={[styles.sheet, ...contentStyles]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}
