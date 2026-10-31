import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@pennyspring/ui';
import type { IconComponent } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { CaretRightIcon } from 'phosphor-react-native';

export type DrawerNavRowVariant = 'default' | 'compact';

export interface DrawerNavRowProps {
  icon: IconComponent;
  label: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
  right?: React.ReactNode;
  showSeparator?: boolean;
  testID?: string;
  variant?: DrawerNavRowVariant;
}

const useStyles = createUseSheetStyle(token => ({
  row: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    flexDirection: 'row',
    paddingHorizontal: token.paddingXXS,
  },
  rowDefault: {
    gap: token.marginSM,
    minHeight: token.controlHeight + token.paddingXS,
  },
  rowCompact: {
    gap: token.paddingSM,
    minHeight: token.controlHeight,
  },
  rowPressed: {
    backgroundColor: token.colorFillContent,
  },
  rowDisabled: {
    opacity: token.opacityLoading,
  },
  separator: {
    backgroundColor: token.colorSplit,
    height: token.lineWidth,
    left: token.paddingXXS + token.sizeXL + token.marginSM,
    position: 'absolute',
    right: token.paddingXXS,
    top: 0,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadiusSM,
    height: token.sizeXL,
    justifyContent: 'center',
    width: token.sizeXL,
  },
  compactIcon: {
    alignItems: 'center',
    height: token.fontSize,
    justifyContent: 'center',
    width: token.fontSize,
  },
  label: {
    flex: 1,
  },
}));

export function DrawerNavRow({
  accessibilityLabel,
  disabled = false,
  icon: Icon,
  label,
  onPress,
  right,
  showSeparator = false,
  testID,
  variant = 'default',
}: DrawerNavRowProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const isCompact = variant === 'compact';

  const iconNode = isCompact ? (
    <View style={styles.compactIcon}>
      <Icon color={token.colorTextTertiary} size={token.fontSize} />
    </View>
  ) : (
    <View style={styles.tile}>
      <Icon color={token.colorTextSecondary} size={token.fontSizeLG} />
    </View>
  );

  const labelNode = (
    <Text
      color={isCompact ? 'secondary' : undefined}
      numberOfLines={1}
      size={isCompact ? 'sm' : 'md'}
      style={styles.label}
      weight={isCompact ? undefined : 'medium'}
    >
      {label}
    </Text>
  );

  const content = (
    <>
      {showSeparator ? (
        <View pointerEvents="none" style={styles.separator} />
      ) : null}
      {iconNode}
      {labelNode}
      {right ?? (
        <CaretRightIcon
          color={token.colorTextQuaternary}
          size={isCompact ? token.fontSizeSM : token.fontSize}
        />
      )}
    </>
  );

  const variantStyle = isCompact ? styles.rowCompact : styles.rowDefault;

  if (onPress !== undefined && !disabled) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          variantStyle,
          pressed ? styles.rowPressed : undefined,
        ]}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.row,
        variantStyle,
        disabled ? styles.rowDisabled : undefined,
      ]}
      testID={testID}
    >
      {content}
    </View>
  );
}
