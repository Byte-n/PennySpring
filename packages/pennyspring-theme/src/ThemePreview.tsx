import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BrandColorsPreview } from './preview/BrandColorsPreview';
import { ColorPalettePreview } from './preview/ColorPalettePreview';
import { NeutralColorsPreview } from './preview/NeutralColorsPreview';
import { TypographyPreview } from './preview/TypographyPreview';
import { SpacingPreview } from './preview/SpacingPreview';
import { ShadowsPreview } from './preview/ShadowsPreview';
import { BorderRadiusPreview } from './preview/BorderRadiusPreview';
import { type ThemeAlgorithm, ThemeProvider } from './ThemeProvider';
import { createUseSheetStyle } from './createUseSheetStyle';
import { april, kaori, penny, spring } from './presets';
import { defaultSeedToken } from './defaults';
import { useTheme } from './useTheme';
import type { SeedToken } from './types';

type PresetName = 'default' | 'april' | 'kaori' | 'penny' | 'spring';

interface PresetOption {
  name: PresetName;
  label: string;
  color: string;
}

const PRESET_OPTIONS: ReadonlyArray<PresetOption> = [
  { name: 'default', label: 'Default', color: defaultSeedToken.colorPrimary },
  { name: 'april', label: 'April', color: april.colorPrimary as string },
  { name: 'kaori', label: 'Kaori', color: kaori.colorPrimary as string },
  { name: 'penny', label: 'Penny', color: penny.colorPrimary as string },
  { name: 'spring', label: 'Spring', color: spring.colorPrimary as string },
];

const PRESET_MAP: Record<PresetName, Partial<SeedToken> | undefined> = {
  default: undefined,
  april,
  kaori,
  penny,
  spring,
};

const useContainerStyles = createUseSheetStyle(
  (tokens, isDarkMode: boolean) => ({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? tokens.colorBgBase : tokens.colorBgContainer,
    },
  }),
);

const useHeaderStyles = createUseSheetStyle(tokens => ({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: tokens.padding,
    borderBottomWidth: tokens.lineWidth,
    borderBottomColor: tokens.colorBorderSecondary,
  },
}));

const useTitleStyles = createUseSheetStyle((tokens, isDarkMode: boolean) => ({
  title: {
    fontSize: tokens.fontSizeHeading1,
    fontWeight: 'bold',
    color: isDarkMode ? tokens.colorTextLightSolid : tokens.colorText,
  },
}));

const useToggleButtonStyles = createUseSheetStyle(
  (tokens, isDarkMode: boolean) => ({
    button: {
      paddingHorizontal: tokens.padding,
      paddingVertical: tokens.paddingSM,
      backgroundColor: isDarkMode
        ? tokens.colorFillSecondary
        : tokens.colorFillTertiary,
      borderRadius: tokens.borderRadiusLG,
    },
  }),
);

const useToggleTextStyles = createUseSheetStyle(
  (tokens, isDarkMode: boolean) => ({
    text: {
      fontSize: tokens.fontSize,
      fontWeight: '600',
      color: isDarkMode ? tokens.colorTextLightSolid : tokens.colorText,
    },
  }),
);

const usePresetBarStyles = createUseSheetStyle(
  (tokens, isDarkMode: boolean) => ({
    bar: {
      paddingHorizontal: tokens.padding,
      paddingVertical: tokens.paddingSM,
      borderBottomWidth: tokens.lineWidth,
      borderBottomColor: tokens.colorBorderSecondary,
      backgroundColor: isDarkMode
        ? tokens.colorBgBase
        : tokens.colorBgContainer,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  }),
);

interface PresetChipProps {
  option: PresetOption;
  selected: boolean;
  isDark: boolean;
  onPress: () => void;
}

function PresetChip({ option, selected, isDark, onPress }: PresetChipProps) {
  const { token } = useTheme();
  const dotSize = token.fontSize;
  const chipStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderColor: selected ? option.color : token.colorBorderSecondary,
    backgroundColor: selected
      ? option.color
      : isDark
        ? token.colorFillSecondary
        : token.colorFillTertiary,
    marginRight: token.marginXS,
  };
  const dotStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    marginRight: token.marginXS,
    backgroundColor: selected ? token.colorTextLightSolid : option.color,
  };
  const textStyle = {
    fontSize: token.fontSizeSM,
    fontWeight: '600' as const,
    color: selected
      ? token.colorTextLightSolid
      : isDark
        ? token.colorTextLightSolid
        : token.colorText,
  };
  return (
    <TouchableOpacity style={chipStyle} onPress={onPress}>
      <View style={dotStyle} />
      <Text style={textStyle}>{option.label}</Text>
    </TouchableOpacity>
  );
}

interface ThemePreviewCompProps {
  algorithm: ThemeAlgorithm;
  setAlgorithm: (a: ThemeAlgorithm) => void;
  preset: PresetName;
  setPreset: (p: PresetName) => void;
}

function ThemePreviewComp({
  algorithm,
  setAlgorithm,
  preset,
  setPreset,
}: ThemePreviewCompProps) {
  const isDark = algorithm === 'dark';

  const toggleTheme = () => {
    setAlgorithm(isDark ? 'default' : 'dark');
  };

  const { container } = useContainerStyles(isDark);
  const { header } = useHeaderStyles();
  const { title } = useTitleStyles(isDark);
  const { button } = useToggleButtonStyles(isDark);
  const { text } = useToggleTextStyles(isDark);
  const { bar, content } = usePresetBarStyles(isDark);

  return (
    <ScrollView style={container}>
      <View style={header}>
        <Text style={title}>Theme Preview</Text>
        <TouchableOpacity style={button} onPress={toggleTheme}>
          <Text style={text}>{isDark ? '☀️ Light' : '🌙 Dark'}</Text>
        </TouchableOpacity>
      </View>
      <View style={bar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={content}
        >
          {PRESET_OPTIONS.map(option => (
            <PresetChip
              key={option.name}
              option={option}
              selected={preset === option.name}
              isDark={isDark}
              onPress={() => setPreset(option.name)}
            />
          ))}
        </ScrollView>
      </View>
      <BrandColorsPreview />
      <NeutralColorsPreview />
      <ColorPalettePreview />
      <TypographyPreview />
      <SpacingPreview />
      <ShadowsPreview />
      <BorderRadiusPreview />
    </ScrollView>
  );
}

export default function ThemePreview() {
  const [algorithm, setAlgorithm] = useState<ThemeAlgorithm>('default');
  const [preset, setPreset] = useState<PresetName>('default');

  const token = useMemo(() => PRESET_MAP[preset], [preset]);

  return (
    <ThemeProvider config={{ algorithm, token }}>
      <ThemePreviewComp
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        preset={preset}
        setPreset={setPreset}
      />
    </ThemeProvider>
  );
}

export { ThemePreview };
