import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import type { AliasToken } from '@pennyspring/theme';
import type { SwitchProps, SwitchSize } from './types';

interface SizeStyleConfig {
  trackWidth: (token: AliasToken) => number;
  thumbSize: (token: AliasToken) => number;
  inset: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<SwitchSize, SizeStyleConfig> = {
  small: {
    trackWidth: token => token.controlHeight,
    thumbSize: token => token.fontSize,
    inset: token => token.lineWidth,
  },
  normal: {
    trackWidth: token => token.controlHeightLG,
    thumbSize: token => token.fontSizeXL,
    inset: token => token.lineWidth,
  },
  large: {
    trackWidth: token => token.controlHeightLG + token.controlHeightXS,
    thumbSize: token => token.controlHeightSM,
    inset: token => token.lineWidth,
  },
};

const useStyles = createUseSheetStyle((token, size: SwitchSize) => {
  const sizeConfig = SIZE_STYLE_MAP[size];
  const trackWidth = sizeConfig.trackWidth(token);
  const thumbSize = sizeConfig.thumbSize(token);
  const inset = sizeConfig.inset(token);
  const checkedOffset =
    trackWidth - thumbSize - inset - token.lineWidth - inset;

  return {
    track: {
      alignItems: 'flex-start',
      backgroundColor: token.colorFillTertiary,
      borderColor: token.colorBorder,
      borderRadius: 999,
      borderWidth: token.lineWidth,
      justifyContent: 'center',
      width: trackWidth,
    },
    trackChecked: {
      backgroundColor: token.colorPrimary,
      borderColor: token.colorPrimary,
    },
    trackDisabled: {
      backgroundColor: token.colorBgContainerDisabled,
      borderColor: token.colorBorderDisabled,
    },
    trackReadonly: {
      borderColor: token.colorBorderSecondary,
    },
    trackPressed: {
      backgroundColor: token.controlItemBgActive,
    },
    thumb: {
      backgroundColor: token.colorBgContainer,
      borderRadius: thumbSize,
      height: thumbSize,
      marginLeft: inset,
      width: thumbSize,
    },
    thumbChecked: {
      transform: [{ translateX: checkedOffset }],
    },
    thumbDisabled: {
      backgroundColor: token.colorTextDisabled,
    },
  };
});

export function Switch({
  value,
  defaultValue = false,
  onChange,
  disabled = false,
  readonly = false,
  size = 'normal',
  style,
  styles,
  ...rest
}: SwitchProps) {
  const tokenStyles = useStyles(size);
  const [checked, setChecked] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const isDisabled = disabled || readonly;

  function handlePress(): void {
    if (isDisabled) {
      return;
    }

    setChecked(!checked);
  }

  return (
    <Pressable
      {...rest}
      testID="switch"
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        tokenStyles.track,
        styles?.track,
        checked ? tokenStyles.trackChecked : null,
        disabled ? tokenStyles.trackDisabled : null,
        readonly ? tokenStyles.trackReadonly : null,
        pressed && !isDisabled ? tokenStyles.trackPressed : null,
        style,
      ]}
    >
      <View
        testID="switch-thumb"
        style={[
          tokenStyles.thumb,
          styles?.thumb,
          checked ? tokenStyles.thumbChecked : null,
          disabled ? tokenStyles.thumbDisabled : null,
        ]}
      />
    </Pressable>
  );
}
