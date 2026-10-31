import React from 'react';
import { Icon, Tag } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import { getPhosphorIconComponent } from '../constants/typeIconTree';

export type TagChipVariant = 'default' | 'add' | 'hidden';

export interface TagChipProps {
  label: string;
  iconName?: string;
  variant?: TagChipVariant;
  placeholder?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  chip: {
    maxWidth: '100%',
  },
  label: {
    flexShrink: 1,
  },
  labelMuted: {
    color: token.colorTextTertiary,
    flexShrink: 1,
  },
}));

export function TagChip({
  label,
  iconName,
  variant = 'default',
  placeholder = false,
  selected = false,
  onPress,
  onLongPress,
}: TagChipProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const IconComponent = iconName ? getPhosphorIconComponent(iconName) : null;
  const isAdd = variant === 'add';
  const isHidden = variant === 'hidden';
  const isDashed = isAdd || isHidden;
  const isMuted = !isAdd && !selected && (isHidden || placeholder);
  const iconColor =
    isAdd || selected
      ? token.colorPrimary
      : isHidden
        ? token.colorTextTertiary
        : token.colorTextSecondary;
  const prefix = isAdd ? (
    <Icon color="primary" icon="plus" size="small" />
  ) : IconComponent ? (
    <IconComponent color={iconColor} size={token.fontSizeSM} />
  ) : undefined;

  return (
    <Tag
      color={isAdd || selected ? 'primary' : 'default'}
      onLongPress={onLongPress}
      onPress={onPress}
      prefix={prefix}
      style={styles.chip}
      styles={{ content: isMuted ? styles.labelMuted : styles.label }}
      variant={isDashed ? 'dashed' : 'filled'}
    >
      {label}
    </Tag>
  );
}
