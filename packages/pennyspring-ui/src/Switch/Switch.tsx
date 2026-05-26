import type { ComponentSize } from '../shares/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { SwitchProps } from './types';

const DEFAULT_TRACK_WIDTH_SCALE = 2;
const TEXT_TRACK_WIDTH_SCALE = 3;

interface SizeStyleConfig {
  thumbSize: (token: AliasToken) => number;
  inset: (token: AliasToken) => number;
}

interface SwitchStyleOptions {
  checked: boolean;
  disabled: boolean;
  hasText: boolean;
  size: ComponentSize;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    thumbSize: token => token.fontSize,
    inset: token => token.lineWidth,
  },
  normal: {
    thumbSize: token => token.fontSizeXL,
    inset: token => token.lineWidth,
  },
  large: {
    thumbSize: token => token.controlHeightSM,
    inset: token => token.lineWidth,
  },
};

const useStyles = createUseSheetStyle((token, options: SwitchStyleOptions) => {
  const sizeConfig = SIZE_STYLE_MAP[options.size];
  const thumbSize = sizeConfig.thumbSize(token);
  const trackWidth =
    thumbSize *
    (options.hasText ? TEXT_TRACK_WIDTH_SCALE : DEFAULT_TRACK_WIDTH_SCALE);
  const inset = sizeConfig.inset(token);
  const textReservedSpace = thumbSize + inset + token.lineWidth;
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
    text: {
      color: options.disabled
        ? token.colorTextDisabled
        : options.checked
          ? token.colorTextLightSolid
          : token.colorTextSecondary,
      fontSize: token.fontSizeSM,
      fontWeight: token.fontWeightStrong as TextStyle['fontWeight'],
      left: options.checked ? inset + token.lineWidth : textReservedSpace,
      lineHeight: token.lineHeightSM,
      position: 'absolute',
      right: options.checked ? textReservedSpace : inset + token.lineWidth,
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
  checkedText,
  uncheckedText,
  disabled = false,
  readonly = false,
  size = 'normal',
  style,
  styles,
  ...rest
}: SwitchProps) {
  const [resolvedChecked, setChecked] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const checked = resolvedChecked ?? false;
  const isDisabled = disabled || readonly;
  const currentText = checked ? checkedText : uncheckedText;
  const hasText = checkedText !== undefined || uncheckedText !== undefined;
  const styleOptions = React.useMemo<SwitchStyleOptions>(
    () => ({
      checked,
      disabled: isDisabled,
      hasText,
      size,
    }),
    [checked, hasText, isDisabled, size],
  );
  const tokenStyles = useStyles(styleOptions);

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
      {currentText !== undefined ? (
        <Text
          numberOfLines={1}
          size="sm"
          style={[tokenStyles.text, styles?.text]}
          testID="switch-text"
        >
          {currentText}
        </Text>
      ) : null}
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
