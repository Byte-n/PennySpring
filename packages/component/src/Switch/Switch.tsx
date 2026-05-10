import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import type { AliasToken } from '@pennyspring/theme';
import type { SwitchProps, SwitchSize } from './types';

interface SizeStyleConfig {
  trackWidth: (token: AliasToken) => number;
  trackHeight: (token: AliasToken) => number;
  thumbSize: (token: AliasToken) => number;
  inset: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<SwitchSize, SizeStyleConfig> = {
  small: {
    trackWidth: token => token.controlHeight,
    trackHeight: token => token.controlHeightSM,
    thumbSize: token => token.fontSize,
    inset: token => token.lineWidth,
  },
  normal: {
    trackWidth: token => token.controlHeightLG,
    trackHeight: token => token.controlHeight,
    thumbSize: token => token.fontSizeXL,
    inset: token => token.lineWidth,
  },
  large: {
    trackWidth: token => token.controlHeightLG + token.controlHeightSM,
    trackHeight: token => token.controlHeightLG,
    thumbSize: token => token.controlHeight,
    inset: token => token.lineWidthBold,
  },
};

const useStyles = createUseSheetStyle((token, size: SwitchSize) => {
  const sizeConfig = SIZE_STYLE_MAP[size];
  const trackWidth = sizeConfig.trackWidth(token);
  const trackHeight = sizeConfig.trackHeight(token);
  const thumbSize = sizeConfig.thumbSize(token);
  const inset = sizeConfig.inset(token);

  return {
    track: {
      alignItems: 'flex-start',
      backgroundColor: token.colorFillTertiary,
      borderColor: token.colorBorder,
      borderRadius: trackHeight,
      borderWidth: token.lineWidth,
      height: trackHeight,
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
      marginLeft: trackWidth - thumbSize - inset - token.lineWidth,
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
