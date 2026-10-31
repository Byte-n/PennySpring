import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Column, Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

const MENU_HIT_SLOP = 6;

export type ManageIconTone = 'default' | 'primary' | 'success' | 'warning';

export interface ManageRowProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconTone?: ManageIconTone;
  leading?: ReactNode;
  badgeText?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onMenuPress?: () => void;
  hasDivider?: boolean;
  isCurrent?: boolean;
  isHidden?: boolean;
}

const useStyles = createUseSheetStyle(token => ({
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: token.marginMD,
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  rowPressed: {
    backgroundColor: token.colorFillQuaternary,
  },
  rowCurrent: {
    backgroundColor: token.colorPrimaryBg,
  },
  rowHidden: {
    backgroundColor: token.colorFillQuaternary,
  },
  currentMarker: {
    backgroundColor: token.colorPrimary,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: token.lineWidthBold,
  },
  hiddenMarker: {
    backgroundColor: token.colorBorder,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: token.lineWidthBold,
  },
  divider: {
    backgroundColor: token.colorSplit,
    height: token.lineWidth,
    left: token.padding + token.controlHeightSM + token.marginMD,
    position: 'absolute',
    right: token.padding,
    top: 0,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    height: token.controlHeightSM,
    justifyContent: 'center',
    width: token.controlHeightSM,
  },
  tilePrimary: {
    backgroundColor: token.colorPrimaryBg,
  },
  tileSuccess: {
    backgroundColor: token.colorSuccessBg,
  },
  tileWarning: {
    backgroundColor: token.colorWarningBg,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
  },
  subtitle: {
    minWidth: 0,
  },
  trailing: {
    flexShrink: 0,
  },
  menu: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    height: token.controlHeightSM,
    justifyContent: 'center',
    width: token.controlHeightSM,
  },
  menuPressed: {
    backgroundColor: token.colorFill,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.controlHeightXS,
    height: token.controlHeightXS,
    justifyContent: 'center',
    paddingHorizontal: token.paddingXS,
  },
  sectionHeader: {
    paddingHorizontal: token.paddingXXS,
    paddingVertical: token.paddingXS,
  },
  sectionTitleArea: {
    flex: 1,
  },
  emptyCard: {
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderStyle: 'dashed',
    borderWidth: token.lineWidth,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingLG,
  },
}));

export function ManageCard({ children }: { children: ReactNode }) {
  const styles = useStyles();

  return (
    <Column style={styles.card}>
      {children}
    </Column>
  );
}

export function ManageRow({
  title,
  subtitle,
  icon,
  iconTone = 'default',
  leading,
  badgeText,
  trailing,
  onPress,
  onLongPress,
  onMenuPress,
  hasDivider = false,
  isCurrent = false,
  isHidden = false,
}: ManageRowProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const tileStyle = [
    styles.tile,
    iconTone === 'primary' && styles.tilePrimary,
    iconTone === 'success' && styles.tileSuccess,
    iconTone === 'warning' && styles.tileWarning,
  ];

  return (
    <Pressable
      disabled={!onPress && !onLongPress && !onMenuPress}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isCurrent && styles.rowCurrent,
        isHidden && styles.rowHidden,
        pressed && styles.rowPressed,
      ]}
    >
      {hasDivider ? <View style={styles.divider} /> : null}
      {isHidden ? <View style={styles.hiddenMarker} /> : null}
      {isCurrent ? <View style={styles.currentMarker} /> : null}
      {leading ?? (icon ? <View style={tileStyle}>{icon}</View> : null)}
      <Column style={styles.main} gap={token.marginXXS}>
        <Row gap="small" align="center">
          <Text
            numberOfLines={1}
            size="md"
            style={styles.title}
            weight="medium"
          >
            {title}
          </Text>
          {badgeText ? <ManageBadge text={badgeText} /> : null}
        </Row>
        <Text
          color="tertiary"
          numberOfLines={1}
          size="xs"
          style={styles.subtitle}
        >
          {subtitle ?? ' '}
        </Text>
      </Column>
      {trailing ? (
        <Column style={styles.trailing} align="end">
          {trailing}
        </Column>
      ) : null}
      {onMenuPress ? (
        <Pressable
          hitSlop={MENU_HIT_SLOP}
          onPress={onMenuPress}
          style={({ pressed }) => [styles.menu, pressed && styles.menuPressed]}
        >
          <Icon color="tertiary" icon="more" size="large" />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export function ManageBadge({ text }: { text: string }) {
  const styles = useStyles();

  return (
    <View style={styles.badge}>
      <Text color="tertiary" size="xs">
        {text}
      </Text>
    </View>
  );
}

export interface ManageSectionHeaderProps {
  title: string;
  countText?: string;
  totalText?: string;
  totalNegative?: boolean;
}

export function ManageSectionHeader({
  title,
  countText,
  totalText,
  totalNegative = false,
}: ManageSectionHeaderProps) {
  const styles = useStyles();

  return (
    <Row style={styles.sectionHeader} gap="small" align="end">
      <Row style={styles.sectionTitleArea} gap="small" align="baseline">
        <Text color="secondary" size="xs" weight="semibold">
          {title}
        </Text>
        {countText ? (
          <Text color="tertiary" size="xs">
            {countText}
          </Text>
        ) : null}
      </Row>
      {totalText ? (
        <Text
          color={totalNegative ? 'errorText' : 'secondary'}
          size="xs"
          weight="semibold"
        >
          {totalText}
        </Text>
      ) : null}
    </Row>
  );
}

export function ManageEmptyCard({ children }: { children: ReactNode }) {
  const styles = useStyles();

  return (
    <Column style={styles.emptyCard} gap="normal" align="center">
      {children}
    </Column>
  );
}
