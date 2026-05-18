import React from 'react';
import { Pressable, View } from 'react-native';
import { MoonIcon, SunIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { ThemeAlgorithm } from '@pennyspring/theme';

export type ComponentPreviewThemePresetName =
  | 'april'
  | 'kaori'
  | 'penny'
  | 'spring';

export interface ComponentPreviewThemePreset {
  name: ComponentPreviewThemePresetName;
  label: string;
}

interface ComponentPreviewThemeControlsProps {
  algorithm: ThemeAlgorithm;
  preset: ComponentPreviewThemePreset;
  onToggleAlgorithm: () => void;
  onNextPreset: () => void;
}

const useStyles = createUseSheetStyle(token => ({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.marginXXS,
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: token.controlHeightSM,
      minWidth: token.controlHeightSM,
      borderRadius: token.borderRadiusSM,
      backgroundColor: token.colorBgContainer,
    },
    buttonPressed: {
      backgroundColor: token.colorBgTextActive,
    },
    swatch: {
      width: token.fontSizeLG,
      height: token.fontSizeLG,
      borderRadius: token.fontSizeLG,
      backgroundColor: token.colorPrimary,
      borderColor: token.colorBorderSecondary,
      borderWidth: token.lineWidth,
    },
  }));

export function ComponentPreviewThemeControls({
  algorithm,
  onNextPreset,
  onToggleAlgorithm,
  preset: _preset,
}: ComponentPreviewThemeControlsProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const isDark = algorithm === 'dark';
  const ModeIcon = isDark ? SunIcon : MoonIcon;

  return (
    <View style={styles.root}>
      <Pressable
        onPress={onToggleAlgorithm}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <ModeIcon color={token.colorIconHover} size={token.fontSizeLG} />
      </Pressable>
      <Pressable
        onPress={onNextPreset}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <View style={styles.swatch} />
      </Pressable>
    </View>
  );
}
