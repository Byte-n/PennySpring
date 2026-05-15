import React from 'react';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Button } from '../Button';
import type { FloatingActionButtonProps } from './types';

const useStyles = createUseSheetStyle(token => ({
  button: {
    minWidth: token.controlHeightLG,
    height: token.controlHeightLG,
    borderRadius: token.borderRadiusLG,
    paddingHorizontal: token.paddingSM,
  },
}));

export function FloatingActionButton({
  color = 'primary',
  disabled,
  icon,
  label,
  onPress,
  style,
  styles,
  testID,
  variant = 'solid',
}: FloatingActionButtonProps) {
  const tokenStyles = useStyles();

  return (
    <Button
      color={color}
      disabled={disabled}
      icon={icon}
      onPress={onPress}
      shape="round"
      size="large"
      style={[tokenStyles.button, style, styles?.button]}
      testID={testID}
      variant={variant}
    >
      {label}
    </Button>
  );
}

export type { FloatingActionButtonProps, FloatingActionButtonStyles } from './types';
