import React from 'react';
import { Pressable, View } from 'react-native';
import { Column, Icon, Popover, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { MoonIcon, SunIcon } from 'phosphor-react-native';

import {
  THEME_PRESET_OPTIONS,
  type ThemePresetName,
  type ThemePresetOption,
  useThemeMode,
} from '../../contexts/ThemeModeContext';

interface ThemePresetOptionStyleOptions {
  color: string;
  selected: boolean;
}

// 收起态浮层宽度由内容决定，给足空间避免中文标签逐字换行。
const PRESET_OPTION_MIN_WIDTH = 160;

const usePresetOptionStyles =
  createUseSheetStyle<ThemePresetOptionStyleOptions>(
    (token, { color, selected }) => ({
      option: {
        backgroundColor: selected ? token.colorPrimaryBg : 'transparent',
        borderRadius: token.borderRadius,
        justifyContent: 'center',
        minHeight: token.controlHeight,
        minWidth: PRESET_OPTION_MIN_WIDTH,
        paddingHorizontal: token.paddingSM,
        paddingVertical: token.paddingXS / 2,
      },
      label: {
        flex: 1,
      },
      swatch: {
        backgroundColor: color,
        borderRadius: token.borderRadiusSM,
        height: token.fontSize,
        width: token.fontSize,
      },
    }),
  );

interface ThemePresetOptionRowProps {
  option: ThemePresetOption;
  selected: boolean;
  onPress: () => void;
}

function ThemePresetOptionRow({
  option,
  selected,
  onPress,
}: ThemePresetOptionRowProps) {
  const styles = usePresetOptionStyles({ color: option.color, selected });

  return (
    <Pressable
      onPress={onPress}
      style={styles.option}
      testID={`theme-preset-option-${option.name}`}
    >
      <Row align="center" gap="normal">
        <View style={styles.swatch} />
        <Text
          numberOfLines={1}
          size="md"
          style={styles.label}
          weight={selected ? 'strong' : 'regular'}
        >
          {option.label}
        </Text>
        {selected ? <Icon color="primary" icon="check" size="small" /> : null}
      </Row>
    </Pressable>
  );
}

export function ThemeSwitchButton() {
  const { themeMode, setThemeMode, themePreset, setThemePreset } =
    useThemeMode();
  const isDark = themeMode === 'dark';
  const { token } = useTheme();
  const [isPresetPanelOpen, setIsPresetPanelOpen] = React.useState(false);

  const handleToggle = React.useCallback(() => {
    setThemeMode(isDark ? 'default' : 'dark');
  }, [isDark, setThemeMode]);

  const handlePresetPress = React.useCallback(
    (preset: ThemePresetName) => {
      setThemePreset(preset);
      setIsPresetPanelOpen(false);
    },
    [setThemePreset],
  );

  const IconComp = isDark ? SunIcon : MoonIcon;

  return (
    <Popover
      align="end"
      content={
        <Column gap="small">
          {THEME_PRESET_OPTIONS.map(option => (
            <ThemePresetOptionRow
              key={option.name}
              onPress={() => handlePresetPress(option.name)}
              option={option}
              selected={themePreset === option.name}
            />
          ))}
        </Column>
      }
      onOpenChange={setIsPresetPanelOpen}
      open={isPresetPanelOpen}
      placement="bottom"
      trigger="manual"
    >
      <Pressable
        hitSlop={token.paddingSM}
        onLongPress={() => setIsPresetPanelOpen(true)}
        onPress={handleToggle}
        testID="theme-switch-button"
      >
        <IconComp size={24} color={token.colorText} />
      </Pressable>
    </Popover>
  );
}
