import React from 'react';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import { Button } from '../Button';
import type { FloatingActionButtonProps } from './types';

interface StyleOptions {
  shadow: boolean;
}

const useStyles = createUseSheetStyle((token, { shadow }: StyleOptions) => ({
  button: {
    height: token.controlHeightLG,
    borderRadius: token.borderRadiusLG,
    paddingHorizontal: token.paddingSM,
    ...(shadow ? toShadowStyle(token.boxShadowSecondary) : undefined),
  },
}));

export function FloatingActionButton({
  color = 'primary',
  disabled,
  icon,
  label,
  onPress,
  shadow = true,
  style,
  styles,
  testID,
  variant = 'solid',
}: FloatingActionButtonProps) {
  const tokenStyles = useStyles({ shadow });

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
